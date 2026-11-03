import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { BatchUploadPage } from './pages/BatchUploadPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { api } from './services/api';
import { RefreshCw } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  // Poll alerts count for notification badge
  const updateAlertsCount = async () => {
    if (!isAuthenticated) return;
    try {
      const activeAlerts = await api.getAlerts('ACTIVE');
      setActiveAlertsCount(activeAlerts.length);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    updateAlertsCount();
  }, [isAuthenticated, activeTab]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertsCount={activeAlertsCount}
      />

      <div className="main-content">
        <Navbar />

        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'simulator' && <SimulatorPage />}
          {activeTab === 'batch' && <BatchUploadPage onNavigateToTransactions={() => setActiveTab('transactions')} />}
          {activeTab === 'alerts' && <AlertsPage />}
          {activeTab === 'reports' && <ReportsPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
