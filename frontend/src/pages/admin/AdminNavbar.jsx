import { Link, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function AdminNavbar() {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useContext(AuthContext);

    const [adminName, setAdminName] = useState("Admin");

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