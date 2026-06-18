import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Loader2, ArrowRight } from 'lucide-react';
import apiClient from '../api/axios';
import { useToastStore } from '../store/useToastStore';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const navigate = useNavigate();
  const addToast = useToastStore(s => s.addToast);

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email address is required.');
    if (!tokenParam && (!otp || otp.length !== 6)) return setError('Please enter a valid 6-digit code.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password/', {
        email,
        otp: tokenParam ? '' : otp,
        token: tokenParam,
        new_password: password,
        confirm_password: confirmPassword
      });
      addToast('Password reset successfully! You can now log in.', 'success');
      navigate('/login');
    } catch (err: any) {
      const errPayload = err?.response?.data?.error;
      if (typeof errPayload === 'string') {
        setError(errPayload);
      } else if (errPayload && typeof errPayload === 'object') {
        const first = Object.values(errPayload)[0] as any;
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Reset failed. Please check the code and try again.');
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
        <KeyRound size={20} color="#fff" />
      </div>
      
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '16px',
        textAlign: 'center', marginBottom: '4px', color: 'var(--tf-text)'
      }}>
        Reset new password
      </h3>
      
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--tf-text-secondary)',
        textAlign: 'center', marginBottom: '20px'
      }}>
        {tokenParam ? 'Enter your new password below' : `Enter the 6-digit code sent to ${email}`}
      </p>

      <form onSubmit={handleReset}>
        {!emailParam && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
              Email
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com"
              style={{ width: '100%', height: '36px' }}
            />
          </div>
        )}
        
        {!tokenParam && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
              Reset Code (OTP)
            </label>
            <input 
              type="text" 
              required 
              maxLength={6}
              pattern="\d{6}"
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
              placeholder="123456"
              style={{ 
                width: '100%', 
                height: '38px', 
                letterSpacing: '6px', 
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            New Password
          </label>
          <input 
            type="password" 
            required minLength={8}
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', height: '36px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Confirm New Password
          </label>
          <input 
            type="password" 
            required minLength={8}
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            style={{ width: '100%', height: '36px' }}
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
            <><Loader2 size={15} className="animate-spin" /> Updating...</>
          ) : (
            <>Reset Password <ArrowRight size={14} /></>
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tf-text-secondary)' }}>
        Back to <Link to="/login" style={{ color: 'var(--tf-accent)', textDecoration: 'none' }}>Sign in</Link>
      </div>
    </div>
  );
}
