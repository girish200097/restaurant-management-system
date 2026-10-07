import { Link, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function AdminNavbar() {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useContext(AuthContext);

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

            <div className="admin-navbar-logo">
                🍽️
            </div>

            <div className="admin-navbar-links">

                <Link to="/admin/dashboard">
                    Dashboard
                </Link>

                <Link to="/admin/menu">
                    Menu
                </Link>

                <Link to="/admin/tables">
                    Tables
                </Link>

                <Link to="/admin/orders">
                    Orders
                </Link>

                <Link to="/admin/users">
                    Users
                </Link>

                <Link to="/admin/payments">
                    Payments
                </Link>

            </div>

            <div className="admin-navbar-actions">

                <button
                    onClick={() => navigate("/admin/profile")}
                >
                    👤 Admin
                </button>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default AdminNavbar;