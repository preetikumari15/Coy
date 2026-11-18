# Coy — "Discover" Tab (SDE Intern Assignment)

A mobile-first swipe discovery experience built alongside Coy's core privacy model: **never revealing one-sided interest unless a match is mutual**.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express, JSON file persistence (`server/store.json`)

## Features Implemented
- **Seeded Deck (32 Profiles):** Includes name, age, avatar, bio, college/city, and interests, with pre-seeded incoming likes for live match demos.
- **Swipe Gestures & Desktop Controls:** Touch drag gestures with real-time `LIKE` / `NOPE` overlays, desktop action buttons, and `ArrowLeft` / `ArrowRight` keyboard shortcuts.
- **Privacy-First Matching:** `GET /feed` strips internal incoming-like flags so client network inspection cannot reveal who liked the user prior to a mutual match.
- **Persistence:** Swipes and mutual matches persist across page reloads and server restarts.

## Running Locally

### 1. Start the Backend (`http://localhost:5000`)
```bash
cd server
npm install
node index.js