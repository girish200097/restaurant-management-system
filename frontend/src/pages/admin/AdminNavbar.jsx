import { Link, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function AdminNavbar() {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useContext(AuthContext);

    const [adminName, setAdminName] = useState("Admin");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    return;
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/user/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (response.ok && data.user?.name) {
                    setAdminName(data.user.name);
                }
            } catch (error) {
                console.log("Failed to fetch admin profile:", error);
            }
        };

        fetchAdminProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("profileCompleted");
        localStorage.removeItem("adminToken");

        setIsLoggedIn(false);

        navigate("/login", { replace: true });
    };

    return (
        <nav className="admin-navbar">

            <Link to="/admin/dashboard" className="admin-navbar-logo">
                🍽️
            </Link>

            <button
    className="admin-mobile-menu-btn"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
>
    {isMenuOpen ? "✕ Close" : "☰ Menu"}
</button>

<div
    className={`admin-navbar-links ${
        isMenuOpen ? "mobile-menu-open" : ""
    }`}
>
    <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
        Dashboard
    </Link>

    <Link to="/admin/menu" onClick={() => setIsMenuOpen(false)}>
        Menu
    </Link>

    <Link to="/admin/tables" onClick={() => setIsMenuOpen(false)}>
        Tables
    </Link>

    <Link to="/admin/orders" onClick={() => setIsMenuOpen(false)}>
        Orders
    </Link>

    <Link to="/admin/users" onClick={() => setIsMenuOpen(false)}>
        Users
    </Link>

    <Link to="/admin/payments" onClick={() => setIsMenuOpen(false)}>
        Payments
    </Link>
</div>

            <div className="admin-navbar-actions">

                <button>
                    👤 {adminName}
                </button>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default AdminNavbar;