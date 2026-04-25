import type { ExtensionState, SiteSettings } from './types'

const STORAGE_KEY = 'darkux_state'

const DEFAULT_STATE: ExtensionState = {
  globalEnabled: true,
  intensity: 22,
  mode: 'dim',
  sites: {},
}

const DEFAULT_SITE: SiteSettings = { enabled: false, customCSS: '' }

function normalizeState(raw: Partial<ExtensionState>): ExtensionState {
  const state = { ...DEFAULT_STATE, ...raw }
  if (state.sites) {
    const normalized: Record<string, SiteSettings> = {}
    for (const [host, site] of Object.entries(state.sites)) {
      normalized[host] = { ...DEFAULT_SITE, ...site }
    }
    state.sites = normalized
  }
  return state
}

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  return normalizeState(result[STORAGE_KEY])
}

export async function setState(state: ExtensionState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}
