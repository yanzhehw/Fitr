import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEY, type Settings } from '../shared/types';

export function App() {
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

  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white text-slate-900">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Fitr</h1>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            settings.enabled
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {loading ? '…' : settings.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </header>

      <p className="text-sm text-slate-600 leading-relaxed">
        Your personal cross-brand sizing advisor.
      </p>

      <button
        type="button"
        onClick={handleOpenSettings}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:bg-slate-950"
      >
        Open Settings
      </button>
    </div>
  );
}
