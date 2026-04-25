import type { ExtensionState, OverlayMode, MessageType } from '../lib/types'

function $(id: string) {
  return document.getElementById(id)!
}

function send(msg: MessageType): Promise<ExtensionState> {
  return chrome.runtime.sendMessage(msg)
}

function debounce<A extends unknown[], R>(fn: (...args: A) => R, ms: number): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
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
    const newState = await send({ type: 'TOGGLE_AND_APPLY', hostname })
    updateUI(newState, hostname)
  })

  // Intensity slider — live update
  const debouncedIntensity = debounce(async (intensity: number) => {
    await send({ type: 'APPLY_INTENSITY', intensity, hostname: hostname! })
  }, 100)

  $('intensitySlider').addEventListener('input', (e) => {
    const intensity = Number((e.target as HTMLInputElement).value)
    $('intensityValue').textContent = intensity + '%'
    debouncedIntensity(intensity)
  })

  // Mode toggle
  $('btnDim').addEventListener('click', async () => {
    const newState = await send({ type: 'APPLY_MODE', mode: 'dim' as OverlayMode, hostname: hostname! })
    updateUI(newState, hostname)
  })

  $('btnWarm').addEventListener('click', async () => {
    const newState = await send({ type: 'APPLY_MODE', mode: 'warm' as OverlayMode, hostname: hostname! })
    updateUI(newState, hostname)
  })

  // Custom CSS apply
  $('applyCSS').addEventListener('click', async () => {
    if (!hostname) return
    const css = ($('customCSS') as HTMLTextAreaElement).value
    const newState = await send({ type: 'APPLY_CUSTOM_CSS', hostname, css })
    updateUI(newState, hostname)
    $('statusText').textContent = 'CSS applied!'
    setTimeout(() => {
      $('statusText').textContent = 'Dim active'
    }, 1500)
  })
})
