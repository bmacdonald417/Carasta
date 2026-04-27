# Carmunity Profile QR (Phase 1)

## Goal
Add a premium, unobtrusive **profile QR** entry point on user profiles without showing a QR by default.

## UX
- **Trigger**: small QR icon button in the profile **Action row** (near Share + Follow).
- **On click**: opens a lightweight dialog containing:
  - scannable QR code
  - helper text (“Scan to view this profile on Carasta”)
  - **Copy profile link** action
  - **Download QR (PNG)** action (safe client-side canvas export)

## URL pattern
- Uses the existing canonical public profile route already used throughout the app:
  - `"/u/:handle"`
- The QR encodes an **absolute URL** at runtime:
  - `window.location.origin + "/u/:handle"`

## Implementation notes
- QR rendering uses `qrcode.react` (`QRCodeCanvas`) for a reliable, scannable canvas output.
- Download uses `canvas.toDataURL("image/png")` and an `<a download>` click.
- The QR itself is rendered on a **white** tile to improve scan reliability across devices.

## Scope / intentionally deferred
- No expansion into car/event QR or a generalized sharing architecture.
- No server-side QR generation endpoint (client-only is sufficient for this phase).

