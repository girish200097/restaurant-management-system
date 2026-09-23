import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

function AdminLayout() {
    return (
        <>
            <AdminNavbar />

            <main>
                <Outlet />
            </main>
        </>
    );
}

export default AdminLayout;