import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  DollarSign,
  AlertOctagon,
  CreditCard,
  ArrowUpRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { TransactionModal } from '../components/TransactionModal';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage = () => {
  const { isDark } = useTheme();
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, trendsData, categoriesData, riskDistData, txnsData] = await Promise.all([
        api.getOverviewKPIs(),
        api.getTrends(),
        api.getCategories(),
        api.getRiskDistribution(),
        api.getTransactions({ limit: 6 })
      ]);

      setKpis(overviewData);
      setTrends(trendsData);
      setCategories(categoriesData);
      setRiskDistribution(riskDistData);
      setRecentTxns(txnsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !kpis) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--accent-cyan)" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Aggregating fraud telemetry & model benchmarks...</p>
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '12px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(15,23,42,0.1)',
  };

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Executive Risk Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time machine learning monitoring of digital transactions and anomaly distribution.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
          <RefreshCw size={15} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Total Evaluated Transactions"
          value={kpis?.total_transactions?.toLocaleString() || '0'}
          subtext="Scored by Random Forest"
          icon={CreditCard}
          color="#6366f1"
          trend={{ text: 'Real-time telemetry', isPositive: true }}
        />

        <StatCard
          title="AI Fraud Detection Rate"
          value={`${kpis?.fraud_rate_percentage || 0}%`}
          subtext={`${kpis?.flagged_transactions || 0} flagged suspicious`}
          icon={TrendingUp}
          color="#f59e0b"
          trend={{ text: 'Within expected variance', isPositive: true }}
        />

        <StatCard
          title="Capital Amount at Risk"
          value={`$${kpis?.at_risk_amount_usd?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`}
          subtext={`≈ Rs. ${((kpis?.at_risk_amount_usd || 0) * 280).toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR (Total: $${kpis?.total_volume_usd?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'})`}
          icon={DollarSign}
          color="#ef4444"
          trend={{ text: 'Under automated triage', isPositive: false }}
        />

        <StatCard
          title="Active Security Alerts"
          value={kpis?.active_alerts_count?.toString() || '0'}
          subtext={`${kpis?.high_risk_count || 0} High • ${kpis?.medium_risk_count || 0} Medium`}
          icon={AlertOctagon}
          color="#ec4899"
          trend={{ text: 'Immediate action needed', isPositive: false }}
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Trend Area Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Transaction Volume & Fraud Anomalies</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timeline trend over discrete transaction intervals</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} /> Total Volume ($)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Flagged Frauds
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="total_amount" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#volGradient)" />
                <Area type="monotone" dataKey="fraud_count" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#fraudGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Risk Tier Distribution</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calibrated 0-100 categorization</p>
          </div>

          <div style={{ width: '100%', height: '200px', flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {riskDistribution.map((tier) => (
              <div key={tier.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tier.color }} />
                  {tier.name}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tier.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Recent Transactions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Merchant Category Risk Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sector Risk Vulnerability</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fraud detection count across merchant sectors</p>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="fraud_count" fill="#ec4899" radius={[4, 4, 0, 0]} name="Fraud Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent High-Risk Transactions Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent High-Priority Feed</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest transactions evaluated by pipeline</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Risk Tier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((txn) => (
                  <tr key={txn.id}>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                      {txn.transaction_id}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${txn.amount?.toFixed(2)}
                    </td>
                    <td>
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} />
                    </td>
                    <td>
                      <button
                        onClick={async () => {
                          const details = await api.getTransactionDetails(txn.transaction_id);
                          setSelectedTxn(details);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
};
