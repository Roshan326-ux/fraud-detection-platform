import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, RefreshCcw } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const SimulatorPage = () => {
  const [formData, setFormData] = useState({
    amount: 75.0,
    merchant_category: 'grocery',
    device_trust_score: 0.90,
    location_distance_km: 12.0,
    time_delta_sec: 14400,
    failed_logins_24h: 0,
    is_vpn_or_proxy: 0,
    is_international: 0,
    user_email: 'demo_user@digitalbank.com',
  });

  const [currency, setCurrency] = useState('USD'); // 'USD' | 'PKR'
  const exchangeRate = 280; // 1 USD = 280 PKR (Standard benchmark rate)

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    {
      name: '🟢 Safe Local Grocery Purchase',
      desc: 'Legitimate customer on trusted device buying everyday groceries.',
      usdAmount: 45.2,
      data: {
        amount: 45.2,
        merchant_category: 'grocery',
        device_trust_score: 0.95,
        location_distance_km: 6.5,
        time_delta_sec: 8500,
        failed_logins_24h: 0,
        is_vpn_or_proxy: 0,
        is_international: 0,
        user_email: 'sarah.smith@gmail.com',
      },
    },
    {
      name: '🟡 Suspicious Velocity & Distance',
      desc: 'Medium risk: Moderate purchase far from billing city after 1 failed login.',
      usdAmount: 420.0,
      data: {
        amount: 420.0,
        merchant_category: 'electronics',
        device_trust_score: 0.55,
        location_distance_km: 450.0,
        time_delta_sec: 240,
        failed_logins_24h: 1,
        is_vpn_or_proxy: 0,
        is_international: 0,
        user_email: 'john.doe@bank.com',
      },
    },
    {
      name: '🔴 Account Takeover & Crypto Heist',
      desc: 'Critical risk: Massive crypto transfer via VPN from an unrecognized device.',
      usdAmount: 3200.0,
      data: {
        amount: 3200.0,
        merchant_category: 'crypto_exchange',
        device_trust_score: 0.12,
        location_distance_km: 3600.0,
        time_delta_sec: 25,
        failed_logins_24h: 3,
        is_vpn_or_proxy: 1,
        is_international: 1,
        user_email: 'victim_account@bank.com',
      },
    },
  ];

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === currency) return;
    const currentVal = parseFloat(formData.amount) || 0;
    let convertedVal;
    if (newCurrency === 'PKR') {
      convertedVal = Math.round(currentVal * exchangeRate);
    } else {
      convertedVal = parseFloat((currentVal / exchangeRate).toFixed(2));
    }
    setCurrency(newCurrency);
    setFormData((prev) => ({ ...prev, amount: convertedVal }));
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const rawAmt = parseFloat(formData.amount) || 0;
      // Normalizing amount to USD for the ML Random Forest model
      const evalAmountUSD = currency === 'PKR' ? (rawAmt / exchangeRate) : rawAmt;
      const evalAmountPKR = currency === 'PKR' ? rawAmt : (rawAmt * exchangeRate);

      const response = await api.predictSingle({
        ...formData,
        amount: parseFloat(evalAmountUSD.toFixed(2)),
        device_trust_score: parseFloat(formData.device_trust_score),
        location_distance_km: parseFloat(formData.location_distance_km),
        time_delta_sec: parseInt(formData.time_delta_sec, 10),
        failed_logins_24h: parseInt(formData.failed_logins_24h, 10),
        is_vpn_or_proxy: parseInt(formData.is_vpn_or_proxy, 10),
        is_international: parseInt(formData.is_international, 10),
        save_to_db: true,
      });

      setResult({
        ...response,
        evaluated_usd: evalAmountUSD,
        evaluated_pkr: evalAmountPKR,
        input_currency: currency,
        input_amount: rawAmt,
      });
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Sparkles size={14} /> University Viva Interactive Demonstration
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Live AI Fraud Simulator
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Test arbitrary financial signals in real-time against the trained Scikit-Learn Random Forest pipeline.
        </p>
      </div>

      {/* Preset Quick-Buttons */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
          Load Benchmark Demo Scenarios:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const amt = currency === 'PKR' ? Math.round(p.usdAmount * exchangeRate) : p.usdAmount;
                setFormData({ ...p.data, amount: amt });
                setResult(null);
              }}
              className="glass-card"
              style={{
                padding: '0.85rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                background: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  ${p.usdAmount} / ₨ {Math.round(p.usdAmount * exchangeRate).toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Score Gauge on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Transaction Parameters & Behavioral Signals
          </h2>

          <form onSubmit={handleRunAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Transaction Amount
                  </label>
                  {/* Currency Switcher Toggle */}
                  <div style={{ display: 'inline-flex', gap: '2px', background: 'var(--bg-subtle)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('USD')}
                      style={{
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        background: currency === 'USD' ? 'var(--accent-cyan)' : 'transparent',
                        color: currency === 'USD' ? '#000' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      $ USD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('PKR')}
                      style={{
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        background: currency === 'PKR' ? 'var(--accent-cyan)' : 'transparent',
                        color: currency === 'PKR' ? '#000' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ₨ PKR
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                    {currency === 'USD' ? '$' : '₨'}
                  </span>
                  <input
                    type="number"
                    step={currency === 'USD' ? "0.01" : "1"}
                    className="input-field"
                    style={{ paddingLeft: currency === 'USD' ? '1.75rem' : '2.1rem' }}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                {/* Real-time Exchange Conversion Subtext */}
                <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {currency === 'USD' ? (
                      <>≈ <strong style={{ color: 'var(--accent-cyan)' }}>Rs. {((parseFloat(formData.amount) || 0) * exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR</strong></>
                    ) : (
                      <>≈ <strong style={{ color: 'var(--accent-cyan)' }}>${(((parseFloat(formData.amount) || 0) / exchangeRate)).toFixed(2)} USD</strong> (Normalized for AI)</>
                    )}
                  </span>
                  <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>1 USD = {exchangeRate} PKR</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Merchant Sector
                </label>
                <select
                  className="input-field"
                  value={formData.merchant_category}
                  onChange={(e) => setFormData({ ...formData, merchant_category: e.target.value })}
                >
                  <option value="grocery">Grocery & Essentials</option>
                  <option value="dining">Restaurants & Dining</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="electronics">Electronics & Tech</option>
                  <option value="travel">Airlines & Travel</option>
                  <option value="gaming">Digital Gaming</option>
                  <option value="crypto_exchange">Crypto Exchange</option>
                </select>
              </div>
            </div>

            {/* Sliders Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Device Trust Score: {formData.device_trust_score}</span>
                  <span style={{ color: formData.device_trust_score < 0.4 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
                    {formData.device_trust_score >= 0.75 ? 'Trusted Hardware' : formData.device_trust_score >= 0.45 ? 'Moderate' : 'Unrecognized Device'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  value={formData.device_trust_score}
                  onChange={(e) => setFormData({ ...formData, device_trust_score: e.target.value })}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Distance from Billing City: {formData.location_distance_km} km</span>
                  <span style={{ color: formData.location_distance_km > 500 ? 'var(--risk-high)' : 'var(--text-muted)' }}>
                    {formData.location_distance_km > 1000 ? 'Severe Geographic Anomaly' : 'Local Range'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5000"
                  step="25"
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  value={formData.location_distance_km}
                  onChange={(e) => setFormData({ ...formData, location_distance_km: e.target.value })}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Time Delta (Velocity): {formData.time_delta_sec} seconds</span>
                  <span style={{ color: formData.time_delta_sec < 60 ? 'var(--risk-high)' : 'var(--text-muted)' }}>
                    {formData.time_delta_sec < 60 ? 'Rapid Bot Velocity' : 'Normal Human Pacing'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="28800"
                  step="30"
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  value={formData.time_delta_sec}
                  onChange={(e) => setFormData({ ...formData, time_delta_sec: e.target.value })}
                />
              </div>
            </div>

            {/* Checkbox / Toggle options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Failed Logins (24h)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  className="input-field"
                  value={formData.failed_logins_24h}
                  onChange={(e) => setFormData({ ...formData, failed_logins_24h: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                <input
                  type="checkbox"
                  id="vpn_toggle"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                  checked={formData.is_vpn_or_proxy === 1}
                  onChange={(e) => setFormData({ ...formData, is_vpn_or_proxy: e.target.checked ? 1 : 0 })}
                />
                <label htmlFor="vpn_toggle" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  VPN / Proxy Exit
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                <input
                  type="checkbox"
                  id="intl_toggle"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                  checked={formData.is_international === 1}
                  onChange={(e) => setFormData({ ...formData, is_international: e.target.checked ? 1 : 0 })}
                />
                <label htmlFor="intl_toggle" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  International Gateway
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
              {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Play size={16} />}
              <span>{loading ? 'Evaluating Scikit-Learn Pipeline...' : 'Run Real-Time AI Fraud Analysis'}</span>
            </button>
          </form>
        </div>

        {/* Live Score Output Gauge Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Model Inference Decision Output
          </h2>

          {result ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Circular Risk Score Display */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `4px solid ${result.risk_score >= 70 ? 'var(--risk-high)' : result.risk_score >= 40 ? 'var(--risk-med)' : 'var(--risk-low)'}`,
                    boxShadow: `0 0 30px ${result.risk_score >= 70 ? 'rgba(220, 38, 38, 0.25)' : result.risk_score >= 40 ? 'rgba(217, 119, 6, 0.25)' : 'rgba(22, 163, 74, 0.25)'}`,
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {result.risk_score}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Risk Score
                  </span>
                </div>

                <RiskBadge level={result.risk_level} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Raw Probability: {(result.fraud_probability * 100).toFixed(2)}%
                </div>

                {/* Evaluated Amount in USD and PKR */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-subtle-hover)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>${result.evaluated_usd?.toFixed(2)} USD</strong>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Rs. {Math.round(result.evaluated_pkr || 0).toLocaleString()} PKR</strong>
                </div>
              </div>

              {/* Automated Operational Action Banner */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem',
                  background: result.risk_score >= 70 ? 'var(--risk-high-bg)' : result.risk_score >= 40 ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)',
                  border: `1px solid ${result.risk_score >= 70 ? 'rgba(220, 38, 38, 0.35)' : result.risk_score >= 40 ? 'rgba(217, 119, 6, 0.35)' : 'rgba(22, 163, 74, 0.25)'}`,
                  color: result.risk_score >= 70 ? 'var(--risk-high)' : result.risk_score >= 40 ? 'var(--risk-med)' : 'var(--risk-low)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {result.risk_score >= 70 ? <ShieldAlert size={18} /> : result.risk_score >= 40 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                <span>
                  {result.risk_score >= 70
                    ? 'ACTION: Immediate Freeze & Critical Alert Triggered'
                    : result.risk_score >= 40
                    ? 'ACTION: Flagged for Manual Review & OTP Challenge'
                    : 'ACTION: Transaction Approved (Safe Baseline)'}
                </span>
              </div>

              {/* Triggered AI Risk Factors */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Model Decision Triggers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.risk_factors.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      • {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <Cpu size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Inference Engine Idle</p>
              <p style={{ fontSize: '0.75rem', maxWidth: '280px', marginTop: '0.25rem' }}>
                Select a preset scenario above or customize transaction parameters to run live fraud scoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
