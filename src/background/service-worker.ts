import { getState, setState } from '../lib/storage'
import type { MessageType, OverlayMode } from '../lib/types'

async function injectOverlay(tabId: number, intensity: number, mode: OverlayMode) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      args: ['darkux-overlay', intensity, mode],
      func: (id: string, intensity: number, mode: string) => {
        const alpha = intensity / 100
        const bg = mode === 'warm'
          ? `rgba(18, 10, 0, ${alpha})`
          : `rgba(0, 0, 0, ${alpha})`
        let el = document.getElementById(id) as HTMLDivElement | null
        if (el) {
          el.style.background = bg
          return
        }
        el = document.createElement('div')
        el.id = id
        el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;'
        el.style.background = bg
        document.documentElement.appendChild(el)
      },
    })
  } catch {
    // chrome:// pages, new tab, etc.
  }
}

async function removeOverlay(tabId: number) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      args: ['darkux-overlay'],
      func: (id: string) => {
        document.getElementById(id)?.remove()
      },
    })
  } catch {
    // tab gone or inaccessible
  }
}

chrome.runtime.onMessage.addListener(
  (message: MessageType, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse)
    return true
  }
)

async function handleMessage(msg: MessageType) {
  const state = await getState()

  switch (msg.type) {
    case 'GET_STATE':
      return state

    case 'TOGGLE_GLOBAL': {
      state.globalEnabled = !state.globalEnabled
      await setState(state)
      return state
    }

    case 'TOGGLE_SITE': {
      const settings = state.sites[msg.hostname] ?? { enabled: false, customCSS: '' }
      settings.enabled = !settings.enabled
      state.sites[msg.hostname] = settings
      await setState(state)
      return state
    }

    case 'SET_INTENSITY': {
      state.intensity = msg.intensity
      await setState(state)
      return state
    }

    case 'SET_MODE': {
      state.mode = msg.mode
      await setState(state)
      return state
    }

    case 'SET_CUSTOM_CSS': {
      const settings = state.sites[msg.hostname] ?? { enabled: false, customCSS: '' }
      settings.customCSS = msg.css
      state.sites[msg.hostname] = settings
      await setState(state)
      return state
    }

    case 'APPLY_OVERLAY': {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) return state
      const settings = state.sites[msg.hostname]
      if (settings?.customCSS) {
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          css: settings.customCSS,
          origin: 'USER',
        })
      }
      await injectOverlay(tab.id, state.intensity, state.mode)
      return state
    }

    case 'REMOVE_OVERLAY': {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) return state
      await removeOverlay(tab.id)
      return state
    }

    default:
      return state
  }
}

// Auto-apply overlay on tab navigation
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return

  try {
    const url = new URL(tab.url)
    const state = await getState()

    if (!state.globalEnabled) return

    const settings = state.sites[url.hostname]
    const isEnabled = settings?.enabled ?? false
    if (!isEnabled) return

    await injectOverlay(tabId, state.intensity, state.mode)
  } catch {
    // Can't inject into chrome:// pages, etc.
  }
})
