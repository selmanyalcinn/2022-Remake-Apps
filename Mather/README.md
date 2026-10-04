# Mather

Mather is an offline-first math equation puzzle built with React Native and Expo. Find the hidden eight-character equation in six attempts, play a daily puzzle based on your local calendar day, or solve unlimited random games.

## Features

- Daily challenge refreshes at local midnight on each device
- Unlimited random equations with correct operation precedence
- Wordle-style duplicate-aware scoring
- English and Turkish interfaces
- Persistent light/dark theme and accessibility-friendly settings
- Haptic and animated feedback controls
- Local statistics: games, wins, losses, streaks, cups, and guess distribution
- Resume-safe local game state using AsyncStorage
- Privacy-friendly daily result sharing with emoji tiles only
- Responsive layouts for small screens, tablets, web, and notched devices
- No accounts, advertisements, analytics, or backend dependency

## Tech stack

- Expo SDK 57
- React Native 0.86 / React 19
- React Navigation 7
- AsyncStorage
- Expo Haptics, Splash Screen, and Updates
- Jest, ESLint, and TypeScript JavaScript checking

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

If a physical device cannot reach Metro over the local network:

```bash
npx expo start --tunnel
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run check
```

The test suite covers equation generation and validation, duplicate-aware cell scoring, local date boundaries, countdown formatting, and share-grid output.

## Daily puzzle and time model

Daily equations are generated deterministically from the device's local calendar date. This lets each country move to its next puzzle at local midnight and requires no server. Because the app is fully offline, deliberate device-clock manipulation cannot be prevented completely without using a trusted network time source.

## Local data and privacy

All progress, statistics, and preferences remain in AsyncStorage on the device. Result sharing opens the native share sheet and does not include the secret equation. See [Privacy Policy](./PRIVACY.md) and [Terms of Use](./TERMS.md).

## EAS Build and Update

Build profiles are defined in `eas.json`:

- `development`: internal development client
- `preview`: internal QA build on the `preview` update channel
- `production`: store build on the `production` update channel

The runtime version follows the app version, so native dependency changes require a new binary. After linking the repository to an Expo account, finish the account-specific setup with:

```bash
npx eas-cli@latest update:configure
npx eas-cli@latest build --profile preview --platform android
npx eas-cli@latest update --channel preview --environment preview --message "Preview update"
```

The generated Expo project ID and update URL are account-owned values and must not be fabricated or copied from another project.

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

## License

Copyright © 2026. No open-source license has been granted yet.
