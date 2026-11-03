import React from 'react';
import { Shield, Activity, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header
      style={{
        minHeight: '74px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 2.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'background 0.25s ease, border-color 0.25s ease, padding 0.25s ease',
      }}
    >
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(79, 70, 229, 0.35)',
          }}
        >
          <Shield size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FraudShield AI
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Intelligence Platform
          </div>
        </div>
      </div>

      {/* Right controls: Live System Status & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Real-time System Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--risk-low-bg)',
            border: '1px solid rgba(22, 163, 74, 0.25)',
            fontSize: '0.75rem',
            color: 'var(--risk-low)',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--risk-low)',
              boxShadow: '0 0 8px var(--risk-low)',
            }}
          />
          ML Pipeline Active (v1.0)
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#4f46e5" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <User size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.full_name || 'Chief Risk Officer'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.email || 'admin@fraudshield.ai'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
          title="Sign Out"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
