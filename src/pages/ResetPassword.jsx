import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset link.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                token: token,
                password: password
            });
            setSuccess(true);
        } catch (err) {
            setError("Failed to reset password. The link may have expired. Please request a new one.");
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={styles.title}>Password Reset Successful!</h2>
                    <p style={styles.message}>
                        Your password has been changed successfully.
                    </p>
                    <button
                        style={styles.submitBtn}
                        onClick={() => navigate("/login", { state: { message: "Password reset successful! Please sign in." } })}
                    >
                        Sign In Now
                    </button>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.errorIcon}>!</div>
                    <h2 style={styles.title}>Invalid Reset Link</h2>
                    <p style={styles.message}>
                        This password reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" style={styles.submitBtn}>
                        Request New Reset Link
                    </Link>
                    <div style={styles.footer}>
                        <Link to="/login" style={styles.backLink}>Back to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconBox}>*</div>
                <h2 style={styles.title}>Create New Password</h2>
                <p style={styles.subtitle}>
                    Enter your new password below.
                </p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            style={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        <label htmlFor="show-pwd" style={styles.checkboxLabel}>Show passwords</label>
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div style={styles.footer}>
                    <Link to="/login" style={styles.backLink}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: 20
    },
    card: {
        background: "#ffffff",
        padding: "40px 36px",
        borderRadius: 16,
        width: 420,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        textAlign: "center"
    },
    iconBox: {
        width: 64,
        height: 64,
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        color: "#fff",
        fontSize: 28,
        fontWeight: 700
    },
    successIcon: {
        width: 80,
        height: 80,
        background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        color: "#fff",
        fontSize: 40,
        fontWeight: 700
    },
    errorIcon: {
        width: 80,
        height: 80,
        background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        color: "#fff",
        fontSize: 40,
        fontWeight: 700
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        color: "#0f172a",
        margin: "0 0 12px 0"
    },
    subtitle: {
        color: "#64748b",
        fontSize: 14,
        margin: "0 0 24px 0",
        lineHeight: 1.6
    },
    message: {
        color: "#64748b",
        fontSize: 14,
        margin: "0 0 24px 0",
        lineHeight: 1.6
    },
    errorBox: {
        background: "#fef2f2",
        color: "#991b1b",
        padding: "12px 16px",
        borderRadius: 8,
        fontSize: 14,
        marginBottom: 20
    },
    formGroup: {
        marginBottom: 16,
        textAlign: "left"
    },
    label: {
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 500,
        color: "#334155"
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: 8,
        border: "none",
        fontSize: 15,
        boxSizing: "border-box",
        background: "#f1f5f9",
        color: "#0f172a",
        outline: "none"
    },
    checkboxRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: 20,
        justifyContent: "flex-start"
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
        outline: "none",
        textDecoration: "none",
        display: "block",
        textAlign: "center"
    },
    footer: {
        marginTop: 24
    },
    backLink: {
        color: "#3b82f6",
        fontSize: 14,
        fontWeight: 500
    }
};
