import { useEffect, useState } from "react";
import "./AdminMenu.css";
function AdminMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");

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

            <button
                className="add-menu-btn"
                onClick={() => setShowForm(true)}
            >
                + Add Menu Item
            </button>

            {showForm && (
    <div className="add-menu-form">

                <h2>Add Menu Item</h2>

                <input
                    type="text"
                    placeholder="Menu name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />

                <div className="add-menu-form-actions">
                    <button
                        className="save-menu-btn"
                        type="button"
                    >
                        Add Menu
                    </button>

                    <button
                        className="cancel-menu-btn"
                        type="button"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </button>
                </div>

            </div>
        )}

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