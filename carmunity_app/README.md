# Carmunity by Carasta

Flutter client for **iOS** and **Windows**, sharing the Carasta web/backend platform.

## Quick setup (Windows)

From **`carmunity_app`** in PowerShell:

```powershell
pwsh .\tool\setup.ps1
```

That runs `flutter pub get`, generates **Windows** + **iOS** platform folders (`flutter create`), and `flutter analyze`.

Then run against **production**:

```powershell
pwsh .\tool\run_windows_prod.ps1
```

Or against **local** Next.js on port 3000:

```powershell
pwsh .\tool\run_windows_local.ps1
```

Scripts default to **`C:\Users\bmacd\Downloads\flutter_windows_3.41.6-stable\flutter`** (the inner `flutter` SDK folder). To use another install, set **`FLUTTER_ROOT`** to that SDK directory (the folder that contains `bin\flutter.bat`).

**VS Code / Cursor:** open the **`carmunity_app`** folder as the workspace (or use Run and Debug with `.vscode/launch.json` here so `${workspaceFolder}` points at this app).

## Prerequisites

- [Flutter](https://docs.flutter.dev/get-started/install) 3.24+ (Dart 3.3+)
- Running Carasta Next.js app (or deployed URL) for API calls

### Flutter SDK on this machine (Cursor / VS Code)

The workspace pins the Flutter SDK for the Dart/Flutter extension:

- **Path:** `C:\Users\bmacd\Downloads\flutter_windows_3.41.6-stable\flutter`  
- **Config:** repository root `.vscode/settings.json` → `dart.flutterSdkPath`

To use Flutter from a terminal, add the `bin` folder to your **PATH** (PowerShell for current session):

```powershell
$env:Path += ";C:\Users\bmacd\Downloads\flutter_windows_3.41.6-stable\flutter\bin"
```

Or set it permanently: Windows **Settings → System → About → Advanced system settings → Environment variables** → edit **Path** → add that `bin` path.

Other developers should change `.vscode/settings.json` (or use their own user settings) to match their install location.

## First-time setup

From this directory:

```bash
flutter pub get
```

If platform folders are missing:

```bash
flutter create . --platforms=ios,windows
```

## Run

Point the client at your API (no trailing slash):

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000 --dart-define=APP_ENV=dev
```

Windows:

```bash
flutter run -d windows --dart-define=API_BASE_URL=http://localhost:3000
```

### Provisional auth (Phase 2 engagement)

Mutations (like, comment, follow) need the same NextAuth session the website uses. Until Bearer tokens exist:

1. **You → Developer session** — paste **cookie name** (often `next-auth.session-token`) and **value** from browser DevTools, plus your **user id** from the database or profile tooling.
2. **Or** build with defines (dev only):

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000 \
  --dart-define=DEV_USER_ID=your_cuid \
  --dart-define=DEV_NEXTAUTH_SESSION_TOKEN=paste_cookie_value_here \
  --dart-define=DEV_SESSION_COOKIE_NAME=next-auth.session-token
```

See `../CARASTA_APP_PHASE_2_NOTES.md` and `../CARMUNITY_MOBILE_API_CONTRACT.md`.

## Verify

```bash
flutter analyze
flutter test
```

## Docs

- Repository root: `../CARASTA_APP_ARCHITECTURE_PLAN.md`
- Phase 1 notes: `../CARASTA_APP_PHASE_1_NOTES.md`
- Phase 2 notes: `../CARASTA_APP_PHASE_2_NOTES.md`
