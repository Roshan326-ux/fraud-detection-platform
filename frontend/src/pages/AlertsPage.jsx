import React, { useState, useEffect } from 'react';
import { BellRing, ShieldAlert, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts(statusFilter);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    setActionLoading(alertId);
    try {
      await api.updateAlertStatus(alertId, newStatus, `Status updated to ${newStatus} by analyst.`);
      await fetchAlerts();
    } catch (err) {
      console.error('Failed to update alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Security Alerts & Incident Triage
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            High-risk anomalies flagged by the Random Forest model requiring security analyst intervention.
          </p>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Alert Statuses</option>
            <option value="ACTIVE">Active Incidents</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <button onClick={fetchAlerts} className="btn btn-secondary">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Incident ID</th>
                <th style={{ whiteSpace: 'nowrap' }}>Transaction</th>
                <th style={{ whiteSpace: 'nowrap' }}>Exposure Amount</th>
                <th style={{ whiteSpace: 'nowrap' }}>Severity</th>
                <th style={{ whiteSpace: 'nowrap' }}>Triage Status</th>
                <th style={{ minWidth: '220px' }}>AI Notes / Context</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Analyst Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      ALT-{1000 + alert.id}
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                      {alert.transaction_id}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <div>${alert.amount?.toFixed(2)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        ≈ Rs. {(alert.amount * 280)?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          whiteSpace: 'nowrap',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                          background: alert.severity === 'CRITICAL' ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
                          color: alert.severity === 'CRITICAL' ? 'var(--risk-high)' : 'var(--risk-med)',
                          border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                        }}
                      >
                        {alert.severity} • Score {alert.risk_score}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          color:
                            alert.status === 'ACTIVE'
                              ? 'var(--risk-high)'
                              : alert.status === 'INVESTIGATING'
                              ? 'var(--risk-med)'
                              : 'var(--risk-low)',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'currentColor',
                          }}
                        />
                        {alert.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                      {alert.notes || 'Automated AI anomaly alert.'}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'INVESTIGATING')}
                            disabled={actionLoading === alert.id}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--risk-med)', whiteSpace: 'nowrap' }}
                            title="Begin Investigation"
                          >
                            <Clock size={12} /> Investigate
                          </button>
                        )}

                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                            disabled={actionLoading === alert.id}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--risk-low)', whiteSpace: 'nowrap' }}
                            title="Mark Resolved"
                          >
                            <CheckCircle size={12} /> Resolve
                          </button>
                        )}

                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'DISMISSED')}
                            disabled={actionLoading === alert.id}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                            title="Dismiss as False Alarm"
                          >
                            <XCircle size={12} /> Dismiss
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Retrieving security incidents...' : 'No alerts found for the selected status.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
