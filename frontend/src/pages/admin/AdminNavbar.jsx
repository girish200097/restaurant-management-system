import { Link, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar() {
    const navigate = useNavigate();

    return (
        <nav className="admin-navbar">

            <div className="admin-navbar-logo">
                🍽️ Restaurant Admin
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

            </div>

        </nav>
    );
}

export default AdminNavbar;