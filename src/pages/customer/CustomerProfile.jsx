import { useState, useEffect } from "react";
import api from "../../api";

export default function CustomerProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ phone: "", address: "" });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/customers/my-profile');
            if (response.data && !response.data.message) {
                setProfile(response.data);
                setFormData({
                    phone: response.data.phone || "",
                    address: response.data.address || ""
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await api.put('/customers/my-profile', {
                phone: formData.phone,
                address: formData.address
            });
            setEditing(false);
            setMessage("Profile updated successfully!");
            fetchProfile();
        } catch (error) {
            setMessage("Failed to update profile: " + (error.response?.data || error.message));
        }
        setSaving(false);
    };

    if (loading) {
        return <div style={{ padding: 40 }}>Loading your profile...</div>;
    }

    if (!profile) {
        return (
            <div>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Profile</h1>
                    <p style={styles.subtitle}>Your account information</p>
                </div>
                <div style={styles.noProfileCard}>
                    <div style={styles.noProfileIcon}>?</div>
                    <h3 style={styles.noProfileTitle}>Profile Not Set Up</h3>
                    <p style={styles.noProfileText}>
                        Your customer profile hasn't been set up yet. Please contact support for assistance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>My Profile</h1>
                    <p style={styles.subtitle}>Manage your account information</p>
                </div>
                {!editing && (
                    <button style={styles.editBtn} onClick={() => setEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <div style={{
                    ...styles.messageBox,
                    background: message.includes('success') ? '#d1fae5' : '#fee2e2',
                    color: message.includes('success') ? '#059669' : '#dc2626',
                    borderColor: message.includes('success') ? '#a7f3d0' : '#fecaca'
                }}>
                    {message}
                </div>
            )}

            {/* Profile Card */}
            <div style={styles.profileCard}>
                <div style={styles.avatarSection}>
                    <div style={styles.avatar}>
                        {profile.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <h2 style={styles.profileName}>{profile.name}</h2>
                        <p style={styles.profileEmail}>{profile.email}</p>
                        {profile.active !== false && (
                            <span style={styles.activeBadge}>Active Account</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Contact Information</h3>

                {editing ? (
                    <div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                style={styles.input}
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Address</label>
                            <textarea
                                style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter your address"
                            />
                        </div>
                        <div style={styles.formActions}>
                            <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={styles.infoList}>
                        <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Phone Number</div>
                            <div style={styles.infoValue}>{profile.phone || 'Not provided'}</div>
                        </div>
                        <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Address</div>
                            <div style={styles.infoValue}>{profile.address || 'Not provided'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Meter Information */}
            {profile.meter && (
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Assigned Meter</h3>
                    <div style={styles.meterInfo}>
                        <div style={styles.meterNumber}>
                            <code style={styles.code}>{profile.meter.meterNumber}</code>
                        </div>
                        <div style={styles.meterDetails}>
                            <span style={{
                                ...styles.badge,
                                background: '#dbeafe',
                                color: '#1d4ed8'
                            }}>
                                {profile.meter.meterType}
                            </span>
                            <span style={{
                                ...styles.badge,
                                background: profile.meter.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                                color: profile.meter.status === 'ACTIVE' ? '#059669' : '#dc2626'
                            }}>
                                {profile.meter.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Info */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Account Details</h3>
                <div style={styles.infoList}>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Customer ID</div>
                        <div style={styles.infoValue}>#{profile.id}</div>
                    </div>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Account Status</div>
                        <div style={styles.infoValue}>
                            {profile.active !== false ? 'Active' : 'Inactive'}
                        </div>
                    </div>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Member Since</div>
                        <div style={styles.infoValue}>
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' },
    subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    editBtn: { padding: '10px 20px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    messageBox: { padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14, border: '1px solid' },
    profileCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
    avatarSection: { display: 'flex', alignItems: 'center', gap: 20 },
    avatar: { width: 80, height: 80, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff' },
    profileName: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' },
    profileEmail: { fontSize: 14, color: '#64748b', margin: '0 0 8px 0' },
    activeBadge: { display: 'inline-block', background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
    card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 20px 0' },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
    input: { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' },
    formActions: { display: 'flex', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    saveBtn: { flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    infoList: { display: 'flex', flexDirection: 'column', gap: 16 },
    infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f1f5f9' },
    infoLabel: { fontSize: 13, color: '#64748b' },
    infoValue: { fontSize: 14, fontWeight: 500, color: '#0f172a' },
    meterInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    meterNumber: {},
    code: { background: '#f1f5f9', padding: '8px 16px', borderRadius: 8, fontSize: 16, fontFamily: 'monospace', fontWeight: 600 },
    meterDetails: { display: 'flex', gap: 8 },
    badge: { padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
    noProfileCard: { background: '#fff', borderRadius: 16, padding: 60, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    noProfileIcon: { width: 80, height: 80, background: '#f1f5f9', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#94a3b8', marginBottom: 24 },
    noProfileTitle: { fontSize: 20, fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' },
    noProfileText: { color: '#64748b', fontSize: 14, maxWidth: 400, margin: '0 auto' }
};
