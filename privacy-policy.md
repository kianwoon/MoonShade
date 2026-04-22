# MoonShade Privacy Policy

**Last updated:** April 23, 2026

---

## Overview

MoonShade is a Chrome browser extension that applies per-site dark mode, dimming, and custom CSS overlays. This privacy policy describes how MoonShade handles user data.

## Data Collection

**MoonShade does not collect, transmit, or share any personal data.**

Specifically, MoonShade:

- Does **not** collect personal information
- Does **not** collect browsing history or track which websites you visit
- Does **not** use cookies, analytics, or tracking technologies
- Does **not** communicate with any external servers or APIs
- Does **not** sell, share, or distribute any user data

## Data Storage

All user preferences are stored locally on your device using `chrome.storage.local`. This includes:

- Global on/off toggle state
- Per-site enable/disable settings
- Intensity level (10–100%)
- Display mode preference (dim or warm)
- Custom CSS snippets per site

This data never leaves your browser. MoonShade has no server-side component.

## Permissions

MoonShade requests the following browser permissions:

| Permission | Purpose |
|---|---|
| `activeTab` | Access the current tab to apply visual overlays |
| `scripting` | Inject dark mode overlay and custom CSS into enabled sites |
| `storage` | Save your preferences locally across browser sessions |
| `<all_urls>` (host access) | Content script checks if the current site is enabled; exits immediately on non-enabled sites without any data access |

## Third Parties

MoonShade does not integrate with, send data to, or rely on any third-party services.

## Changes

If this policy changes, the updated version will be posted on this page with a revised date.

## Contact

For questions about this policy, open an issue on the [GitHub repository](https://github.com/kianwoon/MoonShade/issues).
