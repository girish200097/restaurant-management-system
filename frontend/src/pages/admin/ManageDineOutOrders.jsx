
import { useEffect, useState } from "react";
import "./ManageOrders.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ManageDineOutOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");

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
                // Display only Dine-Out orders
                setOrders(
                    (data.orders || []).filter(
                        (order) => order.orderType === "dine-out"
                    )
                );
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.log("Dine-Out orders error:", error);
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
        setExpandedOrder((current) =>
            current === orderId ? null : orderId
        );
    };

    const handleDeleteOrder = async (orderId) => {
        if (
            !window.confirm(
                "Are you sure you want to permanently delete this order?"
            )
        ) {
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
                alert(data.message || "Failed to delete order.");
                return;
            }

            setOrders((current) =>
                current.filter((order) => order._id !== orderId)
            );
            setExpandedOrder(null);
        } catch (error) {
            console.log("Delete Dine-Out order error:", error);
            alert("Something went wrong while deleting the order.");
        }
    };

    const filteredOrders = orders
        .filter(
            (order) =>
                statusFilter === "all" ||
                order.orderStatus === statusFilter
        )
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
                <p className="orders-loading">
                    Loading Dine-Out orders...
                </p>
            </div>
        );
    }

    return (
        <div className="manage-orders">
            <div className="manage-orders-header">
                <div>
                    <h1>Dine-Out Orders</h1>
                    <p>
                        Manage delivery and takeaway orders
                    </p>
                </div>

                <div className="orders-header-actions">
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
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
                    <h3>No Dine-Out orders found</h3>
                    <p>
                        {statusFilter === "all"
                            ? "New delivery and takeaway orders will appear here."
                            : `There are no ${statusFilter} Dine-Out orders.`}
                    </p>
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map((order) => {
                        const isExpanded =
                            expandedOrder === order._id;

                        const customer = order.customer;

                        return (
                            <div
                                className={`order-card ${
                                    isExpanded ? "expanded" : ""
                                }`}
                                key={order._id}
                                onClick={() => toggleOrder(order._id)}
                            >
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
                                            {customer?.name || "N/A"}
                                        </p>
                                        <small>
                                            {customer?.email || "N/A"}
                                        </small>
                                    </div>

                                    <div className="order-summary-item">
                                        <strong>Order Type</strong>
                                        <p>
                                            {order.fulfillmentType ===
                                            "delivery"
                                                ? "Delivery"
                                                : "Takeaway"}
                                        </p>
                                    </div>

                                    <div className="order-summary-item">
                                        <strong>Total</strong>
                                        <p>₹{order.totalAmount}</p>
                                    </div>

                                    <div className="order-summary-item">
                                        <strong>Payment</strong>
                                        <p className="payment-text">
                                            {order.paymentStatus || "N/A"}
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
                                        {isExpanded ? "▲" : "▼"}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div
                                        className="order-details-expanded"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <div className="details-top">
                                            <div>
                                                <strong>Order Date</strong>
                                                <p>
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div>
                                                <strong>Payment Status</strong>
                                                <p>
                                                    {order.paymentStatus ||
                                                        "N/A"}
                                                </p>
                                            </div>

                                            <div>
                                                <strong>Order Status</strong>
                                                <p>{order.orderStatus}</p>
                                            </div>

                                            <div>
                                                <strong>Fulfillment</strong>
                                                <p>
                                                    {order.fulfillmentType ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {order.fulfillmentType ===
                                            "delivery" && (
                                            <div>
                                                <strong>
                                                    Delivery Address
                                                </strong>
                                                <p>
                                                    {order.deliveryAddress ||
                                                        "Address not provided"}
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
                                            <strong>Total Amount</strong>
                                            <strong>
                                                ₹{order.totalAmount}
                                            </strong>
                                        </div>

                                        <div className="order-delete-section">
                                            <button
                                                className="delete-order-btn"
                                                onClick={() =>
                                                    handleDeleteOrder(
                                                        order._id
                                                    )
                                                }
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

export default ManageDineOutOrders;
