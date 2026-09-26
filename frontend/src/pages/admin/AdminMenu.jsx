import { useEffect, useRef, useState } from "react";
import "./AdminMenu.css";

function AdminMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

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

    const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage) {
        setImage(selectedImage);
    }
};

const handleAddMenu = async () => {
    try {
        const token = localStorage.getItem("adminToken");

        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);

        if (image) {
            formData.append("image", image);
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/admin/menu`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const data = await response.json();

        console.log("ADD MENU RESPONSE:", data);

        if (!response.ok) {
            alert(data.message || "Failed to add menu");
            return;
        }

        setMenuItems((previousItems) => [
            ...previousItems,
            data.menu,
        ]);

        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImage(null);
        setShowForm(false);

        alert("Menu item added successfully");
    } catch (error) {
        console.log("Add menu error:", error);
        alert("Something went wrong");
    }
};

const handleEditMenu = async () => {
    try {
        const token = localStorage.getItem("adminToken");

        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);

        if (image) {
            formData.append("image", image);
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/menu/${editingItem._id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const data = await response.json();

        console.log("EDIT MENU RESPONSE:", data);

        if (!response.ok) {
            alert(data.message || "Failed to update menu");
            return;
        }

        setMenuItems((previousItems) =>
            previousItems.map((item) =>
                item._id === editingItem._id
                    ? data.menu
                    : item
            )
        );

        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImage(null);
        setEditingItem(null);
        setShowForm(false);

        alert("Menu item updated successfully");
    } catch (error) {
        console.log("Edit menu error:", error);
        alert("Something went wrong");
    }
};

const handleDeleteMenu = async (id) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this menu item?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/menu/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        console.log("DELETE MENU RESPONSE:", data);

        if (!response.ok) {
            alert(data.message || "Failed to delete menu");
            return;
        }

        setMenuItems((previousItems) =>
            previousItems.filter((item) => item._id !== id)
        );

        alert("Menu item deleted successfully");
    } catch (error) {
        console.log("Delete menu error:", error);
        alert("Something went wrong");
    }
};

const handleAvailabilityChange = async (id, value) => {
    try {
        const token = localStorage.getItem("adminToken");

        const isAvailable = value === "available";

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/menu/${id}/availability`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isAvailable,
                }),
            }
        );

        const data = await response.json();

        console.log("AVAILABILITY RESPONSE:", data);

        if (!response.ok) {
            alert(data.message || "Failed to update status");
            return;
        }

        setMenuItems((previousItems) =>
            previousItems.map((item) =>
                item._id === id
                    ? data.menu
                    : item
            )
        );
    } catch (error) {
        console.log("Availability update error:", error);
        alert("Something went wrong");
    }
};

const handleMouseDown = (e) => {
    setIsDragging(true);

    dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
    };
};

const handleMouseMove = (e) => {
    if (!isDragging) return;

    setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
    });
};

const handleMouseUp = () => {
    setIsDragging(false);
};
    return (
        <div className="admin-menu">
            <h1>Menu Management</h1>

            <button
                className="add-menu-btn"
                onClick={() => {
                    setPosition({ x: 0, y: 0 });
                    setShowForm(true);
                }}
            >
                + Add Menu Item
            </button>

            {showForm && (
    <div
        className="add-menu-form"
        style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
    >
        <div
            className="menu-form-header"
            onMouseDown={handleMouseDown}
        >
            <h2>
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <span className="drag-hint">
                ⋮⋮
            </span>
        </div>

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

               <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    <option value="Starter">Starter</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                </select>

               <div className="image-upload">

                    <label htmlFor="menu-image" className="image-upload-box">
                        {image ? (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Menu preview"
                                className="image-preview"
                            />
                        ) : (
                            <>
                                <span className="image-plus">+</span>
                                <span>Add Image</span>
                            </>
                        )}
                    </label>

                    <input
                        id="menu-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                    />

                </div>

                <div className="add-menu-form-actions">
                  <button
                    className="save-menu-btn"
                    type="button"
                    onClick={editingItem ? handleEditMenu : handleAddMenu}
                >
                    {editingItem ? "Update Menu" : "Add Menu"}
                </button>

                    <button
                        className="cancel-menu-btn"
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setEditingItem(null);
                            setName("");
                            setDescription("");
                            setPrice("");
                            setCategory("");
                            setImage(null);
                        }}
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
                                        <div
                    className={`admin-menu-card ${
                        !item.isAvailable ? "menu-not-available" : ""
                    }`}
                    key={item._id}
                >
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

                                <div className="menu-status-control">
                                    <select
                                    value={item.isAvailable ? "available" : "unavailable"}
                                    onChange={(e) =>
                                        handleAvailabilityChange(
                                            item._id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="unavailable">
                                       Currently Not Available
                                    </option>
                                </select>
                                </div>

                             <div className="admin-menu-actions">
                                <button
                                    className="edit-menu-btn"
                                    onClick={() => {
                                        setEditingItem(item);
                                        setPosition({ x: 0, y: 0 });
                                        setName(item.name);
                                        setDescription(item.description);
                                        setPrice(item.price);
                                        setCategory(item.category);
                                        setImage(null);
                                        setShowForm(true);
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    className="delete-menu-btn"
                                    onClick={() => handleDeleteMenu(item._id)}
                                >
                                    Delete
                                </button>
                            </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminMenu;