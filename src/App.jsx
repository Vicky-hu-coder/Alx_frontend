import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

// Auth Pages
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Admin/Employee Pages (shared)
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Bills from "./pages/Bills";
import Payments from "./pages/Payments";
import Users from "./pages/Users";
import Meters from "./pages/Meters";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyBills from "./pages/customer/MyBills";
import MyPayments from "./pages/customer/MyPayments";
import MyMeter from "./pages/customer/MyMeter";
import CustomerProfile from "./pages/customer/CustomerProfile";
import RequestWatts from "./pages/customer/RequestWatts";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// Protect private pages
function ProtectedRoute({ children, allowedRoles }) {
  const { user, otpPending } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (otpPending) return <Navigate to="/otp" />;

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === 'ROLE_EMPLOYEE' || user.role === 'EMPLOYEE') {
      return <Navigate to="/employee/dashboard" />;
    } else {
      return <Navigate to="/customer/dashboard" />;
    }
  }

  return children;
}

// Redirect to correct dashboard based on role
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else if (user.role === 'ROLE_EMPLOYEE' || user.role === 'EMPLOYEE') {
    return <Navigate to="/employee/dashboard" />;
  } else {
    return <Navigate to="/customer/dashboard" />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="bills" element={<Bills />} />
          <Route path="payments" element={<Payments />} />
          <Route path="meters" element={<Meters />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'ROLE_EMPLOYEE']}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/employee/dashboard" />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="bills" element={<Bills />} />
          <Route path="payments" element={<Payments />} />
          <Route path="meters" element={<Meters />} />
        </Route>

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ROLE_CUSTOMER']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customer/dashboard" />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="my-bills" element={<MyBills />} />
          <Route path="my-payments" element={<MyPayments />} />
          <Route path="my-meter" element={<MyMeter />} />
          <Route path="request-watts" element={<RequestWatts />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        {/* Legacy routes - redirect to new structure */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        <Route path="/customers" element={<RoleBasedRedirect />} />
        <Route path="/bills" element={<RoleBasedRedirect />} />
        <Route path="/payments" element={<RoleBasedRedirect />} />
        <Route path="/meters" element={<RoleBasedRedirect />} />
        <Route path="/users" element={<RoleBasedRedirect />} />

        {/* Default */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}
