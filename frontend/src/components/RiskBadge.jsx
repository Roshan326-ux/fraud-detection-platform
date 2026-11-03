import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export const RiskBadge = ({ level = 'LOW', score }) => {
  const normalizedLevel = String(level).toUpperCase();

  let badgeClass = 'badge-low';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (normalizedLevel === 'HIGH') {
    badgeClass = 'badge-high';
    Icon = ShieldAlert;
    label = 'High Risk';
  } else if (normalizedLevel === 'MEDIUM') {
    badgeClass = 'badge-medium';
    Icon = AlertTriangle;
    label = 'Medium Risk';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span className={`badge ${badgeClass}`}>
        <Icon size={12} />
        {label}
      </span>
      {score !== undefined && (
        <span
          className="font-mono"
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-secondary)',
          }}
        >
          {score}/100
        </span>
      )}
    </div>
  );
};
