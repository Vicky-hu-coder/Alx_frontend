import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
    LayoutDashboard,
    Receipt,
    CreditCard,
    Gauge,
    Zap,
    User,
    LogOut
} from "lucide-react";

export default function CustomerLayout() {
    const { user, logout } = useAuth();

    const navLinkStyle = ({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 10,
        marginBottom: 4,
        background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
        color: "#ffffff",
        fontSize: 14,
        fontWeight: isActive ? 500 : 400,
        transition: "all 0.15s ease",
        textDecoration: "none",
        border: "none"
    });

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <Zap size={20} />
                    </div>
                    <span style={styles.logoText}>E-Billing</span>
                </div>

                <div style={styles.navSection}>
                    <div style={styles.navLabel}>My Account</div>
                    <nav>
                        <NavLink to="/customer/dashboard" style={navLinkStyle}>
                            <LayoutDashboard size={18} /> Dashboard
                        </NavLink>
                        <NavLink to="/customer/my-bills" style={navLinkStyle}>
                            <Receipt size={18} /> My Bills
                        </NavLink>
                        <NavLink to="/customer/my-payments" style={navLinkStyle}>
                            <CreditCard size={18} /> My Payments
                        </NavLink>
                        <NavLink to="/customer/my-meter" style={navLinkStyle}>
                            <Gauge size={18} /> My Meter
                        </NavLink>
                    </nav>
                </div>

                <div style={styles.navSection}>
                    <div style={styles.navLabel}>Services</div>
                    <nav>
                        <NavLink to="/customer/request-watts" style={navLinkStyle}>
                            <Zap size={18} /> Request Service
                        </NavLink>
                        <NavLink to="/customer/profile" style={navLinkStyle}>
                            <User size={18} /> My Profile
                        </NavLink>
                    </nav>
                </div>

                <div style={styles.sidebarFooter}>
                    <div style={styles.userCard}>
                        <div style={styles.avatar}>{user?.name?.charAt(0) || 'C'}</div>
                        <div style={styles.userInfo}>
                            <div style={styles.userName}>{user?.name}</div>
                            <div style={styles.userRole}>Customer Account</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div style={styles.main}>
                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>Customer Portal</h1>
                    </div>

                    <div style={styles.headerRight}>
                        <div style={styles.welcomeText}>
                            Welcome, <strong>{user?.name?.split(' ')[0]}</strong>
                        </div>
                        <button onClick={logout} style={styles.logoutBtn}>
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={styles.content}>
                    <Outlet />
                </main>

                {/* Footer */}
                <footer style={styles.footer}>
                    E-Billing System © 2025 — Customer Portal
                </footer>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    sidebar: {
        width: 260,
        background: "linear-gradient(180deg, #064e3b 0%, #047857 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        zIndex: 100
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
    },
    logoIcon: {
        width: 40,
        height: 40,
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    logoText: {
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: -0.5
    },
    navSection: {
        padding: "16px 12px 8px"
    },
    navLabel: {
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "rgba(255,255,255,0.4)",
        padding: "8px 16px",
        marginBottom: 4
    },
    sidebarFooter: {
        marginTop: "auto",
        padding: 16,
        borderTop: "1px solid rgba(255,255,255,0.08)"
    },
    userCard: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 12
    },
    avatar: {
        width: 40,
        height: 40,
        background: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 600
    },
    userInfo: {
        flex: 1
    },
    userName: {
        fontSize: 14,
        fontWeight: 600
    },
    userRole: {
        fontSize: 12,
        color: "rgba(255,255,255,0.5)"
    },
    main: {
        flex: 1,
        marginLeft: 260,
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        minHeight: "100vh"
    },
    header: {
        background: "#ffffff",
        padding: "16px 32px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: 600,
        color: "#0f172a",
        margin: 0
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 24
    },
    welcomeText: {
        fontSize: 14,
        color: "#64748b"
    },
    logoutBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        background: "#fef2f2",
        color: "#dc2626",
        borderRadius: 10,
        fontWeight: 500,
        fontSize: 13,
        border: "none",
        cursor: "pointer"
    },
    content: {
        flex: 1,
        padding: 32
    },
    footer: {
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        padding: 20,
        textAlign: "center",
        fontSize: 13,
        color: "#64748b"
    }
};
