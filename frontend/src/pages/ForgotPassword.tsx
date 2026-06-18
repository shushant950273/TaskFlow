import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, ArrowRight, Loader2 } from 'lucide-react';
import apiClient from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password/', { email });
      setSent(true);
      // Redirect to reset page after short delay
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1800);
    } catch (err: any) {
      const errPayload = err?.response?.data?.error;
      if (typeof errPayload === 'string') {
        setError(errPayload);
      } else if (errPayload && typeof errPayload === 'object') {
        const first = Object.values(errPayload)[0] as any;
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Something went wrong. Please try again.');
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
        <Mail size={20} color="#fff" />
      </div>

      <h3 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '16px',
        textAlign: 'center', marginBottom: '4px', color: 'var(--tf-text)'
      }}>
        Forgot your password?
      </h3>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--tf-text-secondary)',
        textAlign: 'center', marginBottom: '20px'
      }}>
        Enter your email and we'll send you a 6-digit reset code
      </p>

      {sent ? (
        <div style={{
          background: 'rgba(29, 158, 117, 0.1)',
          border: '1px solid rgba(29, 158, 117, 0.3)',
          borderRadius: '8px',
          padding: '14px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📬</div>
          <div style={{ fontSize: '13px', color: 'var(--tf-text)', fontWeight: 500, marginBottom: '4px' }}>
            Reset code sent!
          </div>
          <div style={{ fontSize: '11px', color: 'var(--tf-text-secondary)' }}>
            Check your inbox at <strong>{email}</strong>.<br />Redirecting you now...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', height: '36px' }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ color: 'var(--tf-red)', fontSize: '11px', marginBottom: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: '36px',
              background: 'var(--tf-accent)', color: '#fff',
              fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '13px',
              marginBottom: '14px',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Sending...</>
            ) : (
              <>Send reset code <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tf-text-secondary)' }}>
        Remember your password? <Link to="/login" style={{ color: 'var(--tf-accent)', textDecoration: 'none' }}>Sign in</Link>
      </div>
    </div>
  );
}
