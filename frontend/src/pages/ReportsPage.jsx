import React, { useState } from 'react';
import { Download, FileSpreadsheet, ShieldCheck, FileCheck2, Info } from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage = () => {
  const [onlyFlagged, setOnlyFlagged] = useState(true);

  const handleDownloadCSV = () => {
    const url = api.getCSVExportUrl(onlyFlagged);
    window.open(url, '_blank');
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Compliance & Audit Reports
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Export regulatory compliance audit logs and evaluated risk scores for financial audit inspection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Export Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Export Transactions Log (CSV)</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Structured report with model predictions and risk levels</p>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={onlyFlagged}
                onChange={(e) => setOnlyFlagged(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <span>Export Suspicious & High-Risk Transactions Only</span>
            </label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '2.1rem', marginTop: '0.25rem' }}>
              Filters only transactions flagged by the Random Forest model for targeted investigation.
            </p>
          </div>

          <button onClick={handleDownloadCSV} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            <Download size={16} />
            <span>Download CSV Audit Report</span>
          </button>
        </div>

        {/* Regulatory Governance & Viva Info Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Model Governance & Explainability
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--risk-low)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Responsible AI Principles</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Model decisions are paired with transparent heuristic feature importances so that no customer is blocked without an auditable rationale.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <FileCheck2 size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Data Privacy & Compliance</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Compliant with PCI-DSS and GDPR by isolating personal identification from raw inference pipelines.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Info size={20} color="var(--risk-med)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Continuous Calibration</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Probability scaling partitions decisions into 3 distinct operational actions: Approve, 2FA Challenge, or Freeze.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
