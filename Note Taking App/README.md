# Noto

**Noto** is a lightweight note-taking app for capturing ideas quickly and keeping them available offline. Its focused editor and uncluttered list make it useful for short notes, reminders, and everyday thoughts.

## Features

- Create, edit, and delete notes
- Title and body editor with a simple reading list
- Local persistence with AsyncStorage
- Recovery-friendly loading and reset flow for unreadable local data
- Empty states, loading feedback, and save error handling
- Responsive layout for phones, tablets, and the web

## Orientation

Phones are locked to portrait mode. Tablets support both portrait and landscape modes. The app applies the device-aware policy with `expo-screen-orientation`.

## Tech stack

- Expo SDK 57 and React Native 0.86
- JavaScript
- AsyncStorage
- Expo Asset, Fonts, Screen Orientation, and Status Bar
- Node's built-in test runner

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

The test suite covers note serialization, normalization, identifiers, and legacy storage migration behavior.

## Privacy

Notes stay on the device. Noto does not use an account, analytics, advertising, or a remote notes service.

## Demo

[Watch the demo video](https://www.youtube.com/shorts/rjLIKyByWZo)
