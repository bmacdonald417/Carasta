# One-time (or repeat-safe) Flutter setup for Carmunity by Carasta.
# From carmunity_app:  pwsh .\tool\setup.ps1
$ErrorActionPreference = "Stop"

# ZIP is at ...\flutter_windows_3.41.6-stable\ ; SDK root is the inner `flutter` folder (contains bin\).
$DefaultFlutterSdkRoot = "C:\Users\bmacd\Downloads\flutter_windows_3.41.6-stable\flutter"
$FlutterBat = if ($env:FLUTTER_ROOT) {
  Join-Path $env:FLUTTER_ROOT "bin\flutter.bat"
} else {
  Join-Path $DefaultFlutterSdkRoot "bin\flutter.bat"
}

if (-not (Test-Path $FlutterBat)) {
  throw @"
Flutter not found at:
  $FlutterBat

Install Flutter or set FLUTTER_ROOT to your SDK folder (the one that contains bin\flutter.bat).
"@
}

$AppDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $AppDir

Write-Host "Using Flutter: $FlutterBat"
Write-Host "App directory: $AppDir"

& $FlutterBat pub get
& $FlutterBat create . --platforms=windows,ios,web
& $FlutterBat analyze

Write-Host ""
Write-Host "Setup finished. Run the app with:"
Write-Host "  pwsh .\tool\run_windows_prod.ps1"
Write-Host "or open this folder in VS Code / Cursor and use the launch configuration."
