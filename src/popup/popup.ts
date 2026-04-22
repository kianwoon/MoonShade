import type { ExtensionState, OverlayMode, MessageType } from '../lib/types'

function $(id: string) {
  return document.getElementById(id)!
}

function send(msg: MessageType): Promise<ExtensionState> {
  return chrome.runtime.sendMessage(msg)
}

async function getCurrentHostname(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url) return null
  try {
    return new URL(tab.url).hostname
  } catch {
    return null
  }
}

function updateUI(state: ExtensionState, hostname: string | null) {
  const globalToggle = $('globalToggle') as HTMLInputElement
  const siteToggle = $('siteToggle') as HTMLInputElement
  const siteName = $('siteName')
  const statusText = $('statusText')
  const editorSection = $('editorSection')
  const siteSection = $('siteSection')
  const controlsSection = $('controlsSection')
  const intensitySlider = $('intensitySlider') as HTMLInputElement
  const intensityValue = $('intensityValue')
  const btnDim = $('btnDim')
  const btnWarm = $('btnWarm')

  globalToggle.checked = state.globalEnabled
  controlsSection.style.display = state.globalEnabled ? 'block' : 'none'

  intensitySlider.value = String(state.intensity)
  intensityValue.textContent = state.intensity + '%'
  btnDim.classList.toggle('active', state.mode === 'dim')
  btnWarm.classList.toggle('active', state.mode === 'warm')

  if (hostname) {
    siteSection.style.display = 'block'
    siteName.textContent = hostname
    const settings = state.sites[hostname]
    siteToggle.checked = settings?.enabled ?? false
    const css = settings?.customCSS ?? ''
    ;($('customCSS') as HTMLTextAreaElement).value = css
    editorSection.style.display = siteToggle.checked ? 'block' : 'none'
    statusText.textContent = siteToggle.checked ? 'Dim active' : 'Dim off for this site'
  } else {
    siteSection.style.display = 'none'
    statusText.textContent = state.globalEnabled ? 'Enabled globally' : 'Disabled globally'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const hostname = await getCurrentHostname()
  const state = await send({ type: 'GET_STATE' })
  updateUI(state, hostname)

  $('globalToggle').addEventListener('change', async () => {
    const newState = await send({ type: 'TOGGLE_GLOBAL' })
    updateUI(newState, hostname)
  })

  $('siteToggle').addEventListener('change', async () => {
    if (!hostname) return
    const newState = await send({ type: 'TOGGLE_SITE', hostname })
    updateUI(newState, hostname)

    if (newState.sites[hostname]?.enabled) {
      await send({ type: 'APPLY_OVERLAY', hostname })
    } else {
      await send({ type: 'REMOVE_OVERLAY', hostname })
    }
  })

  // Intensity slider — live update
  $('intensitySlider').addEventListener('input', async (e) => {
    const intensity = Number((e.target as HTMLInputElement).value)
    const newState = await send({ type: 'SET_INTENSITY', intensity })
    $('intensityValue').textContent = intensity + '%'

    // Live-apply overlay if site is active
    const siteSettings = newState.sites[hostname ?? '']
    if (siteSettings?.enabled) {
      await send({ type: 'APPLY_OVERLAY', hostname: hostname! })
    }
  })

  // Mode toggle
  $('btnDim').addEventListener('click', async () => {
    const newState = await send({ type: 'SET_MODE', mode: 'dim' as OverlayMode })
    updateUI(newState, hostname)
    const siteSettings = newState.sites[hostname ?? '']
    if (siteSettings?.enabled) {
      await send({ type: 'APPLY_OVERLAY', hostname: hostname! })
    }
  })

  $('btnWarm').addEventListener('click', async () => {
    const newState = await send({ type: 'SET_MODE', mode: 'warm' as OverlayMode })
    updateUI(newState, hostname)
    const siteSettings = newState.sites[hostname ?? '']
    if (siteSettings?.enabled) {
      await send({ type: 'APPLY_OVERLAY', hostname: hostname! })
    }
  })

  // Custom CSS apply
  $('applyCSS').addEventListener('click', async () => {
    if (!hostname) return
    const css = ($('customCSS') as HTMLTextAreaElement).value
    let newState = await send({ type: 'SET_CUSTOM_CSS', hostname, css })

    if (!newState.sites[hostname]?.enabled) {
      newState = await send({ type: 'TOGGLE_SITE', hostname })
    }

    await send({ type: 'APPLY_OVERLAY', hostname })
    updateUI(newState, hostname)
    $('statusText').textContent = 'CSS applied!'
    setTimeout(() => {
      $('statusText').textContent = 'Dim active'
    }, 1500)
  })
})
