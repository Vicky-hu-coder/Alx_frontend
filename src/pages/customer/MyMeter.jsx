import { useState, useEffect } from "react";
import api from "../../api";

export default function MyMeter() {
    const [meter, setMeter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyMeter();
    }, []);

    const fetchMyMeter = async () => {
        try {
            const response = await api.get('/meters/my-meter');
            setMeter(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch meter:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            ACTIVE: { background: '#d1fae5', color: '#059669' },
            INACTIVE: { background: '#fee2e2', color: '#dc2626' },
            SUSPENDED: { background: '#fef3c7', color: '#d97706' }
        };
        const style = statusStyles[status] || statusStyles.ACTIVE;
        return (
            <span style={{ ...styles.badge, ...style }}>
                {status}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const typeStyles = {
            POSTPAID: { background: '#dbeafe', color: '#1d4ed8' },
            PREPAID: { background: '#f3e8ff', color: '#7c3aed' }
        };
        const style = typeStyles[type] || typeStyles.POSTPAID;
        return (
            <span style={{ ...styles.badge, ...style }}>
                {type}
            </span>
        );
    };

    if (loading) {
        return <div style={{ padding: 40 }}>Loading your meter information...</div>;
    }

    if (!meter) {
        return (
            <div>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Meter</h1>
                    <p style={styles.subtitle}>Your electricity meter information</p>
                </div>
                <div style={styles.noMeterCard}>
                    <div style={styles.noMeterIcon}>?</div>
                    <h3 style={styles.noMeterTitle}>No Meter Assigned</h3>
                    <p style={styles.noMeterText}>
                        You don't have a meter assigned to your account yet. Please contact support for assistance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>My Meter</h1>
                <p style={styles.subtitle}>Your electricity meter information</p>
            </div>

            {/* Meter Card */}
            <div style={styles.meterCard}>
                <div style={styles.meterCardHeader}>
                    <div>
                        <div style={styles.meterLabel}>Meter Number</div>
                        <code style={styles.meterNumber}>{meter.meterNumber}</code>
                    </div>
                    <div style={styles.meterBadges}>
                        {getTypeBadge(meter.meterType)}
                        {getStatusBadge(meter.status)}
                    </div>
                </div>

                <div style={styles.infoGrid}>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Last Reading</div>
                        <div style={styles.infoValue}>{meter.lastReading || 0} kWh</div>
                    </div>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Last Reading Date</div>
                        <div style={styles.infoValue}>{meter.lastReadingDate || 'N/A'}</div>
                    </div>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Installation Date</div>
                        <div style={styles.infoValue}>{meter.installationDate || 'N/A'}</div>
                    </div>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Meter Type</div>
                        <div style={styles.infoValue}>{meter.meterType}</div>
                    </div>
                </div>
            </div>

            {/* Usage Information */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Usage Information</h3>
                <p style={styles.cardText}>
                    Your meter is currently <strong>{meter.status}</strong>.
                    {meter.meterType === 'POSTPAID'
                        ? ' As a postpaid customer, you will be billed at the end of each billing period based on your consumption.'
                        : ' As a prepaid customer, you can purchase electricity units before usage.'}
                </p>
                <div style={styles.rateInfo}>
                    <div style={styles.rateItem}>
                        <span style={styles.rateLabel}>Current Rate</span>
                        <span style={styles.rateValue}>180 RWF/kWh</span>
                    </div>
                    <div style={styles.rateItem}>
                        <span style={styles.rateLabel}>Billing Cycle</span>
                        <span style={styles.rateValue}>Monthly</span>
                    </div>
                </div>
            </div>

            {/* Contact Support */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Need Help?</h3>
                <p style={styles.cardText}>
                    If you have any issues with your meter or need to report a problem, please contact our support team.
                </p>
                <div style={styles.supportInfo}>
                    <div style={styles.supportItem}>
                        <strong>Phone:</strong> +250 788 XXX XXX
                    </div>
                    <div style={styles.supportItem}>
                        <strong>Email:</strong> support@ebilling.rw
                    </div>
                    <div style={styles.supportItem}>
                        <strong>Hours:</strong> Mon-Fri, 8:00 AM - 5:00 PM
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
    meterCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24, border: '1px solid #e2e8f0' },
    meterCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' },
    meterLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    meterNumber: { fontSize: 24, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '8px 16px', borderRadius: 8, fontFamily: 'monospace' },
    meterBadges: { display: 'flex', gap: 8 },
    badge: { padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
    infoCard: { background: '#f8fafc', padding: 16, borderRadius: 10, textAlign: 'center' },
    infoLabel: { fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 },
    infoValue: { fontSize: 16, fontWeight: 600, color: '#0f172a' },
    card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' },
    cardText: { color: '#475569', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' },
    rateInfo: { display: 'flex', gap: 40 },
    rateItem: { display: 'flex', flexDirection: 'column', gap: 4 },
    rateLabel: { fontSize: 12, color: '#64748b' },
    rateValue: { fontSize: 16, fontWeight: 600, color: '#0f172a' },
    supportInfo: { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#475569' },
    supportItem: {},
    noMeterCard: { background: '#fff', borderRadius: 16, padding: 60, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    noMeterIcon: { width: 80, height: 80, background: '#f1f5f9', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#94a3b8', marginBottom: 24 },
    noMeterTitle: { fontSize: 20, fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' },
    noMeterText: { color: '#64748b', fontSize: 14, maxWidth: 400, margin: '0 auto' }
};
