import type { OverlayMode } from '../lib/types'

const OVERLAY_ID = 'darkux-overlay'

interface SiteSettings {
  enabled: boolean
  customCSS: string
}

interface ExtensionState {
  globalEnabled: boolean
  intensity: number
  mode: OverlayMode
  sites: Record<string, SiteSettings>
}

const STORAGE_KEY = 'darkux_state'

function toRGBA(mode: OverlayMode, alpha: number): string {
  return mode === 'warm'
    ? `rgba(18, 10, 0, ${alpha})`
    : `rgba(0, 0, 0, ${alpha})`
}

function apply(intensity: number, mode: OverlayMode) {
  const alpha = intensity / 100
  let el = document.getElementById(OVERLAY_ID) as HTMLDivElement | null
  if (el) {
    el.style.background = toRGBA(mode, alpha)
    return
  }
  el = document.createElement('div')
  el.id = OVERLAY_ID
  el.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:2147483647;'
  el.style.background = toRGBA(mode, alpha)
  document.documentElement.appendChild(el)
}

function remove() {
  document.getElementById(OVERLAY_ID)?.remove()
}

async function initFromState() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const state: ExtensionState = result[STORAGE_KEY]
    if (!state?.globalEnabled) return

    const hostname = location.hostname
    const settings = state.sites?.[hostname]
    if (!settings?.enabled) return

    apply(state.intensity, state.mode)

    if (settings.customCSS) {
      const style = document.createElement('style')
      style.id = 'darkux-custom-css'
      style.textContent = settings.customCSS
      document.head.appendChild(style)
    }
  } catch {
    // Storage not available or restricted page
  }
}

// Self-initialize on content script injection
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFromState)
} else {
  initFromState()
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'CONTENT_APPLY') {
    apply(msg.intensity, msg.mode)
    sendResponse({ ok: true })
  } else if (msg.type === 'CONTENT_REMOVE') {
    remove()
    sendResponse({ ok: true })
  }
  return true
})
