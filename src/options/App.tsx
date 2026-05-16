import { useEffect, useState } from 'react';
import { TopRightControls } from './components/TopRightControls';
import { PopupPreview } from './components/PopupPreview';
import { SignInView } from './views/SignInView';
import { OnboardingView, newFitRow } from './views/OnboardingView';
import { ConflictView } from './views/ConflictView';
import { AllSetView } from './views/AllSetView';
import { DashboardView } from './views/DashboardView';
import type { OnboardingData, ViewId } from './types';

const INITIAL_DATA: OnboardingData = {
  username: '',
  nickname: '',
  bodyType: null,
  silhouette: null,
  height: 182,
  heightUnit: 'cm',
  weight: 78,
  weightUnit: 'kg',
  shoeSize: 44,
  shoeUnit: 'EU',
  tshirtFit: 'regular',
  hoodieFit: 'regular',
  pantsLength: 'regular',
  pantsWaist: 'regular',
  fits: {
    tops: [newFitRow()],
    pants: [newFitRow()],
    shoes: [newFitRow()],
  },
};

function loadTheme(): 'light' | 'dark' {
  try {
    const v = localStorage.getItem('fitr-theme');
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [view, setView] = useState<ViewId>('signIn');
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [theme, setThemeState] = useState<'light' | 'dark'>(loadTheme);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('fitr-theme', theme);
    } catch {
      // ignore quota errors
    }
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <>
      <TopRightControls
        onTogglePopupPreview={() => setPreviewOpen((v) => !v)}
        onToggleTheme={toggleTheme}
      />
      <PopupPreview open={previewOpen} theme={theme} onClose={() => setPreviewOpen(false)} />

      {view === 'signIn' && <SignInView onContinue={() => setView('onboarding')} />}
      {view === 'onboarding' && (
        <OnboardingView
          data={data}
          onChange={setData}
          onComplete={() => setView('conflict')}
        />
      )}
      {view === 'conflict' && <ConflictView onContinue={() => setView('allSet')} />}
      {view === 'allSet' && (
        <AllSetView data={data} onContinue={() => setView('dashboard')} />
      )}
      {view === 'dashboard' && (
        <DashboardView theme={theme} onThemeChange={setThemeState} />
      )}
    </>
  );
}
