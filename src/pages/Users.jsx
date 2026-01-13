import { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import TableSearch from "../components/TableSearch";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    enabled: true
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let endpoint = '/users';
      const params = new URLSearchParams({
        page: currentPage,
        size: 10
      });

      if (searchQuery) {
        endpoint = '/users/search';
        // Simple heuristic: if it looks like an email, search by email, otherwise first name
        if (searchQuery.includes('@')) {
          params.append('email', searchQuery);
        } else {
          params.append('firstName', searchQuery);
        }
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);
      if (response.data.content) {
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setUsers(response.data || []);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      enabled: true
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      role: user.roles?.[0]?.replace('ROLE_', '') || "EMPLOYEE",
      enabled: user.enabled !== false
    });
    setShowModal(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    const currentRole = user.roles?.[0]?.replace('ROLE_', '') || 'EMPLOYEE';
    setNewRole(currentRole);
    setShowRoleModal(true);
  };

  const handleSubmitRoleChange = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/users/${selectedUser.id}`, {
        ...selectedUser,
        roles: [`ROLE_${newRole}`]
      });

      if (newRole === 'CUSTOMER') {
        try {
          await api.post(`/users/${selectedUser.id}/link-customer`, {
            phone: 'Not provided',
            address: 'Not provided'
          });
        } catch (linkError) {
          console.log('Customer may already exist:', linkError);
        }
      }

      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      alert("Failed to update role: " + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user: ' + (error.response?.data || error.message));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.enabled) {
        await api.patch(`/users/disable/${user.id}`);
      } else {
        await api.patch(`/users/enable/${user.id}`);
      }
      fetchUsers();
    } catch (error) {
      alert('Failed to update user status: ' + (error.response?.data || error.message));
    }
  };

  const handleLinkCustomer = async (user) => {
    try {
      const checkRes = await api.get(`/users/${user.id}/customer`).catch(() => null);
      if (checkRes && checkRes.status === 200) {
        alert(`Customer record already exists for ${user.firstName} ${user.lastName}`);
        return;
      }

      const res = await api.post(`/users/${user.id}/link-customer`, {
        phone: 'Not provided',
        address: 'Not provided'
      });

      alert(`Customer record created successfully!\nCustomer ID: ${res.data.id}`);
      fetchUsers();
    } catch (error) {
      alert('Failed to link customer: ' + (error.response?.data || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        roles: [`ROLE_${formData.role}`],
        enabled: formData.enabled
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/auth/register', {
          ...payload,
          password: formData.password,
          role: formData.role
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert('Failed to save user: ' + (error.response?.data || error.message));
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      ADMIN: { background: '#fee2e2', color: '#dc2626' },
      EMPLOYEE: { background: '#f3e8ff', color: '#7c3aed' },
      CUSTOMER: { background: '#d1fae5', color: '#059669' }
    };
    const cleanRole = (role || 'USER').replace('ROLE_', '');
    const style = roleStyles[cleanRole] || { background: '#f1f5f9', color: '#64748b' };
    return (
      <span style={{ ...styles.badge, ...style }}>
        {cleanRole}
      </span>
    );
  };

  const getStatusBadge = (enabled) => {
    return (
      <span style={{
        ...styles.badge,
        background: enabled ? '#d1fae5' : '#fee2e2',
        color: enabled ? '#059669' : '#dc2626'
      }}>
        {enabled ? 'Active' : 'Disabled'}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading users...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Manage system users and access permissions</p>
        </div>
        <button style={styles.addBtn} onClick={handleAdd}>
          + Add User
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{users.length}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#dc2626' }}>
            {users.filter(u => u.roles?.[0]?.includes('ADMIN')).length}
          </div>
          <div style={styles.statLabel}>Administrators</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#7c3aed' }}>
            {users.filter(u => u.roles?.[0]?.includes('EMPLOYEE')).length}
          </div>
          <div style={styles.statLabel}>Employees</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#059669' }}>
            {users.filter(u => u.roles?.[0]?.includes('CUSTOMER')).length}
          </div>
          <div style={styles.statLabel}>Customers</div>
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
            placeholder="Search users..."
          />
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>#{user.id}</td>
                <td style={styles.td}>
                  <strong>{user.firstName} {user.lastName}</strong>
                </td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span onClick={() => handleChangeRole(user)} style={{ cursor: 'pointer' }}>
                    {getRoleBadge(user.roles?.[0])}
                  </span>
                </td>
                <td style={styles.td}>{getStatusBadge(user.enabled !== false)}</td>
                <td style={styles.td}>
                  <button style={styles.roleBtn} onClick={() => handleChangeRole(user)}>
                    Change Role
                  </button>
                  {user.roles?.[0]?.includes('CUSTOMER') && (
                    <button style={styles.linkBtn} onClick={() => handleLinkCustomer(user)}>
                      Link Customer
                    </button>
                  )}
                  <button style={styles.editBtn} onClick={() => handleEdit(user)}>Edit</button>
                  <button
                    style={user.enabled !== false ? styles.disableBtn : styles.enableBtn}
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.enabled !== false ? 'Disable' : 'Enable'}
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(user.id)}>Delete</button>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? "Edit User" : "Add User"}>
        <form onSubmit={handleSubmit}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                style={styles.input}
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                style={styles.input}
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              style={styles.input}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          {!editingUser && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                style={styles.input}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
          )}
          <div style={styles.formGroup}>
            <label style={styles.label}>Role *</label>
            <select
              style={styles.input}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="ADMIN">Administrator</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>{editingUser ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Role Change Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Change User Role">
        {selectedUser && (
          <div>
            <div style={styles.userCard}>
              <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
              <div style={{ color: '#64748b', fontSize: 13 }}>{selectedUser.email}</div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select New Role</label>
              <select
                style={styles.input}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="ADMIN">Administrator - Full system access</option>
                <option value="EMPLOYEE">Employee - Staff operations</option>
                <option value="CUSTOMER">Customer - Personal account access</option>
              </select>
            </div>
            {newRole === 'CUSTOMER' && (
              <div style={styles.infoBox}>
                A customer record and meter will be created automatically.
              </div>
            )}
            <div style={styles.formActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button type="button" style={styles.submitBtn} onClick={handleSubmitRoleChange}>Update Role</button>
            </div>
          </div>
        )}
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
  badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-block' },
  roleBtn: { padding: '5px 8px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', marginRight: 4, fontWeight: 600 },
  linkBtn: { padding: '5px 8px', background: '#dcfce7', color: '#059669', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', marginRight: 4, fontWeight: 600 },
  editBtn: { padding: '5px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', marginRight: 4 },
  disableBtn: { padding: '5px 8px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', marginRight: 4 },
  enableBtn: { padding: '5px 8px', background: '#d1fae5', color: '#059669', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer', marginRight: 4 },
  deleteBtn: { padding: '5px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer' },
  formGroup: { marginBottom: 16, flex: 1 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' },
  userCard: { background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20 },
  infoBox: { background: '#eff6ff', color: '#1e40af', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 },
  formActions: { display: 'flex', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  submitBtn: { flex: 1, padding: '12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};
