# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds all React Native code. Top-level navigation lives in `src/App.js`, shared UI resides in `src/components/`, and feature pages (예: `CareScreen.js`) live in `src/screens/`.
- Tests reside in `__tests__/` and mirror component names (예: `App.test.tsx`). Keep new suites here to simplify Jest discovery.
- Native shells stay in `ios/` and `android/`; open the workspace via `ios/BloomDent.xcworkspace` for Xcode and `android/` in Android Studio.
- Ruby dependencies are vendored under `vendor/bundle/`; keep updates scoped to iOS changes.
- Tooling configs (`babel.config.js`, `metro.config.js`, `jest.config.js`) remain at the repository root—update them cautiously and document changes.

## Build, Test, and Development Commands
- `npm start` — boots the Metro bundler; keep this running during local work.
- `npm run ios` / `npm run android` — launches the app on a simulator or attached device (Metro must be active).
- `bundle exec pod install` (from `ios/`) — syncs CocoaPods after dependency changes.
- `npm run lint` — runs ESLint using the shared React Native config.
- `npm test` — executes the Jest suite with React Test Renderer integration.

## Coding Style & Naming Conventions
- Follow ESLint + Prettier defaults: 2-space indent, single quotes, dangling commas disabled, semicolons enabled.
- Components, hooks, and providers use PascalCase file names (`SurveyComponent.js`); utilities remain camelCase.
- Centralize reusable UI in `src/components/` to avoid bulky screen files; keep styles co-located via `StyleSheet.create`.
- Prefer TypeScript for new tests (`*.test.tsx`), while application code stays in JavaScript unless migration is planned.

## Testing Guidelines
- Use Jest for unit and snapshot coverage; run `npm test` before raising a PR.
- Mirror source names in `__tests__/` and group related expectations inside `describe` blocks for clarity.
- When updating UI states (예: 설문 점수 계산), add regression tests that capture expected values or rendered branches.
- Flag flaky tests in the PR description and include reproduction steps if they touch native layers.

## Commit & Pull Request Guidelines
- Match the existing Conventional Commit style (`type: summary`), keeping the summary in Korean 또는 English present tense (예: `chore: ios pod update`).
- Reference issue IDs or ticket codes in the body when applicable; note native-side steps such as `pod install`.
- PRs should outline the change scope, include screenshots or screen recordings for UI updates, and list manual/automated test evidence.
- Request design/Product 리뷰 when adjusting copy or layout, and note any follow-up tasks in the PR checklist.
