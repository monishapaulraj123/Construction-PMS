import { useState } from 'react'
import { User, SlidersHorizontal, Bell, Palette, Globe, ShieldCheck } from 'lucide-react'
import { FormInput, SelectInput } from '../components/FormInputs'
import { PrimaryButton } from '../components/Buttons'
import { useToast } from '../components/ToastContext'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'

const SECTIONS = [
  { id: 'theme', keyLabel: 'theme_settings', label: 'Theme & Appearance', icon: Palette },
  { id: 'preferences', keyLabel: 'system_preferences', label: 'System Preferences', icon: SlidersHorizontal },
  { id: 'notifications', keyLabel: 'notification_settings', label: 'Notification Settings', icon: Bell },
  { id: 'language', keyLabel: 'app_language', label: 'Language', icon: Globe },
  { id: 'security', keyLabel: 'security', label: 'Security', icon: ShieldCheck },
]

function Toggle({ on, onClick }) {
  return <button className={`switch ${on ? 'on' : ''}`} onClick={onClick} aria-label="Toggle" />
}

export default function Settings() {
  const [active, setActive] = useState('theme')
  const [toggles, setToggles] = useState({ email: true, sms: false, push: true, weeklyDigest: true })
  const showToast = useToast()
  const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useApp()
  const { language, setLanguage, t } = useTranslation()

  function flip(key) {
    setToggles((t) => ({ ...t, [key]: !t[key] }))
  }

  const currentLangLabel = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'

  return (
    <div className="settings-layout">
      <div className="settings-nav">
        {SECTIONS.map((s) => (
          <button key={s.id} className={active === s.id ? 'active' : ''} onClick={() => setActive(s.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <s.icon size={16} />
              {t(s.keyLabel, s.label)}
            </span>
          </button>
        ))}
      </div>

      <div className="card card-pad">
        {active === 'profile' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div className="avatar-lg" style={{ background: 'var(--forest-800)', color: 'var(--gold-400)', fontWeight: 800 }}>
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
              </div>
              <div>
                <div className="cell-primary" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {currentUser?.name || 'Arun Supervisor'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.82rem', textTransform: 'capitalize' }}>
                  {currentUser?.role || 'Supervisor'} Account
                </div>
              </div>
            </div>
            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); showToast('Profile details updated successfully!') }}>
              <FormInput label="Display Name" defaultValue={currentUser?.name || 'Arun Supervisor'} />
              <FormInput label="Role" defaultValue={currentUser?.role || 'SUPERVISOR'} disabled />
              <FormInput label="Email Address" defaultValue={currentUser?.email || 'supervisor@pms.com'} />
              <FormInput label="Contact Phone" defaultValue={currentUser?.phone || '9840011223'} />
              <div className="form-field full">
                <PrimaryButton type="submit">{t('save_changes', 'Save Changes')}</PrimaryButton>
              </div>
            </form>
          </div>
        )}

        {active === 'preferences' && (
          <div>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>{t('system_preferences', 'System Preferences')}</h3>
            <div className="form-grid">
              <SelectInput label="Default Landing Page" options={['Dashboard', 'Projects', 'Reports']} defaultValue="Dashboard" />
              <SelectInput label="Date Format" options={['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} defaultValue="DD MMM YYYY" />
              <SelectInput label="Currency" options={['INR (₹)', 'USD ($)']} defaultValue="INR (₹)" />
              <SelectInput label="Timezone" options={['Asia/Kolkata (IST)', 'UTC']} defaultValue="Asia/Kolkata (IST)" />
            </div>
          </div>
        )}

        {active === 'notifications' && (
          <div>
            <h3 style={{ marginBottom: 4, fontSize: '1rem' }}>{t('notification_settings', 'Notification Settings')}</h3>
            <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: 16 }}>Choose how you'd like to be notified about project activity.</p>
            <div className="toggle-row">
              <div className="toggle-row-text">
                <strong>Email Notifications</strong>
                <span>Progress updates, approvals and inspection alerts</span>
              </div>
              <Toggle on={toggles.email} onClick={() => flip('email')} />
            </div>
            <div className="toggle-row">
              <div className="toggle-row-text">
                <strong>SMS Alerts</strong>
                <span>Critical delays and safety notifications</span>
              </div>
              <Toggle on={toggles.sms} onClick={() => flip('sms')} />
            </div>
            <div className="toggle-row">
              <div className="toggle-row-text">
                <strong>Push Notifications</strong>
                <span>Real-time updates on the mobile app</span>
              </div>
              <Toggle on={toggles.push} onClick={() => flip('push')} />
            </div>
            <div className="toggle-row">
              <div className="toggle-row-text">
                <strong>Weekly Digest</strong>
                <span>A summary of all project activity every Monday</span>
              </div>
              <Toggle on={toggles.weeklyDigest} onClick={() => flip('weeklyDigest')} />
            </div>
          </div>
        )}

        {active === 'theme' && (
          <div>
            {/* 1. Theme Selection */}
            <h3 style={{ marginBottom: 6, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)' }}>
              {t('theme_settings', 'Theme Selection')}
            </h3>
            <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: 16 }}>
              Select your preferred visual mode for the interface.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <div
                onClick={() => { setTheme('light'); showToast('Light Theme applied', 'success') }}
                style={{
                  cursor: 'pointer',
                  padding: 16,
                  borderRadius: 10,
                  border: theme === 'light' ? '2px solid var(--forest-700)' : '1px solid var(--line-100)',
                  background: 'var(--cream-050)',
                  boxShadow: theme === 'light' ? '0 4px 14px rgba(27, 56, 48, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.94rem', marginBottom: 4, color: 'var(--forest-900)' }}>
                  ☀️ {t('light_theme', 'Light Theme')} {theme === 'light' && ' ✓'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                  Approved classic forest green & warm cream aesthetic (Default).
                </div>
              </div>

              <div
                onClick={() => { setTheme('dark'); showToast('Dark Theme applied', 'success') }}
                style={{
                  cursor: 'pointer',
                  padding: 16,
                  borderRadius: 10,
                  border: theme === 'dark' ? '2px solid #D4B06A' : '1px solid var(--line-100)',
                  background: '#1B3830',
                  color: '#F5F1E8',
                  boxShadow: theme === 'dark' ? '0 4px 14px rgba(0, 0, 0, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.94rem', marginBottom: 4, color: '#F5F1E8' }}>
                  🌙 {t('dark_theme', 'Dark Theme')} {theme === 'dark' && ' ✓'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#C8C4BA' }}>
                  Deep forest night palette (#142D26 / #1B3830 / #D4B06A).
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line-100)', margin: '24px 0' }} />

            {/* 2. Color Preferences */}
            <h3 style={{ marginBottom: 6, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)' }}>
              Color Preferences
            </h3>
            <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: 16 }}>
              Choose your accent branding color preference.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { id: 'emerald', label: 'Forest Green', hex: '#1B3830' },
                { id: 'gold', label: 'Rich Gold', hex: '#D4AF37' },
                { id: 'navy', label: 'Royal Navy', hex: '#1E3A8A' },
                { id: 'slate', label: 'Slate Charcoal', hex: '#334155' },
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setAccentColor(c.id); showToast(`${c.label} accent applied`, 'success') }}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: accentColor === c.id ? `2px solid ${c.hex}` : '1px solid var(--line-100)',
                    background: 'var(--paper)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink-900)' }}>{c.label}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line-100)', margin: '24px 0' }} />

            {/* 3. Font Size Preferences */}
            <h3 style={{ marginBottom: 6, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)' }}>
              Font Size Preferences
            </h3>
            <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: 16 }}>
              Adjust text scale for improved readability on your device.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { id: 'normal', label: 'Default (100%)', sample: 'Aa' },
                { id: 'medium', label: 'Medium (105%)', sample: 'Aa+' },
                { id: 'large', label: 'Large (112%)', sample: 'Aa++' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setFontSize(f.id); showToast(`Font size set to ${f.label}`, 'success') }}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: fontSize === f.id ? '2px solid var(--forest-700)' : '1px solid var(--line-100)',
                    background: fontSize === f.id ? 'var(--forest-050, rgba(27,56,48,0.06))' : 'var(--paper)',
                    fontWeight: fontSize === f.id ? 700 : 500,
                    color: fontSize === f.id ? 'var(--forest-900)' : 'var(--ink-800)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.86rem',
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.8 }}>{f.sample}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {active === 'language' && (
          <div>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>{t('language_settings', 'Language Settings')}</h3>
            <div className="form-field" style={{ maxWidth: 400 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.86rem', fontWeight: 600 }}>
                {t('app_language', 'Application Language')}
              </label>
              <select
                className="input"
                value={currentLangLabel}
                onChange={(e) => {
                  const val = e.target.value
                  setLanguage(val)
                  showToast(`Language set to ${val}`)
                }}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                <option value="English">English</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        )}

        {active === 'security' && (
          <div>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Security</h3>
            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); showToast('Password updated') }}>
              <FormInput label="Current Password" type="password" full />
              <FormInput label="New Password" type="password" />
              <FormInput label="Confirm New Password" type="password" />
              <div className="form-field full">
                <PrimaryButton type="submit">Update Password</PrimaryButton>
              </div>
            </form>
            <div className="toggle-row" style={{ marginTop: 8 }}>
              <div className="toggle-row-text">
                <strong>Two-Factor Authentication</strong>
                <span>Add an extra layer of security to your account</span>
              </div>
              <Toggle on={false} onClick={() => showToast('Two-factor setup coming soon')} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
