import { useEffect, useState } from "react";
import WaiterNavbar from "./WaiterNavbar";
import "./WaiterDashboard.css";

function WaiterDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderMessage, setOrderMessage] = useState("");

   useEffect(() => {
    let firstLoad = true;

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/order/my-assigned-orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return;
            }

            const newOrders = data.orders || [];

            setOrders((currentOrders) => {
                if (!firstLoad) {
                    // Check for new orders
                    const hasNewOrder = newOrders.some(
                        (newOrder) =>
                            !currentOrders.some(
                                (oldOrder) =>
                                    oldOrder._id === newOrder._id
                            )
                    );

                    if (hasNewOrder) {
                        setOrderMessage("New order received");
                    }

                    // Check for updated orders
                    const hasUpdatedOrder = newOrders.some((newOrder) => {
                        const oldOrder = currentOrders.find(
                            (order) => order._id === newOrder._id
                        );

                        if (!oldOrder) {
                            return false;
                        }

                        return (
                            newOrder.totalAmount !== oldOrder.totalAmount ||
                            JSON.stringify(newOrder.items) !==
                                JSON.stringify(oldOrder.items)
                        );
                    });

                    if (hasUpdatedOrder) {
                        setOrderMessage("Order has been updated");
                    }
                }

                return newOrders;
            });

            firstLoad = false;
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
}, []);

useEffect(() => {
    if (!orderMessage) {
        return;
    }

    const timer = setTimeout(() => {
        setOrderMessage("");
    }, 4000);

    return () => clearTimeout(timer);
}, [orderMessage]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/order/${orderId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderStatus: status,
                    }),
                }
            );

            const data = await response.json();

            console.log("STATUS UPDATE:", data);

            if (!response.ok) {
                alert(data.message || "Failed to update order");
                return;
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order._id === orderId
                        ? {
                              ...order,
                              orderStatus: status,
                          }
                        : order
                )
            );
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <WaiterNavbar />

            {orderMessage && (
                <div className="waiter-order-message">
                    {orderMessage}
                </div>
            )}
            <h1>Waiter Dashboard</h1>

            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <p>No assigned orders</p>
            ) : (
                <div className="waiter-orders">
                    {orders.map((order) => (
                        <div className="waiter-order-card" key={order._id}>

                            <div className="waiter-order-header">
                            <h2>Order #{order._id}</h2>

                            <select
                                className="waiter-status-select"
                                value={order.orderStatus}
                                onChange={(event) =>
                                    updateOrderStatus(order._id, event.target.value)
                                }
                                disabled={order.orderStatus === "completed"}
                            >
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="served">Served</option>
                                <option value="completed" disabled>Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                            <div className="waiter-order-info">
                                <p>
                                    Customer: {order.customer?.name}
                                </p>

                                <p>
                                    Table: {order.table?.tableNumber}
                                </p>
                            </div>

                            <div className="waiter-order-items">
                                <h3>Items</h3>

                                {order.items?.map((item) => (
                                    <div
                                        className="waiter-order-item"
                                        key={item._id}
                                    >
                                        <span>
                                            {item.menuItem?.name}
                                        </span>

                                        <span>
                                            × {item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="waiter-order-footer">
                                <strong>
                                    Total: ₹{order.totalAmount}
                                </strong>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WaiterDashboard;