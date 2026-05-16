import type { OnboardingData } from '../types';

type Props = {
  data: OnboardingData;
  onContinue: () => void;
};

const TYPE_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  youth: 'Youth',
  enfant: 'Enfant',
};

export function AllSetView({ data, onContinue }: Props) {
  const fitsCount =
    data.fits.tops.length + data.fits.pants.length + data.fits.shoes.length;

  return (
    <div className="view" id="viewAllSet">
      <div className="onboarding-container" style={{ textAlign: 'center' }}>
        <div className="onboarding-illustration">
          <div className="onboarding-icon-circle icon-teal">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <h1 className="text-section-heading">You're all set</h1>
        <p className="text-body text-muted onboarding-desc">
          Your profile is ready. Browse Nike, adidas, or New Balance to see your first size
          recommendation.
        </p>

        <div className="onboarding-summary">
          <div className="summary-row">
            <span className="text-small text-muted">Body Type</span>
            <span className="text-body-semibold">
              {data.bodyType ? TYPE_LABELS[data.bodyType] ?? '--' : '--'}
            </span>
          </div>
          <div className="summary-row">
            <span className="text-small text-muted">Height / Weight</span>
            <span className="text-body-semibold">
              {data.height} cm / {data.weight} kg
            </span>
          </div>
          <div className="summary-row">
            <span className="text-small text-muted">Known Fits</span>
            <span className="text-body-semibold">
              {fitsCount > 0 ? `${fitsCount} items added` : 'Skipped'}
            </span>
          </div>
        </div>

        <div className="onboarding-actions">
          <button className="btn btn-primary btn-block" onClick={onContinue}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
