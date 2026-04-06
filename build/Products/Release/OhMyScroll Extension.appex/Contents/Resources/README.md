# OhMyScroll (Safari Web Extension MVP)

`OhMyScroll` brings Firefox-like auto-scroll behavior to Safari pages within Safari's extension limits.

## What this MVP does

- Middle-click on page content to enable auto-scroll mode.
- Mouse movement scrolls vertically and horizontally with a smooth speed curve.
- Uses the white hand cursor by default; users can switch to yellow in extension settings.
- Auto-scroll exits on:
  - Any non-middle mouse click (first click only exits; second click performs page action)
  - `Escape`
  - Tab/window losing focus
- Safari toolbar button toggles extension state (`ON`/`OFF`) and persists it.

## Why this implementation is safer

- Uses a requestAnimationFrame loop instead of direct `mousemove` scrolling.
- Has a dead zone to prevent accidental tiny movements from scrolling.
- Clamps speed to avoid sudden jumps.
- Tries nearest scrollable container first, then falls back to document scrolling.
- Ignores editable elements and link middle-clicks by default to reduce conflicts.

## Files

- `manifest.json`: Extension manifest and script injection.
- `content.js`: Core auto-scroll state machine.
- `content.css`: Active cursor visuals.
- `background.js`: Toolbar toggle and state synchronization.

## Run in Safari

1. Convert this folder to a Safari extension app:
   - `xcrun safari-web-extension-converter /Users/altan/Documents/mini-scroll`
2. Open generated Xcode project.
3. Build and run the macOS container app.
4. In Safari:
   - Open `Settings` > `Extensions`
   - Enable `OhMyScroll`
   - Allow on websites you want to test

## Notes on Safari limits

- Safari can still reserve middle-click behavior in some contexts.
- This extension cannot create an OS-level overlay; all visuals are page-injected.
- Browser-special pages, some PDFs, and restricted iframes may not be scriptable.

## Tuning

You can tune behavior in `content.js`:

- `deadZonePx`
- `baseSpeed`
- `curveExponent`
- `maxSpeedPerFrame`
- `ignoreMiddleClickOnLinks`

User-facing cursor style is configurable in extension settings (white or yellow hand).
