import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Cpu,
  UploadCloud,
  BellRing,
  FileSpreadsheet
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, alertsCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions Explorer', icon: Receipt },
    { id: 'simulator', label: 'Live AI Simulator', icon: Cpu, badge: 'Interactive' },
    { id: 'batch', label: 'Batch CSV Analysis', icon: UploadCloud },
    { id: 'alerts', label: 'Alerts & Triage', icon: BellRing, count: alertsCount },
    { id: 'reports', label: 'Compliance Reports', icon: FileSpreadsheet },
  ];

  return (
    <aside
      style={{
        width: '260px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        gap: '0.4rem',
        userSelect: 'none',
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 0.75rem 0.5rem', letterSpacing: '0.05em' }}>
        Core Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--bg-subtle-hover)' : 'transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                }}
              >
                {item.badge}
              </span>
            )}

            {item.count > 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--risk-high)',
                  color: '#ffffff',
                  fontWeight: 700,
                }}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '1rem 0.75rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          University Final Year Project
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Scikit-Learn • FastAPI • React
        </div>
      </div>
    </aside>
  );
};
