import React from 'react';
import { X, ShieldAlert, MapPin, Smartphone, Clock, Globe, Shield, AlertTriangle } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Transaction Analysis</h2>
              <RiskBadge level={transaction.risk_level} score={transaction.risk_score} />
            </div>
            <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {transaction.transaction_id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount & Key Meta Box */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transaction Amount</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ${transaction.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              ≈ Rs. {(transaction.amount * 280)?.toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Merchant Category</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {transaction.merchant_category?.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User Email</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {transaction.user_email || 'customer@bank.com'}
            </div>
          </div>
        </div>

        {/* Explainable AI Risk Factors Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldAlert size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Decision Reasoning & Triggers</span>
          </div>

          {transaction.risk_factors && transaction.risk_factors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transaction.risk_factors.map((factor, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: transaction.risk_score >= 70 ? 'var(--risk-high-bg)' : 'var(--bg-subtle)',
                    border: `1px solid ${transaction.risk_score >= 70 ? 'rgba(220, 38, 38, 0.25)' : 'var(--border-subtle)'}`,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    color: transaction.risk_score >= 70 ? 'var(--risk-high)' : 'var(--text-secondary)',
                  }}
                >
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No abnormal indicators detected. Transaction matches normal baseline.
            </div>
          )}
        </div>

        {/* Detailed Behavioral Telemetry Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Behavioral Telemetry Signals
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Smartphone size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Device Trust Score</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{transaction.device_trust_score?.toFixed(2)} / 1.00</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location Distance</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{transaction.location_distance_km} km</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Velocity (Time Delta)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{transaction.time_delta_sec} seconds</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Globe size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Network & Routing</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {transaction.is_vpn_or_proxy ? 'VPN / Proxy Masked' : 'Direct ISP'}
                  {transaction.is_international ? ' • Cross-Border' : ' • Domestic'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
