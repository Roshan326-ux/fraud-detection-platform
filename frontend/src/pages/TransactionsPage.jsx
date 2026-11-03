import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { TransactionModal } from '../components/TransactionModal';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions({
        search,
        risk_level: riskLevel,
        merchant_category: category,
        page,
        limit: 15,
      });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, riskLevel, category, page]);

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Transactions Explorer
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Inspect individual telemetry signals, model scores, and explainable decision triggers.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by ID or customer email..."
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Risk Level Filter */}
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={riskLevel}
            onChange={(e) => {
              setRiskLevel(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Risk Tiers</option>
            <option value="HIGH">High Risk (70-100)</option>
            <option value="MEDIUM">Medium Risk (40-69)</option>
            <option value="LOW">Low Risk (0-39)</option>
          </select>

          {/* Merchant Category Filter */}
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Merchant Sectors</option>
            <option value="crypto_exchange">Crypto Exchange</option>
            <option value="gaming">Gaming</option>
            <option value="electronics">Electronics</option>
            <option value="travel">Travel</option>
            <option value="clothing">Clothing</option>
            <option value="dining">Dining</option>
            <option value="grocery">Grocery</option>
          </select>
        </div>

        <button onClick={fetchTransactions} className="btn btn-secondary" style={{ padding: '0.65rem 1rem' }}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Reload</span>
        </button>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Transaction ID</th>
                <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
                <th style={{ whiteSpace: 'nowrap' }}>Merchant Sector</th>
                <th style={{ whiteSpace: 'nowrap' }}>Customer Profile</th>
                <th style={{ whiteSpace: 'nowrap' }}>Device Trust</th>
                <th style={{ whiteSpace: 'nowrap' }}>Distance</th>
                <th style={{ whiteSpace: 'nowrap' }}>Risk Assessment</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                      {txn.transaction_id}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <div>${txn.amount?.toFixed(2)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        ≈ Rs. {(txn.amount * 280)?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {txn.merchant_category?.replace('_', ' ')}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {txn.user_email || 'customer@bank.com'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: txn.device_trust_score < 0.4 ? 'var(--risk-high)' : 'var(--text-secondary)',
                        }}
                      >
                        {txn.device_trust_score?.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{txn.location_distance_km} km</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={async () => {
                          const details = await api.getTransactionDetails(txn.transaction_id);
                          setSelectedTxn(details);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        <Eye size={13} />
                        <span>Inspect AI</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Evaluating transactions with model pipeline...' : 'No transactions matched the selected filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing Page {page} • 15 records per page
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={transactions.length < 15}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', opacity: transactions.length < 15 ? 0.4 : 1 }}
            >
              Next <ChevronRight size={16} />
            </button>
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
