import "./AdminDashboard.css";

function AdminDashboard() {
    return (
        <div className="admin-dashboard">

            <h1>Admin Dashboard</h1>

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <h3>Menu</h3>
                    <p>Manage menu items</p>
                </div>

                <div className="dashboard-card">
                    <h3>Tables</h3>
                    <p>Manage restaurant tables</p>
                </div>

                <div className="dashboard-card">
                    <h3>Orders</h3>
                    <p>Manage customer orders</p>
                </div>

                <div className="dashboard-card">
                    <h3>Users</h3>
                    <p>View customers</p>
                </div>

                <div className="dashboard-card">
                    <h3>Payments</h3>
                    <p>View payments</p>
                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;