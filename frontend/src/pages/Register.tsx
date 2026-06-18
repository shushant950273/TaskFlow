import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import apiClient from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ email: '', displayName: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const res = await apiClient.get('/auth/social/config/');
      const { google_enabled, github_enabled, mock_enabled, google_client_id, github_client_id } = res.data.data;
      
      const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
      
      const useMock = mock_enabled || 
                      (provider === 'google' && !google_enabled) || 
                      (provider === 'github' && !github_enabled);

      if (useMock) {
        window.location.href = `/auth/mock-provider?provider=${provider}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      } else {
        if (provider === 'google') {
          window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${google_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile`;
        } else if (provider === 'github') {
          window.location.href = `https://github.com/login/oauth/authorize?client_id=${github_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
        }
      }
    } catch (err) {
      console.error('Failed to load social login configuration:', err);
      const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
      window.location.href = `/auth/mock-provider?provider=${provider}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form.email, form.password, form.displayName);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error: any) {
      // Custom renderer wraps errors as { success: false, error: { fieldName: ['msg'] } }
      const errPayload = error?.response?.data?.error;
      if (errPayload && typeof errPayload === 'object') {
        // Field-level errors (e.g. { email: ['user with this email already exists'] })
        const firstField = Object.values(errPayload)[0] as any;
        const msg = Array.isArray(firstField) ? firstField[0] : String(firstField);
        setError(msg);
      } else {
        setError(
          typeof errPayload === 'string' ? errPayload :
          error?.message ||
          'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '340px',
      background: 'var(--tf-surface)',
      border: '0.5px solid var(--tf-border)',
      borderRadius: '14px',
      padding: '28px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        width: '36px', height: '36px',
        background: 'var(--tf-accent)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px'
      }}>
        <Layers size={20} color="#fff" />
      </div>
      
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '16px',
        textAlign: 'center', marginBottom: '4px', color: 'var(--tf-text)'
      }}>
        Create an account
      </h3>
      
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--tf-text-secondary)',
        textAlign: 'center', marginBottom: '20px'
      }}>
        Join TaskFlow to manage your projects
      </p>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Email
          </label>
          <input 
            type="email" 
            required 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Display Name
          </label>
          <input 
            type="text" 
            required 
            value={form.displayName} 
            onChange={e => setForm({...form, displayName: e.target.value})} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Password
          </label>
          <input 
            type="password" 
            required minLength={8}
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Confirm Password
          </label>
          <input 
            type="password" 
            required minLength={8}
            value={form.confirm} 
            onChange={e => setForm({...form, confirm: e.target.value})} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>

        {error && <div style={{ color: 'var(--tf-red)', fontSize: '11px', marginBottom: '14px', textAlign: 'center' }}>{error}</div>}
        
        <button type="submit" disabled={loading} style={{
          width: '100%', height: '36px',
          background: 'var(--tf-accent)', color: '#fff',
          fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '13px',
          marginBottom: '14px',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }}>
          {loading ? 'Sending code...' : 'Register'}
        </button>
      </form>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '14px', color: 'var(--tf-text-tertiary)', fontSize: '11px'
      }}>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--tf-border)' }}></div>
        <span>or continue with</span>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--tf-border)' }}></div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          type="button"
          disabled={loading}
          onClick={() => handleSocialAuth('google')} 
          style={{
            flex: 1, height: '34px', background: 'transparent',
            border: '0.5px solid var(--tf-border)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            color: 'var(--tf-text)',
            cursor: loading ? 'default' : 'pointer'
          }} 
          className="btn-ghost"
        >
          <div style={{ width: '14px', height: '14px', background: '#DB4437', borderRadius: '3px' }}></div>
          Google
        </button>
        <button 
          type="button"
          disabled={loading}
          onClick={() => handleSocialAuth('github')} 
          style={{
            flex: 1, height: '34px', background: 'transparent',
            border: '0.5px solid var(--tf-border)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            color: 'var(--tf-text)',
            cursor: loading ? 'default' : 'pointer'
          }} 
          className="btn-ghost"
        >
          <div style={{ width: '14px', height: '14px', background: '#333', borderRadius: '3px' }}></div>
          GitHub
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tf-text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--tf-accent)', textDecoration: 'none' }}>Sign in</Link>
      </div>
    </div>
  );
}
