import { useState, useEffect } from "react";
import api from "../api";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalBills: 0,
    totalMeters: 0,
    totalRevenue: 0,
    pendingBills: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [customersRes, billsRes, metersRes] = await Promise.all([
          api.get('/customers?size=1'),
          api.get('/bills?size=1'),
          api.get('/meters/count')
        ]);

        const totalCustomers = customersRes.data.totalElements || 0;
        const totalBills = billsRes.data.totalElements || 0;
        const totalMeters = metersRes.data || 0;

        const allBillsRes = await api.get('/bills?size=1000');
        const allBills = allBillsRes.data.content || [];

        const totalRevenue = allBills
          .filter(b => b.status === 'PAID')
          .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

        const pendingBills = allBills.filter(b => b.status === 'UNPAID' || b.status === 'PENDING').length;

        setMetrics({
          totalCustomers,
          totalBills,
          totalMeters,
          totalRevenue,
          pendingBills
        });

        const usersRes = await api.get('/users?size=5');
        setUsers(usersRes.data.content || []);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Business Overview</h1>
        <p style={styles.subtitle}>Monitor your electricity billing operations</p>
      </div>

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers}
          subtitle="Registered accounts"
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <MetricCard
          title="Bills Issued"
          value={metrics.totalBills}
          subtitle={`${metrics.pendingBills} pending`}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <MetricCard
          title="Active Meters"
          value={metrics.totalMeters}
          subtitle="Connected devices"
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <MetricCard
          title="Total Revenue"
          value={`${metrics.totalRevenue.toLocaleString()} RWF`}
          subtitle="Collected payments"
          color="#059669"
          bgColor="#ecfdf5"
        />
      </div>

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        {/* Summary Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Operational Summary</h3>
          <p style={styles.summaryText}>
            The system currently manages <strong>{metrics.totalCustomers}</strong> customers
            and <strong>{metrics.totalMeters}</strong> electricity meters.
            A total of <strong>{metrics.totalBills}</strong> bills have been generated,
            with <strong>{metrics.pendingBills}</strong> still awaiting payment.
          </p>
          <div style={styles.statusRow}>
            <div style={styles.statusItem}>
              <div style={styles.statusLabel}>System Status</div>
              <div style={styles.statusOnline}>
                <span style={styles.statusDot}></span> Online
              </div>
            </div>
            <div style={styles.statusItem}>
              <div style={styles.statusLabel}>Last Updated</div>
              <div style={styles.statusValue}>Just now</div>
            </div>
            <div style={styles.statusItem}>
              <div style={styles.statusLabel}>Collection Rate</div>
              <div style={styles.statusValue}>
                {metrics.totalBills > 0
                  ? Math.round((1 - metrics.pendingBills / metrics.totalBills) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Staff Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>System Users</h3>
          <div style={styles.usersList}>
            {users.map(u => (
              <div key={u.id} style={styles.userItem}>
                <div style={styles.userAvatar}>
                  {u.firstName?.[0] || 'U'}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{u.firstName} {u.lastName}</div>
                  <div style={styles.userRole}>
                    {(u.roles?.[0] || 'USER').replace('ROLE_', '')}
                  </div>
                </div>
                <div style={{
                  ...styles.userBadge,
                  background: u.enabled !== false ? '#d1fae5' : '#fee2e2',
                  color: u.enabled !== false ? '#059669' : '#dc2626'
                }}>
                  {u.enabled !== false ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color, bgColor }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricContent}>
        <p style={styles.metricTitle}>{title}</p>
        <h2 style={styles.metricValue}>{value}</h2>
        <p style={styles.metricSubtitle}>{subtitle}</p>
      </div>
      <div style={{ ...styles.metricIcon, background: bgColor }}>
        <div style={{ ...styles.metricDot, background: color }}></div>
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: '3px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 14
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 6px 0'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: 0
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginBottom: 24
  },
  metricCard: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  metricContent: {},
  metricTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: 500,
    margin: '0 0 8px 0'
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px 0'
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    margin: 0
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricDot: {
    width: 12,
    height: 12,
    borderRadius: '50%'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 24
  },
  card: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 16px 0'
  },
  summaryText: {
    color: '#475569',
    lineHeight: 1.7,
    fontSize: 14,
    margin: '0 0 24px 0'
  },
  statusRow: {
    display: 'flex',
    gap: 40,
    paddingTop: 20,
    borderTop: '1px solid #f1f5f9'
  },
  statusItem: {},
  statusLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: 6
  },
  statusOnline: {
    color: '#059669',
    fontWeight: 600,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    background: '#059669',
    borderRadius: '50%'
  },
  statusValue: {
    color: '#0f172a',
    fontWeight: 600,
    fontSize: 14
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 14,
    color: '#475569'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a'
  },
  userRole: {
    fontSize: 12,
    color: '#64748b'
  },
  userBadge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600
  }
};
