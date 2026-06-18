import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import apiClient from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/boards');
    } catch (error: any) {
      const data = error?.response?.data;
      if (data && typeof data === 'object' && !data.error && !data.detail && !data.message) {
        const firstError = Object.values(data)[0] as any;
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        const message =
          error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Login failed. Please try again.';
        setError(message);
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
        Welcome back
      </h3>
      
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--tf-text-secondary)',
        textAlign: 'center', marginBottom: '20px'
      }}>
        Sign in to your TaskFlow account
      </p>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Email
          </label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label style={{ fontSize: '11px', color: 'var(--tf-text-secondary)' }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--tf-accent)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>

        {error && <div style={{ color: 'var(--tf-red)', fontSize: '11px', marginBottom: '14px', textAlign: 'center' }}>{error}</div>}
        
        <button type="submit" style={{
          width: '100%', height: '36px',
          background: 'var(--tf-accent)', color: '#fff',
          fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '13px',
          marginBottom: '14px'
        }}>
          Sign in
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
        No account? <Link to="/register" style={{ color: 'var(--tf-accent)', textDecoration: 'none' }}>Create one</Link>
      </div>
    </div>
  );
}
