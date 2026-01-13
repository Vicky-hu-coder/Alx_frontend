import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Sidebar = ({ menuGroups, user }) => {
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
        <aside style={styles.sidebar}>
            <div style={styles.logo}>
                <div style={styles.logoIcon}>
                    <Zap size={20} />
                </div>
                <span style={styles.logoText}>E-Billing</span>
            </div>

            <div style={styles.scrollArea}>
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} style={styles.navSection}>
                        {group.label && <div style={styles.navLabel}>{group.label}</div>}
                        <nav>
                            {group.items.map((item, itemIndex) => (
                                <NavLink key={itemIndex} to={item.path} style={navLinkStyle}>
                                    {item.icon && <item.icon size={18} />}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                ))}
            </div>

            <div style={styles.sidebarFooter}>
                <div style={styles.userCard}>
                    <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.name || 'User'}</div>
                        <div style={styles.userRole}>{user?.roles?.[0]?.replace('ROLE_', '') || 'User'}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: 260,
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        zIndex: 100,
        left: 0,
        top: 0
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
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
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
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
        paddingTop: 16
    },
    navSection: {
        padding: "0 12px 16px"
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
        background: "rgba(255,255,255,0.05)",
        borderRadius: 12
    },
    avatar: {
        width: 40,
        height: 40,
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 600
    },
    userInfo: {
        flex: 1,
        overflow: 'hidden'
    },
    userName: {
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    userRole: {
        fontSize: 12,
        color: "rgba(255,255,255,0.5)"
    }
};

export default Sidebar;
