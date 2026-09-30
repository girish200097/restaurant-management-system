import { useEffect, useState } from "react";
import "./ManageOrders.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

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
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrder(
            expandedOrder === orderId ? null : orderId
        );
    };

    if (loading) {
        return (
            <div className="manage-orders">
                <p className="orders-loading">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="manage-orders">

            <div className="manage-orders-header">
                <div>
                    <h1>Orders</h1>
                    <p>Click an order to view details</p>
                </div>

                <button onClick={fetchOrders}>
                    Refresh
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <h3>No orders found</h3>
                    <p>There are no customer orders yet.</p>
                </div>
            ) : (
                <div className="orders-list">

                    {orders.map((order) => {

                        const isExpanded =
                            expandedOrder === order._id;

                        return (
                            <div
                                className={`order-card ${
                                    isExpanded ? "expanded" : ""
                                }`}
                                key={order._id}
                                onClick={() => toggleOrder(order._id)}
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
                                            {order.customer?.name || "N/A"}
                                        </p>
                                        <small>
                                            {order.customer?.email || "N/A"}
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
                                        {isExpanded ? "▲" : "▼"}
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