import { useEffect, useState } from "react";
import WaiterNavbar from "./WaiterNavbar";
import "./WaiterDashboard.css";

function WaiterDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

                console.log("ASSIGNED ORDERS:", data);

                if (response.ok) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div>
            <WaiterNavbar />

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

                                <span className="waiter-order-status">
                                    {order.orderStatus}
                                </span>
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