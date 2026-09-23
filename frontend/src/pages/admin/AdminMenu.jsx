import { useEffect, useState } from "react";
import "./AdminMenu.css";

function AdminMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/menu`
                );

                const data = await response.json();

                console.log("ADMIN MENU:", data);

                if (response.ok) {
                    setMenuItems(data.menus || []);
                }
            } catch (error) {
                console.log("Error fetching menu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    return (
        <div className="admin-menu">
            <h1>Menu Management</h1>

            <button className="add-menu-btn">
                + Add Menu Item
            </button>

            {loading ? (
                <p className="menu-loading">Loading menu...</p>
            ) : (
                <div className="admin-menu-grid">
                    {menuItems.map((item) => (
                        <div className="admin-menu-card" key={item._id}>
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="admin-menu-image"
                                />
                            )}

                            <div className="admin-menu-content">
                                <h3>{item.name}</h3>

                                <p className="admin-menu-category">
                                    {item.category}
                                </p>

                                <p className="admin-menu-price">
                                    ₹{item.price}
                                </p>

                                <p>
                                    {item.description}
                                </p>

                                <p>
                                    Status:{" "}
                                    {item.isAvailable
                                        ? "Available"
                                        : "Unavailable"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminMenu;