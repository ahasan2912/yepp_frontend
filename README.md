# Yepp Ads — Frontend

Yepp Ads is a location-based advertising platform that helps users discover nearby shops, outlets, offers, discounts, and promotional deals.

This repository contains the frontend application built with React.js, Vite, Redux Toolkit, Tailwind CSS, and other modern frontend technologies.

## Features

- 📍 Location-based shop and outlet discovery
- 🎯 Browse advertisements, offers, and promotional deals
- 🗺️ Google Maps integration for location selection
- 🔔 Firebase Cloud Messaging (FCM) notifications
- 🔄 Dynamic location switching
- 📱 Fully responsive user interface
- 🔐 Authentication and protected routes
- 💾 Persistent application state with Redux Persist
- 🛒 Deal and offer management
- 📊 Data visualization and reporting
- 🔔 Toast notifications
- 📷 QR code support
- ⚡ Smooth animations and interactive UI
- 📡 REST API integration

## Tech Stack

### Frontend

- React.js
- React Router
- JavaScript
- Vite
- Tailwind CSS

### State Management

- Redux Toolkit
- React Redux
- Redux Persist

### API & Data

- Axios
- REST API

### Authentication & Notifications

- Firebase
- Firebase Cloud Messaging
- JS Cookie

### Maps & Location

- Google Maps API
- `@react-google-maps/api`

### UI & Utilities

- Lucide React
- React Hot Toast
- React Hook Form
- React Phone Input
- Swiper
- GSAP
- Moment.js
- React QR Code
- Recharts

## Project Structure

```text
yepp_frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md

## Environment Variables

Before running the application, create a `.env` file in the project root directory.

```env
VITE_API_BASE_URL=your_backend_api_url

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
