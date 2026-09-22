import { useState } from 'react'
import { User, SlidersHorizontal, Bell, Palette, Globe, ShieldCheck } from 'lucide-react'
import { FormInput, SelectInput } from '../components/FormInputs'
import { PrimaryButton } from '../components/Buttons'
import { useToast } from '../components/ToastContext'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'

const SECTIONS = [
  { id: 'profile', keyLabel: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', keyLabel: 'system_preferences', label: 'System Preferences', icon: SlidersHorizontal },
  { id: 'notifications', keyLabel: 'notification_settings', label: 'Notification Settings', icon: Bell },
  { id: 'theme', keyLabel: 'theme_settings', label: 'Theme', icon: Palette },
  { id: 'language', keyLabel: 'app_language', label: 'Language', icon: Globe },
  { id: 'security', keyLabel: 'security', label: 'Security', icon: ShieldCheck },
]

function Toggle({ on, onClick }) {
  return <button className={`switch ${on ? 'on' : ''}`} onClick={onClick} aria-label="Toggle" />
}

export default function Settings() {
  const [active, setActive] = useState('profile')
  const [toggles, setToggles] = useState({ email: true, sms: false, push: true, weeklyDigest: true })
  const showToast = useToast()
  const { theme, setTheme } = useApp()
  const { language, setLanguage, t, languages } = useTranslation()

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
              <div className="avatar-lg">A</div>
              <div>
                <div className="cell-primary" style={{ fontSize: '1.05rem' }}>Administrator</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>Admin</div>
              </div>
            </div>
            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); showToast('Profile updated') }}>
              <FormInput label="Display Name" defaultValue="Administrator" />
              <FormInput label="Role" defaultValue="Admin" disabled />
              <FormInput label="Email" defaultValue="admin@constructionpms.in" />
              <FormInput label="Phone" defaultValue="9840000000" />
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
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>{t('theme_settings', 'Theme Settings')}</h3>
            <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: 16 }}>Select your preferred theme palette for the application.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div
                onClick={() => { setTheme('light'); showToast('Light Theme applied') }}
                style={{
                  cursor: 'pointer',
                  padding: 16,
                  borderRadius: 8,
                  border: theme === 'light' ? '2px solid var(--forest-700)' : '1px solid var(--border-color)',
                  background: 'var(--cream-100)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 4, color: 'var(--forest-900)' }}>
                  {t('light_theme', 'Light Theme')} {theme === 'light' && ' (Active)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                  Approved standard forest green & cream visual interface (Default).
                </div>
              </div>

              <div
                onClick={() => { setTheme('dark'); showToast('Dark Theme applied') }}
                style={{
                  cursor: 'pointer',
                  padding: 16,
                  borderRadius: 8,
                  border: theme === 'dark' ? '2px solid #D4B06A' : '1px solid var(--border-color)',
                  background: '#1E3932',
                  color: '#F5F1E8',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 4, color: '#F5F1E8' }}>
                  {t('dark_theme', 'Dark Theme')} {theme === 'dark' && ' (Active)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#C8C4BA' }}>
                  Dark forest green brand palette (#162923 / #1E3932 / #D4B06A).
                </div>
              </div>
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
