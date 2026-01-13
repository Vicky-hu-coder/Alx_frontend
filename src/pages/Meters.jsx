import { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function Meters() {
    const [meters, setMeters] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMeter, setEditingMeter] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [formData, setFormData] = useState({
        meterNumber: "",
        meterType: "POSTPAID",
        status: "ACTIVE",
        installationDate: "",
        customerId: ""
    });

    useEffect(() => {
        fetchMeters();
        fetchCustomers();
    }, [currentPage]);

    const fetchMeters = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/meters?page=${currentPage}&size=10`);
            if (response.data.content) {
                setMeters(response.data.content);
                setTotalPages(response.data.totalPages);
            } else {
                setMeters(response.data || []);
                setTotalPages(1);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch meters:', error);
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers?size=1000');
            setCustomers(response.data.content || response.data || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    };

    const handleAdd = () => {
        setEditingMeter(null);
        setFormData({
            meterNumber: "MTR-" + Date.now(),
            meterType: "POSTPAID",
            status: "ACTIVE",
            installationDate: new Date().toISOString().split('T')[0],
            customerId: ""
        });
        setShowModal(true);
    };

    const handleEdit = (meter) => {
        setEditingMeter(meter);
        setFormData({
            meterNumber: meter.meterNumber || "",
            meterType: meter.meterType || "POSTPAID",
            status: meter.status || "ACTIVE",
            installationDate: meter.installationDate || "",
            customerId: meter.customer?.id || meter.customerId || ""
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this meter?')) return;
        try {
            await api.delete(`/meters/${id}`);
            fetchMeters();
        } catch (error) {
            alert('Failed to delete meter: ' + (error.response?.data || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                meterNumber: formData.meterNumber,
                meterType: formData.meterType,
                status: formData.status,
                installationDate: formData.installationDate,
                customerId: formData.customerId || null
            };

            if (editingMeter) {
                await api.put(`/meters/${editingMeter.id}`, payload);
            } else {
                await api.post('/meters', payload);
            }
            setShowModal(false);
            fetchMeters();
        } catch (error) {
            alert('Failed to save meter: ' + (error.response?.data || error.message));
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
        return <div style={{ padding: 40 }}>Loading meters...</div>;
    }

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Meters</h1>
                    <p style={styles.subtitle}>Manage electricity meters and assignments</p>
                </div>
                <button style={styles.addBtn} onClick={handleAdd}>
                    + Add Meter
                </button>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{meters.length}</div>
                    <div style={styles.statLabel}>Total Meters</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#059669' }}>
                        {meters.filter(m => m.status === 'ACTIVE').length}
                    </div>
                    <div style={styles.statLabel}>Active</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {meters.filter(m => m.customer || m.customerId).length}
                    </div>
                    <div style={styles.statLabel}>Assigned</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#d97706' }}>
                        {meters.filter(m => !m.customer && !m.customerId).length}
                    </div>
                    <div style={styles.statLabel}>Unassigned</div>
                </div>
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Meter Number</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Customer</th>
                            <th style={styles.th}>Installation Date</th>
                            <th style={styles.th}>Last Reading</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meters.map(meter => (
                            <tr key={meter.id}>
                                <td style={styles.td}>
                                    <code style={styles.code}>{meter.meterNumber}</code>
                                </td>
                                <td style={styles.td}>{getTypeBadge(meter.meterType)}</td>
                                <td style={styles.td}>{getStatusBadge(meter.status)}</td>
                                <td style={styles.td}>
                                    {meter.customer?.name || meter.customerName || (
                                        <span style={{ color: '#94a3b8' }}>Unassigned</span>
                                    )}
                                </td>
                                <td style={styles.td}>{meter.installationDate || 'N/A'}</td>
                                <td style={styles.td}>{meter.lastReading || 0} kWh</td>
                                <td style={styles.td}>
                                    <button style={styles.editBtn} onClick={() => handleEdit(meter)}>Edit</button>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(meter.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMeter ? "Edit Meter" : "Add Meter"}>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Meter Number *</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={formData.meterNumber}
                            onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Meter Type *</label>
                            <select
                                style={styles.input}
                                value={formData.meterType}
                                onChange={(e) => setFormData({ ...formData, meterType: e.target.value })}
                            >
                                <option value="POSTPAID">Postpaid</option>
                                <option value="PREPAID">Prepaid</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Status *</label>
                            <select
                                style={styles.input}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Installation Date</label>
                        <input
                            style={styles.input}
                            type="date"
                            value={formData.installationDate}
                            onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Assign to Customer</label>
                        <select
                            style={styles.input}
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">-- Unassigned --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.formActions}>
                        <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" style={styles.submitBtn}>{editingMeter ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' },
    subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    addBtn: { padding: '10px 20px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
    statCard: { background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
    statValue: { fontSize: 28, fontWeight: 700, color: '#0f172a' },
    statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
    tableContainer: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '14px 16px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, fontSize: 12, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '14px 16px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
    badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
    code: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' },
    editBtn: { padding: '5px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer', marginRight: 6 },
    deleteBtn: { padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer' },
    formGroup: { marginBottom: 16, flex: 1 },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' },
    formActions: { display: 'flex', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};
