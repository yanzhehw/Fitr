import { useState } from 'react';
import { GeneralTab } from './tabs/GeneralTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { AboutTab } from './tabs/AboutTab';

type TabId = 'general' | 'advanced' | 'about';

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'about', label: 'About' },
];

function getInitialTab(): TabId {
  const param = new URLSearchParams(window.location.search).get('tab');
  if (param === 'advanced' || param === 'about' || param === 'general') {
    return param;
  }
  return 'general';
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    window.history.replaceState(null, '', url.toString());
  };

  return (
    <div className="flex h-full min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white">
        <div className="px-6 py-6">
          <h1 className="text-lg font-semibold tracking-tight">Fitr</h1>
          <p className="mt-1 text-xs text-slate-500">Settings</p>
        </div>
        <nav className="px-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-10 py-10">
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'advanced' && <AdvancedTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>
      </main>
    </div>
  );
}
