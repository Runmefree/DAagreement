# Frontend - Vite React Auth App

A modern React application built with Vite for user authentication and dashboard.

## Features

- Landing Page
- Login & Signup Pages
- Google OAuth Integration  
- User Dashboard
- Responsive Design
- TypeScript Support

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── pages/          # Page components
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── LoginSuccessPage.tsx
│   ├── LoginFailurePage.tsx
│   ├── SignupSuccessPage.tsx
│   └── Dashboard.tsx
├── context/        # React Context
│   └── AuthContext.tsx
├── styles/         # CSS stylesheets
├── services/       # API services
├── components/     # Reusable components
├── App.tsx         # Main App component
└── main.tsx        # Entry point
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=357095799558-j0sipl6qhovh51003ac47nfpimr6hgki.apps.googleusercontent.com
```

## Technologies

- React 18
- TypeScript
- Vite
- React Router v6
- Google OAuth

## API Integration

The app connects to a backend server at `http://localhost:5000`. Make sure the backend is running before using the app.
