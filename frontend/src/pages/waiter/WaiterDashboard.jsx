import { useEffect, useState } from "react";
import WaiterNavbar from "./WaiterNavbar";

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
                <div>
                    {orders.map((order) => (
                        <div key={order._id}>
                            <h2>Order #{order._id}</h2>

                            <p>
                                Customer: {order.customer?.name}
                            </p>

                            <p>
                                Table: {order.table?.tableNumber}
                            </p>

                            <p>
                                Status: {order.orderStatus}
                            </p>

                            <p>
                                Total: ₹{order.totalAmount}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WaiterDashboard;