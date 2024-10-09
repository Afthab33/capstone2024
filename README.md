# Doctor Finder

Doctor Finder is a web app that helps you find doctors near you. You can search for doctors by what they do, where they are, and what insurance they take. Doctors can make their own profile to show patients what they offer. We made it to make finding a doctor less of a headache. Whether you need a checkup or you're a doctor looking for patients, Doctor Finder's got you covered.

## Installation

1. Clone the repository
```
git clone https://github.com/markie-dev/capstone2024.git
```
2. cd into the project
```
cd doctor-finder
```
3. Install dependencies
```
npm install
```

3. Create environment variable file
```
touch .env.local
```

4. Add the following environment variables to the .env.local file
```
FIREBASE_API_KEY=<your-firebase-api-key>
FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
FIREBASE_APP_ID=<your-firebase-app-id>
FIREBASE_MEASUREMENT_ID=<your-firebase-measurement-id>
```


5. Start the development server
```
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Contributing

In order to see your changes on vercel, run the following command to check for linting errors:
```
npm run lint
```
After fixing any errors, you may commit your code.

## Group Members

- Trung Du
- Marcus Ellison
- Daniel Wagner
- Layth Gharbia
- Mark Oladipo

## Documentation

### Firebase -https://firebase.google.com/docs/web/setup

### Next.js - https://nextjs.org/docs

### Tailwind CSS - https://tailwindcss.com/docs/guides/nextjs

### Shadcn - https://ui.shadcn.com/docs/components


