import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertOctagon, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const BatchUploadPage = ({ onNavigateToTransactions }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a valid CSV file first.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const data = await api.uploadBatchCSV(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Batch upload failed. Check CSV formatting.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Batch CSV Transaction Analysis
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Upload high-volume transaction CSV files to run automated batch ML scoring and trigger security alerts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Upload Box */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
            Upload Transaction Feed (.csv)
          </h2>

          <div
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.01)',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
            onClick={() => document.getElementById('csvFileInput').click()}
          >
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <UploadCloud size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {file ? file.name : 'Click to Browse or Drag CSV File'}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Supports transaction attributes: amount, merchant_category, device_trust_score, location_distance_km
            </p>
          </div>

          {/* Quick Demo Hint */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}
          >
            💡 <strong>Quick Demo Tip:</strong> You can select the pre-generated sample batch file located at:{' '}
            <code className="font-mono" style={{ color: 'var(--accent-cyan)' }}>
              ml_pipeline/data/sample_transactions_batch.csv
            </code>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--risk-high-bg)', color: 'var(--risk-high)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>{uploading ? 'Processing Batch with Random Forest...' : 'Process Batch File'}</span>
          </button>
        </div>

        {/* Results Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Batch Execution Summary
          </h2>

          {result ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--risk-low)', fontWeight: 700, fontSize: '0.95rem' }}>
                <CheckCircle size={20} />
                <span>Batch Scored Successfully!</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Evaluated</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{result.total_processed}</div>
                </div>

                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--risk-high-bg)', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--risk-high)' }}>Flagged Fraud</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--risk-high)' }}>
                    {result.flagged_fraud_count} ({result.fraud_rate_percentage}%)
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High-Risk Threats</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--risk-high)' }}>
                    {result.high_risk_count}
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alerts Triggered</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--risk-med)' }}>
                    {result.alerts_created}
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToTransactions}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', gap: '0.5rem' }}
              >
                <span>View Loaded Transactions in Explorer</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <AlertOctagon size={44} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No batch file currently uploaded.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Upload a CSV to view instantaneous detection breakdown and risk tier analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
