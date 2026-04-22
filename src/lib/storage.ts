import type { ExtensionState } from './types'

const STORAGE_KEY = 'darkux_state'

const DEFAULT_STATE: ExtensionState = {
  globalEnabled: true,
  intensity: 22,
  mode: 'dim',
  sites: {},
}

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  return { ...DEFAULT_STATE, ...result[STORAGE_KEY] }
}

export async function setState(state: ExtensionState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}
