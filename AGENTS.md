# Repository Guidelines

This guide summarizes the expectations for contributors working in the BloomDent React Native app.

## Project Structure & Module Organization
- `src/` contains all JS code; navigation starts in `src/App.js`, shared UI lives in `src/components/`, and feature screens sit in `src/screens/`.
- Tests mirror components in `__tests__/` (예: `__tests__/App.test.tsx`); keep names aligned so Jest picks them up automatically.
- Native shells stay in `ios/` and `android/`; open `ios/BloomDent.xcworkspace` for Xcode and the `android/` folder for Android Studio.
- Vendored Ruby gems reside in `vendor/bundle/`; only touch them when updating iOS dependencies. Tooling configs (`babel.config.js`, `metro.config.js`, `jest.config.js`) live at the repo root.

## Build, Test, and Development Commands
- `npm start` boots Metro; leave it running while iterating.
- `npm run ios` / `npm run android` launches the app in a simulator or attached device.
- From `ios/`, run `bundle exec pod install` after native dependency changes.
- `npm run lint` applies the shared ESLint rules; `npm test` executes the Jest suite.

## Coding Style & Naming Conventions
- Follow ESLint + Prettier defaults: 2-space indent, single quotes, semicolons on, no trailing commas.
- Components, hooks, and providers use PascalCase (`SurveyComponent.js`); utilities stay camelCase.
- Co-locate styles via `StyleSheet.create` next to each component, and move reusable UI into `src/components/`.
- Write new tests in TypeScript (`*.test.tsx`); app code remains in JavaScript unless migration plans change.

## Testing Guidelines
- Use Jest for unit and snapshot coverage; run `npm test` before every PR.
- Organize assertions inside descriptive `describe` blocks and mirror source file names under `__tests__/`.
- Add regression cases when altering UI or state calculations (예: 설문 점수 계산) and document any flaky scenarios in the PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`type: summary`) in Korean 또는 English present tense, e.g., `chore: ios pod update`.
- Reference related tickets in the commit body and note any required native follow-up such as `pod install`.
- PRs should outline scope, include screenshots or recordings for UI tweaks, and list manual or automated test evidence.
- Request design/Product 리뷰 before merging copy or layout updates and capture follow-up TODOs in the PR checklist.

## Configuration & Environment Tips
- Keep `.env` values out of source control; use the shared secure store when provisioning devices.
- After pulling large dependency changes, clear Metro caches with `npm start -- --reset-cache` to avoid stale bundles.
