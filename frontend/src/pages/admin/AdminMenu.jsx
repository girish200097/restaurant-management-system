// import "./AdminMenu.css";

function AdminMenu() {
    return (
        <div className="admin-menu">
            <h1>Menu Management</h1>

            <button className="add-menu-btn">
                + Add Menu Item
            </button>

            <div className="admin-menu-list">
                <p>Menu items will appear here.</p>
            </div>
        </div>
    );
}

export default AdminMenu;