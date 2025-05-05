# Doctor Finder

https://capstone2024-five.vercel.app/

## Overview

Doctor Finder is a comprehensive web application that connects patients with healthcare providers based on specialty, location, insurance acceptance, and other criteria. Built with Next.js and Firebase, the platform offers a seamless, user-friendly experience for both patients seeking medical care and doctors looking to expand their practice.

## Features

### For Patients
- **Advanced Search**: Filter doctors by specialty, location, insurance, availability, and ratings
- **Interactive Maps**: See doctor locations with Google Maps integration
- **Patient Reviews**: Read and leave reviews for doctors you've visited
- **Appointment Scheduling**: Request appointments directly through the platform
- **User Profiles**: Save your favorite doctors and medical preferences

### For Doctors
- **Professional Profiles**: Create comprehensive profiles showcasing your expertise, education, and services
- **Availability Management**: Set your working hours and appointment slots
- **Patient Communication**: Respond to patient inquiries and appointment requests
- **Review Management**: View and respond to patient reviews
- **Analytics Dashboard**: Track profile views and appointment requests

## Tech Stack

- **Frontend**: Next.js 15.1.6, React 18.3.12, TypeScript 5.6.3
- **Styling**: TailwindCSS 3.4.1, ShadCN UI components
- **Backend**: Firebase 11.0.1 (Authentication, Firestore, Cloud Functions)
- **Deployment**: Vercel
- **Maps Integration**: Google Maps Embed API v1
- **Geolocation**: IPGeolocation.io API
- **Code Quality**: ESLint 8, Prettier 3.3.3

## Installation

1. Clone the repository
```bash
git clone https://github.com/markie-dev/capstone2024.git
```

2. Navigate to the project directory
```bash
cd capstone2024/doctor-finder
```

3. Install dependencies
```bash
npm install
```

4. Create environment variable file
```bash
touch .env.local
```

5. Add the following environment variables to the .env.local file
```
FIREBASE_API_KEY=<your-firebase-api-key>
FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
FIREBASE_APP_ID=<your-firebase-app-id>
FIREBASE_MEASUREMENT_ID=<your-firebase-measurement-id>
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
IPGEOLOCATION_API_KEY=<your-ipgeolocation-api-key>
```

> **Note:** Your Google Maps key only needs to have embed capabilities

> **Note:** You can obtain an IPGeolocation API key from [ipgeolocation.io](https://ipgeolocation.io/ip-location-api.html)

6. Deploy and set up Firebase Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

7. Return to project root and start the development server
```bash
cd ..
npm run dev
```

8. Open your browser and navigate to `http://localhost:3000`

## Deployment

The application is designed to be deployed on Vercel:

1. Create a Vercel account and connect it to your GitHub repository
2. Set up all environment variables in the Vercel dashboard
3. Deploy the application with automatic updates on push to main branch

## Project Structure

- `app/`: Main application code and pages
- `api/`: Next.js server actions for Firebase, Google Maps, and geolocation
- `components/`: Reusable UI components (buttons, forms, doctor cards, etc.)
- `functions/src/`: Firebase Cloud Functions (including doctor rating updates)
- `hooks/`: Custom React hooks (including toast notifications)
- `public/`: Static assets and images
- `.env.local`: Environment variables configuration
- `next.config.mjs`: Next.js configuration
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.js`: ESLint rules for code quality
- `.prettierrc`: Prettier configuration for code formatting

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication services (Email/Password, Google Sign-in)
3. Create Firestore collections for doctors, users, reviews, and appointments
4. Configure Firestore Security Rules to secure your data
5. Set up Cloud Functions for background processes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting checks before committing
```bash
npm run lint
```
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Documentation & Resources

- [Firebase Documentation](https://firebase.google.com/docs/web/setup)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/guides/nextjs)
- [ShadCN UI Components](https://ui.shadcn.com/docs/components)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation/embed/get-started)
