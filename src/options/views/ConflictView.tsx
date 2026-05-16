import { useState } from 'react';

type Priority = 'height-weight' | 'body-metr' | 'known-fits';

type Props = {
  onContinue: () => void;
};

export function ConflictView({ onContinue }: Props) {
  const [priority, setPriority] = useState<Priority>('body-metr');

  const options: { value: Priority; label: string }[] = [
    { value: 'height-weight', label: 'Height/Weight' },
    { value: 'body-metr', label: 'Body Metr' },
    { value: 'known-fits', label: 'Known Fits' },
  ];

  return (
    <div className="view" id="viewConflict">
      <div className="onboarding-container">
        <h1 className="text-section-heading">Oops, your data doesn't quite match</h1>
        <p className="text-body text-muted ob-subtitle">
          Your height and weight seems too off with the body measurements. Which one would you
          like to prioritize for approximating?
        </p>
        <p className="text-small text-muted">
          To give you the most accurate fit recommendation, we need to know which set of data
          defines your silhouette best.
        </p>

        <div className="ob-section">
          <span className="text-caption text-muted">Priority Approximation</span>
          <div className="ob-pill-group ob-conflict-pills">
            {options.map((opt) => (
              <button
                key={opt.value}
                className={`ob-pill ${priority === opt.value ? 'active' : ''}`}
                onClick={() => setPriority(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-primary btn-block" onClick={onContinue}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
