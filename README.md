# Notis

Fast, private notes, lists, drawings and voice memos — one self-contained HTML app.
Everything is stored locally on the device (IndexedDB); nothing is uploaded anywhere.

## Live

- **App:** https://arbabtalha.github.io/notes/
- Old link (still works, redirects): https://arbabtalha.github.io/notes/Notis.html

Install it like an app: open the link in Chrome / Edge / Safari, then choose
**Install app** (Android/desktop) or **Add to Home Screen** (iPhone/iPad).
It works offline after the first visit.

> Why the link used to be broken: GitHub Pages serves the folder's `index.html`
> as the home page and this repository only had `Notis.html`, so
> `https://arbabtalha.github.io/notes/` returned **404**. The app now lives in
> `index.html` (and `Notis.html` forwards to it), so the plain link works.

## Run locally

```bash
npm start          # http://localhost:8080
# or
node server.mjs 3000
# or, without Node:
python3 -m http.server 8080
```

The local server is a zero-dependency `server.mjs`; it binds `0.0.0.0` so it also
works inside containers and preview sandboxes. Opening `index.html` directly from
disk still works too.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app (UI, styles, data layer) |
| `Notis.html` | Redirect from the old URL to `index.html` |
| `manifest.webmanifest` | PWA manifest (name, icons, standalone display) |
| `sw.js` | Service worker — offline app shell |
| `icons/` | App icons (192, 512, maskable 512) |
| `404.html` | Sends unknown paths back to the app |
| `server.mjs` | Local static server for development |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll) |

## Deploying

GitHub Pages is configured to publish the **default branch (`main`) at `/`**.
Push to `main` and the site rebuilds automatically — no build step, no dependencies.

## Data & privacy

Notes, lists, drawings, images and voice memos live in the browser's IndexedDB
(plus a small `localStorage` draft journal). Clearing site data or using a
private window removes them, so export/back up from Settings if the notes matter.

## Browser support

Chrome/Edge 105+, Safari 15.4+, Firefox 110+. Voice memos need microphone
permission and a secure origin (`https://` or `localhost`).
