import { useState, useEffect } from "react";
import api from "../../api";

export default function MyPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPayments();
    }, []);

    const fetchMyPayments = async () => {
        try {
            const response = await api.get('/payments/my-payments?size=100');
            setPayments(response.data.content || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            setLoading(false);
        }
    };

    const getMethodBadge = (method) => {
        const methodStyles = {
            MOBILE_MONEY: { background: '#dbeafe', color: '#1d4ed8' },
            BANK_TRANSFER: { background: '#f3e8ff', color: '#7c3aed' },
            CARD: { background: '#fef3c7', color: '#d97706' },
            CASH: { background: '#d1fae5', color: '#059669' }
        };
        const style = methodStyles[method] || methodStyles.CASH;
        return (
            <span style={{ ...styles.badge, ...style }}>
                {method?.replace('_', ' ')}
            </span>
        );
    };

    const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

    if (loading) {
        return <div style={{ padding: 40 }}>Loading your payments...</div>;
    }

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>My Payments</h1>
                    <p style={styles.subtitle}>View your payment history</p>
                </div>
            </div>

            {/* Summary */}
            <div style={styles.summaryRow}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryValue}>{payments.length}</div>
                    <div style={styles.summaryLabel}>Total Payments</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#059669' }}>{totalPaid.toLocaleString()} RWF</div>
                    <div style={styles.summaryLabel}>Total Amount Paid</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryValue}>
                        {payments.filter(p => p.paymentMethod === 'MOBILE_MONEY').length}
                    </div>
                    <div style={styles.summaryLabel}>Mobile Money Payments</div>
                </div>
            </div>

            {/* Table */}
            <div style={styles.tableCard}>
                <h3 style={styles.tableTitle}>Payment History</h3>
                {payments.length === 0 ? (
                    <div style={styles.emptyState}>You haven't made any payments yet.</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Transaction ID</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Method</th>
                                <th style={styles.th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td style={styles.td}>
                                        <code style={styles.code}>{payment.transactionId || `TXN-${payment.id}`}</code>
                                    </td>
                                    <td style={{ ...styles.td, fontWeight: 600 }}>
                                        {(payment.amountPaid || 0).toLocaleString()} RWF
                                    </td>
                                    <td style={styles.td}>{getMethodBadge(payment.paymentMethod)}</td>
                                    <td style={styles.td}>{payment.paymentDate?.split('T')[0] || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const styles = {
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' },
    subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
    summaryCard: { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
    summaryValue: { fontSize: 28, fontWeight: 700, color: '#0f172a' },
    summaryLabel: { fontSize: 13, color: '#64748b', marginTop: 6 },
    tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    tableTitle: { margin: 0, padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 16, fontWeight: 600, color: '#0f172a' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '14px 20px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, fontSize: 12, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '14px 20px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
    badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
    code: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' },
    emptyState: { padding: 40, textAlign: 'center', color: '#64748b' }
};
