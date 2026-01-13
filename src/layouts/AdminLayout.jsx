import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import api from "../api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import {
    LayoutDashboard,
    Users,
    UserCircle,
    Receipt,
    CreditCard,
    Gauge
} from "lucide-react";

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        try {
            const [customersRes, usersRes, billsRes] = await Promise.all([
                api.get(`/customers?search=${term}&size=5`).catch(() => ({ data: { content: [] } })),
                api.get(`/users?search=${term}&size=5`).catch(() => ({ data: { content: [] } })),
                api.get(`/bills?size=5`).catch(() => ({ data: { content: [] } }))
            ]);

            const results = [
                ...(customersRes.data.content || []).map(c => ({ type: 'Customer', name: c.name, id: c.id, path: '/admin/customers' })),
                ...(usersRes.data.content || []).map(u => ({ type: 'User', name: `${u.firstName} ${u.lastName}`, id: u.id, path: '/admin/users' })),
                ...(billsRes.data.content || []).slice(0, 3).map(b => ({ type: 'Bill', name: `Bill #${b.id}`, id: b.id, path: '/admin/bills' }))
            ];
            setSearchResults(results);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleResultClick = (result) => {
        navigate(result.path);
        setShowResults(false);
        setSearchTerm('');
    };

    const menuGroups = [
        {
            label: "Main Menu",
            items: [
                { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
                { label: "Customers", path: "/admin/customers", icon: UserCircle },
                { label: "Bills", path: "/admin/bills", icon: Receipt },
                { label: "Payments", path: "/admin/payments", icon: CreditCard },
                { label: "Meters", path: "/admin/meters", icon: Gauge },
            ]
        },
        {
            label: "Administration",
            items: [
                { label: "User Management", path: "/admin/users", icon: Users }
            ]
        }
    ];

    return (
        <div style={styles.container}>
            <Sidebar menuGroups={menuGroups} user={user} />

            <div style={styles.main}>
                <TopBar
                    user={user}
                    onLogout={logout}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    searchResults={searchResults}
                    showResults={showResults}
                    setShowResults={setShowResults}
                    onResultClick={handleResultClick}
                />

                <main style={styles.content}>
                    <Outlet />
                </main>

                <Footer />
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
    main: {
        flex: 1,
        marginLeft: 260,
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        minHeight: "100vh"
    },
    content: {
        flex: 1,
        padding: 32
    }
};

