import { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import TableSearch from "../components/TableSearch";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    customerId: "",
    unitsConsumed: "",
    billingDate: "",
    dueDate: "",
    amount: ""
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBills();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      let endpoint = '/bills';
      const params = new URLSearchParams({
        page: currentPage,
        size: 10
      });

      if (searchQuery) {
        endpoint = '/bills/search';
        params.append('query', searchQuery);
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);
      if (response.data.content) {
        setBills(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setBills(response.data || []);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
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
    setEditingBill(null);
    setFormData({
      customerId: "",
      unitsConsumed: "",
      billingDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      amount: ""
    });
    setShowModal(true);
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      customerId: bill.customer?.id || bill.customerId || "",
      unitsConsumed: bill.unitsConsumed || "",
      billingDate: bill.billingDate || "",
      dueDate: bill.dueDate || "",
      amount: bill.amount || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      await api.delete(`/bills/${id}`);
      fetchBills();
    } catch (error) {
      alert('Failed to delete bill: ' + (error.response?.data || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        unitsConsumed: parseFloat(formData.unitsConsumed),
        billingDate: formData.billingDate,
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount),
        status: 'PENDING'
      };

      if (editingBill) {
        await api.put(`/bills/${editingBill.id}`, payload);
      } else {
        await api.post(`/bills?customerId=${formData.customerId}`, payload);
      }
      setShowModal(false);
      fetchBills();
    } catch (error) {
      alert('Failed to save bill: ' + (error.response?.data || error.message));
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/bills/pay/${id}`);
      fetchBills();
    } catch (error) {
      alert('Failed to mark bill as paid: ' + (error.response?.data || error.message));
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
    return <div style={{ padding: 40 }}>Loading bills...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bills</h1>
          <p style={styles.subtitle}>Manage customer electricity bills</p>
        </div>
        <button style={styles.addBtn} onClick={handleAdd}>
          + Create Bill
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{bills.length}</div>
          <div style={styles.statLabel}>Total Bills</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#d97706' }}>
            {bills.filter(b => b.status === 'PENDING' || b.status === 'UNPAID').length}
          </div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#059669' }}>
            {bills.filter(b => b.status === 'PAID').length}
          </div>
          <div style={styles.statLabel}>Paid</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#dc2626' }}>
            {bills.filter(b => b.status === 'OVERDUE').length}
          </div>
          <div style={styles.statLabel}>Overdue</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={{ padding: '16px 16px 0' }}>
          <TableSearch
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(0); // Reset to first page on search
            }}
            placeholder="Search bills..."
          />
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Bill ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Units (kWh)</th>
              <th style={styles.th}>Amount (RWF)</th>
              <th style={styles.th}>Billing Date</th>
              <th style={styles.th}>Due Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id}>
                <td style={styles.td}>#{bill.id}</td>
                <td style={styles.td}>
                  <strong>{bill.customerName || bill.customer?.name || 'N/A'}</strong>
                </td>
                <td style={styles.td}>{bill.unitsConsumed}</td>
                <td style={styles.td}>{(bill.amount || 0).toLocaleString()}</td>
                <td style={styles.td}>{bill.billingDate}</td>
                <td style={styles.td}>{bill.dueDate}</td>
                <td style={styles.td}>{getStatusBadge(bill.status)}</td>
                <td style={styles.td}>
                  {bill.status !== 'PAID' && (
                    <button style={styles.payBtn} onClick={() => handleMarkPaid(bill.id)}>
                      Mark Paid
                    </button>
                  )}
                  <button style={styles.editBtn} onClick={() => handleEdit(bill)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(bill.id)}>Delete</button>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBill ? "Edit Bill" : "Create Bill"}>
        <form onSubmit={handleSubmit}>
          {!editingBill && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Customer *</label>
              <select
                style={styles.input}
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
          )}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Units Consumed (kWh) *</label>
              <input
                style={styles.input}
                type="number"
                value={formData.unitsConsumed}
                onChange={(e) => setFormData({ ...formData, unitsConsumed: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount (RWF) *</label>
              <input
                style={styles.input}
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Billing Date *</label>
              <input
                style={styles.input}
                type="date"
                value={formData.billingDate}
                onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date *</label>
              <input
                style={styles.input}
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>{editingBill ? 'Update' : 'Create'}</button>
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
  payBtn: { padding: '5px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer', marginRight: 6 },
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
