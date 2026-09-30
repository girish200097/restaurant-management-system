import { useEffect, useState } from "react";
import "./ManageOrders.css";

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(`${VITE_API_URL}/admin/order`, {
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
                    <p>View all customer orders</p>
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

                    {orders.map((order) => (
                        <div className="order-card" key={order._id}>

                            <div className="order-card-header">
                                <div>
                                    <h3>
                                        Order #{order._id.slice(-6)}
                                    </h3>

                                    <p>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="order-status">
                                    <span className={`status ${order.orderStatus}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="order-details">

                                <div>
                                    <strong>Customer</strong>
                                    <p>
                                        {order.customer?.name || "N/A"}
                                    </p>
                                    <small>
                                        {order.customer?.email || "N/A"}
                                    </small>
                                </div>

                                <div>
                                    <strong>Table</strong>
                                    <p>
                                        {order.table?.tableNumber
                                            ? `Table ${order.table.tableNumber}`
                                            : "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <strong>Waiter</strong>
                                    <p>
                                        {order.waiter?.name || "Not assigned"}
                                    </p>
                                </div>

                                <div>
                                    <strong>Payment</strong>
                                    <p>
                                        {order.paymentStatus}
                                    </p>
                                </div>

                            </div>

                            <div className="order-items">

                                <h4>Ordered Items</h4>

                                {order.items?.map((item, index) => (
                                    <div
                                        className="order-item"
                                        key={item.menuItem?._id || index}
                                    >
                                        <div>
                                            <strong>
                                                {item.menuItem?.name || "Unknown item"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Qty: {item.quantity}
                                            </span>

                                            <span>
                                                ₹{item.price}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="order-total">
                                <strong>Total Amount</strong>
                                <strong>₹{order.totalAmount}</strong>
                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default ManageOrders;