import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {

    const [users, setUsers] = useState(0);
    const [menus, setMenus] = useState(0);
    const [tables, setTables] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("adminToken");

                const [usersResponse, menuResponse, tableResponse] =
                    await Promise.all([
                        fetch(
                            `${import.meta.env.VITE_API_URL}/user/users`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        ),

                        fetch(
                            `${import.meta.env.VITE_API_URL}/menu`
                        ),

                        fetch(
                            `${import.meta.env.VITE_API_URL}/admin/table`
                        ),
                    ]);

                const usersData = await usersResponse.json();
                const menuData = await menuResponse.json();
                const tableData = await tableResponse.json();

                setUsers(usersData.users?.length || 0);
                setMenus(menuData.menus?.length || 0);
                setTables(tableData.tables?.length || 0);

            } catch (error) {
                console.log("Dashboard error:", error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="admin-dashboard">

            <h1>Admin Dashboard</h1>

            <div className="dashboard-cards">

                <div
                    className="dashboard-card"
                    onClick={() => navigate("/admin/menu")}
                >
                    <h3>Menu</h3>
                    <p>{menus} Menu Items</p>
                </div>

                <div
                    className="dashboard-card"
                    onClick={() => navigate("/admin/tables")}
                >
                    <h3>Tables</h3>
                    <p>{tables} Tables</p>
                </div>

                <div className="dashboard-card"
                    onClick={() => navigate("/admin/orders")}
                >
                    <h3>Orders</h3>
                    <p>Manage customer orders</p>
                </div>

               <div
                className="dashboard-card"
                onClick={() => navigate("/admin/users")}
            >
                <h3>Users</h3>
                <p>{users} Customers</p>
            </div>

                <div
                    className="dashboard-card"
                    onClick={() => navigate("/admin/payments")}
                >
                    <h3>Payments</h3>
                    <p>View payments</p>
                </div>

                <div
                    className="dashboard-card"
                    onClick={() => navigate("/admin/dineout-orders")}
                >
                    <h3>Dine-Out Orders</h3>
                    <p>Manage delivery and takeaway orders</p>
                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;