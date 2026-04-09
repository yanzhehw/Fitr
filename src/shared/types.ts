/**
 * Extension-LOCAL types — only the contracts that cross between the popup,
 * options page, background service worker, and content script live here.
 *
 * Cross-package entities (Profile, Purchase, RecommendResponse, etc.) live in
 * `@fitr/types` (../../shared/types/) so the backend and admin can import
 * the same shapes.
 */

export interface Settings {
  /** Master switch for the extension. When false, content script stays passive. */
  enabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
};

export const STORAGE_KEY = 'fitr_settings';

export type Message =
  | { type: 'GET_SETTINGS' }
  | { type: 'SETTINGS_UPDATED'; settings: Settings }
  | { type: 'PING' };

export interface MessageResponse {
  ok: boolean;
  settings?: Settings;
  error?: string;
}
