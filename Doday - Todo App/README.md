# Tudu

**Tudu** is a calm, local-first task manager for turning everyday plans into a clear, searchable list. It is designed around quick capture, useful organization, and reliable offline persistence.

## Features

- Create, edit, complete, and delete tasks
- Categories for general, work, personal, shopping, and education tasks
- Priority and due-date support
- Filters for all, active, and completed tasks
- Fast task search
- Haptic feedback for key actions
- Safe AsyncStorage persistence with validation and recovery-friendly errors
- Responsive layout for phones, tablets, and the web

## Orientation

Phones are locked to portrait mode. Tablets support both portrait and landscape modes. The policy is applied from the Expo Router root layout with `expo-screen-orientation`.

## Tech stack

- Expo SDK 57
- React Native 0.86 and React 19
- Expo Router with file-based navigation
- AsyncStorage for local task data
- Expo Haptics, Image, Fonts, and Web Browser
- TypeScript, ESLint, and Jest/Expo tooling

## Getting started

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npx expo start
```

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Project structure

```text
app/          Expo Router entry points
components/   Task cards, modals, and shared UI
constants/    Colors and theme values
hooks/        Reusable React hooks
utils/        Date, search, and haptic helpers
```

## Data and privacy

Tasks are stored locally on the device with AsyncStorage. There is no account, server, analytics, or remote task database in this project. Local data is validated when loaded so malformed storage does not silently overwrite an existing task list.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
```
