import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type Message,
  type Settings,
} from '../shared/types';

let currentSettings: Settings = DEFAULT_SETTINGS;

function applySettings(settings: Settings) {
  currentSettings = settings;
  console.log('[Fitr] content script active, enabled =', settings.enabled);
}

chrome.storage.sync.get([STORAGE_KEY], (result) => {
  const stored = result[STORAGE_KEY] as Settings | undefined;
  applySettings(stored ?? DEFAULT_SETTINGS);
});

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'SETTINGS_UPDATED') {
    applySettings(message.settings);
  }
});

export { currentSettings };
