import { useEffect, useMemo, useState } from 'react';

type PopupState = 'no-account' | 'no-product' | 'recommendation';

const MESSAGES: Record<'no-account' | 'no-product', string[]> = {
  'no-account': [
    'Get the right size every time. Sign up to unlock personalized size recommendations for Nike, adidas, and New Balance.',
    "Stop guessing your size. Create a free Fitr account and we'll tell you exactly what to order.",
    'Returns are expensive. Let Fitr find your perfect fit across brands — takes 2 minutes to set up.',
  ],
  'no-product': [
    'Fitr works on Nike, adidas, and New Balance. Browse a product to get started.',
    'Head to nike.com, adidas.com, or newbalance.com and open any product page.',
    'Your profile is ready! Now visit a supported product page to see your size recommendation.',
    'Looking for a recommendation? Navigate to a shoe or apparel product on a supported brand site.',
  ],
};

function readUrlState(): PopupState | null {
  const param = new URLSearchParams(window.location.search).get('state');
  if (param === 'no-account' || param === 'no-product' || param === 'recommendation') {
    return param;
  }
  return null;
}

function openDashboard() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
    return;
  }
  window.open('../options/options.html', '_blank');
}

export function App() {
  const [state, setState] = useState<PopupState>(() => readUrlState() ?? 'no-account');
  const [msgIndex, setMsgIndex] = useState<Record<'no-account' | 'no-product', number>>({
    'no-account': 0,
    'no-product': 0,
  });
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
    chrome.storage.local.get(['theme'], (data) => {
      const theme = (data?.theme as string | undefined) ?? 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }, []);

  const cycleMessage = (key: 'no-account' | 'no-product') => {
    setMsgIndex((prev) => ({ ...prev, [key]: (prev[key] + 1) % MESSAGES[key].length }));
  };

  const noAccountMsg = useMemo(
    () => MESSAGES['no-account'][msgIndex['no-account']],
    [msgIndex],
  );
  const noProductMsg = useMemo(
    () => MESSAGES['no-product'][msgIndex['no-product']],
    [msgIndex],
  );

  return (
    <>
      <div className="state-toggle">
        {(['no-account', 'no-product', 'recommendation'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`state-toggle-btn ${state === s ? 'active' : ''}`}
            onClick={() => setState(s)}
          >
            {s === 'no-account' ? 'No Account' : s === 'no-product' ? 'No Product' : 'On Product'}
          </button>
        ))}
      </div>

      {state === 'no-account' && (
        <div className="popup-state active">
          <div className="popup-chrome">
            <div className="popup-drag-handle" />
            <button className="popup-close" onClick={() => window.close()}>
              ×
            </button>
          </div>
          <div className="popup-body popup-body-centered">
            <div className="popup-brand-mini">
              <div className="popup-logo">F</div>
            </div>
            <h2 className="text-card-title">Welcome to Fitr</h2>
            <p className="text-small text-muted popup-msg">{noAccountMsg}</p>
            <button className="btn btn-primary btn-block btn-sm" onClick={openDashboard}>
              Create Account
            </button>
            <a className="link" onClick={openDashboard}>
              Already have an account? Sign in
            </a>
          </div>
          <footer className="popup-footer">
            <span />
            <button className="link popup-cycle" onClick={() => cycleMessage('no-account')}>
              Next message
            </button>
          </footer>
        </div>
      )}

      {state === 'no-product' && (
        <div className="popup-state active">
          <div className="popup-chrome">
            <div className="popup-drag-handle" />
            <button className="popup-close" onClick={() => window.close()}>
              ×
            </button>
          </div>
          <div className="popup-body popup-body-centered">
            <p className="text-body popup-msg">{noProductMsg}</p>
          </div>
          <footer className="popup-footer">
            <a className="link" onClick={openDashboard}>
              Open dashboard
            </a>
            <button className="link popup-cycle" onClick={() => cycleMessage('no-product')}>
              Next message
            </button>
          </footer>
        </div>
      )}

      {state === 'recommendation' && (
        <div className="popup-state active">
          <div className="popup-chrome">
            <div className="popup-drag-handle" />
            <button className="popup-close" onClick={() => window.close()}>
              ×
            </button>
          </div>
          <div className="rec-body">
            <p className="text-caption text-muted">Your Fitr recommendation</p>

            <div className="rec-size-row">
              <span className="size-token size-token-xl">US 10</span>
              <span className="confidence-chip confidence-chip-high">
                <span className="confidence-dot" />
                High confidence
              </span>
            </div>

            <button
              className={`why-toggle ${whyOpen ? 'expanded' : ''}`}
              onClick={() => setWhyOpen((v) => !v)}
            >
              <span>Why this size?</span>
              <svg
                className="why-chevron"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div className={`why-panel ${whyOpen ? '' : 'hidden'}`}>
              <ul className="why-list">
                <li className="why-item">
                  <span className="why-tier text-caption">Purchase history</span>
                  <span className="text-small">You bought US 10 in Nike Air Max 90</span>
                </li>
                <li className="why-item">
                  <span className="why-tier text-caption">Body estimate</span>
                  <span className="text-small">Your foot length matches US 10 range</span>
                </li>
                <li className="why-item">
                  <span className="why-tier text-caption">Community</span>
                  <span className="text-small">Similar profiles chose US 10 for this model</span>
                </li>
              </ul>
            </div>

            <div className="social-proof">
              <div className="divider" />
              <div className="social-proof-content">
                <div className="social-proof-avatars">
                  <span className="anon-avatar anon-avatar-sm">Ya</span>
                  <span className="anon-avatar anon-avatar-sm">Ma</span>
                  <span className="anon-avatar anon-avatar-sm">Li</span>
                </div>
                <p className="text-small text-muted">
                  <strong>62%</strong> of people like you chose <strong>US 10</strong>
                </p>
              </div>
              <div className="social-proof-names text-small text-tertiary">
                Yan***, Mar***, Lia***
              </div>
            </div>
          </div>
          <footer className="popup-footer">
            <a className="link" onClick={openDashboard}>
              Adjust profile
            </a>
            <span />
          </footer>
        </div>
      )}
    </>
  );
}
