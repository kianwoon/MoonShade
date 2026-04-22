export type OverlayMode = 'dim' | 'warm'

export interface SiteSettings {
  enabled: boolean
  customCSS: string
}

export interface ExtensionState {
  globalEnabled: boolean
  intensity: number       // 10–50, maps to rgba alpha
  mode: OverlayMode       // 'dim' or 'warm'
  sites: Record<string, SiteSettings>
}

export type MessageType =
  | { type: 'GET_STATE' }
  | { type: 'TOGGLE_GLOBAL' }
  | { type: 'TOGGLE_SITE'; hostname: string }
  | { type: 'SET_INTENSITY'; intensity: number }
  | { type: 'SET_MODE'; mode: OverlayMode }
  | { type: 'SET_CUSTOM_CSS'; hostname: string; css: string }
  | { type: 'APPLY_OVERLAY'; hostname: string }
  | { type: 'REMOVE_OVERLAY'; hostname: string }
