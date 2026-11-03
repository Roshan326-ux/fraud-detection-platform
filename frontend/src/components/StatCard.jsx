import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = '#6366f1', trend }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient glow corner */}
      <div
        style={{
          position: 'absolute',
          top: '-25px',
          right: '-25px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: color,
          filter: 'blur(35px)',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.15)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtext && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {subtext}
          </span>
        )}
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: trend.isPositive ? 'var(--risk-low)' : 'var(--risk-high)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
