# Run Carmunity on Windows against production Carasta.
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

& $FlutterBat run -d windows `
  --dart-define=API_BASE_URL=https://carasta-production.up.railway.app `
  --dart-define=APP_ENV=prod
