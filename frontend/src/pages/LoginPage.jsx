import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, RefreshCw, KeyRound, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [email, setEmail] = useState('admin@fraudshield.ai');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-gradient-radial)',
        backgroundColor: 'var(--bg-primary)',
        padding: '1.5rem',
        position: 'relative',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* Theme Toggle Button in Corner */}
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          padding: '0.5rem 1rem',
        }}
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      >
        {isDark ? (
          <>
            <Sun size={16} color="#f59e0b" />
            <span>Light Theme</span>
          </>
        ) : (
          <>
            <Moon size={16} color="#4f46e5" />
            <span>Dark Theme</span>
          </>
        )}
      </button>

      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 25px rgba(79, 70, 229, 0.4)',
            }}
          >
            <Shield size={28} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            FraudShield AI
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Digital Risk Analysis & Anomaly Detection Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--risk-high-bg)',
              color: 'var(--risk-high)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(220, 38, 38, 0.3)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            <span>{loading ? 'Authenticating with Backend...' : 'Sign in to Platform'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
