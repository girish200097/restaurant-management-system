import { useEffect, useState } from "react";
import "./ManageUsers.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("all");

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(`${VITE_API_URL}/user/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setUsers(data.users || []);
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.log("Users error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users according to selected role
    const filteredUsers = users.filter((user) => {
        if (roleFilter === "all") {
            return true;
        }

        return user.role === roleFilter;
    });

    // Change user role
    const handleRoleChange = async (userId, role) => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${VITE_API_URL}/user/${userId}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        role,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.log(data.message);
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? { ...user, role }
                        : user
                )
            );

        } catch (error) {
            console.log("Role update error:", error);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this user?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${VITE_API_URL}/user/${userId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.log(data.message);
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (user) => user._id !== userId
                )
            );

        } catch (error) {
            console.log("Delete user error:", error);
        }
    };

    if (loading) {
        return (
            <div className="manage-users">
                <p className="users-loading">
                    Loading users...
                </p>
            </div>
        );
    }

    return (
        <div className="manage-users">

            {/* Header */}
            <div className="manage-users-header">

                <div>
                    <h1>Users</h1>
                    <p>Manage customers and waiters</p>
                </div>

                <div className="users-header-actions">

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(event) =>
                            setRoleFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All Roles
                        </option>

                        <option value="customer">
                            Customers
                        </option>

                        <option value="waiter">
                            Waiters
                        </option>

                        <option value="admin">
                            Admins
                        </option>
                    </select>

                    {/* Refresh */}
                    <button onClick={fetchUsers}>
                        Refresh
                    </button>

                </div>

            </div>

            {/* Users */}
            {filteredUsers.length === 0 ? (

                <div className="no-users">
                    <h3>No users found</h3>

                    <p>
                        No users match the selected role.
                    </p>
                </div>

            ) : (

                <div className="users-list">

                    {filteredUsers.map((user) => (

                        <div
                            className="user-card"
                            key={user._id}
                        >

                            {/* User Information */}
                            <div className="user-info">

                                <div className="user-name">
                                    <strong>Name</strong>

                                    <p>
                                        {user.name || "N/A"}
                                    </p>
                                </div>

                                <div className="user-email">
                                    <strong>Email</strong>

                                    <p>
                                        {user.email}
                                    </p>
                                </div>

                            </div>

                            {/* Role */}
                            <div className="user-role">

                                <strong>Role</strong>

                                {user.role === "admin" ? (

                                    <span className="admin-role">
                                        Admin
                                    </span>

                                ) : (

                                    <select
                                        value={user.role}
                                        onChange={(event) =>
                                            handleRoleChange(
                                                user._id,
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="customer">
                                            Customer
                                        </option>

                                        <option value="waiter">
                                            Waiter
                                        </option>

                                    </select>

                                )}

                            </div>

                            {/* Delete */}
                            {user.role !== "admin" && (

                                <button
                                    className="delete-user-btn"
                                    onClick={() =>
                                        handleDeleteUser(
                                            user._id
                                        )
                                    }
                                    title="Delete user"
                                >
                                    🗑️
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default ManageUsers;