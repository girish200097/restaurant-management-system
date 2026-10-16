import "./OrderHistory.css";
import { useEffect, useState } from "react";

function OrderHistory() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/order/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load order history");
        }

        const orders = data.orders || [];

        if (orders.length > 0) {
          setOrder(
            [...orders].sort(
              (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )[0]
          );
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, []);

  if (loading) {
    return <div className="order-history"><p>Loading your last order...</p></div>;
  }

  if (error) {
    return <div className="order-history"><p>{error}</p></div>;
  }

  if (!order) {
    return (
      <div className="order-history">
        <h2>Last Order</h2>
        <p>No previous order yet.</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2>Last Order</h2>

      <p className="order-history-date">
        {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="order-history-items">
        {order.items?.map((item, index) => (
          <div
            className="order-history-item"
            key={item.menuItem?._id || index}
          >
            {item.menuItem?.image && (
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name || "Food item"}
              />
            )}

            <h3>{item.menuItem?.name || "Item unavailable"}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;
