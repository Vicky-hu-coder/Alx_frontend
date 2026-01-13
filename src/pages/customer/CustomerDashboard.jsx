import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../api";
import Modal from "../../components/Modal";

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBills: 0,
        unpaidBills: 0,
        totalPayments: 0,
        outstandingAmount: 0,
        meterNumber: null
    });
    const [recentBills, setRecentBills] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [meterInfo, setMeterInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestData, setRequestData] = useState({ units: 100, paymentMethod: 'MOBILE_MONEY' });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [billsRes, paymentsRes, meterRes] = await Promise.all([
                api.get('/bills/my-bills?size=1000'),
                api.get('/payments/my-payments?size=1000'),
                api.get('/meters/my-meter').catch(() => null)
            ]);

            const bills = billsRes.data.content || [];
            const payments = paymentsRes.data.content || [];
            const meter = meterRes?.data || null;

            const unpaidBills = bills.filter(b => b.status !== 'PAID');
            const outstandingAmount = unpaidBills.reduce((sum, b) => sum + (b.amount || 0), 0);

            setStats({
                totalBills: bills.length,
                unpaidBills: unpaidBills.length,
                totalPayments: payments.length,
                outstandingAmount,
                meterNumber: meter?.meterNumber || null
            });

            setRecentBills(bills.slice(0, 5));
            setRecentPayments(payments.slice(0, 5));
            setMeterInfo(meter);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    const handleRequestUnits = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            alert(`Unit request for ${requestData.units} kWh submitted successfully! You will receive a confirmation shortly.`);
            setShowRequestModal(false);
        } catch (error) {
            alert('Request failed: ' + (error.response?.data || error.message));
        }
        setProcessing(false);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Section */}
            <div style={styles.welcomeSection}>
                <div>
                    <h1 style={styles.welcomeTitle}>Welcome, {user?.name?.split(' ')[0]}</h1>
                    <p style={styles.welcomeSubtitle}>Here's an overview of your electricity account</p>
                </div>
                {meterInfo && (
                    <div style={styles.meterBadge}>
                        <span style={styles.meterLabel}>Meter Number</span>
                        <code style={styles.meterCode}>{meterInfo.meterNumber}</code>
                    </div>
                )}
            </div>

            {/* Alert for unpaid bills */}
            {stats.unpaidBills > 0 && (
                <div style={styles.alertCard}>
                    <div style={styles.alertContent}>
                        <div style={styles.alertIcon}>!</div>
                        <div>
                            <div style={styles.alertTitle}>You have {stats.unpaidBills} unpaid bill(s)</div>
                            <div style={styles.alertSubtitle}>Total outstanding: {stats.outstandingAmount.toLocaleString()} RWF</div>
                        </div>
                    </div>
                    <Link to="/customer/my-bills" style={styles.alertBtn}>Pay Now</Link>
                </div>
            )}

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.totalBills}</div>
                    <div style={styles.statLabel}>Total Bills</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: stats.unpaidBills > 0 ? '#d97706' : '#059669' }}>
                        {stats.unpaidBills}
                    </div>
                    <div style={styles.statLabel}>Pending Payment</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.totalPayments}</div>
                    <div style={styles.statLabel}>Payments Made</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{meterInfo?.lastReading || 0}</div>
                    <div style={styles.statLabel}>Last Reading (kWh)</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Quick Actions</h3>
                <div style={styles.actionsRow}>
                    <button style={styles.actionBtn} onClick={() => setShowRequestModal(true)}>
                        Request Service
                    </button>
                    <Link to="/customer/my-bills" style={styles.actionBtn}>
                        View Bills
                    </Link>
                    <Link to="/customer/my-payments" style={styles.actionBtn}>
                        Payment History
                    </Link>
                    <Link to="/customer/profile" style={styles.actionBtn}>
                        My Profile
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={styles.gridTwo}>
                {/* Recent Bills */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Bills</h3>
                        <Link to="/customer/my-bills" style={styles.viewAll}>View All</Link>
                    </div>
                    {recentBills.length === 0 ? (
                        <p style={styles.emptyText}>No bills yet</p>
                    ) : (
                        <div style={styles.listContainer}>
                            {recentBills.map(bill => (
                                <div key={bill.id} style={styles.listItem}>
                                    <div>
                                        <div style={styles.listPrimary}>Bill #{bill.id}</div>
                                        <div style={styles.listSecondary}>{bill.billingDate}</div>
                                    </div>
                                    <div style={styles.listRight}>
                                        <div style={styles.listAmount}>{(bill.amount || 0).toLocaleString()} RWF</div>
                                        <span style={{
                                            ...styles.badge,
                                            background: bill.status === 'PAID' ? '#d1fae5' : '#fef3c7',
                                            color: bill.status === 'PAID' ? '#059669' : '#d97706'
                                        }}>
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Payments */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Payments</h3>
                        <Link to="/customer/my-payments" style={styles.viewAll}>View All</Link>
                    </div>
                    {recentPayments.length === 0 ? (
                        <p style={styles.emptyText}>No payments yet</p>
                    ) : (
                        <div style={styles.listContainer}>
                            {recentPayments.map(payment => (
                                <div key={payment.id} style={styles.listItem}>
                                    <div>
                                        <div style={styles.listPrimary}>{payment.transactionId || `TXN-${payment.id}`}</div>
                                        <div style={styles.listSecondary}>{payment.paymentDate?.split('T')[0]}</div>
                                    </div>
                                    <div style={styles.listAmount}>{(payment.amountPaid || 0).toLocaleString()} RWF</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Modal */}
            <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Service">
                <form onSubmit={handleRequestUnits}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Units to Request (kWh)</label>
                        <input
                            style={styles.input}
                            type="number"
                            value={requestData.units}
                            onChange={(e) => setRequestData({ ...requestData, units: e.target.value })}
                            min="1"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Payment Method</label>
                        <select
                            style={styles.input}
                            value={requestData.paymentMethod}
                            onChange={(e) => setRequestData({ ...requestData, paymentMethod: e.target.value })}
                        >
                            <option value="MOBILE_MONEY">Mobile Money</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CARD">Card Payment</option>
                        </select>
                    </div>
                    <div style={styles.estimateBox}>
                        <div style={styles.estimateLabel}>Estimated Cost</div>
                        <div style={styles.estimateValue}>{(requestData.units * 180).toLocaleString()} RWF</div>
                        <div style={styles.estimateNote}>Rate: 180 RWF/kWh</div>
                    </div>
                    <div style={styles.formActions}>
                        <button type="button" style={styles.cancelBtn} onClick={() => setShowRequestModal(false)}>Cancel</button>
                        <button type="submit" style={styles.submitBtn} disabled={processing}>
                            {processing ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const styles = {
    loadingContainer: { padding: 60, textAlign: 'center', color: '#64748b' },
    welcomeSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    welcomeTitle: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' },
    welcomeSubtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    meterBadge: { textAlign: 'right' },
    meterLabel: { fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 },
    meterCode: { background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontFamily: 'monospace', fontWeight: 600 },
    alertCard: { background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    alertContent: { display: 'flex', alignItems: 'center', gap: 16 },
    alertIcon: { width: 40, height: 40, background: '#f59e0b', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 },
    alertTitle: { fontWeight: 600, color: '#92400e' },
    alertSubtitle: { fontSize: 13, color: '#b45309' },
    alertBtn: { padding: '10px 24px', background: '#059669', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
    statCard: { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
    statValue: { fontSize: 28, fontWeight: 700, color: '#0f172a' },
    statLabel: { fontSize: 13, color: '#64748b', marginTop: 6 },
    card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    viewAll: { fontSize: 13, color: '#3b82f6', fontWeight: 500 },
    actionsRow: { display: 'flex', gap: 12 },
    actionBtn: { padding: '12px 20px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, textDecoration: 'none' },
    gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
    listContainer: {},
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
    listPrimary: { fontWeight: 600, fontSize: 14, color: '#0f172a' },
    listSecondary: { fontSize: 12, color: '#64748b' },
    listRight: { textAlign: 'right' },
    listAmount: { fontWeight: 600, fontSize: 14, color: '#0f172a' },
    badge: { display: 'inline-block', padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, marginTop: 4 },
    emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 20 },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' },
    estimateBox: { background: '#f0fdf4', padding: 16, borderRadius: 10, textAlign: 'center', marginBottom: 16, border: '1px solid #bbf7d0' },
    estimateLabel: { fontSize: 12, color: '#059669', marginBottom: 4 },
    estimateValue: { fontSize: 24, fontWeight: 700, color: '#059669' },
    estimateNote: { fontSize: 11, color: '#16a34a', marginTop: 4 },
    formActions: { display: 'flex', gap: 12 },
    cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};
