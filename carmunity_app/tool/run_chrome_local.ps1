# Run Carmunity in Chrome against local Next.js (npm run dev on :3000).
# Use this when the Windows desktop target is unavailable (install Visual Studio
# "Desktop development with C++" for flutter run -d windows).
$ErrorActionPreference = "Stop"

$DefaultFlutterSdkRoot = "C:\Users\bmacd\Downloads\flutter_windows_3.41.6-stable\flutter"
$FlutterBat = if ($env:FLUTTER_ROOT) {
  Join-Path $env:FLUTTER_ROOT "bin\flutter.bat"
} else {
  Join-Path $DefaultFlutterSdkRoot "bin\flutter.bat"
}

if (-not (Test-Path $FlutterBat)) {
  throw "Flutter not found at $FlutterBat. Set FLUTTER_ROOT or install Flutter."
}

$AppDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $AppDir

& $FlutterBat run -d chrome `
  --dart-define=API_BASE_URL=http://localhost:3000 `
  --dart-define=APP_ENV=dev
