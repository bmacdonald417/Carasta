# Carmunity by Carasta

Flutter client for **iOS** and **Windows**, sharing the Carasta web/backend platform.

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

## Verify

```bash
flutter analyze
flutter test
```

## Docs

- Repository root: `../CARASTA_APP_ARCHITECTURE_PLAN.md`
- Phase 1 notes: `../CARASTA_APP_PHASE_1_NOTES.md`
