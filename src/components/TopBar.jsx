import React from 'react';
import { Search, LogOut } from 'lucide-react';

const TopBar = ({
    user,
    onLogout,
    searchTerm,
    onSearchChange,
    searchResults = [],
    showResults = false,
    setShowResults,
    onResultClick
}) => {
    return (
        <header style={styles.header}>
            <div style={styles.searchContainer}>
                {onSearchChange && (
                    <>
                        <Search size={18} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowResults && setShowResults(false), 200)}
                            onFocus={() => searchResults.length > 0 && setShowResults && setShowResults(true)}
                        />
                        {showResults && searchResults.length > 0 && (
                            <div style={styles.searchResults}>
                                {searchResults.map((r, i) => (
                                    <div
                                        key={i}
                                        style={styles.searchResultItem}
                                        onClick={() => onResultClick && onResultClick(r)}
                                    >
                                        <span style={styles.resultType}>{r.type}</span>
                                        <span style={styles.resultName}>{r.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div style={styles.headerRight}>
                <div style={styles.welcomeText}>
                    Welcome, <strong>{user?.name?.split(' ')[0]}</strong>
                </div>
                <button onClick={onLogout} style={styles.logoutBtn}>
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </header>
    );
};

const styles = {
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
    searchContainer: {
        position: "relative",
        width: 400
    },
    searchIcon: {
        position: "absolute",
        left: 14,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8"
    },
    searchInput: {
        width: "100%",
        padding: "12px 16px 12px 44px",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        fontSize: 14,
        background: "#f8fafc",
        color: "#0f172a",
        outline: "none",
        transition: "all 0.15s ease"
    },
    searchResults: {
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        right: 0,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        overflow: "hidden",
        zIndex: 1000
    },
    searchResultItem: {
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        transition: "background 0.1s",
        borderBottom: "1px solid #f1f5f9"
    },
    resultType: {
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        background: "#e2e8f0",
        color: "#64748b",
        padding: "3px 8px",
        borderRadius: 4
    },
    resultName: {
        fontSize: 14,
        color: "#0f172a",
        fontWeight: 500
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
        cursor: "pointer",
        transition: "all 0.15s ease"
    }
};

export default TopBar;
