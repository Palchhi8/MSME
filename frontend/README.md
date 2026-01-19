# MSME AI Frontend

React + Vite frontend for the MSME AI Business Manager. Handles Firebase authentication, CSV uploads, analytics dashboards, and Gemini-powered chat.

## Requirements
- Node.js 18+
- Backend API running (default `http://localhost:8080`)
- Firebase project with Email/Password auth enabled

## Setup
```bash
npm install
npm install axios firebase recharts react-router-dom
cp .env.example .env # fill Firebase + API config
npm run dev
```

## Environment Variables (`.env`)
```
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Scripts
- `npm run dev` – Vite dev server
- `npm run build` – Production build for Firebase Hosting
- `npm run preview` – Preview local build

## Deployment
1. Build with `npm run build`
2. Initialize Firebase Hosting (`firebase init hosting`)
3. Deploy `dist/` via `firebase deploy`
