import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.otpRequired) {
        navigate("/otp");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>E</div>
          <h1 style={styles.logoText}>E-Billing</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {successMessage && <div style={styles.successBox}>{successMessage}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              id="show-pwd"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              style={styles.checkbox}
            />
            <label htmlFor="show-pwd" style={styles.checkboxLabel}>Show password</label>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.signupLink}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: 20
  },
  card: {
    width: 420,
    background: "#ffffff",
    padding: "40px 36px",
    borderRadius: 16,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
  },
  logoSection: {
    textAlign: "center",
    marginBottom: 32
  },
  logoIcon: {
    width: 56,
    height: 56,
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 16
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    margin: 0
  },
  successBox: {
    background: "#f0fdf4",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14
  },
  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "#334155"
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 15,
    color: "#0f172a",
    background: "#f1f5f9",
    boxSizing: "border-box",
    outline: "none"
  },
  forgotLink: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: 500
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 24
  },
  checkbox: {
    marginRight: 8,
    width: 16,
    height: 16,
    accentColor: "#3b82f6"
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#64748b",
    cursor: "pointer"
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    outline: "none"
  },
  footer: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 14,
    color: "#64748b"
  },
  signupLink: {
    color: "#3b82f6",
    fontWeight: 600
  }
};
