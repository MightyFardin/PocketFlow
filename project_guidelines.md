# PocketFlow - Project Guidelines & User Preferences

This file serves as the permanent memory for the PocketFlow project. Future agents and developers MUST strictly adhere to these rules.

## Core Preferences
1. **Language**: Always communicate with the user in **English**.
2. **App Scope**: This is a minimalist personal expense and income tracker. **DO NOT** implement banking features, money transfers, payment processing, or bank account syncing.
3. **Data Integrity**: **ABSOLUTELY NO DUMMY DATA**. All data must be fetched and written live via the connected Firebase Firestore database. The app must remain production-ready.

## Database Architecture
- **Backend**: Firebase Firestore.
- **Real-time Sync**: Must use `onSnapshot` for WebSockets-like real-time data synchronization. Do not implement a separate Node.js/Socket.io backend.
- **Collections**:
  - `pocketflow_transactions`: Stores all income and expense logs.
  - `pocketflow_goals`: Stores savings goals.

## UI / UX Design System
- **Aesthetics**: Strictly **Minimalist**.
- **Forbidden Styles**: NO gradients (`bg-gradient`), NO glassmorphism (`backdrop-blur` heavily used for main components). Keep it flat, clean, and professional.
- **Icons**: Use consistent, colorful icons (via `lucide-react`). Ensure icons don't default to monochrome black/white in light/dark modes.
- **Theme**: Support Dark Mode and Light Mode with zero FOUC (Flash of Unstyled Content) on reload. Theme state must be saved in `localStorage`.

## Business Logic
1. **No Fixed Budgets**: There are no arbitrary or hardcoded budget limits (e.g., a fixed $3000 budget). 
2. **Income-Driven Allocation**: All spending limits and budget calculations must dynamically depend on the **Total Monthly Income**. The "Budgets" page is designed as an "Income Allocation" tracker.
3. **Calendar**: The Calendar feature is a core component. It must remain fully interactive, allowing users to click specific days to see detailed transaction breakdowns and add new entries.
