import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Palette, Shield, Layers, ChevronLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { updateProfile, changePassword } from '../api/settingsApi';
import { useToastStore } from '../store/useToastStore';

const AVATAR_COLORS: { key: string; hex: string; label: string }[] = [
  { key: 'purple', hex: '#7B68EE', label: 'Purple' },
  { key: 'teal',   hex: '#2DD4BF', label: 'Teal' },
  { key: 'red',    hex: '#F87171', label: 'Red' },
  { key: 'pink',   hex: '#F472B6', label: 'Pink' },
  { key: 'blue',   hex: '#60A5FA', label: 'Blue' },
  { key: 'amber',  hex: '#FBBF24', label: 'Amber' },
];

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'security',      label: 'Security',       icon: Shield },
];

/* ── tiny helpers ── */
const inp: React.CSSProperties = {
  width: '100%', background: 'var(--tf-surface2)',
  border: '1px solid var(--tf-border)',
  borderRadius: '8px', padding: '11px 14px',
  color: 'var(--tf-text)', fontSize: '14px', outline: 'none',
  transition: 'border-color .2s',
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? 'var(--tf-accent)' : 'var(--tf-border-hover)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background .25s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'left .25s',
        boxShadow: '0 1px 4px rgba(0,0,0,.4)',
      }} />
    </button>
  );
}

/* ═══════════════════════════════════════ */
export default function Settings() {
  const navigate = useNavigate();
  const { user, loadUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [tab, setTab] = useState('profile');

  /* ── Profile ── */
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color ?? 'purple');
  const [saving, setSaving] = useState(false);

  const avatarHex = AVATAR_COLORS.find(c => c.key === avatarColor)?.hex ?? '#7B68EE';

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim(), avatar_color: avatarColor });
      await loadUser();
      addToast('Profile saved!', 'success');
    } catch {
      addToast('Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleColorPick = async (key: string) => {
    setAvatarColor(key);
    try {
      await updateProfile({ avatar_color: key });
      await loadUser();
    } catch { /* silent */ }
  };

  /* ── Notifications ── */
  const NOTIF_KEYS = ['task_assigned', 'task_done', 'sprint_started', 'member_added', 'weekly_digest'];
  const NOTIF_LABELS: Record<string, string> = {
    task_assigned:  'Task assigned to me',
    task_done:      'Task moved to Done',
    sprint_started: 'Sprint started',
    member_added:   'Member added to board',
    weekly_digest:  'Weekly digest email',
  };
  const loadNotifs = () => {
    try { return JSON.parse(localStorage.getItem('tf_notif_prefs') || '{}'); } catch { return {}; }
  };
  const [notifs, setNotifs] = useState<Record<string, boolean>>(() => {
    const saved = loadNotifs();
    const defaults: Record<string, boolean> = {};
    NOTIF_KEYS.forEach(k => { defaults[k] = saved[k] !== false; });
    return defaults;
  });
  const handleToggleNotif = (key: string, val: boolean) => {
    const next = { ...notifs, [key]: val };
    setNotifs(next);
    localStorage.setItem('tf_notif_prefs', JSON.stringify(next));
    addToast('Preference saved', 'success');
  };

  /* ── Appearance ── */
  const [theme, setTheme] = useState(() => localStorage.getItem('tf_theme') || 'dark');
  const [compact, setCompact] = useState(() => localStorage.getItem('tf_compact') === 'true');
  const [boardView, setBoardView] = useState(() => localStorage.getItem('tf_board_view') || 'kanban');

  const saveAppearance = (key: string, val: string | boolean) => {
    localStorage.setItem(key, String(val));
    addToast('Preference saved', 'success');
  };

  /* ── Security ── */
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdLoading(true);
    try {
      await changePassword({ current_password: curPwd, new_password: newPwd, confirm_password: confirmPwd });
      addToast('Password updated!', 'success');
      setCurPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.data?.error || 'Failed to update password.';
      setPwdError(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  /* ── focus border util ── */
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = 'var(--tf-accent)');
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = 'var(--tf-border)');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        height: 64, padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => navigate('/boards')} style={{
          background: 'var(--tf-surface2)', border: '1px solid var(--tf-border)',
          borderRadius: 8, padding: '6px 12px', color: 'var(--tf-text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, transition: 'color .2s',
        }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--tf-text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--tf-text-secondary)')}>
          <ChevronLeft size={15} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={15} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>TaskFlow</span>
        </div>
        <span style={{ marginLeft: 4, color: 'var(--text-muted)', fontSize: 14 }}>/ Settings</span>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem', gap: '2rem' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 180, flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '0.75rem' }}>Settings</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} id={`settings-tab-${t.id}`} onClick={() => setTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
                  background: active ? 'var(--tf-accent-glow)' : 'none',
                  border: 'none', color: active ? 'var(--tf-accent)' : 'var(--tf-text-secondary)',
                  fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer',
                  textAlign: 'left', width: '100%', transition: 'all .15s',
                }}>
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

              {/* ════════ PROFILE ════════ */}
              {tab === 'profile' && (
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Profile</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Manage your personal information</p>

                  {/* Avatar preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', background: avatarHex,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 700, color: '#fff',
                      boxShadow: `0 0 0 3px ${avatarHex}44`,
                      transition: 'background .3s, box-shadow .3s',
                    }}>
                      {(displayName || user?.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{displayName || user?.display_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>
                  </div>

                  {/* Display name */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Display Name
                    </label>
                    <input
                      id="settings-display-name"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      onBlur={onBlur}
                      onFocus={onFocus}
                      style={inp}
                    />
                  </div>

                  {/* Email read-only */}
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Email
                    </label>
                    <input
                      value={user?.email || ''}
                      readOnly
                      style={{ ...inp, color: 'var(--text-muted)', cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Email cannot be changed</p>
                  </div>

                  {/* Avatar color picker */}
                  <div style={{ marginBottom: 36 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Avatar Color
                    </label>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {AVATAR_COLORS.map(c => (
                        <button
                          key={c.key}
                          id={`avatar-color-${c.key}`}
                          onClick={() => handleColorPick(c.key)}
                          title={c.label}
                          style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: c.hex, border: 'none', cursor: 'pointer',
                            boxShadow: avatarColor === c.key ? `0 0 0 3px var(--bg), 0 0 0 5px ${c.hex}` : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'box-shadow .2s, transform .15s',
                            transform: avatarColor === c.key ? 'scale(1.12)' : 'scale(1)',
                          }}
                        >
                          {avatarColor === c.key && <Check size={16} color="#fff" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    id="settings-save-profile"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '11px 28px', fontFamily: "'Syne', sans-serif",
                      fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1, transition: 'all .2s',
                      boxShadow: '0 4px 14px var(--accent-glow)',
                    }}
                    onMouseOver={e => { if (!saving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.filter = 'none'; }}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}

              {/* ════════ NOTIFICATIONS ════════ */}
              {tab === 'notifications' && (
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Notifications</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Choose what you want to be notified about</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {NOTIF_KEYS.map((key, i) => (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '18px 20px',
                        background: i % 2 === 0 ? 'var(--tf-surface2)' : 'transparent',
                        borderBottom: i < NOTIF_KEYS.length - 1 ? '1px solid var(--tf-border)' : 'none',
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{NOTIF_LABELS[key]}</span>
                        <Toggle checked={notifs[key]} onChange={val => handleToggleNotif(key, val)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════════ APPEARANCE ════════ */}
              {tab === 'appearance' && (
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Appearance</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Customize how TaskFlow looks for you</p>

                  {/* Theme */}
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>Theme</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['light', 'dark', 'auto'].map(t => (
                        <label key={t} id={`theme-option-${t}`} style={{
                          flex: 1, background: theme === t ? 'var(--tf-accent-glow)' : 'var(--tf-surface2)',
                          border: `1px solid ${theme === t ? 'var(--tf-accent)' : 'var(--tf-border)'}`,
                          borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10, transition: 'all .2s',
                        }}>
                          <input type="radio" name="theme" value={t} checked={theme === t}
                            onChange={() => { setTheme(t); saveAppearance('tf_theme', t); }}
                            style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                          <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Compact */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 20px', background: 'var(--tf-surface2)',
                    border: '1px solid var(--tf-border)', borderRadius: 10, marginBottom: 24,
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>Compact mode</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Reduce spacing between elements</p>
                    </div>
                    <Toggle checked={compact} onChange={v => { setCompact(v); saveAppearance('tf_compact', v); }} />
                  </div>

                  {/* Default board view */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Default Board View
                    </label>
                    <select
                      id="settings-default-view"
                      value={boardView}
                      onChange={e => { setBoardView(e.target.value); saveAppearance('tf_board_view', e.target.value); }}
                      onFocus={onFocus as any}
                      onBlur={onBlur as any}
                      style={{ ...inp, appearance: 'none', cursor: 'pointer', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                    >
                      <option value="kanban">Kanban</option>
                      <option value="list">List</option>
                      <option value="calendar">Calendar</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ════════ SECURITY ════════ */}
              {tab === 'security' && (
                <div>
                  <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Security</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Manage your password and connected accounts</p>

                  {/* Change password */}
                  <div style={{ background: 'var(--tf-surface2)', border: '1px solid var(--tf-border)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Change Password</h2>
                    <form onSubmit={handleChangePassword}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="settings-current-password"
                            type={showPwd ? 'text' : 'password'}
                            value={curPwd}
                            onChange={e => setCurPwd(e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            style={{ ...inp, paddingRight: 44 }}
                            placeholder="Enter current password"
                          />
                          <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>New Password</label>
                        <input
                          id="settings-new-password"
                          type={showPwd ? 'text' : 'password'}
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          style={inp}
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Confirm New Password</label>
                        <input
                          id="settings-confirm-password"
                          type={showPwd ? 'text' : 'password'}
                          value={confirmPwd}
                          onChange={e => setConfirmPwd(e.target.value)}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          style={inp}
                          placeholder="Repeat new password"
                        />
                      </div>
                      {pwdError && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 14 }}>{pwdError}</p>}
                      <button
                        type="submit"
                        id="settings-update-password"
                        disabled={pwdLoading}
                        style={{
                          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '11px 24px', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14,
                          cursor: pwdLoading ? 'not-allowed' : 'pointer', opacity: pwdLoading ? 0.7 : 1, transition: 'all .2s',
                        }}
                      >
                        {pwdLoading ? 'Updating…' : 'Update password'}
                      </button>
                    </form>
                  </div>

                  {/* Connected accounts */}
                  <div style={{ background: 'var(--tf-surface2)', border: '1px solid var(--tf-border)', borderRadius: 12, padding: 24 }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Connected Accounts</h2>
                    {[
                      { name: 'Google', icon: '🔵', linked: false },
                      { name: 'GitHub', icon: '⚫', linked: false },
                    ].map(acc => (
                      <div key={acc.name} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{acc.icon}</span>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 500 }}>{acc.name}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{acc.linked ? 'Connected' : 'Not connected'}</p>
                          </div>
                        </div>
                        <button style={{
                          background: 'none',
                          border: `1px solid ${acc.linked ? 'var(--tf-red)' : 'var(--tf-border)'}`,
                          color: acc.linked ? 'var(--tf-red)' : 'var(--tf-text-secondary)',
                          borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer', transition: 'all .2s',
                        }}>
                          {acc.linked ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
