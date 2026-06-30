# Tasks: Provider 设置与 API Key 安全

## Phase 1: Settings Modal

- [x] T001 Create SettingsModal component in apps/web/src/components/SettingsModal.tsx — Provider selector (4 options), API Key input (password type), Base URL, Model ID, privacy notice, save/clear buttons
- [x] T002 Integrate SettingsModal into NavSidebar in apps/web/src/components/NavSidebar.tsx — replace alert() with modal toggle

## Phase 2: Data Persistence

- [x] T003 Implement localStorage read/write in SettingsModal — save to `llm_viz_settings`, load on mount
- [x] T004 [P] Add legacy config migration — auto-detect old `{ apiKey }` format and migrate to new format
- [x] T005 [P] Add API Key clear function — clear key from localStorage and UI

## Phase 3: Integration

- [x] T006 Verify api.ts getSettings() reads new format correctly
- [x] T007 TypeScript typecheck
- [x] T008 Manual test: save settings → refresh → settings persist; switch provider → key not overwritten

## Notes

- API Key input MUST use type="password"
- Privacy notice text per Constitution required
- Base URL auto-fill based on selected Provider
