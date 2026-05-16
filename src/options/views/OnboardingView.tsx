import { useMemo, useState } from 'react';
import {
  FIT_SIZE_OPTIONS,
  SILHOUETTE_SETS,
  type BodyType,
  type FitCategory,
  type FitRow,
  type OnboardingData,
} from '../types';
import {
  SHOE_BOUNDS,
  cmToFtIn,
  cmToIn,
  convertShoeSize,
  ftInToCm,
  inToCm,
  kgToLb,
  lbToKg,
} from '../lib/units';

type Props = {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onComplete: () => void;
};

const TOTAL_STEPS = 4;

let fitIdCounter = 0;
const nextFitId = () => `fit-${++fitIdCounter}`;

function newFitRow(): FitRow {
  return { id: nextFitId(), brand: '', line: '', size: '' };
}

function silhouetteSVG(shoulder: number, hip: number) {
  const sLeft = 16 - shoulder;
  const sRight = 16 + shoulder;
  const hLeft = 16 - hip;
  const hRight = 16 + hip;
  return (
    <svg
      width="32"
      height="64"
      viewBox="0 0 32 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <ellipse cx="16" cy="6" rx="5" ry="5" />
      <path
        d={`M${sLeft} 18 L${sLeft + 1} 31 L${hLeft} 53 M${sRight} 18 L${sRight - 1} 31 L${hRight} 53 M16 11v20 M${sLeft} 18 H${sRight}`}
      />
    </svg>
  );
}

export function OnboardingView({ data, onChange, onComplete }: Props) {
  const [step, setStep] = useState(1);

  const update = (partial: Partial<OnboardingData>) => {
    onChange({ ...data, ...partial });
  };

  const updateFits = (cat: FitCategory, rows: FitRow[]) => {
    onChange({ ...data, fits: { ...data.fits, [cat]: rows } });
  };

  const progressPct = (step / TOTAL_STEPS) * 100;

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else onComplete();
  };
  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="view" id="viewOnboarding">
      <div className="onboarding-container">
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-small text-muted">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {step === 1 && <Step1 data={data} update={update} onNext={goNext} />}
        {step === 2 && (
          <Step2 data={data} update={update} onNext={goNext} onBack={goBack} />
        )}
        {step === 3 && <Step3 onNext={goNext} onBack={goBack} />}
        {step === 4 && (
          <Step4
            data={data}
            updateFits={updateFits}
            onNext={goNext}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Step 1: Identity & Body Type
// ============================================================
function Step1({
  data,
  update,
  onNext,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
}) {
  const usernameValid = /^@?[a-zA-Z0-9_]{3,20}$/.test(data.username.trim());
  const nicknameValid = /^[A-Za-z][A-Za-z0-9 _\-]{1,29}$/.test(data.nickname.trim());
  const ok = usernameValid && nicknameValid && data.bodyType !== null;

  return (
    <div className="onboarding-step active">
      <h1 className="text-section-heading">
        Complete your profile <span className="required-star">*</span>
      </h1>
      <p className="text-small text-muted ob-subtitle">Step 1 of 4: Identity & Body Type</p>

      <div className="profile-upload">
        <div className="profile-upload-circle">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-small">Upload</span>
        </div>
        <span className="text-caption text-muted">Profile Pic</span>
      </div>

      <div className="ob-field-row">
        <div className="ob-field">
          <label className="text-caption text-muted">
            Choose your username <span className="required-star">*</span>
          </label>
          <input
            className={`input ${data.username && !usernameValid ? 'is-invalid' : ''}`}
            type="text"
            placeholder="@tailor_fit"
            value={data.username}
            onChange={(e) => update({ username: e.target.value })}
          />
          {data.username && !usernameValid && (
            <span className="ob-error-msg visible">
              3–20 letters, numbers or underscores
            </span>
          )}
        </div>
        <div className="ob-field">
          <label className="text-caption text-muted">
            Nickname <span className="required-star">*</span>
          </label>
          <input
            className={`input ${data.nickname && !nicknameValid ? 'is-invalid' : ''}`}
            type="text"
            placeholder="Alex"
            value={data.nickname}
            onChange={(e) => update({ nickname: e.target.value })}
          />
          {data.nickname && !nicknameValid && (
            <span className="ob-error-msg visible">
              Starts with a letter; up to 30 chars
            </span>
          )}
        </div>
      </div>

      <div className="ob-section">
        <span className="text-caption text-muted">Select your body most identify with</span>
        <div className="ob-body-types">
          {(['male', 'female', 'youth', 'enfant'] as BodyType[]).map((bt) => (
            <button
              key={bt}
              className={`body-type-card ${data.bodyType === bt ? 'selected' : ''}`}
              onClick={() => update({ bodyType: bt, silhouette: null })}
            >
              <div className="body-type-card-icon">
                <BodyTypeIcon type={bt} />
              </div>
              <span className="text-small">
                {bt.charAt(0).toUpperCase() + bt.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="onboarding-actions">
        <button
          className="btn btn-primary btn-block onboarding-next"
          disabled={!ok}
          onClick={onNext}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function BodyTypeIcon({ type }: { type: BodyType }) {
  if (type === 'male') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="4" r="3" />
        <path d="M10 7v10M7 10h6M21 3l-5 5M21 3h-4M21 3v4" />
      </svg>
    );
  }
  if (type === 'female') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="5" />
        <path d="M12 13v8M9 18h6" />
      </svg>
    );
  }
  if (type === 'youth') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="6" r="3" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

// ============================================================
// Step 2: Personal Dimensions
// ============================================================
function Step2({
  data,
  update,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const silhouettes = data.bodyType ? SILHOUETTE_SETS[data.bodyType] : [];
  const silhouetteRequired = silhouettes.length > 0;
  const ok =
    data.height >= 120 &&
    data.height <= 220 &&
    data.weight >= 30 &&
    data.weight <= 180 &&
    data.shoeSize > 0 &&
    (!silhouetteRequired || data.silhouette !== null);

  const heightDisplay =
    data.heightUnit === 'ft' ? cmToFtIn(data.height) : String(data.height);
  const weightDisplay =
    data.weightUnit === 'lb' ? String(kgToLb(data.weight)) : String(data.weight);

  const toggleHeightUnit = (unit: 'cm' | 'ft') => {
    update({ heightUnit: unit });
  };
  const toggleWeightUnit = (unit: 'kg' | 'lb') => {
    update({ weightUnit: unit });
  };
  const toggleShoeUnit = (unit: 'EU' | 'US' | 'UK') => {
    const newSize = convertShoeSize(data.shoeSize, data.shoeUnit, unit);
    update({ shoeUnit: unit, shoeSize: newSize });
  };

  const setHeightFromDisplay = (raw: string) => {
    if (data.heightUnit === 'ft') {
      const cm = ftInToCm(raw);
      if (cm) update({ height: Math.max(120, Math.min(220, cm)) });
    } else {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) update({ height: Math.max(120, Math.min(220, n)) });
    }
  };
  const setWeightFromDisplay = (raw: string) => {
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return;
    if (data.weightUnit === 'lb') {
      update({ weight: Math.max(30, Math.min(180, lbToKg(n))) });
    } else {
      update({ weight: Math.max(30, Math.min(180, n)) });
    }
  };

  return (
    <div className="onboarding-step active">
      <div className="ob-step-header-row">
        <span className="text-small text-muted">Step 2 of 4</span>
        <span className="text-caption text-muted">Measurements</span>
      </div>
      <h1 className="text-section-heading">
        Personal Dimensions <span className="required-star">*</span>
      </h1>
      <p className="text-body text-muted ob-subtitle">
        We use these technical specifications to calculate your perfect fit across all supported
        garment categories.
      </p>

      <div className="ob-dimension-row">
        <div className="ob-dimension">
          <div className="ob-label-with-toggle">
            <span className="text-caption text-muted">Height</span>
            <div className="unit-toggle unit-toggle-xs">
              {(['cm', 'ft'] as const).map((u) => (
                <button
                  key={u}
                  className={`unit-toggle-option ${data.heightUnit === u ? 'active' : ''}`}
                  onClick={() => toggleHeightUnit(u)}
                >
                  {u === 'ft' ? 'ft/in' : 'cm'}
                </button>
              ))}
            </div>
          </div>
          <div className="ob-num-wrap">
            <button
              className="ob-num-arrow ob-num-left"
              onClick={() => update({ height: Math.max(120, data.height - 1) })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <input
              className="input input-lg"
              type={data.heightUnit === 'ft' ? 'text' : 'number'}
              value={heightDisplay}
              onChange={(e) => setHeightFromDisplay(e.target.value)}
            />
            <button
              className="ob-num-arrow ob-num-right"
              onClick={() => update({ height: Math.min(220, data.height + 1) })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="ob-dimension-bottom">
            <input
              className="ob-slider"
              type="range"
              min={120}
              max={220}
              value={data.height}
              step={1}
              onChange={(e) => update({ height: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>

        <div className="ob-dimension">
          <div className="ob-label-with-toggle">
            <span className="text-caption text-muted">Weight</span>
            <div className="unit-toggle unit-toggle-xs">
              {(['kg', 'lb'] as const).map((u) => (
                <button
                  key={u}
                  className={`unit-toggle-option ${data.weightUnit === u ? 'active' : ''}`}
                  onClick={() => toggleWeightUnit(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="ob-num-wrap">
            <button
              className="ob-num-arrow ob-num-left"
              onClick={() => update({ weight: Math.max(30, data.weight - 1) })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <input
              className="input input-lg"
              type="number"
              value={weightDisplay}
              onChange={(e) => setWeightFromDisplay(e.target.value)}
            />
            <button
              className="ob-num-arrow ob-num-right"
              onClick={() => update({ weight: Math.min(180, data.weight + 1) })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="ob-dimension-bottom">
            <input
              className="ob-slider"
              type="range"
              min={data.weightUnit === 'lb' ? 66 : 30}
              max={data.weightUnit === 'lb' ? 397 : 180}
              value={data.weightUnit === 'lb' ? kgToLb(data.weight) : data.weight}
              step={1}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                update({ weight: data.weightUnit === 'lb' ? lbToKg(v) : v });
              }}
            />
          </div>
        </div>

        <div className="ob-dimension">
          <label className="text-caption text-muted">Shoe Size</label>
          <input
            className="input input-lg"
            type="number"
            value={data.shoeSize}
            min={SHOE_BOUNDS[data.shoeUnit].min}
            max={SHOE_BOUNDS[data.shoeUnit].max}
            step={SHOE_BOUNDS[data.shoeUnit].step}
            onChange={(e) => update({ shoeSize: parseFloat(e.target.value) || 0 })}
          />
          <div className="ob-dimension-bottom">
            <div className="unit-toggle unit-toggle-full ob-shoe-unit">
              {(['EU', 'US', 'UK'] as const).map((u) => (
                <button
                  key={u}
                  className={`unit-toggle-option ${data.shoeUnit === u ? 'active' : ''}`}
                  onClick={() => toggleShoeUnit(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <span className="text-caption text-muted">Fitting Preference</span>
      <div className="ob-fit-prefs">
        <FitPrefRow
          label="T-shirt Fitting"
          value={data.tshirtFit}
          options={['tight', 'regular', 'loose']}
          onChange={(v) => update({ tshirtFit: v as OnboardingData['tshirtFit'] })}
        />
        <FitPrefRow
          label="Hoodie / Jacket Fitting"
          value={data.hoodieFit}
          options={['tight', 'regular', 'loose']}
          onChange={(v) => update({ hoodieFit: v as OnboardingData['hoodieFit'] })}
        />
        <FitPrefRow
          label="Pants Length"
          value={data.pantsLength}
          options={['short', 'regular', 'long']}
          onChange={(v) => update({ pantsLength: v as OnboardingData['pantsLength'] })}
        />
        <FitPrefRow
          label="Pants Waist"
          value={data.pantsWaist}
          options={['tight', 'regular', 'loose']}
          onChange={(v) => update({ pantsWaist: v as OnboardingData['pantsWaist'] })}
        />
      </div>

      {silhouetteRequired && (
        <div className="ob-section">
          <span className="text-caption text-muted">
            Select your body type <span className="required-star">*</span>
          </span>
          <div
            className="ob-silhouettes"
            style={{ gridTemplateColumns: `repeat(${silhouettes.length}, 1fr)` }}
          >
            {silhouettes.map((s) => (
              <button
                key={s.value}
                className={`ob-silhouette ${data.silhouette === s.value ? 'selected' : ''}`}
                onClick={() => update({ silhouette: s.value })}
              >
                <div className="ob-silhouette-icon">{silhouetteSVG(s.shoulder, s.hip)}</div>
                <span className="text-small">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="onboarding-actions ob-actions-between">
        <button className="btn btn-secondary btn-sm onboarding-back" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn btn-primary onboarding-next"
          disabled={!ok}
          onClick={onNext}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function FitPrefRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="ob-pref">
      <span className="text-small text-muted">{label}</span>
      <div className="unit-toggle unit-toggle-full">
        {options.map((opt) => (
          <button
            key={opt}
            className={`unit-toggle-option ${value === opt ? 'active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Step 3: Body Measurements (optional)
// ============================================================
type MeasurePanel = 'upper' | 'lower' | 'footwear';

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [panel, setPanel] = useState<MeasurePanel>('upper');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [fields, setFields] = useState({
    shoulder: '',
    arm: '',
    chest: '',
    neck: '',
    waist: '',
    hip: '',
    inseam: '',
    thigh: '',
    footLength: '',
    footWidth: '',
    footShoeSize: '',
  });
  const [footUnit, setFootUnit] = useState<'EU' | 'US' | 'UK'>('EU');

  const setField = (k: keyof typeof fields, v: string) =>
    setFields((f) => ({ ...f, [k]: v }));

  const toggleUnit = (toUnit: 'cm' | 'in') => {
    if (toUnit === unit) return;
    const convert = (v: string) => {
      const n = parseFloat(v);
      if (Number.isNaN(n)) return '';
      return toUnit === 'in' ? String(cmToIn(n)) : String(inToCm(n));
    };
    setFields({
      ...fields,
      shoulder: convert(fields.shoulder),
      arm: convert(fields.arm),
      chest: convert(fields.chest),
      neck: convert(fields.neck),
      waist: convert(fields.waist),
      hip: convert(fields.hip),
      inseam: convert(fields.inseam),
      thigh: convert(fields.thigh),
      footLength: convert(fields.footLength),
      footWidth: convert(fields.footWidth),
    });
    setUnit(toUnit);
  };

  return (
    <div className="onboarding-step active">
      <div className="ob-step-header-row">
        <span className="text-small text-muted">Step 3 of 4</span>
        <span className="text-caption text-muted">Body Measurements</span>
      </div>
      <div className="ob-measure-title-row">
        <div>
          <h1 className="text-section-heading">Body Measurements</h1>
          <p className="text-body text-muted ob-subtitle">
            Input your precise metrics for a tailor-fit profile.
          </p>
        </div>
        <div className="unit-toggle unit-toggle-xs ob-measure-unit-toggle">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              className={`unit-toggle-option ${unit === u ? 'active' : ''}`}
              onClick={() => toggleUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="unit-toggle unit-toggle-full ob-measure-tabs">
        {(['upper', 'lower', 'footwear'] as MeasurePanel[]).map((p) => (
          <button
            key={p}
            className={`unit-toggle-option ${panel === p ? 'active' : ''}`}
            onClick={() => setPanel(p)}
          >
            {p === 'upper' ? 'Upper Body' : p === 'lower' ? 'Lower Body' : 'Footwear'}
          </button>
        ))}
      </div>

      {panel === 'upper' && (
        <div className="ob-measure-panel ob-tab-panel active">
          <div className="ob-measure-fields">
            <MeasureField
              label="Shoulder Width"
              value={fields.shoulder}
              onChange={(v) => setField('shoulder', v)}
            />
            <MeasureField
              label="Arm Length"
              value={fields.arm}
              onChange={(v) => setField('arm', v)}
            />
            <MeasureField
              label="Chest Circumference"
              value={fields.chest}
              onChange={(v) => setField('chest', v)}
            />
            <MeasureField
              label="Neck Circumference"
              value={fields.neck}
              onChange={(v) => setField('neck', v)}
            />
          </div>
          <div className="ob-measure-visual">
            <div className="ob-body-diagram">
              <BodyDiagramSVG />
              <p className="text-small text-muted">
                Measure across the widest part of your shoulders.
              </p>
            </div>
          </div>
        </div>
      )}

      {panel === 'lower' && (
        <div className="ob-measure-panel ob-tab-panel active">
          <div className="ob-measure-fields">
            <MeasureField
              label="Waist Circumference"
              value={fields.waist}
              onChange={(v) => setField('waist', v)}
            />
            <MeasureField
              label="Hip Circumference"
              value={fields.hip}
              onChange={(v) => setField('hip', v)}
            />
            <MeasureField
              label="Inseam Length"
              value={fields.inseam}
              onChange={(v) => setField('inseam', v)}
            />
            <MeasureField
              label="Thigh Circumference"
              value={fields.thigh}
              onChange={(v) => setField('thigh', v)}
            />
          </div>
          <div className="ob-measure-visual">
            <div className="ob-body-diagram">
              <BodyDiagramSVG />
              <p className="text-small text-muted">
                Measure around the narrowest part of your natural waist.
              </p>
            </div>
          </div>
        </div>
      )}

      {panel === 'footwear' && (
        <div className="ob-measure-panel ob-tab-panel active">
          <div className="ob-measure-fields">
            <MeasureField
              label="Foot Length"
              value={fields.footLength}
              onChange={(v) => setField('footLength', v)}
            />
            <MeasureField
              label="Foot Width"
              value={fields.footWidth}
              onChange={(v) => setField('footWidth', v)}
            />
            <div className="ob-field">
              <span className="text-caption text-muted">Shoe Size</span>
              <input
                className="input"
                type="number"
                value={fields.footShoeSize}
                onChange={(e) => setField('footShoeSize', e.target.value)}
              />
              <div className="unit-toggle unit-toggle-full">
                {(['EU', 'US', 'UK'] as const).map((u) => (
                  <button
                    key={u}
                    className={`unit-toggle-option ${footUnit === u ? 'active' : ''}`}
                    onClick={() => setFootUnit(u)}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ob-measure-visual">
            <div className="ob-body-diagram">
              <svg
                width="140"
                height="120"
                viewBox="0 0 140 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M30 20 Q30 10 50 10 L110 10 Q130 10 130 30 L130 80 Q130 110 100 110 L60 110 Q30 110 30 80Z" />
                <line x1="50" y1="10" x2="50" y2="110" strokeDasharray="4" />
                <line x1="30" y1="60" x2="130" y2="60" strokeDasharray="4" />
              </svg>
              <p className="text-small text-muted">
                Trace your foot on paper and measure the longest point.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="onboarding-actions ob-actions-between">
        <button className="btn btn-secondary btn-sm onboarding-back" onClick={onBack}>
          ← Back
        </button>
        <div className="ob-actions-right">
          <a className="link onboarding-skip" onClick={onNext}>
            Skip
          </a>
          <button className="btn btn-primary onboarding-next" onClick={onNext}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

function MeasureField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="ob-field">
      <span className="text-caption text-muted">{label}</span>
      <input
        className="input ob-measure-input"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={0.1}
      />
    </div>
  );
}

function BodyDiagramSVG() {
  return (
    <svg
      width="120"
      height="200"
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <ellipse cx="60" cy="24" rx="14" ry="16" />
      <path d="M46 40 Q30 50 25 80 L35 80 L40 60 L46 80 L46 130 L38 190 L50 190 L56 140 L60 140 L64 140 L70 190 L82 190 L74 130 L74 80 L80 60 L85 80 L95 80 Q90 50 74 40Z" />
    </svg>
  );
}

// ============================================================
// Step 4: Known Fits (optional)
// ============================================================
function Step4({
  data,
  updateFits,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateFits: (cat: FitCategory, rows: FitRow[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<FitCategory>('tops');
  const rows = data.fits[tab];

  const addRow = () => updateFits(tab, [...rows, newFitRow()]);
  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    updateFits(
      tab,
      rows.filter((r) => r.id !== id),
    );
  };
  const updateRow = (id: string, partial: Partial<FitRow>) => {
    updateFits(
      tab,
      rows.map((r) => (r.id === id ? { ...r, ...partial } : r)),
    );
  };

  const sizeOptions = useMemo(() => FIT_SIZE_OPTIONS[tab], [tab]);

  return (
    <div className="onboarding-step active">
      <h1 className="text-section-heading">Choose some of your Known Fits</h1>
      <p className="text-body text-muted ob-subtitle">
        Tell us what currently fits you best for more accurate sizing.
      </p>

      <div className="unit-toggle unit-toggle-full ob-fits-tabs">
        {(['tops', 'pants', 'shoes'] as FitCategory[]).map((t) => (
          <button
            key={t}
            className={`unit-toggle-option ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="ob-fits-panel active">
        <div className="ob-fits-list">
          {rows.map((row) => (
            <div key={row.id} className="ob-fit-row">
              <div className="ob-fit-field">
                <label className="text-caption text-muted">Brand</label>
                <select
                  className="input ob-select"
                  value={row.brand}
                  onChange={(e) => updateRow(row.id, { brand: e.target.value })}
                >
                  <option value="" disabled>
                    Select brand
                  </option>
                  <option>Nike</option>
                  <option>adidas</option>
                  <option>New Balance</option>
                  <option>Levi's</option>
                  <option>Everlane</option>
                  <option>Patagonia</option>
                </select>
              </div>
              <div className="ob-fit-field">
                <label className="text-caption text-muted">Line</label>
                <select
                  className="input ob-select"
                  value={row.line}
                  onChange={(e) => updateRow(row.id, { line: e.target.value })}
                >
                  <option value="" disabled>
                    Select line
                  </option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Unisex</option>
                </select>
              </div>
              <div className="ob-fit-field">
                <label className="text-caption text-muted">Size</label>
                <select
                  className="input ob-select"
                  value={row.size}
                  onChange={(e) => updateRow(row.id, { size: e.target.value })}
                >
                  <option value="" disabled>
                    Select size
                  </option>
                  {sizeOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                className="ob-fit-remove"
                title="Remove"
                onClick={() => removeRow(row.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm ob-add-fit" onClick={addRow}>
          + Add another {tab === 'tops' ? 'top' : 'pair'}
        </button>
      </div>

      <div className="onboarding-actions ob-actions-between">
        <button className="btn btn-secondary btn-sm onboarding-back" onClick={onBack}>
          ← Back
        </button>
        <div className="ob-actions-right">
          <a className="link onboarding-skip" onClick={onNext}>
            Skip
          </a>
          <button className="btn btn-primary onboarding-next" onClick={onNext}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

export { newFitRow };
