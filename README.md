# Upchar Health

## Problem

Healthcare access in India is still fragmented across multiple touchpoints:

- patients must search across separate websites and apps to find doctors, clinics, and labs
- appointments are often managed manually through calls, WhatsApp, or spreadsheets
- clinics and doctors struggle with queues, patient flow, and follow-ups without a unified system
- diagnostic centers and medical workflows often operate in disconnected silos
- patients lack a single, trusted place for records, appointments, prescriptions, and service tracking

This creates friction, inefficiency, and poor patient experience across the care journey.

## Solution

Upchar Health is a role-based healthcare mobile app designed to bring the core healthcare journey into one place.

Built with Expo + React Native, the app is structured around the real user personas that matter most:

- Patient
- Doctor
- Clinic
- Lab / Diagnostic

It provides a unified experience for:

- discovering healthcare providers
- booking and tracking appointments
- monitoring queue status
- viewing role-specific dashboards
- managing patient, clinic, and lab workflows
- onboarding through a guided experience

The project is designed as a mobile-first healthcare MVP and a strong front-end foundation for future Supabase-backed production integration.

## Why this app matters

The product aim is simple but important:

- reduce fragmentation in healthcare access
- give patients one place to manage care touchpoints
- help clinics and doctors operate more efficiently
- support diagnostic and lab workflows in a single platform
- create an extensible architecture ready for backend integration

## App overview

Upchar Health is a prototype healthcare platform with a role-based interface and demo-style data flow. Users can switch between patient, doctor, clinic, and lab experiences and explore the core journeys without requiring a live backend.

### Core user journeys

- Patient dashboard and health discovery
- doctor booking and related schedule flow
- clinic queue and operational view
- lab/diagnostic workflow and reporting views
- onboarding and role selection

## Features

### Patient experience

- onboarding flow
- role-based access and demo login
- dashboard summary cards
- provider/clinic discovery experience
- appointment booking UX
- queue status and tracking components
- record and prescription-oriented UI views

### Doctor experience

- doctor dashboard overview
- patient queue experience
- clinic schedule and consultation flow
- service status and operational cards
- role-specific healthcare workflow components

### Clinic experience

- clinic overview and performance cards
- queue management and patient flow view
- operational dashboard for appointments and services
- clinic-level quick actions and information panels

### Diagnostic / lab experience

- lab dashboard overview
- booking/card-based sample flow
- report and sample tracking UI
- operational views tailored to diagnostic teams

### Shared platform elements

- auth context and role management
- reusable components for cards, buttons, headers, status badges, and loaders
- theme tokens for consistent styling
- mock data-driven screens for demonstration

## Tech stack

- React Native
- Expo
- TypeScript
- Expo Router
- React Native Safe Area Context
- AsyncStorage
- Supabase client library (included in dependencies and designed for future backend integration)
- Ionicons for UI icons

## Project structure

```text
upcharapp/
├── app.json
├── package.json
├── tsconfig.json
├── README.md
├── PRD(1).md
├── TRD(1).md
├── LICENSE
├── assets/
│   ├── images/
│   └── expo.icon/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── onboarding.tsx
│   │   ├── role-selection.tsx
│   │   └── schedule-detail.tsx
│   ├── components/
│   │   ├── appointment/
│   │   ├── auth/
│   │   ├── clinic/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── diagnostic/
│   │   ├── doctor/
│   │   ├── home/
│   │   ├── medical/
│   │   ├── navigation/
│   │   ├── onboarding/
│   │   ├── patient/
│   │   ├── queue/
│   │   └── records/
│   ├── constants/
│   │   └── roleConfig.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ClinicContext.tsx
│   ├── data/
│   ├── hooks/
│   ├── services/
│   │   ├── mock/
│   │   └── supabase/
│   ├── theme/
│   ├── types/
│   └── ...
└──
```

## Architecture notes

The app follows a clear mobile app structure:

- entry screen handles onboarding and auth gating
- role-based UI is selected from the auth context
- reusable UI components power the dashboards
- mock service and data layers allow UI exploration without backend requirements
- Supabase integration is scaffolded and intended for production data access

This is a strong MVP foundation for a healthcare product rather than a fully production-ready backend-integrated system.

## Role model

The current app supports a role-driven front-end experience for:

- patient
- doctor
- clinic
- lab

This aligns with the broader healthcare ecosystem and the need to separate user experiences by operational responsibility.

## Running the app locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start the Expo development server

```bash
npm start
```

### 3) Run on a platform

```bash
npm run android
```

```bash
npm run ios
```

```bash
npm run web
```

## Available scripts

```json
"scripts": {
  "start": "expo start",
  "dev": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint"
}
```

## Environment and backend readiness

This repository currently contains the mobile application shell and UI prototypes with mock/demo behavior in the auth and dashboard layers.

For a production-grade implementation, the next step would be to connect the project to a real backend and secure the app with environment variables such as:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

The repository is structured to support that direction, but the current codebase is better understood as a frontend MVP/demo rather than a fully hardened healthcare platform.

## Design and UX principles

The application emphasizes:

- clean, trustworthy healthcare visual language
- role clarity
- readable cards and dashboard layouts
- onboarding-driven adoption
- status-aware UI elements
- task-oriented patient and provider flows

## Current status

This repo is a frontend prototype for a healthcare product MVP with:

- Expo + React Native foundations
- role-based user experience
- onboarding and authentication flow
- mock/demo data for patient and provider scenarios
- reusable UI components and app structure

### Important limitation

The app is not yet a production healthcare backend integration. Current auth and dashboard behavior are demo-driven and should be treated as a design and product foundation, not a live clinical system.

## Recommended next steps

1. connect real Supabase authentication and role checks
2. replace mock data with live backend queries
3. implement secure patient/doctor/clinic/lab data access
4. add appointment, queue, and record APIs
5. add real notifications and deep linking
6. harden security and production environment configuration

## Documentation included in repo

- PRD(1).md — product requirements for the healthcare platform
- TRD(1).md — technical requirements and architecture guidance

These documents provide the product and engineering context for the app and can be used as the foundation for the next implementation phase.

## License

This project is licensed under the 0BSD license.

## Summary

Upchar Health addresses the real-world problem of fragmented digital healthcare by offering a single, role-aware mobile application that simplifies patient access, provider workflows, and healthcare operations. The current repo is a strong MVP-style foundation that demonstrates the product vision and app experience, with a clear path toward backend integration and production readiness.
