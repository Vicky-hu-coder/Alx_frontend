import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import LocationSelector from "../components/LocationSelector";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        locationId: null,
        password: "",
        confirmPassword: "",
        role: "CUSTOMER"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/register", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                locationId: formData.locationId,
                password: formData.password,
                role: formData.role
            });

            if (response.data.otpRequired) {
                sessionStorage.setItem("pendingEmail", formData.email);
                navigate("/otp");
            }
        } catch (err) {
            setError(err.response?.data || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isCustomer = formData.role === "CUSTOMER";

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>E</div>
                    <h1 style={styles.logoText}>E-Billing</h1>
                    <p style={styles.subtitle}>Create your account</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>First Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Last Name</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Account Type</label>
                        <select style={styles.input} name="role" value={formData.role} onChange={handleChange}>
                            <option value="CUSTOMER">Customer - Personal electricity account</option>
                            <option value="EMPLOYEE">Employee - Staff member</option>
                            <option value="ADMIN">Administrator - Full system access</option>
                        </select>
                    </div>

                    {isCustomer && (
                        <>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    style={styles.input}
                                    type="tel"
                                    name="phone"
                                    placeholder="07X XXX XXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Location</label>
                                <LocationSelector
                                    onLocationSelect={(id) => setFormData({ ...formData, locationId: id })}
                                />
                            </div>
                            <div style={styles.infoBox}>
                                <strong>Note:</strong> As a customer, you will automatically be assigned a new electricity meter upon registration.
                            </div>
                        </>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            style={styles.input}
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            id="show-pwd-register"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            style={styles.checkbox}
                        />
                        <label htmlFor="show-pwd-register" style={styles.checkboxLabel}>
                            Show password
                        </label>
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div style={styles.footer}>
                    Already have an account?{" "}
                    <Link to="/login" style={styles.loginLink}>Sign In</Link>
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
        width: 480,
        background: "#ffffff",
        padding: "36px",
        borderRadius: 16,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    },
    logoSection: {
        textAlign: "center",
        marginBottom: 28
    },
    logoIcon: {
        width: 48,
        height: 48,
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        borderRadius: 12,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 700,
        color: "#fff",
        marginBottom: 12
    },
    logoText: {
        fontSize: 22,
        fontWeight: 700,
        color: "#0f172a",
        margin: "0 0 6px 0"
    },
    subtitle: {
        color: "#64748b",
        fontSize: 14,
        margin: 0
    },
    errorBox: {
        background: "#fef2f2",
        color: "#991b1b",
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 14
    },
    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 0
    },
    formGroup: {
        marginBottom: 16
    },
    label: {
        display: "block",
        marginBottom: 6,
        fontSize: 13,
        fontWeight: 500,
        color: "#334155"
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 8,
        border: "none",
        fontSize: 14,
        color: "#0f172a",
        background: "#f1f5f9",
        boxSizing: "border-box",
        outline: "none"
    },
    infoBox: {
        background: "#eff6ff",
        color: "#1e40af",
        padding: "12px 14px",
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 13
    },
    checkboxRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: 20
    },
    checkbox: {
        marginRight: 8,
        width: 16,
        height: 16
    },
    checkboxLabel: {
        fontSize: 13,
        color: "#64748b",
        cursor: "pointer"
    },
    submitBtn: {
        width: "100%",
        padding: "13px",
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer"
    },
    footer: {
        marginTop: 24,
        textAlign: "center",
        fontSize: 14,
        color: "#64748b"
    },
    loginLink: {
        color: "#3b82f6",
        fontWeight: 600
    }
};
