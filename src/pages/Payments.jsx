import { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Button from "../components/Button";
import TableSearch from "../components/TableSearch";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    billId: "",
    amountPaid: "",
    paymentMethod: "MOBILE_MONEY",
    transactionId: ""
  });

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPayments();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let endpoint = '/payments';
      const params = new URLSearchParams({
        page: currentPage,
        size: 10
      });

      if (searchQuery) {
        endpoint = '/payments/search';
        params.append('query', searchQuery);
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);

      // Handle search response which is a List, not a Page
      if (searchQuery && Array.isArray(response.data)) {
        setPayments(response.data);
        setTotalPages(1); // Search returns all results, so 1 page
      } else if (response.data.content) {
        setPayments(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setPayments(response.data || []);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills?size=1000');
      const unpaidBills = (response.data.content || []).filter(b => b.status !== 'PAID');
      setBills(unpaidBills);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    }
  };

  const handleAdd = () => {
    setFormData({
      billId: "",
      amountPaid: "",
      paymentMethod: "MOBILE_MONEY",
      transactionId: "TXN-" + Date.now()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/payments?billId=${formData.billId}`, {
        amountPaid: parseFloat(formData.amountPaid),
        paymentMethod: formData.paymentMethod,
        paymentDate: new Date().toISOString(),
        transactionId: formData.transactionId
      });

      // Mark bill as paid
      await api.patch(`/bills/pay/${formData.billId}`);

      setShowModal(false);
      fetchPayments();
      fetchBills();
    } catch (error) {
      alert('Failed to record payment: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (error) {
      alert('Failed to delete payment: ' + (error.response?.data || error.message));
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

  const totalPayments = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading payments...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Payments</h1>
          <p style={styles.subtitle}>Track and manage payment transactions</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          + Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{payments.length}</div>
          <div style={styles.statLabel}>Total Payments</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#059669' }}>
            {totalPayments.toLocaleString()} RWF
          </div>
          <div style={styles.statLabel}>Total Collected</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {payments.filter(p => p.paymentMethod === 'MOBILE_MONEY').length}
          </div>
          <div style={styles.statLabel}>Mobile Money</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {payments.filter(p => p.paymentMethod === 'BANK_TRANSFER').length}
          </div>
          <div style={styles.statLabel}>Bank Transfers</div>
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
            placeholder="Search payments..."
          />
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Payment ID</th>
              <th style={styles.th}>Transaction ID</th>
              <th style={styles.th}>Amount (RWF)</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td style={styles.td}>#{payment.id}</td>
                <td style={styles.td}>
                  <code style={styles.code}>{payment.transactionId || 'N/A'}</code>
                </td>
                <td style={styles.td}>
                  <strong>{(payment.amountPaid || 0).toLocaleString()}</strong>
                </td>
                <td style={styles.td}>{getMethodBadge(payment.paymentMethod)}</td>
                <td style={styles.td}>{payment.paymentDate?.split('T')[0] || 'N/A'}</td>
                <td style={styles.td}>
                  <Button variant="danger" size="small" onClick={() => handleDelete(payment.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div style={styles.emptyState}>No payments recorded yet.</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Bill *</label>
            <select
              style={styles.input}
              value={formData.billId}
              onChange={(e) => {
                const selectedBill = bills.find(b => b.id === parseInt(e.target.value));
                setFormData({
                  ...formData,
                  billId: e.target.value,
                  amountPaid: selectedBill?.amount || ""
                });
              }}
              required
            >
              <option value="">Select a bill to pay</option>
              {bills.map(b => (
                <option key={b.id} value={b.id}>
                  Bill #{b.id} - {b.customerName || b.customer?.name || 'Customer'} - {(b.amount || 0).toLocaleString()} RWF
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Amount (RWF) *</label>
            <input
              style={styles.input}
              type="number"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Method *</label>
            <select
              style={styles.input}
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card Payment</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Transaction ID</label>
            <input
              style={styles.input}
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            />
          </div>
          <div style={styles.formActions}>
            <Button variant="light" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="primary" type="submit" style={{ flex: 1 }}>Record Payment</Button>
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
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
  statValue: { fontSize: 24, fontWeight: 700, color: '#0f172a' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  tableContainer: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 16px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, fontSize: 12, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '14px 16px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  code: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' },
  emptyState: { padding: 40, textAlign: 'center', color: '#64748b' },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: 12, marginTop: 24 }
};
