import { useEffect, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type Message,
  type Settings,
} from '../../shared/types';

export function GeneralTab() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] as Settings | undefined;
      if (stored) {
        setSettings(stored);
      }
      setLoading(false);
    });
  }, []);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    chrome.storage.sync.set({ [STORAGE_KEY]: next }, () => {
      const message: Message = { type: 'SETTINGS_UPDATED', settings: next };
      chrome.runtime.sendMessage(message).catch(() => {
        // background may be asleep — fine, it'll wake on next message
      });
    });
  };

  const handleToggle = () => {
    updateSettings({ ...settings, enabled: !settings.enabled });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">General</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage how Fitr behaves while you shop.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Enable Fitr
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              When off, Fitr won't make recommendations on supported product
              pages.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            disabled={loading}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              settings.enabled ? 'bg-emerald-500' : 'bg-slate-300'
            } ${loading ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
