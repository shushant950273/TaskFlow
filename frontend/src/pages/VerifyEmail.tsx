import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { KeyRound, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const navigate = useNavigate();
  const verifyEmail = useAuthStore(s => s.verifyEmail);
  const resendVerification = useAuthStore(s => s.resendVerification);
  const addToast = useToastStore(s => s.addToast);

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [error, setError] = useState('');

  const autoVerifyCalled = useRef(false);

  // Auto verify if email and token are in URL
  useEffect(() => {
    if (emailParam && tokenParam && !autoVerifyCalled.current) {
      autoVerifyCalled.current = true;
      const handleAutoVerify = async () => {
        setAutoVerifying(true);
        setLoading(true);
        try {
          await verifyEmail(emailParam, { token: tokenParam });
          addToast('Email verified successfully! Welcome to TaskFlow.', 'success');
          navigate('/boards');
        } catch (err: any) {
          const errMsg = err?.response?.data?.error || 'Verification failed. The link may have expired or is invalid.';
          setError(errMsg);
          addToast(errMsg, 'error');
        } finally {
          setLoading(false);
          setAutoVerifying(false);
        }
      };
      handleAutoVerify();
    }
  }, [emailParam, tokenParam, verifyEmail, navigate, addToast]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email address is required.');
    if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit code.');
    
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, { otp });
      addToast('Email verified successfully! Welcome to TaskFlow.', 'success');
      navigate('/boards');
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Verification failed. Please check the code and try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setError('Email address is required to resend verification.');
    
    setError('');
    setResending(true);
    try {
      await resendVerification(email);
      addToast('Verification code resent. Please check your inbox.', 'success');
      setCooldown(30);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Failed to resend code. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setResending(false);
    }
  };

  if (autoVerifying) {
    return (
      <div style={{
        width: '360px',
        background: 'var(--tf-surface)',
        border: '0.5px solid var(--tf-border)',
        borderRadius: '14px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <Loader2 size={36} color="var(--tf-accent)" className="animate-spin" />
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--tf-text)', fontSize: '15px' }}>
          Verifying your email...
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--tf-text-secondary)', textAlign: 'center' }}>
          Please hold on while we complete your registration.
        </p>
      </div>
    );
  }

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
        Verify your email
      </h3>
      
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--tf-text-secondary)',
        textAlign: 'center', marginBottom: '20px'
      }}>
        {email ? `Enter the 6-digit OTP code sent to ${email}` : 'Enter your email and the 6-digit verification code'}
      </p>

      <form onSubmit={handleVerify}>
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
              placeholder="e.g. you@example.com"
              style={{ width: '100%', height: '36px' }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--tf-text-secondary)', marginBottom: '5px' }}>
            Verification Code (OTP)
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
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>Verify Account <ArrowRight size={14} /></>
          )}
        </button>
      </form>

      {email && (
        <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '10px' }}>
          <button
            type="button"
            disabled={resending || cooldown > 0}
            onClick={handleResend}
            style={{
              background: 'transparent',
              color: cooldown > 0 ? 'var(--tf-text-tertiary)' : 'var(--tf-accent)',
              fontSize: '11px',
              fontFamily: 'var(--font-body)',
              textDecoration: cooldown > 0 ? 'none' : 'underline',
              cursor: cooldown > 0 ? 'default' : 'pointer',
              padding: 0
            }}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive a code? Resend"}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tf-text-secondary)', marginTop: '20px' }}>
        Back to <Link to="/login" style={{ color: 'var(--tf-accent)', textDecoration: 'none' }}>Sign in</Link> or <Link to="/register" style={{ color: 'var(--tf-accent)', textDecoration: 'none' }}>Register</Link>
      </div>
    </div>
  );
}
