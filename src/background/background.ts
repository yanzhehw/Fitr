import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type Message,
  type MessageResponse,
  type Settings,
} from '../shared/types';
import { ensureUserId } from '../lib/user';

// On install: seed default settings and generate local user ID.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    if (!result[STORAGE_KEY]) {
      chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
    }
  });

  ensureUserId();
});

// Message broker between popup/options/content surfaces.
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    switch (message.type) {
      case 'PING': {
        sendResponse({ ok: true });
        return false;
      }

      case 'GET_SETTINGS': {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          const settings =
            (result[STORAGE_KEY] as Settings | undefined) ?? DEFAULT_SETTINGS;
          sendResponse({ ok: true, settings });
        });
        // async response
        return true;
      }

      case 'SETTINGS_UPDATED': {
        // Forward to all tabs so content scripts can react.
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            if (tab.id !== undefined) {
              chrome.tabs.sendMessage(tab.id, message).catch(() => {
                // tab may not have a content script (e.g., chrome:// pages) — ignore
              });
            }
          }
          sendResponse({ ok: true });
        });
        return true;
      }

      default: {
        sendResponse({ ok: false, error: 'Unknown message type' });
        return false;
      }
    }
  },
);
