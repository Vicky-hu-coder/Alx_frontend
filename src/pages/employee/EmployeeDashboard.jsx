import { useState, useEffect } from "react";
import api from "../../api";

export default function EmployeeDashboard() {
    const [metrics, setMetrics] = useState({
        totalCustomers: 0,
        totalBills: 0,
        pendingBills: 0,
        totalMeters: 0
    });
    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [customersRes, billsRes, metersRes] = await Promise.all([
                api.get('/customers?size=1'),
                api.get('/bills?size=1000'),
                api.get('/meters/count')
            ]);

            const totalCustomers = customersRes.data.totalElements || 0;
            const allBills = billsRes.data.content || [];
            const totalBills = allBills.length;
            const pendingBills = allBills.filter(b => b.status !== 'PAID').length;
            const totalMeters = metersRes.data || 0;

            setMetrics({
                totalCustomers,
                totalBills,
                pendingBills,
                totalMeters
            });

            setRecentBills(allBills.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            PAID: { background: '#d1fae5', color: '#059669' },
            PENDING: { background: '#fef3c7', color: '#d97706' },
            UNPAID: { background: '#fef3c7', color: '#d97706' },
            OVERDUE: { background: '#fee2e2', color: '#dc2626' }
        };
        const style = statusStyles[status] || statusStyles.PENDING;
        return (
            <span style={{ ...styles.badge, ...style }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>Staff Dashboard</h1>
                <p style={styles.subtitle}>Overview of daily operations</p>
            </div>

            {/* Metrics */}
            <div style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                    <div style={styles.metricValue}>{metrics.totalCustomers}</div>
                    <div style={styles.metricLabel}>Customers</div>
                </div>
                <div style={styles.metricCard}>
                    <div style={styles.metricValue}>{metrics.totalBills}</div>
                    <div style={styles.metricLabel}>Total Bills</div>
                </div>
                <div style={styles.metricCard}>
                    <div style={{ ...styles.metricValue, color: metrics.pendingBills > 0 ? '#d97706' : '#059669' }}>
                        {metrics.pendingBills}
                    </div>
                    <div style={styles.metricLabel}>Pending Bills</div>
                </div>
                <div style={styles.metricCard}>
                    <div style={styles.metricValue}>{metrics.totalMeters}</div>
                    <div style={styles.metricLabel}>Active Meters</div>
                </div>
            </div>

            {/* Quick Tasks */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Quick Tasks</h3>
                <div style={styles.tasksGrid}>
                    <a href="/employee/customers" style={styles.taskCard}>
                        <div style={styles.taskTitle}>Manage Customers</div>
                        <div style={styles.taskDesc}>View and update customer records</div>
                    </a>
                    <a href="/employee/bills" style={styles.taskCard}>
                        <div style={styles.taskTitle}>Process Bills</div>
                        <div style={styles.taskDesc}>Create and manage billing</div>
                    </a>
                    <a href="/employee/payments" style={styles.taskCard}>
                        <div style={styles.taskTitle}>Record Payments</div>
                        <div style={styles.taskDesc}>Process customer payments</div>
                    </a>
                    <a href="/employee/meters" style={styles.taskCard}>
                        <div style={styles.taskTitle}>Meter Management</div>
                        <div style={styles.taskDesc}>Update meter readings</div>
                    </a>
                </div>
            </div>

            {/* Recent Bills */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Recent Bills</h3>
                    <a href="/employee/bills" style={styles.viewAll}>View All</a>
                </div>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Bill ID</th>
                            <th style={styles.th}>Customer</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentBills.map(bill => (
                            <tr key={bill.id}>
                                <td style={styles.td}>#{bill.id}</td>
                                <td style={styles.td}>{bill.customerName || bill.customer?.name || 'N/A'}</td>
                                <td style={styles.td}>{(bill.amount || 0).toLocaleString()} RWF</td>
                                <td style={styles.td}>{getStatusBadge(bill.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    loadingContainer: { padding: 60, textAlign: 'center', color: '#64748b' },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' },
    subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
    metricCard: { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
    metricValue: { fontSize: 32, fontWeight: 700, color: '#0f172a' },
    metricLabel: { fontSize: 13, color: '#64748b', marginTop: 6 },
    card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    viewAll: { fontSize: 13, color: '#6366f1', fontWeight: 500, textDecoration: 'none' },
    tasksGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 },
    taskCard: { background: '#f8fafc', padding: 20, borderRadius: 10, textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.15s' },
    taskTitle: { fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 4 },
    taskDesc: { fontSize: 12, color: '#64748b' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, fontSize: 12, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px 16px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
    badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }
};
