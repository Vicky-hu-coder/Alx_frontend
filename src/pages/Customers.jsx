import { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import TableSearch from "../components/TableSearch";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    linkToUserId: "",
    createMeter: true
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchUnlinkedUsers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let endpoint = '/customers';
      const params = new URLSearchParams({
        page: currentPage,
        size: 10
      });

      if (searchQuery) {
        endpoint = '/customers/search';
        params.append('name', searchQuery);
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);
      if (response.data.content) {
        setCustomers(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setCustomers(response.data || []);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setLoading(false);
    }
  };

  const fetchUnlinkedUsers = async () => {
    try {
      const usersRes = await api.get('/users?size=1000');
      const allUsers = usersRes.data.content || [];

      const customerUsers = allUsers.filter(u =>
        u.roles?.some(r => r.includes('CUSTOMER'))
      );

      const customersRes = await api.get('/customers?size=1000');
      const allCustomers = customersRes.data.content || customersRes.data || [];
      const linkedUserIds = allCustomers.filter(c => c.user?.id).map(c => c.user.id);
      const linkedEmails = allCustomers.map(c => c.email?.toLowerCase());

      const unlinked = customerUsers.filter(u =>
        !linkedUserIds.includes(u.id) &&
        !linkedEmails.includes(u.email?.toLowerCase())
      );

      setUnlinkedUsers(unlinked);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      linkToUserId: "",
      createMeter: true
    });
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      linkToUserId: "",
      createMeter: false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
      fetchUnlinkedUsers();
    } catch (error) {
      alert('Failed to delete customer: ' + (error.response?.data || error.message));
    }
  };

  const handleUserSelect = (userId) => {
    if (userId) {
      const selectedUser = unlinkedUsers.find(u => u.id === parseInt(userId));
      if (selectedUser) {
        setFormData({
          ...formData,
          linkToUserId: userId,
          name: `${selectedUser.firstName} ${selectedUser.lastName}`,
          email: selectedUser.email
        });
        return;
      }
    }
    setFormData({ ...formData, linkToUserId: userId, name: "", email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        });
      } else if (formData.linkToUserId) {
        await api.post(`/users/${formData.linkToUserId}/link-customer`, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        });
      } else {
        const customerRes = await api.post('/customers', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          active: true
        });

        if (formData.createMeter && customerRes.data?.id) {
          await api.post('/meters', {
            meterNumber: 'MTR-' + Date.now(),
            meterType: 'POSTPAID',
            status: 'ACTIVE',
            customerId: customerRes.data.id,
            installationDate: new Date().toISOString().split('T')[0]
          });
        }
      }
      setShowModal(false);
      fetchCustomers();
      fetchUnlinkedUsers();
    } catch (error) {
      alert('Failed to save customer: ' + (error.response?.data || error.message));
    }
  };

  const linkedCustomers = customers.filter(c => c.user?.id);
  const customersWithMeters = customers.filter(c => c.meter?.id);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading customers...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Customers</h1>
          <p style={styles.subtitle}>Manage customer accounts and information</p>
        </div>
        <button style={styles.addBtn} onClick={handleAdd}>
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{customers.length}</div>
          <div style={styles.statLabel}>Total Customers</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#059669' }}>
            {linkedCustomers.length}
          </div>
          <div style={styles.statLabel}>Linked to Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{customersWithMeters.length}</div>
          <div style={styles.statLabel}>With Meters</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: unlinkedUsers.length > 0 ? '#d97706' : '#059669' }}>
            {unlinkedUsers.length}
          </div>
          <div style={styles.statLabel}>Users Need Records</div>
        </div>
      </div>

      {/* Alert for unlinked users */}
      {unlinkedUsers.length > 0 && (
        <div style={styles.alertBox}>
          <strong>Action Required:</strong> {unlinkedUsers.length} user(s) with CUSTOMER role need customer records.
          Click "Add Customer" and select from the dropdown to link them.
        </div>
      )}

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={{ padding: '16px 16px 0' }}>
          <TableSearch
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(0); // Reset to first page on search
            }}
            placeholder="Search customers..."
          />
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>User Status</th>
              <th style={styles.th}>Meter</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td style={styles.td}>#{customer.id}</td>
                <td style={styles.td}><strong>{customer.name}</strong></td>
                <td style={styles.td}>{customer.email}</td>
                <td style={styles.td}>{customer.phone || 'N/A'}</td>
                <td style={styles.td}>{customer.address || 'N/A'}</td>
                <td style={styles.td}>
                  {customer.user?.id ? (
                    <span style={{ ...styles.badge, background: '#d1fae5', color: '#059669' }}>Linked</span>
                  ) : (
                    <span style={{ ...styles.badge, background: '#f1f5f9', color: '#64748b' }}>Not Linked</span>
                  )}
                </td>
                <td style={styles.td}>
                  {customer.meter?.meterNumber ? (
                    <code style={styles.code}>{customer.meter.meterNumber}</code>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>No Meter</span>
                  )}
                </td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(customer)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(customer.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div style={styles.emptyState}>No customers found.</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCustomer ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSubmit}>
          {!editingCustomer && unlinkedUsers.length > 0 && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Link to Existing User (Optional)</label>
              <select
                style={styles.input}
                value={formData.linkToUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
              >
                <option value="">-- Create without user link --</option>
                {unlinkedUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
              {formData.linkToUserId && (
                <div style={styles.infoBox}>
                  A meter will be automatically created and assigned.
                </div>
              )}
            </div>
          )}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              style={styles.input}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={!!formData.linkToUserId}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              style={styles.input}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!formData.linkToUserId}
            />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                style={styles.input}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input
                style={styles.input}
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          {!editingCustomer && !formData.linkToUserId && (
            <div style={styles.checkboxRow}>
              <input
                type="checkbox"
                id="createMeter"
                checked={formData.createMeter}
                onChange={(e) => setFormData({ ...formData, createMeter: e.target.checked })}
              />
              <label htmlFor="createMeter" style={styles.checkboxLabel}>
                Create and assign a meter
              </label>
            </div>
          )}
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>
              {editingCustomer ? 'Update' : (formData.linkToUserId ? 'Create & Link' : 'Create')}
            </button>
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
  alertBox: { background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '14px 16px', borderRadius: 10, marginBottom: 24, fontSize: 14 },
  tableContainer: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 16px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, fontSize: 12, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '14px 16px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  code: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' },
  editBtn: { padding: '5px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer', marginRight: 6 },
  deleteBtn: { padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer' },
  emptyState: { padding: 40, textAlign: 'center', color: '#64748b' },
  formGroup: { marginBottom: 16, flex: 1 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' },
  infoBox: { background: '#eff6ff', color: '#1e40af', padding: 10, borderRadius: 6, fontSize: 12, marginTop: 8 },
  checkboxRow: { display: 'flex', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#475569', cursor: 'pointer' },
  formActions: { display: 'flex', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  submitBtn: { flex: 1, padding: '12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};
