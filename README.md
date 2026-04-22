# MoonShade

Make bright websites easier on the eyes with per-site dark mode, dimming, and night-friendly visual tuning.

## Features

- **Global toggle** — enable or disable MoonShade across all sites with one switch
- **Per-site control** — choose exactly which sites get dimmed
- **Intensity slider** — adjust from 10% to 100% opacity
- **Two modes** — *Dim* (neutral dark overlay) or *Warm* (amber-tinted for night reading)
- **Custom CSS** — inject your own CSS rules per site for deeper visual tweaks
- **Auto-applies on load** — enabled sites are dimmed automatically when you open or navigate to them

## Install

### From Chrome Web Store

*(Pending publication)*

### From source

1. Clone the repo and build:
   ```bash
   git clone https://github.com/kianwoon/MoonShade.git
   cd MoonShade
   npm install
   npm run build
   ```
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `dist/` folder

## How It Works

MoonShade uses a lightweight, non-invasive overlay approach:

- A content script is injected on every page at `document_idle`
- It reads local storage to check if the current site is enabled
- If enabled, a fixed-position overlay `<div>` is appended with a semi-transparent background
- If not enabled, the script exits immediately — no DOM changes, no data access

All preferences are stored in `chrome.storage.local`. No data ever leaves your browser.

## Development

```bash
# Install dependencies
npm install

# Type-check
npx tsc --noEmit

# Build for production
npm run build

# Watch mode (rebuild on file change)
npm run dev
```

Built with [Vite](https://vite.dev/) and TypeScript. Manifest V3.

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Access the current tab to apply overlays |
| `scripting` | Inject the overlay element and custom CSS |
| `storage` | Save your preferences locally |
| `<all_urls>` | Content script checks per-site settings; exits immediately on non-enabled sites |

## Privacy

MoonShade collects no data. See the [Privacy Policy](https://kianwoon.github.io/MoonShade/).

## License

MIT
