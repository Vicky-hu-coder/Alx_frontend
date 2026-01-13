import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Otp() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyOtp, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(code);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "The verification code is incorrect. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <span style={styles.iconText}>OTP</span>
          </div>
          <h2 style={styles.title}>Two-Step Verification</h2>
          <p style={styles.subtitle}>
            We've sent a verification code to <strong>{user?.email}</strong>
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleVerify}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Enter 6-digit code</label>
            <input
              style={styles.input}
              placeholder="0 0 0 0 0 0"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.resendText}>
            Didn't receive the code? <span style={styles.resendLink}>Resend Code</span>
          </p>
          <button onClick={logout} style={styles.backBtn}>
            Back to Login
          </button>
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
  header: {
    textAlign: "center",
    marginBottom: 28
  },
  iconBox: {
    width: 72,
    height: 72,
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  iconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
    lineHeight: 1.5
  },
  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center"
  },
  formGroup: {
    marginBottom: 24
  },
  label: {
    display: "block",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 500,
    color: "#334155"
  },
  input: {
    width: "100%",
    padding: "16px",
    fontSize: 28,
    textAlign: "center",
    letterSpacing: "10px",
    borderRadius: 12,
    border: "none",
    boxSizing: "border-box",
    background: "#f1f5f9",
    fontWeight: 600,
    color: "#0f172a",
    outline: "none"
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer"
  },
  footer: {
    marginTop: 28,
    textAlign: "center"
  },
  resendText: {
    fontSize: 14,
    color: "#64748b",
    margin: 0
  },
  resendLink: {
    color: "#3b82f6",
    fontWeight: 600,
    cursor: "pointer"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 16,
    cursor: "pointer",
    textDecoration: "underline"
  }
};
