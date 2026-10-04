# Mather

**Mather** is an offline-first math equation puzzle built with React Native and Expo. Find the hidden eight-character equation in six attempts, solve a daily puzzle based on the local calendar day, or keep playing unlimited random games.

## Features

- Daily challenge that refreshes at local midnight
- Unlimited random equations with correct operator precedence
- Wordle-style scoring with duplicate-aware cell evaluation
- English and Turkish interfaces
- Persistent light and dark themes
- Haptic and animated feedback controls
- Local games, wins, losses, streaks, trophies, and guess distribution
- Resume-safe local game state using AsyncStorage
- Emoji-only result sharing that keeps the equation private
- Responsive layouts for phones, tablets, web, and notched devices

## Orientation

Phones open in portrait mode. Tablets support both portrait and landscape modes. The app detects the device class at runtime and applies the appropriate orientation policy.

## Tech stack

- Expo SDK 57
- React Native 0.86 and React 19
- React Navigation 7
- AsyncStorage
- Expo Haptics, Splash Screen, Updates, and Screen Orientation
- Jest, ESLint, and TypeScript checks

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

## Quality checks

```bash
npm run check
```

The tests cover equation generation and validation, duplicate-aware scoring, local date boundaries, countdown formatting, and share-grid output.

## Daily puzzle and privacy

Daily equations are generated deterministically from each device's local calendar date. All progress, statistics, and preferences remain in AsyncStorage. The app has no account, advertising, analytics, or backend dependency.

See [PRIVACY.md](./PRIVACY.md) and [TERMS.md](./TERMS.md) for the included legal pages.

## Project structure

```text
Components/       Shared game and navigation UI
Functions/        Equation, validation, and statistics logic
Pages/            Home, game, settings, and legal screens
src/context/      Theme and preference persistence
src/hooks/        Countdown and feedback hooks
src/i18n/         English and Turkish copy
src/theme/        Design tokens
src/utils/        Result-sharing helpers
__tests__/        Automated logic tests
```
