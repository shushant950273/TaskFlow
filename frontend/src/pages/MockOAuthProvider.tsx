import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitBranch, Info, ArrowLeftRight } from 'lucide-react';

export default function MockOAuthProvider() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'google';
  const redirectUri = searchParams.get('redirect_uri') || '/auth/callback';

  const [email, setEmail] = useState(
    provider === 'google' ? 'guru.taskflow@gmail.com' : 'guru-developer@github.com'
  );
  const [name, setName] = useState(
    provider === 'google' ? 'Guru Prasad' : 'Guru Developer'
  );
  const [avatar, setAvatar] = useState(
    provider === 'google' 
      ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guru' 
      : 'https://api.dicebear.com/7.x/identicon/svg?seed=GuruGitHub'
  );

  const handleAuthorize = () => {
    // Generate a random mock authorization code
    const mockCode = `mock_code_${Math.random().toString(36).substring(2, 12)}`;
    
    // Redirect back to callback URL with auth code and mock user profile details
    const targetUrl = `${redirectUri}?code=${mockCode}&provider=${provider}&email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent(name)}&avatar_url=${encodeURIComponent(avatar)}`;
    
    window.location.href = targetUrl;
  };

  const isGoogle = provider === 'google';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isGoogle ? '#f0f4f9' : '#0d1117',
      color: isGoogle ? '#1f1f1f' : '#c9d1d9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        width: '450px',
        background: isGoogle ? '#ffffff' : '#161b22',
        border: isGoogle ? 'none' : '1px solid #30363d',
        borderRadius: isGoogle ? '28px' : '6px',
        padding: isGoogle ? '40px' : '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Mock Alert Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isGoogle ? '#e8f0fe' : '#1f242c',
          border: isGoogle ? '1px solid #1a73e8' : '1px solid #388bfd',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: isGoogle ? '#1a73e8' : '#58a6ff'
        }}>
          <Info size={18} />
          <div>
            <strong>Developer Mock Mode Active</strong>
            <br />
            No developer credentials are set. You are using a simulated authentication screen.
          </div>
        </div>

        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          {isGoogle ? (
            <svg viewBox="0 0 24 24" width="36" height="36">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          ) : (
            <GitBranch size={36} color="#c9d1d9" />
          )}

          <h3 style={{
            fontSize: isGoogle ? '24px' : '20px',
            fontWeight: isGoogle ? 400 : 300,
            margin: 0
          }}>
            {isGoogle ? 'Sign in with Google' : 'Authorize TaskFlow'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: isGoogle ? '#5f6368' : '#8b949e',
            margin: 0
          }}>
            to continue to <strong>TaskFlow</strong>
          </p>
        </div>

        {/* OAuth Visualizer Connector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          padding: '10px 0'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: isGoogle ? '#f1f3f4' : '#21262d',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {isGoogle ? 'G' : <GitBranch size={20} />}
          </div>
          <ArrowLeftRight size={16} color={isGoogle ? '#70757a' : '#8b949e'} />
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--tf-accent)',
            color: '#fff',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            TF
          </div>
        </div>

        {/* Details Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: isGoogle ? '#5f6368' : '#8b949e', marginBottom: '4px' }}>
              Full Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                background: isGoogle ? '#f1f3f4' : '#0d1117',
                border: isGoogle ? '1px solid #dadce0' : '1px solid #30363d',
                borderRadius: isGoogle ? '4px' : '6px',
                color: isGoogle ? '#1f1f1f' : '#c9d1d9',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: isGoogle ? '#5f6368' : '#8b949e', marginBottom: '4px' }}>
              Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                background: isGoogle ? '#f1f3f4' : '#0d1117',
                border: isGoogle ? '1px solid #dadce0' : '1px solid #30363d',
                borderRadius: isGoogle ? '4px' : '6px',
                color: isGoogle ? '#1f1f1f' : '#c9d1d9',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: isGoogle ? '#5f6368' : '#8b949e', marginBottom: '4px' }}>
              Avatar URL
            </label>
            <input 
              type="text" 
              value={avatar} 
              onChange={e => setAvatar(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                background: isGoogle ? '#f1f3f4' : '#0d1117',
                border: isGoogle ? '1px solid #dadce0' : '1px solid #30363d',
                borderRadius: isGoogle ? '4px' : '6px',
                color: isGoogle ? '#1f1f1f' : '#c9d1d9',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={handleAuthorize}
            style={{
              width: '100%',
              height: '40px',
              background: isGoogle ? '#1a73e8' : '#238636',
              color: '#ffffff',
              border: 'none',
              borderRadius: isGoogle ? '100px' : '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = isGoogle ? '#1557b0' : '#2ea043'}
            onMouseOut={e => e.currentTarget.style.background = isGoogle ? '#1a73e8' : '#238636'}
          >
            {isGoogle ? `Continue as ${name.split(' ')[0]}` : 'Authorize TaskFlow'}
          </button>
          
          <button
            onClick={() => window.close()}
            style={{
              width: '100%',
              height: '40px',
              background: 'transparent',
              color: isGoogle ? '#1a73e8' : '#c9d1d9',
              border: isGoogle ? 'none' : '1px solid #21262d',
              borderRadius: isGoogle ? '100px' : '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = isGoogle ? '#f4f8fe' : '#30363d'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
