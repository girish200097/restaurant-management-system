import { useEffect, useState } from "react";
// import "./ManageTables.css";

function ManageTables() {

    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [tableNumber, setTableNumber] = useState("");

    const [editingTable, setEditingTable] = useState(null);

    const fetchTables = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/table`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to fetch tables");
                return;
            }

            setTables(data.tables || []);

        } catch (error) {
            console.log("Fetch tables error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleCreateTable = async () => {

        if (!tableNumber) {
            alert("Please enter table number");
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/table`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        tableNumber: Number(tableNumber),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to create table");
                return;
            }

            setTables((previousTables) => [
                ...previousTables,
                data.table,
            ]);

            setTableNumber("");
            setShowForm(false);

            alert("Table created successfully");

        } catch (error) {
            console.log("Create table error:", error);
            alert("Something went wrong");
        }
    };

    const handleEditTable = async () => {

        if (!tableNumber) {
            alert("Please enter table number");
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/table/${editingTable._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        tableNumber: Number(tableNumber),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update table");
                return;
            }

            setTables((previousTables) =>
                previousTables.map((table) =>
                    table._id === editingTable._id
                        ? data.table
                        : table
                )
            );

            setTableNumber("");
            setEditingTable(null);
            setShowForm(false);

            alert("Table updated successfully");

        } catch (error) {
            console.log("Edit table error:", error);
            alert("Something went wrong");
        }
    };

    const handleDeleteTable = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this table?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/table/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete table");
                return;
            }

            setTables((previousTables) =>
                previousTables.filter(
                    (table) => table._id !== id
                )
            );

            alert("Table deleted successfully");

        } catch (error) {
            console.log("Delete table error:", error);
            alert("Something went wrong");
        }
    };

    const handleStatusChange = async (id, status) => {

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/table/${id}/availability`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update status");
                return;
            }

            setTables((previousTables) =>
                previousTables.map((table) =>
                    table._id === id
                        ? data.table
                        : table
                )
            );

        } catch (error) {
            console.log("Status update error:", error);
            alert("Something went wrong");
        }
    };

    const openCreateForm = () => {
        setEditingTable(null);
        setTableNumber("");
        setShowForm(true);
    };

    const openEditForm = (table) => {
        setEditingTable(table);
        setTableNumber(table.tableNumber);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingTable(null);
        setTableNumber("");
    };

    return (
        <div className="manage-tables">

            <div className="manage-tables-header">
                <h1>Tables Management</h1>

                <button
                    className="add-table-btn"
                    onClick={openCreateForm}
                >
                    + Add Table
                </button>
            </div>

            {loading ? (
                <p className="tables-loading">
                    Loading tables...
                </p>
            ) : tables.length === 0 ? (
                <p className="no-tables">
                    No tables found
                </p>
            ) : (
                <div className="tables-list">

                    {tables.map((table) => (

                        <div
                            className="table-card"
                            key={table._id}
                        >

                            <div className="table-info">
                                <h3>
                                    Table {table.tableNumber}
                                </h3>
                            </div>

                            <div className="table-status">
                                <select
                                    value={table.status}
                                    onChange={(event) =>
                                        handleStatusChange(
                                            table._id,
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="occupied">
                                        Occupied
                                    </option>

                                    <option value="reserved">
                                        Reserved
                                    </option>
                                </select>
                            </div>

                            <div className="table-actions">

                                <button
                                    className="edit-table-btn"
                                    onClick={() =>
                                        openEditForm(table)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="delete-table-btn"
                                    onClick={() =>
                                        handleDeleteTable(
                                            table._id
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>
            )}

            {showForm && (

                <div className="table-form-overlay">

                    <div className="table-form">

                        <h2>
                            {editingTable
                                ? "Edit Table"
                                : "Add Table"}
                        </h2>

                        <input
                            type="number"
                            placeholder="Table Number"
                            value={tableNumber}
                            onChange={(event) =>
                                setTableNumber(
                                    event.target.value
                                )
                            }
                        />

                        <div className="table-form-actions">

                            <button
                                className="save-table-btn"
                                onClick={
                                    editingTable
                                        ? handleEditTable
                                        : handleCreateTable
                                }
                            >
                                {editingTable
                                    ? "Update Table"
                                    : "Add Table"}
                            </button>

                            <button
                                className="cancel-table-btn"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default ManageTables;