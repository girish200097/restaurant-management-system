import { useEffect, useRef, useState } from "react";
import "./ManageOrders.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchOrder, setSearchOrder] = useState("");
    const [searchType, setSearchType] = useState("all");
    const [showSearchFilters, setShowSearchFilters] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const longPressTimer = useRef(null);
    const suppressNextClick = useRef(false);
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(`${VITE_API_URL}/order`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setOrders(data.orders || []);
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.log("Orders error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(fetchOrders, 2000);

        return () => clearInterval(interval);
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrder(
            expandedOrder === orderId ? null : orderId
        );
    };

    const handleOrderSelection = (orderId) => {
    setSelectedOrderIds((previousIds) => {
        if (previousIds.includes(orderId)) {
            const updatedIds = previousIds.filter(
                (id) => id !== orderId
            );

            if (updatedIds.length === 0) {
                setSelectionMode(false);
            }

            return updatedIds;
        }

        return [...previousIds, orderId];
    });
};

    const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this order?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
            `${VITE_API_URL}/order/${orderId}`,
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

        // Remove deleted order from the current list
        setOrders((currentOrders) =>
            currentOrders.filter(
                (order) => order._id !== orderId
            )
        );

        // Close the expanded order
        setExpandedOrder(null);

    } catch (error) {
        console.log("Delete order error:", error);
    }
};


const handleBulkDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) return;

    const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedOrderIds.length} orders?`
    );

    if (!confirmed) return;

    try {
        const token = localStorage.getItem("adminToken");

        const results = await Promise.all(
            selectedOrderIds.map((id) =>
                fetch(`${VITE_API_URL}/order/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            )
        );

        const deletedIds = selectedOrderIds.filter(
            (_, index) => results[index].ok
        );

        const failedCount = results.filter(
            (response) => !response.ok
        ).length;

        setOrders((previousOrders) =>
            previousOrders.filter(
                (order) => !deletedIds.includes(order._id)
            )
        );

        setSelectedOrderIds([]);
        setSelectionMode(false);
        setExpandedOrder(null);

        if (failedCount > 0) {
            alert(
                `${deletedIds.length} orders deleted. ${failedCount} orders failed.`
            );
        } else {
            alert(`${deletedIds.length} orders deleted successfully.`);
        }
    } catch (error) {
        console.error("Bulk delete orders error:", error);
        alert("Something went wrong while deleting orders.");
    }
};

    // Filter and sort orders
const filteredOrders = orders
    .filter((order) => {
        const query = searchOrder.trim().toLowerCase();

        const orderId = order._id?.toLowerCase() || "";
        const tableNumber = String(
            order.table?.tableNumber ?? ""
        ).toLowerCase();
        const customerName = order.customer?.name?.toLowerCase() || "";
        const waiterName = order.waiter?.name?.toLowerCase() || "";

        const matchesSearch = !query || (
            searchType === "orderId"
                ? orderId.includes(query)
                : searchType === "table"
                ? tableNumber.includes(query) ||
                  `t${tableNumber}`.includes(query)
                : searchType === "customer"
                ? customerName.includes(query)
                : searchType === "waiter"
                ? waiterName.includes(query)
                : orderId.includes(query) ||
                  tableNumber.includes(query) ||
                  `t${tableNumber}`.includes(query) ||
                  customerName.includes(query) ||
                  waiterName.includes(query)
        );

        const matchesStatus =
            statusFilter === "all" ||
            order.orderStatus === statusFilter;

        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        if (
            a.orderStatus === "completed" &&
            b.orderStatus !== "completed"
        ) {
            return 1;
        }

        if (
            a.orderStatus !== "completed" &&
            b.orderStatus === "completed"
        ) {
            return -1;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (loading) {
        return (
            <div className="manage-orders">
                <p className="orders-loading">Loading orders...</p>
            </div>
        );
    }

    return (
<div className="manage-orders">

        {selectionMode && selectedOrderIds.length > 0 && (
                <button
                    type="button"
                    className="bulk-delete-orders-btn"
                    onClick={handleBulkDeleteOrders}
                >
                    🗑️ Delete Selected ({selectedOrderIds.length})
                </button>
            )}
    <div className="manage-orders-header">
    <div className="orders-search-wrapper">
        <div className="orders-search">
            <span className="orders-search-icon">⌕</span>

            <input
                type="text"
                value={searchOrder}
                onChange={(event) => setSearchOrder(event.target.value)}
                placeholder={
                    searchType === "orderId"
                        ? "Search order ID..."
                        : searchType === "table"
                        ? "Search table (T1, T2...)"
                        : searchType === "customer"
                        ? "Search customer..."
                        : searchType === "waiter"
                        ? "Search waiter..."
                        : "Search orders..."
                }
                aria-label="Search orders"
            />

            {searchOrder && (
                <button
                    type="button"
                    className="clear-order-search"
                    onClick={() => setSearchOrder("")}
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}

            <button
                type="button"
                className="search-filter-btn"
                onClick={() => setShowSearchFilters((open) => !open)}
                aria-label="Choose search field"
                aria-expanded={showSearchFilters}
                title="Choose search field"
            >
                ☷
            </button>
        </div>

        {showSearchFilters && (
            <div className="search-filter-dropdown">
                {[
                    { value: "all", label: "All fields" },
                    { value: "orderId", label: "Order ID" },
                    { value: "table", label: "Table number" },
                    { value: "customer", label: "Customer name" },
                    { value: "waiter", label: "Waiter name" },
                ].map((option) => (
                    <button
                        type="button"
                        key={option.value}
                        className={
                            searchType === option.value ? "active" : ""
                        }
                        onClick={() => {
                            setSearchType(option.value);
                            setShowSearchFilters(false);
                        }}
                    >
                        {option.label}
                        {searchType === option.value && " ✓"}
                    </button>
                ))}
            </div>
        )}
    </div>

    <div className="orders-header-actions">
        <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter orders by status"
        >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
        </select>
    </div>
</div>

            {filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <h3>No orders found</h3>

                    <p>
                        {statusFilter === "all"
                            ? "There are no customer orders yet."
                            : `There are no ${statusFilter} orders.`}
                    </p>
                </div>
            ) : (
                <div className="orders-list">

                    {filteredOrders.map((order) => {

                        const isExpanded =
                            expandedOrder === order._id;

                        return (
                            <div
                                className={`order-card ${
                                    isExpanded ? "expanded" : ""
                                } ${
                                    selectedOrderIds.includes(order._id)
                                        ? "order-selected"
                                        : ""
                                }`}
                                key={order._id}
                                onClick={(event) => {
                                    if (suppressNextClick.current) {
                                        suppressNextClick.current = false;
                                        return;
                                    }

                                    if (event.ctrlKey || event.metaKey || selectionMode) {
                                        event.preventDefault();
                                        handleOrderSelection(order._id);
                                        return;
                                    }

                                    toggleOrder(order._id);
                                }}
                                onTouchStart={() => {
                                    longPressTimer.current = setTimeout(() => {
                                        suppressNextClick.current = true;
                                        setSelectionMode(true);
                                        handleOrderSelection(order._id);
                                    }, 500);
                                }}
                                onTouchEnd={() => {
                                    clearTimeout(longPressTimer.current);
                                }}
                                onTouchMove={() => {
                                    clearTimeout(longPressTimer.current);
                                }}
                            >

                                {/* Summary */}
                                <div className="order-summary">

                                    <div className="order-id">
                                        <span>Order</span>

                                        <strong>
                                            #{order._id.slice(-6)}
                                        </strong>
                                    </div>

                                    <div className="order-summary-item">

                                        <strong>Customer</strong>

                                        <p>
                                            {order.customer?.name ||
                                                "N/A"}
                                        </p>

                                        <small>
                                            {order.customer?.email ||
                                                "N/A"}
                                        </small>

                                    </div>

                                    <div className="order-summary-item">

                                        <strong>Table</strong>

                                        <p>
                                            {order.table?.tableNumber
                                                ? `Table ${order.table.tableNumber}`
                                                : "N/A"}
                                        </p>

                                    </div>

                                    {/* New block */}
                                    <div className="order-summary-item">
                                        <strong>Order Type</strong>

                                        <p>
                                            {order.orderType === "dine-out"
                                                ? `Dine-Out (${order.fulfillmentType || "N/A"})`
                                                : "Dine-In"}
                                        </p>
                                    </div>

                                    <div className="order-summary-item">

                                        <strong>Waiter</strong>

                                        <p>
                                            {order.waiter?.name ||
                                                "Not assigned"}
                                        </p>

                                    </div>

                                    <div className="order-summary-item">

                                        <strong>Payment</strong>

                                        <p className="payment-text">
                                            {order.paymentStatus}
                                        </p>

                                    </div>

                                    <div className="order-status">

                                        <span
                                            className={`status ${order.orderStatus}`}
                                        >
                                            {order.orderStatus}
                                        </span>

                                    </div>

                                    <div className="expand-icon">
                                        {isExpanded
                                            ? "▲"
                                            : "▼"}
                                    </div>

                                </div>

                                {/* Details */}
                                {isExpanded && (
                                    <div
                                        className="order-details-expanded"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >

                                        <div className="details-top">

                                            <div>
                                                <strong>
                                                    Order Date
                                                </strong>

                                                <p>
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div>
                                                <strong>
                                                    Payment Status
                                                </strong>

                                                <p>
                                                    {order.paymentStatus}
                                                </p>
                                            </div>

                                            <div>
                                                <strong>
                                                    Order Status
                                                </strong>

                                                <p>
                                                    {order.orderStatus}
                                                </p>
                                            </div>

                                        </div>

                                        {order.orderType === "dine-out" &&
                                            order.fulfillmentType === "delivery" && (
                                                <div>
                                                    <strong>Delivery Address</strong>
                                                    <p>
                                                        {order.deliveryAddress || "Address not provided"}
                                                    </p>
                                                </div>
                                            )}

                                        <div className="order-items">

                                            <h4>Ordered Items</h4>

                                            {order.items?.map(
                                                (item, index) => (
                                                    <div
                                                        className="order-item"
                                                        key={
                                                            item.menuItem?._id ||
                                                            index
                                                        }
                                                    >

                                                        <div>
                                                            <strong>
                                                                {item.menuItem
                                                                    ?.name ||
                                                                    "Unknown item"}
                                                            </strong>
                                                        </div>

                                                        <div className="item-values">

                                                            <span>
                                                                Qty:{" "}
                                                                {item.quantity}
                                                            </span>

                                                            <span>
                                                                ₹{item.price}
                                                            </span>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                        <div className="order-total">

                                            <strong>
                                                Total Amount
                                            </strong>

                                            <strong>
                                                ₹{order.totalAmount}
                                            </strong>

                                        </div>

                                        <div className="order-delete-section">
                                           <button
                                                className="delete-order-btn"
                                                onClick={() => handleDeleteOrder(order._id)}
                                                title="Delete order"
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default ManageOrders;