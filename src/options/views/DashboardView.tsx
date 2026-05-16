import { useState } from 'react';

type Section = 'measure' | 'wardrobe' | 'guides' | 'profile';
type ProfilePage =
  | 'profile-info'
  | 'profile-measurements'
  | 'profile-known-fits'
  | 'profile-preferences'
  | 'profile-security';

type Props = {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
};

export function DashboardView({ theme, onThemeChange }: Props) {
  const [section, setSection] = useState<Section>('measure');
  const [profilePage, setProfilePage] = useState<ProfilePage>('profile-info');
  const [sizeUnit, setSizeUnit] = useState<'US' | 'EU' | 'UK'>('US');

  return (
    <div className="view" id="viewDashboard">
      <nav className="dash-topnav">
        <div className="dash-topnav-left">
          <div className="dash-logo">F</div>
          <span className="text-card-title">Fitr</span>
        </div>
        <div className="dash-topnav-tabs">
          {(['measure', 'wardrobe', 'guides', 'profile'] as Section[]).map((s) => (
            <button
              key={s}
              className={`dash-tab ${section === s ? 'active' : ''}`}
              onClick={() => setSection(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="dash-topnav-right">
          <div className="anon-avatar">P</div>
        </div>
      </nav>

      <div className="dash-body">
        {section === 'measure' && (
          <div className="dash-section active">
            <MeasureSection sizeUnit={sizeUnit} onSizeUnitChange={setSizeUnit} />
          </div>
        )}
        {section === 'wardrobe' && (
          <div className="dash-section active">
            <WardrobeSection />
          </div>
        )}
        {section === 'guides' && (
          <div className="dash-section active">
            <GuidesSection />
          </div>
        )}
        {section === 'profile' && (
          <div className="dash-section active">
            <ProfileSection
              page={profilePage}
              onPageChange={setProfilePage}
              theme={theme}
              onThemeChange={onThemeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Measure section
// ============================================================
function MeasureSection({
  sizeUnit,
  onSizeUnitChange,
}: {
  sizeUnit: 'US' | 'EU' | 'UK';
  onSizeUnitChange: (u: 'US' | 'EU' | 'UK') => void;
}) {
  return (
    <div className="dash-content-full">
      <div className="dash-page-header">
        <div>
          <h1 className="text-display-hero">Your Sizes</h1>
          <p className="text-body-large text-muted">
            Personalized size recommendations across your brands.
          </p>
        </div>
        <div className="unit-toggle">
          {(['US', 'EU', 'UK'] as const).map((u) => (
            <button
              key={u}
              className={`unit-toggle-option ${sizeUnit === u ? 'active' : ''}`}
              onClick={() => onSizeUnitChange(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-brand-grid">
        <BrandCard
          brand="Nike"
          confidence="high"
          tops="M"
          pants="32"
          shoes="US 10"
          basis="Based on 4 purchases + body profile"
        />
        <BrandCard
          brand="adidas"
          confidence="medium"
          tops="L"
          pants="32"
          shoes="US 10.5"
          basis="Based on community data + body profile"
        />
        <BrandCard
          brand="New Balance"
          confidence="low"
          tops="M"
          pants="--"
          shoes="US 10"
          basis="Based on body estimate only"
        />
      </div>

      <div className="dash-confidence-row">
        <div className="card dash-confidence-card">
          <span className="text-caption text-muted">Overall Confidence Score</span>
          <div className="dash-confidence-display">
            <span className="size-token size-token-xl">84%</span>
            <div className="dash-confidence-bar">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '84%' }} />
              </div>
              <span className="text-small text-muted">
                Add 2 more items to reach 95% precision.
              </span>
            </div>
          </div>
        </div>
        <div className="card dash-precision-card">
          <div className="dash-precision-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-card-title">Precision Modeling</h3>
          <p className="text-small text-muted">
            The more "Known Fits" you add, the more accurate our tailored recommendations
            become across all brands.
          </p>
        </div>
      </div>

      <div className="dash-recent">
        <h2 className="text-card-title">Recent Recommendations</h2>
        <div className="dash-recent-list">
          <RecentItem
            name="Nike Air Max 90"
            date="Apr 14, 2026"
            size="US 10"
            confidence="high"
          />
          <RecentItem
            name="adidas Ultraboost 23"
            date="Apr 12, 2026"
            size="US 10.5"
            confidence="medium"
          />
          <RecentItem
            name="New Balance 990v6"
            date="Apr 10, 2026"
            size="US 10"
            confidence="low"
          />
        </div>
      </div>
    </div>
  );
}

function BrandCard({
  brand,
  confidence,
  tops,
  pants,
  shoes,
  basis,
}: {
  brand: string;
  confidence: 'high' | 'medium' | 'low';
  tops: string;
  pants: string;
  shoes: string;
  basis: string;
}) {
  return (
    <div className="card dash-brand-card">
      <div className="dash-brand-card-header">
        <span className="text-card-title">{brand}</span>
        <ConfidenceChip level={confidence} />
      </div>
      <div className="dash-brand-card-body">
        <div className="dash-brand-sizes">
          <div className="dash-size-item">
            <span className="text-caption text-muted">Tops</span>
            <span className="size-token size-token-md">{tops}</span>
          </div>
          <div className="dash-size-item">
            <span className="text-caption text-muted">Pants</span>
            <span className="size-token size-token-md">{pants}</span>
          </div>
          <div className="dash-size-item">
            <span className="text-caption text-muted">Shoes</span>
            <span className="size-token size-token-md">{shoes}</span>
          </div>
        </div>
      </div>
      <span className="text-small text-muted">{basis}</span>
    </div>
  );
}

function ConfidenceChip({ level, label }: { level: 'high' | 'medium' | 'low'; label?: string }) {
  return (
    <span className={`confidence-chip confidence-chip-${level}`}>
      <span className="confidence-dot" />
      {label ?? level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function RecentItem({
  name,
  date,
  size,
  confidence,
}: {
  name: string;
  date: string;
  size: string;
  confidence: 'high' | 'medium' | 'low';
}) {
  return (
    <div className="card dash-recent-item">
      <div className="dash-recent-info">
        <span className="text-body-semibold">{name}</span>
        <span className="text-small text-muted">{date}</span>
      </div>
      <div className="dash-recent-size">
        <span className="size-token size-token-sm">{size}</span>
        <ConfidenceChip level={confidence} />
      </div>
    </div>
  );
}

// ============================================================
// Wardrobe section
// ============================================================
function WardrobeSection() {
  return (
    <div className="dash-content-full">
      <div className="dash-page-header">
        <div>
          <h1 className="text-section-heading">Wardrobe</h1>
          <p className="text-body text-muted">Items you own and their fit feedback.</p>
        </div>
        <button className="btn btn-primary btn-sm">+ Add Item</button>
      </div>
      <div className="dash-wardrobe-list">
        <WardrobeItem name="Nike Dri-FIT Tee" sub="Size M · Tops" fit="high" label="Perfect fit" />
        <WardrobeItem
          name="Levi's 511 Slim Fit"
          sub="Size 32x30 · Pants"
          fit="medium"
          label="Slightly tight"
        />
        <WardrobeItem
          name="adidas Ultraboost 23"
          sub="Size US 10.5 · Shoes"
          fit="high"
          label="Perfect fit"
        />
        <WardrobeItem
          name="Patagonia Better Sweater"
          sub="Size M · Tops"
          fit="low"
          label="Too loose"
        />
      </div>
    </div>
  );
}

function WardrobeItem({
  name,
  sub,
  fit,
  label,
}: {
  name: string;
  sub: string;
  fit: 'high' | 'medium' | 'low';
  label: string;
}) {
  return (
    <div className="card dash-wardrobe-item">
      <div className="dash-wardrobe-info">
        <span className="text-body-semibold">{name}</span>
        <span className="text-small text-muted">{sub}</span>
      </div>
      <ConfidenceChip level={fit} label={label} />
    </div>
  );
}

// ============================================================
// Guides section
// ============================================================
function GuidesSection() {
  return (
    <div className="dash-content-full">
      <div className="dash-page-header">
        <div>
          <h1 className="text-section-heading">Size Guides</h1>
          <p className="text-body text-muted">Brand-specific sizing charts and tips.</p>
        </div>
      </div>
      <div className="dash-guides-grid">
        <GuideCard
          title="Nike Sizing Guide"
          body="Nike tends to run narrow. We recommend going half a size up if you have wide feet."
          updated="Updated Apr 2026"
          updatedClass="text-teal"
        />
        <GuideCard
          title="adidas Sizing Guide"
          body="adidas fits true to size for most models. Ultraboost runs slightly large in the toe box."
          updated="Updated Apr 2026"
          updatedClass="text-teal"
        />
        <GuideCard
          title="New Balance Sizing Guide"
          body="New Balance widths vary significantly. Use our width calculator for best results."
          updated="Updated Mar 2026"
          updatedClass="text-teal"
        />
        <GuideCard
          title="How to Measure Your Feet"
          body="Step-by-step guide to measuring foot length and width at home for accurate results."
          updated="General"
          updatedClass="text-muted"
        />
      </div>
    </div>
  );
}

function GuideCard({
  title,
  body,
  updated,
  updatedClass,
}: {
  title: string;
  body: string;
  updated: string;
  updatedClass: string;
}) {
  return (
    <div className="card dash-guide-card">
      <span className="text-card-title">{title}</span>
      <p className="text-small text-muted">{body}</p>
      <span className={`text-caption ${updatedClass}`}>{updated}</span>
    </div>
  );
}

// ============================================================
// Profile section
// ============================================================
const PROFILE_PAGES: { id: ProfilePage; label: string }[] = [
  { id: 'profile-info', label: 'Profile' },
  { id: 'profile-measurements', label: 'Measurements' },
  { id: 'profile-known-fits', label: 'Known Fits' },
  { id: 'profile-preferences', label: 'Preferences' },
  { id: 'profile-security', label: 'Security' },
];

function ProfileSection({
  page,
  onPageChange,
  theme,
  onThemeChange,
}: {
  page: ProfilePage;
  onPageChange: (p: ProfilePage) => void;
  theme: 'light' | 'dark';
  onThemeChange: (t: 'light' | 'dark') => void;
}) {
  return (
    <div className="dash-with-sidebar">
      <aside className="dash-sidebar">
        <ul className="dash-sidebar-nav">
          {PROFILE_PAGES.map((p) => (
            <li
              key={p.id}
              className={`dash-sidebar-item ${page === p.id ? 'active' : ''}`}
              onClick={() => onPageChange(p.id)}
            >
              {p.label}
            </li>
          ))}
        </ul>
      </aside>

      <div className="dash-profile-content">
        {page === 'profile-info' && <ProfileInfoPage />}
        {page === 'profile-measurements' && <MeasurementsPage />}
        {page === 'profile-known-fits' && <KnownFitsPage />}
        {page === 'profile-preferences' && (
          <PreferencesPage theme={theme} onThemeChange={onThemeChange} />
        )}
        {page === 'profile-security' && <SecurityPage />}
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  action,
  noBorder,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className="setting-row"
      style={noBorder ? { border: 'none', paddingTop: 0 } : undefined}
    >
      <div className="setting-info">
        <span className="text-body-semibold">{title}</span>
        <span className="text-small text-muted">{description}</span>
      </div>
      {action}
    </div>
  );
}

function ProfileInfoPage() {
  return (
    <div className="dash-profile-page active">
      <h2 className="text-section-heading">Profile</h2>
      <p className="text-body text-muted">Manage your personal information.</p>
      <div className="card settings-group">
        <SettingRow
          title="Username"
          description="@tailor_fit"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
          noBorder
        />
        <SettingRow
          title="Nickname"
          description="Peter"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
        <SettingRow
          title="Email"
          description="peter@example.com"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
        <SettingRow
          title="Body Type"
          description="Male"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
      </div>
    </div>
  );
}

function MeasurementsPage() {
  return (
    <div className="dash-profile-page active">
      <h2 className="text-section-heading">Measurements</h2>
      <p className="text-body text-muted">Your body dimensions used for sizing calculations.</p>
      <div className="card settings-group">
        <SettingRow
          title="Height"
          description="182 cm"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
          noBorder
        />
        <SettingRow
          title="Weight"
          description="78 kg"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
        <SettingRow
          title="Shoe Size"
          description="EU 44"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
        <SettingRow
          title="Shoulder Width"
          description="44 cm"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
        <SettingRow
          title="Chest Circumference"
          description="102 cm"
          action={<button className="btn btn-secondary btn-sm">Edit</button>}
        />
      </div>
    </div>
  );
}

function KnownFitsPage() {
  return (
    <div className="dash-profile-page active" id="profile-known-fits">
      <div className="dash-page-header">
        <div>
          <h2 className="text-section-heading">Known Fits</h2>
          <p className="text-body text-muted">
            Manage items that fit you perfectly for better recommendations.
          </p>
        </div>
        <button className="btn btn-primary btn-sm">+ Add fit</button>
      </div>

      <div className="card dash-fits-table-wrap">
        <table className="dash-fits-table">
          <thead>
            <tr>
              <th className="text-caption text-muted">Brand</th>
              <th className="text-caption text-muted">Category</th>
              <th className="text-caption text-muted">Size</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-body-semibold">Everlane</td>
              <td className="text-body">Oxford Shirt</td>
              <td className="size-token size-token-sm">M</td>
              <td>
                <button className="btn btn-secondary btn-sm">Edit</button>
              </td>
            </tr>
            <tr>
              <td className="text-body-semibold">Levi's</td>
              <td className="text-body">511 Slim Fit</td>
              <td className="size-token size-token-sm">32x30</td>
              <td>
                <button className="btn btn-secondary btn-sm">Edit</button>
              </td>
            </tr>
            <tr>
              <td className="text-body-semibold">Nike</td>
              <td className="text-body">Sportswear Tee</td>
              <td className="size-token size-token-sm">L</td>
              <td>
                <button className="btn btn-secondary btn-sm">Edit</button>
              </td>
            </tr>
            <tr>
              <td className="text-body-semibold">Patagonia</td>
              <td className="text-body">Better Sweater</td>
              <td className="size-token size-token-sm">M</td>
              <td>
                <button className="btn btn-secondary btn-sm">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="dash-known-fits-aside">
        <div className="card">
          <span className="text-caption text-muted">The Precision Engine</span>
          <p className="text-small text-muted">
            Our engine analyzes the technical specifications of your "Known Fits" to build a 3D
            volume profile. This eliminates the guesswork of vanity sizing across different
            manufacturers.
          </p>
        </div>
        <div className="card">
          <span className="text-caption text-muted">Confidence Score</span>
          <span className="size-token size-token-lg">84%</span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '84%' }} />
          </div>
          <span className="text-small text-muted">
            Add 2 more items to reach 95% precision.
          </span>
        </div>
      </div>
    </div>
  );
}

function PreferencesPage({
  theme,
  onThemeChange,
}: {
  theme: 'light' | 'dark';
  onThemeChange: (t: 'light' | 'dark') => void;
}) {
  const [sizeUnit, setSizeUnit] = useState<'US' | 'EU' | 'UK'>('US');
  const [community, setCommunity] = useState(true);
  const [socialProof, setSocialProof] = useState(true);

  return (
    <div className="dash-profile-page active">
      <h2 className="text-section-heading">Preferences</h2>
      <p className="text-body text-muted">Display and notification settings.</p>
      <div className="card settings-group">
        <SettingRow
          title="Size Unit"
          description="Default unit for size display"
          noBorder
          action={
            <div className="unit-toggle">
              {(['US', 'EU', 'UK'] as const).map((u) => (
                <button
                  key={u}
                  className={`unit-toggle-option ${sizeUnit === u ? 'active' : ''}`}
                  onClick={() => setSizeUnit(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          }
        />
        <SettingRow
          title="Theme"
          description="Light or dark appearance"
          action={
            <div className="unit-toggle">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  className={`unit-toggle-option ${theme === t ? 'active' : ''}`}
                  onClick={() => onThemeChange(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          }
        />
        <SettingRow
          title="Community Data"
          description="Share anonymized size data to improve recommendations"
          action={
            <label className="toggle">
              <input
                type="checkbox"
                checked={community}
                onChange={(e) => setCommunity(e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          }
        />
        <SettingRow
          title="Social Proof in Popup"
          description='Show "X% chose this size" in the extension popup'
          action={
            <label className="toggle">
              <input
                type="checkbox"
                checked={socialProof}
                onChange={(e) => setSocialProof(e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          }
        />
      </div>
    </div>
  );
}

function SecurityPage() {
  return (
    <div className="dash-profile-page active">
      <h2 className="text-section-heading">Security</h2>
      <p className="text-body text-muted">Account security and data management.</p>
      <div className="card settings-group">
        <SettingRow
          title="Change Password"
          description="Last changed 30 days ago"
          action={<button className="btn btn-secondary btn-sm">Change</button>}
          noBorder
        />
        <SettingRow
          title="Two-Factor Authentication"
          description="Not enabled"
          action={<button className="btn btn-secondary btn-sm">Enable</button>}
        />
        <SettingRow
          title="Export Data"
          description="Download all your profile and fit data"
          action={<button className="btn btn-outline btn-sm">Export</button>}
        />
        <SettingRow
          title="Delete Account"
          description="This action cannot be undone"
          action={
            <button
              className="btn btn-outline btn-sm"
              style={{
                borderColor: 'var(--color-danger)',
                color: 'var(--color-danger)',
              }}
            >
              Delete
            </button>
          }
        />
      </div>
    </div>
  );
}
