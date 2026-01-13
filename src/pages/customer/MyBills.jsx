import { useState, useEffect } from "react";
import api from "../../api";
import Modal from "../../components/Modal";

export default function MyBills() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: "",
        paymentMethod: "MOBILE_MONEY"
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchMyBills();
    }, []);

    const fetchMyBills = async () => {
        try {
            const response = await api.get('/bills/my-bills?size=100');
            setBills(response.data.content || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch bills:', error);
            setLoading(false);
        }
    };

    const handlePayBill = (bill) => {
        setSelectedBill(bill);
        setPaymentData({
            amount: bill.amount || bill.amountDue || 0,
            paymentMethod: "MOBILE_MONEY"
        });
        setShowPayModal(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            await api.post(`/payments?billId=${selectedBill.id}`, {
                amountPaid: parseFloat(paymentData.amount),
                paymentMethod: paymentData.paymentMethod,
                paymentDate: new Date().toISOString(),
                transactionId: "TXN-" + Date.now()
            });

            await api.patch(`/bills/pay/${selectedBill.id}`);

            setShowPayModal(false);
            fetchMyBills();
            alert("Payment successful!");
        } catch (error) {
            alert("Payment failed: " + (error.response?.data || error.message));
        }
        setProcessing(false);
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
        return <div style={{ padding: 40 }}>Loading your bills...</div>;
    }

    const unpaidBills = bills.filter(b => b.status === 'PENDING' || b.status === 'UNPAID' || b.status === 'OVERDUE');
    const paidBills = bills.filter(b => b.status === 'PAID');
    const totalOutstanding = unpaidBills.reduce((sum, b) => sum + (b.amount || b.amountDue || 0), 0);

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>My Bills</h1>
                    <p style={styles.subtitle}>View and pay your electricity bills</p>
                </div>
            </div>

            {/* Summary */}
            <div style={styles.summaryRow}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryValue}>{bills.length}</div>
                    <div style={styles.summaryLabel}>Total Bills</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#dc2626' }}>{unpaidBills.length}</div>
                    <div style={styles.summaryLabel}>Unpaid</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={{ ...styles.summaryValue, color: '#dc2626' }}>{totalOutstanding.toLocaleString()} RWF</div>
                    <div style={styles.summaryLabel}>Outstanding</div>
                </div>
            </div>

            {/* Unpaid Bills */}
            {unpaidBills.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Bills Awaiting Payment</h3>
                    <div style={styles.cardGrid}>
                        {unpaidBills.map(bill => (
                            <div key={bill.id} style={styles.billCard}>
                                <div style={styles.billCardHeader}>
                                    <div>
                                        <div style={styles.billNumber}>Bill #{bill.id}</div>
                                        <div style={styles.billDate}>{bill.billingPeriod || bill.billingDate} | Due: {bill.dueDate}</div>
                                    </div>
                                    {getStatusBadge(bill.status)}
                                </div>
                                <div style={styles.billDetails}>
                                    <div style={styles.billUnits}>
                                        <span style={styles.billUnitsLabel}>Units Consumed</span>
                                        <span style={styles.billUnitsValue}>{bill.unitsConsumed} kWh</span>
                                    </div>
                                </div>
                                <div style={styles.billCardFooter}>
                                    <div style={styles.billAmount}>{(bill.amount || bill.amountDue || 0).toLocaleString()} RWF</div>
                                    <button style={styles.payBtn} onClick={() => handlePayBill(bill)}>
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Bills Table */}
            <div style={styles.tableCard}>
                <h3 style={styles.tableTitle}>All Bills History</h3>
                {bills.length === 0 ? (
                    <div style={styles.emptyState}>You have no bills yet.</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Bill #</th>
                                <th style={styles.th}>Billing Period</th>
                                <th style={styles.th}>Units</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Due Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr key={bill.id}>
                                    <td style={styles.td}>#{bill.id}</td>
                                    <td style={styles.td}>{bill.billingPeriod || bill.billingDate}</td>
                                    <td style={styles.td}>{bill.unitsConsumed} kWh</td>
                                    <td style={{ ...styles.td, fontWeight: 600 }}>{(bill.amount || bill.amountDue || 0).toLocaleString()} RWF</td>
                                    <td style={styles.td}>{bill.dueDate}</td>
                                    <td style={styles.td}>{getStatusBadge(bill.status)}</td>
                                    <td style={styles.td}>
                                        {bill.status !== 'PAID' && (
                                            <button style={styles.smallPayBtn} onClick={() => handlePayBill(bill)}>Pay</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Payment Modal */}
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Pay Bill">
                {selectedBill && (
                    <form onSubmit={handleSubmitPayment}>
                        <div style={styles.billSummary}>
                            <div style={styles.billSummaryNumber}>Bill #{selectedBill.id}</div>
                            <div style={styles.billSummaryAmount}>
                                {(selectedBill.amount || selectedBill.amountDue || 0).toLocaleString()} RWF
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Payment Method</label>
                            <select
                                style={styles.input}
                                value={paymentData.paymentMethod}
                                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                required
                            >
                                <option value="MOBILE_MONEY">Mobile Money (MTN/Airtel)</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CARD">Card Payment</option>
                                <option value="CASH">Cash</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Amount (RWF)</label>
                            <input
                                style={styles.input}
                                type="number"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div style={styles.formActions}>
                            <button type="button" style={styles.cancelBtn} onClick={() => setShowPayModal(false)}>Cancel</button>
                            <button type="submit" style={styles.submitBtn} disabled={processing}>
                                {processing ? 'Processing...' : 'Complete Payment'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
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
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 16 },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
    billCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #fecaca' },
    billCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    billNumber: { fontWeight: 600, fontSize: 16, color: '#0f172a' },
    billDate: { fontSize: 13, color: '#64748b', marginTop: 4 },
    badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
    billDetails: { marginBottom: 16 },
    billUnits: { display: 'flex', justifyContent: 'space-between' },
    billUnitsLabel: { fontSize: 13, color: '#64748b' },
    billUnitsValue: { fontSize: 14, fontWeight: 500 },
    billCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9' },
    billAmount: { fontSize: 22, fontWeight: 700, color: '#dc2626' },
    payBtn: { padding: '10px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    tableTitle: { margin: 0, padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 16, fontWeight: 600, color: '#0f172a' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '14px 20px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, fontSize: 12, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '14px 20px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
    smallPayBtn: { padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12 },
    emptyState: { padding: 40, textAlign: 'center', color: '#64748b' },
    billSummary: { background: '#f0fdf4', padding: 20, borderRadius: 12, textAlign: 'center', marginBottom: 20, border: '1px solid #bbf7d0' },
    billSummaryNumber: { fontWeight: 600, color: '#059669', marginBottom: 4 },
    billSummaryAmount: { fontSize: 28, fontWeight: 700, color: '#059669' },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
    input: { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: 14 },
    formActions: { display: 'flex', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};
