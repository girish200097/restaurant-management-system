import { useEffect, useRef, useState } from "react";
import "./AdminMenu.css";
import imageCompression from "browser-image-compression";

function AdminMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [compressionQuality, setCompressionQuality] = useState("medium");
    const [isCompressing, setIsCompressing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const [selectedMenuIds, setSelectedMenuIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const longPressTimer = useRef(null);

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
    setOriginalImage(selectedImage);
  }
};

useEffect(() => {
  if (!originalImage) return;

  let cancelled = false;

  const compressImage = async () => {
    setIsCompressing(true);

    const compressionOptions = {
      high: {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        initialQuality: 0.8,
        useWebWorker: true,
      },
      medium: {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1400,
        initialQuality: 0.6,
        useWebWorker: true,
      },
      low: {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        initialQuality: 0.4,
        useWebWorker: true,
      },
    };

    try {
      const compressedImage = await imageCompression(
        originalImage,
        compressionOptions[compressionQuality]
      );

      if (!cancelled) {
        setImage(compressedImage);
      }
    } catch (error) {
      console.error("Image compression failed:", error);

      if (!cancelled) {
        setImage(originalImage);
      }
    } finally {
      if (!cancelled) {
        setIsCompressing(false);
      }
    }
  };

  compressImage();

  return () => {
    cancelled = true;
  };
}, [originalImage, compressionQuality]);

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

//handleMenuSelection
const handleMenuSelection = (id) => {
    setSelectedMenuIds((previousIds) => {
        if (previousIds.includes(id)) {
            const updatedIds = previousIds.filter(
                (selectedId) => selectedId !== id
            );

            if (updatedIds.length === 0) {
                setSelectionMode(false);
            }

            return updatedIds;
        }

        return [...previousIds, id];
    });
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


const handleBulkDeleteMenu = async () => {
    if (selectedMenuIds.length === 0) return;

    const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedMenuIds.length} menu items?`
    );

    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("adminToken");

        const results = await Promise.all(
            selectedMenuIds.map((id) =>
                fetch(`${import.meta.env.VITE_API_URL}/menu/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            )
        );

        const failed = results.filter((response) => !response.ok);

        const deletedIds = selectedMenuIds.filter(
            (_, index) => results[index].ok
        );

        setMenuItems((previousItems) =>
            previousItems.filter((item) => !deletedIds.includes(item._id))
        );

        setSelectedMenuIds([]);
        setSelectionMode(false);

        if (failed.length > 0) {
            alert(`${deletedIds.length} items deleted. ${failed.length} items failed.`);
        } else {
            alert(`${deletedIds.length} menu items deleted successfully.`);
        }
    } catch (error) {
        console.error("Bulk delete error:", error);
        alert("Something went wrong while deleting menu items.");
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


const handleFoodTypeChange = async (id, foodType) => {
    try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/menu/${id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ foodType }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to update food type");
            return;
        }

        setMenuItems((previousItems) =>
            previousItems.map((item) =>
                item._id === id ? data.menu : item
            )
        );
    } catch (error) {
        console.error("Food type update error:", error);
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

            
        
        {selectionMode && selectedMenuIds.length > 0 && (
            <button
                className="bulk-delete-floating-btn"
                onClick={handleBulkDeleteMenu}
            >
                🗑️ Delete Selected ({selectedMenuIds.length})
            </button>
        )}


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

                    <div className="image-compression-options">
                        <label>Image Quality</label>

                        <select
                            value={compressionQuality}
                            onChange={(e) => setCompressionQuality(e.target.value)}
                            disabled={!originalImage || isCompressing}
                        >
                            <option value="high">
                            High Quality — Less Compression
                            </option>

                            <option value="medium">
                            Medium Quality — More Compression
                            </option>

                            <option value="low">
                            Low Quality — Maximum Compression
                            </option>
                        </select>

                        {isCompressing && <p>Compressing image...</p>}
                        </div>

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
                                            } ${selectedMenuIds.includes(item._id) ? "menu-selected" : ""}`}
                                            key={item._id}
                                            onClick={(e) => {
                                                if (e.ctrlKey || e.metaKey || selectionMode) {
                                                    e.preventDefault();
                                                    handleMenuSelection(item._id);
                                                }
                                            }}
                                            onTouchStart={() => {
                                                longPressTimer.current = setTimeout(() => {
                                                    setSelectionMode(true);
                                                    handleMenuSelection(item._id);
                                                }, 500);
                                            }}
                                            onTouchEnd={() => clearTimeout(longPressTimer.current)}
                                            onTouchMove={() => clearTimeout(longPressTimer.current)}
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
                                        Not Available
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
                                        setPrice(item.price);
                                        setCategory(item.category);
                                        setImage(null);
                                        setShowForm(true);
                                    }}
                                >
                                    Edit
                                </button>

                                <div className="menu-food-type-control">
                                    <span className="food-type-label">
                                        {item.foodType === "non-veg" ? "Non-Veg" : "Veg"}
                                    </span>

                                    <button
                                        type="button"
                                        className={`food-type-toggle ${
                                            item.foodType === "non-veg" ? "non-veg" : "veg"
                                        }`}
                                        role="switch"
                                        aria-checked={item.foodType === "non-veg"}
                                        aria-label={`Change ${item.name} food type`}
                                        onClick={() =>
                                            handleFoodTypeChange(
                                                item._id,
                                                item.foodType === "non-veg" ? "veg" : "non-veg"
                                            )
                                        }
                                    >
                                        <span className="food-type-toggle-knob"></span>
                                    </button>
                                </div>

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