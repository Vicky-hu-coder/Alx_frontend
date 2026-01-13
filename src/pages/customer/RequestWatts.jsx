import { useState } from "react";
import api from "../../api";

export default function RequestWatts() {
    const [formData, setFormData] = useState({
        units: 100,
        paymentMethod: 'MOBILE_MONEY'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate request - in production this would create a prepaid purchase
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(true);
        } catch (error) {
            alert('Request failed: ' + (error.response?.data || error.message));
        }
        setLoading(false);
    };

    const estimatedCost = formData.units * 180;

    if (success) {
        return (
            <div>
                <div style={styles.header}>
                    <h1 style={styles.title}>Request Service</h1>
                    <p style={styles.subtitle}>Purchase prepaid electricity units</p>
                </div>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>✓</div>
                    <h3 style={styles.successTitle}>Request Submitted!</h3>
                    <p style={styles.successText}>
                        Your request for {formData.units} kWh has been submitted successfully.
                        You will receive confirmation shortly.
                    </p>
                    <div style={styles.successDetails}>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Units Requested</span>
                            <span style={styles.detailValue}>{formData.units} kWh</span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Amount</span>
                            <span style={styles.detailValue}>{estimatedCost.toLocaleString()} RWF</span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Payment Method</span>
                            <span style={styles.detailValue}>{formData.paymentMethod.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button
                        style={styles.newRequestBtn}
                        onClick={() => { setSuccess(false); setFormData({ units: 100, paymentMethod: 'MOBILE_MONEY' }); }}
                    >
                        Make Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>Request Service</h1>
                <p style={styles.subtitle}>Purchase prepaid electricity units</p>
            </div>

            <div style={styles.contentGrid}>
                {/* Request Form */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Request Units</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Units to Purchase (kWh)</label>
                            <input
                                style={styles.input}
                                type="number"
                                value={formData.units}
                                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })}
                                min="1"
                                required
                            />
                        </div>

                        <div style={styles.quickSelect}>
                            <span style={styles.quickLabel}>Quick Select:</span>
                            {[50, 100, 200, 500].map(amount => (
                                <button
                                    key={amount}
                                    type="button"
                                    style={{
                                        ...styles.quickBtn,
                                        background: formData.units === amount ? '#1e40af' : '#f1f5f9',
                                        color: formData.units === amount ? '#fff' : '#475569'
                                    }}
                                    onClick={() => setFormData({ ...formData, units: amount })}
                                >
                                    {amount} kWh
                                </button>
                            ))}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Payment Method</label>
                            <select
                                style={styles.input}
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            >
                                <option value="MOBILE_MONEY">Mobile Money (MTN/Airtel)</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CARD">Card Payment</option>
                            </select>
                        </div>

                        <button type="submit" style={styles.submitBtn} disabled={loading}>
                            {loading ? 'Processing...' : 'Submit Request'}
                        </button>
                    </form>
                </div>

                {/* Summary */}
                <div style={styles.summaryCard}>
                    <h3 style={styles.cardTitle}>Order Summary</h3>
                    <div style={styles.summaryContent}>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Units</span>
                            <span style={styles.summaryValue}>{formData.units} kWh</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Rate</span>
                            <span style={styles.summaryValue}>180 RWF/kWh</span>
                        </div>
                        <div style={styles.summaryDivider}></div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabelBold}>Total</span>
                            <span style={styles.summaryTotal}>{estimatedCost.toLocaleString()} RWF</span>
                        </div>
                    </div>

                    <div style={styles.infoBox}>
                        <strong>Note:</strong> Units will be credited to your meter after payment confirmation.
                    </div>
                </div>
            </div>

            {/* Pricing Info */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Pricing Information</h3>
                <div style={styles.pricingGrid}>
                    <div style={styles.pricingItem}>
                        <div style={styles.pricingLabel}>Standard Rate</div>
                        <div style={styles.pricingValue}>180 RWF/kWh</div>
                    </div>
                    <div style={styles.pricingItem}>
                        <div style={styles.pricingLabel}>Minimum Purchase</div>
                        <div style={styles.pricingValue}>1 kWh</div>
                    </div>
                    <div style={styles.pricingItem}>
                        <div style={styles.pricingLabel}>Processing Time</div>
                        <div style={styles.pricingValue}>Instant</div>
                    </div>
                    <div style={styles.pricingItem}>
                        <div style={styles.pricingLabel}>Validity</div>
                        <div style={styles.pricingValue}>No expiry</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' },
    subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 },
    card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 20px 0' },
    formGroup: { marginBottom: 20 },
    label: { display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#334155' },
    input: { width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15, boxSizing: 'border-box' },
    quickSelect: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
    quickLabel: { fontSize: 13, color: '#64748b' },
    quickBtn: { padding: '8px 16px', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer', fontSize: 13 },
    submitBtn: { width: '100%', padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer' },
    summaryCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: 'fit-content' },
    summaryContent: { marginBottom: 20 },
    summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryLabel: { fontSize: 14, color: '#64748b' },
    summaryValue: { fontSize: 14, fontWeight: 500, color: '#0f172a' },
    summaryDivider: { height: 1, background: '#e2e8f0', margin: '16px 0' },
    summaryLabelBold: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
    summaryTotal: { fontSize: 22, fontWeight: 700, color: '#059669' },
    infoBox: { background: '#eff6ff', color: '#1e40af', padding: 12, borderRadius: 8, fontSize: 13 },
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
    pricingItem: { textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 },
    pricingLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    pricingValue: { fontSize: 16, fontWeight: 600, color: '#0f172a' },
    successCard: { background: '#fff', borderRadius: 16, padding: 48, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: 500, margin: '0 auto' },
    successIcon: { width: 80, height: 80, background: '#d1fae5', color: '#059669', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, marginBottom: 24 },
    successTitle: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' },
    successText: { color: '#64748b', fontSize: 14, margin: '0 0 24px 0' },
    successDetails: { background: '#f8fafc', borderRadius: 10, padding: 20, marginBottom: 24 },
    detailItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' },
    detailLabel: { color: '#64748b', fontSize: 13 },
    detailValue: { fontWeight: 600, fontSize: 14 },
    newRequestBtn: { padding: '12px 28px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};
