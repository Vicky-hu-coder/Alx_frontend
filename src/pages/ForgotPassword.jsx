import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError("Failed to send reset link. Please try again.");
        }
        setLoading(false);
    };

    if (sent) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={styles.title}>Check Your Email</h2>
                    <p style={styles.message}>
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p style={styles.submessage}>
                        Click the link in the email to reset your password.
                        If you don't see it, check your spam folder.
                    </p>
                    <button style={styles.resendBtn} onClick={() => setSent(false)}>
                        Send to a different email
                    </button>
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
                <div style={styles.iconBox}>?</div>
                <h2 style={styles.title}>Forgot Password?</h2>
                <p style={styles.subtitle}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
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
        color: "#0f172a",
        fontSize: 15,
        margin: "0 0 8px 0"
    },
    submessage: {
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
        marginBottom: 20,
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
    resendBtn: {
        padding: "12px 24px",
        background: "#f1f5f9",
        color: "#334155",
        border: "none",
        borderRadius: 8,
        fontWeight: 500,
        fontSize: 14,
        cursor: "pointer",
        outline: "none"
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
