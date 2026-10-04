# Beste Bes

**Beste Bes** is an offline Turkish word puzzle built with React Native and Expo. Find the hidden five-letter word in six attempts, return for a new daily challenge, or keep playing unlimited games without an account or network connection.

## Features

- Daily puzzle that refreshes at local midnight
- Unlimited random games with resume support
- Wordle-style scoring with correct duplicate-letter handling
- Turkish and English interface copy
- Light and dark themes with persistent preferences
- Haptic feedback and subtle transitions
- Local statistics, streaks, trophies, and guess distribution
- Emoji result sharing without revealing the answer
- Static, offline dictionary data generated from Turkish dictionary sources

## Orientation

Phones open in portrait mode. Tablets support both portrait and landscape layouts. The responsive game board is designed for small phones, larger tablets, and the web.

## Tech stack

- Expo SDK 57
- React Native 0.86 and React 19
- React Navigation 7
- AsyncStorage for local progress and preferences
- Expo Haptics, Updates, Splash Screen, and Screen Orientation
- Jest, ESLint, and TypeScript checks

## Getting started

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm start
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

This runs linting, TypeScript validation, and the Jest test suite.

## Dictionary generation

The runtime dictionary is bundled with the app, so gameplay does not need an API or backend. When the source JSON is updated, regenerate the static data with:

```bash
npm run words:generate -- /path/to/gts.json
```

The generated word lists, filtering rules, and attribution details are documented in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Privacy

Game progress, preferences, and statistics stay on the device. The app does not require accounts, analytics, advertising, or a backend. See [PRIVACY.md](./PRIVACY.md) and [TERMS.md](./TERMS.md) for the legal pages included in the project.
