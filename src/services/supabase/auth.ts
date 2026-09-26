/**
 * Supabase Auth Service — Patient Authentication
 *
 * Handles:
 *  - signInPatient   : Email + password sign-in
 *  - signUpPatient   : Email + password sign-up + profile row creation
 *  - signOutUser     : Session sign-out
 *  - resetPassword   : Send password reset email
 *  - getCurrentUser  : Get active Supabase session + profile
 */

import { supabase } from './client';
import { UserProfile, UserRole } from '../../types/auth';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  user: UserProfile | null;
  error: string | null;
  isIncompleteProfile?: boolean;
}

/** Resolves the application role from database profile_type */
export function resolveUserRole(profileType?: string): UserRole {
  const normalized = (profileType || '').trim().toLowerCase();
  switch (normalized) {
    case 'doctor':
      return 'doctor';
    case 'clinic':
    case 'hospital':
    case 'medical':
      return 'clinic';
    case 'diagnostic':
    case 'lab':
      return 'lab';
    case 'patient':
    default:
      return 'patient';
  }
}

/** Maps a Supabase profile row to our app's UserProfile with authorized role */
export function mapProfileToUserProfile(profile: any, userMetadata?: any): UserProfile {
  const role = resolveUserRole(profile.profile_type);

  // Generate or read role-specific identifier
  let identifier = profile.metadata?.uhid || userMetadata?.uhid;
  if (!identifier) {
    const code = profile.id ? profile.id.slice(0, 6).toUpperCase() : 'USER';
    if (role === 'doctor') identifier = `DOC-REG-${code}`;
    else if (role === 'clinic') identifier = `CLI-REG-${code}`;
    else if (role === 'lab') identifier = `LAB-NABL-${code}`;
    else identifier = `UPC-PAT-${code}`;
  }

  // Display name: use center_name for clinic/lab if available
  let displayName = profile.full_name || userMetadata?.full_name;
  if (!displayName || displayName.trim() === '') {
    displayName = profile.metadata?.center_name || profile.email?.split('@')[0] || 'User';
  }

  // Generate role-appropriate tagline / specialty
  let specialtyOrTagline = (profile.metadata?.uhid || userMetadata?.uhid)
    ? `UHID: ${profile.metadata?.uhid || userMetadata?.uhid} • Blood Group ${profile.metadata?.blood_group || userMetadata?.blood_group || 'O+'}`
    : undefined;

  if (role === 'doctor') {
    specialtyOrTagline = profile.metadata?.specialization || 'General Physician • Verified Doctor';
  } else if (role === 'clinic') {
    const loc = [profile.metadata?.city, profile.metadata?.state].filter(Boolean).join(', ');
    specialtyOrTagline = loc ? `Clinic • ${loc}` : 'Registered Clinic & OPD Facility';
  } else if (role === 'lab') {
    specialtyOrTagline = 'NABL Accredited • Diagnostic & Pathology Center';
  } else if (role === 'patient') {
    const bg = profile.metadata?.blood_group || userMetadata?.blood_group || 'O+ Positive';
    specialtyOrTagline = `UHID: ${identifier} • Blood Group ${bg}`;
  }

  return {
    id: profile.id,
    name: displayName,
    role,
    identifier,
    email: profile.email,
    phone: profile.phone ?? userMetadata?.phone ?? undefined,
    avatarUrl: profile.avatar_url ?? userMetadata?.avatar_url ?? undefined,
    specialtyOrTagline,
    bloodGroup: profile.metadata?.blood_group || userMetadata?.blood_group || 'O+ Positive',
    dateOfBirth: profile.metadata?.date_of_birth || userMetadata?.date_of_birth,
    gender: profile.metadata?.gender || userMetadata?.gender,
    address:
      profile.metadata?.address ||
      userMetadata?.address ||
      [profile.metadata?.city, profile.metadata?.state, profile.metadata?.pincode]
        .filter(Boolean)
        .join(', '),
    isVerified: profile.status === 'active' || userMetadata?.email_confirmed_at != null,
  };
}

/**
 * Sign in a user with email + password and retrieve their authorized profile and role.
 */
export async function signInUser(
  credentials: SignInCredentials
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: humaniseError(error.message) };
    }

    if (!data.user) {
      return { user: null, error: 'Sign-in failed. Please try again.' };
    }

    // Fetch profile row to determine authorized role & attributes
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      // Auth succeeded: resolve role from metadata if row not yet in public.profiles
      const userMetaRole = data.user.user_metadata?.profile_type;
      const role = resolveUserRole(userMetaRole);
      const fallbackProfile: UserProfile = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        role,
        identifier: data.user.user_metadata?.uhid || `UPC-${data.user.id.slice(0, 6).toUpperCase()}`,
        email: data.user.email!,
        phone: data.user.user_metadata?.phone,
        avatarUrl: data.user.user_metadata?.avatar_url,
        specialtyOrTagline: data.user.user_metadata?.uhid
          ? `UHID: ${data.user.user_metadata.uhid} • Blood Group ${data.user.user_metadata?.blood_group || 'O+'}`
          : undefined,
        bloodGroup: data.user.user_metadata?.blood_group || 'O+ Positive',
        dateOfBirth: data.user.user_metadata?.date_of_birth,
        gender: data.user.user_metadata?.gender,
        address: data.user.user_metadata?.address,
        isVerified: data.user.email_confirmed_at != null,
      };
      return { user: fallbackProfile, error: null };
    }

    return { user: mapProfileToUserProfile(profile, data.user.user_metadata), error: null };
  } catch (err: any) {
    return { user: null, error: 'Network error. Check your connection and try again.' };
  }
}

/** Backward-compatibility alias */
export const signInPatient = signInUser;

/**
 * Sign up a new patient with email + password.
 * Creates auth user + updates profile row with profile_type = 'patient'.
 */
/**
 * Complete or retry profile setup for an authenticated user without repeating auth sign-up.
 */
export async function completePatientProfile(
  userId: string,
  credentials: Partial<SignUpCredentials>
): Promise<AuthResult> {
  try {
    const uhid = `UPC-PAT-${userId.slice(0, 6).toUpperCase()}`;
    const metadata = {
      uhid,
      date_of_birth: credentials.dateOfBirth,
      gender: credentials.gender,
      blood_group: credentials.bloodGroup,
      address: credentials.address,
    };

    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: credentials.fullName?.trim() || 'Patient',
        phone: credentials.phone ?? null,
        avatar_url: credentials.avatarUrl ?? null,
        profile_type: 'patient',
        metadata,
      })
      .select();

    if (updateError) {
      return {
        user: null,
        error: humaniseError(updateError.message),
        isIncompleteProfile: true,
      };
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      return {
        user: null,
        error: 'Failed to complete profile setup. Please try again.',
        isIncompleteProfile: true,
      };
    }

    return {
      user: mapProfileToUserProfile(updatedProfiles[0]),
      error: null,
    };
  } catch {
    return {
      user: null,
      error: 'Network error while completing profile.',
      isIncompleteProfile: true,
    };
  }
}

/**
 * Sign up a new patient with email + password.
 * Creates auth user + updates profile row with profile_type = 'patient'.
 */
export async function signUpPatient(
  credentials: SignUpCredentials
): Promise<AuthResult> {
  try {
    const email = credentials.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName.trim(),
          phone: credentials.phone ?? null,
          profile_type: 'patient',
          date_of_birth: credentials.dateOfBirth ?? null,
          gender: credentials.gender ?? null,
          blood_group: credentials.bloodGroup ?? null,
          address: credentials.address ?? null,
          avatar_url: credentials.avatarUrl ?? null,
        },
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        // Attempt sign-in with the provided password so an already-created account can complete setup without repeating sign-up
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password,
        });

        if (!signInErr && signInData?.user && signInData?.session) {
          return completePatientProfile(signInData.user.id, credentials);
        }
      }
      return { user: null, error: humaniseError(error.message) };
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed. Please try again.' };
    }

    const uhid = `UPC-PAT-${data.user.id.slice(0, 6).toUpperCase()}`;
    const metadata = {
      uhid,
      date_of_birth: credentials.dateOfBirth,
      gender: credentials.gender,
      blood_group: credentials.bloodGroup,
      address: credentials.address,
    };

    // When Supabase requires email confirmation before session creation:
    // persist the profile write before returning the confirmation message
    if (!data.session) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: credentials.fullName.trim(),
            phone: credentials.phone ?? null,
            avatar_url: credentials.avatarUrl ?? null,
            metadata,
          })
          .eq('id', data.user.id);
      } catch {
        // Fallback: options.data already persisted on auth.users and will be synced upon confirmation
      }

      return {
        user: null,
        error: 'Please check your email to confirm your account before signing in.',
      };
    }

    // Update the profile row that was created by the DB trigger
    let { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: credentials.fullName.trim(),
        phone: credentials.phone ?? null,
        avatar_url: credentials.avatarUrl ?? null,
        metadata,
      })
      .eq('id', data.user.id)
      .select();

    // If update returned 0 rows, try upserting directly
    if (!updateError && (!updatedProfiles || updatedProfiles.length === 0)) {
      const upsertRes = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: credentials.fullName.trim(),
          phone: credentials.phone ?? null,
          avatar_url: credentials.avatarUrl ?? null,
          profile_type: 'patient',
          metadata,
        })
        .select();

      updatedProfiles = upsertRes.data;
      updateError = upsertRes.error;
    }

    // Distinguish incomplete-profile state from sign-up failure so the user isn't stuck
    if (updateError || !updatedProfiles || updatedProfiles.length === 0) {
      const incompleteProfile: UserProfile = {
        id: data.user.id,
        name: credentials.fullName.trim(),
        role: 'patient',
        identifier: uhid,
        email: data.user.email!,
        phone: credentials.phone,
        avatarUrl: credentials.avatarUrl,
        specialtyOrTagline: `UHID: ${uhid} • Profile Pending`,
        bloodGroup: credentials.bloodGroup,
        dateOfBirth: credentials.dateOfBirth,
        gender: credentials.gender,
        address: credentials.address,
        isVerified: false,
      };

      return {
        user: incompleteProfile,
        error: updateError
          ? humaniseError(updateError.message)
          : 'Account created, but profile setup could not be saved. You can complete it in settings.',
        isIncompleteProfile: true,
      };
    }

    const updated = updatedProfiles[0];
    const newProfile: UserProfile = {
      id: data.user.id,
      name: updated.full_name || credentials.fullName.trim(),
      role: 'patient',
      identifier: uhid,
      email: data.user.email!,
      phone: updated.phone || credentials.phone,
      avatarUrl: updated.avatar_url || credentials.avatarUrl,
      specialtyOrTagline: `UHID: ${uhid} • Blood Group ${credentials.bloodGroup || 'O+'}`,
      bloodGroup: credentials.bloodGroup,
      dateOfBirth: credentials.dateOfBirth,
      gender: credentials.gender,
      address: credentials.address,
      isVerified: true,
    };

    return { user: newProfile, error: null };
  } catch (err: any) {
    return { user: null, error: 'Network error. Check your connection and try again.' };
  }
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );
    if (error) return { error: humaniseError(error.message) };
    return { error: null };
  } catch {
    return { error: 'Could not send reset email. Try again.' };
  }
}

/**
 * Sign out the current session.
 */
export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Load the current logged-in user from Supabase session.
 * Returns null if no session exists.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      const fallbackRole = resolveUserRole(session.user.user_metadata?.profile_type);
      return {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        role: fallbackRole,
        identifier: session.user.user_metadata?.uhid || `UPC-${session.user.id.slice(0, 6).toUpperCase()}`,
        email: session.user.email!,
        phone: session.user.user_metadata?.phone,
        avatarUrl: session.user.user_metadata?.avatar_url,
        specialtyOrTagline: session.user.user_metadata?.uhid
          ? `UHID: ${session.user.user_metadata.uhid} • Blood Group ${session.user.user_metadata?.blood_group || 'O+'}`
          : undefined,
        bloodGroup: session.user.user_metadata?.blood_group || 'O+ Positive',
        dateOfBirth: session.user.user_metadata?.date_of_birth,
        gender: session.user.user_metadata?.gender,
        address: session.user.user_metadata?.address,
        isVerified: session.user.email_confirmed_at != null,
      };
    }

    return mapProfileToUserProfile(profile, session.user.user_metadata);
  } catch {
    return null;
  }
}

/** Converts Supabase error messages to user-friendly strings */
function humaniseError(msg: string): string {
  if (msg.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please verify your email first. Check your inbox for the confirmation link.';
  }
  if (msg.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('Unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  return msg;
}
