import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import PaymentButton from "../../components/PaymentButton";
import MenuCard from "../../components/MenuCard";
import "./Menu.css";
import { useSearchParams } from "react-router-dom";

function Menu() {
  const [searchParams] = useSearchParams();
  const [paidAmount, setPaidAmount] = useState(0);
  const searchText = searchParams.get("search") || "";
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(
    () => localStorage.getItem("selectedTable") || ""
);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderingAgain, setIsOrderingAgain] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [showCompletedStatus, setShowCompletedStatus] = useState(false);
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/menu`
        );

        const data = await response.json();

        console.log("MENU RESPONSE:", data);

        setMenus(data.menus);

        const tableResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/table`
        );

        const tableData = await tableResponse.json();

        console.log("TABLE RESPONSE:", tableData);

        setTables(tableData.tables);
      } catch (error) {
        console.log(error);
      }
    };

   fetchMenus();

const interval = setInterval(fetchMenus, 2000);

return () => clearInterval(interval);
}, []);

  useEffect(() => {
  const savedCart = localStorage.getItem("cart");

  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }
}, []);
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);

  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem("selectedTable", selectedTable);
    }
  }, [selectedTable]);

  useEffect(() => {
        const fetchLatestOrder = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    return;
                }

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
                    console.log("Failed to fetch orders:", data.message);
                    return;
                }

                const orders = data.orders || [];

                if (orders.length === 0) {
                    return;
                }

                // Get the latest order
                const latestOrder = orders[orders.length - 1];

                // Restore payment state
                // Restore only an unfinished order
          if (latestOrder.paymentStatus !== "paid") {
             setOrderId(latestOrder._id);
              setOrderStatus(latestOrder.orderStatus);
              setOrderTotal(latestOrder.totalAmount);
              setPaymentSuccess(false);
          } else {
                    setPaymentSuccess(false);
                }

            } catch (error) {
                console.log("Error fetching latest order:", error);
            }
        };

        fetchLatestOrder();
    }, []);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);

        socket.emit("joinOrder", orderId);
    });

    socket.on("orderStatusUpdated", (data) => {
        console.log("Order status updated:", data);

        if (data.orderId === orderId) {
            setOrderStatus(data.orderStatus);
        }
    });

    return () => {
        socket.disconnect();
    };
}, [orderId]);

  const addToCart = (menu) => {
    const existingItem = cart.find(
      (item) => item._id === menu._id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === menu._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...menu,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (menuId, change) => {
    setCart(
      cart
        .map((item) =>
          item._id === menuId
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const createOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!selectedTable) {
        alert("Please select a table");
        return;
      }

      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }

      setIsCreatingOrder(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/order/${selectedTable}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              menuItem: item._id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      console.log("ORDER RESPONSE:", data);

      setOrderId(data.order._id);
      setOrderStatus(data.order.orderStatus);
      setOrderTotal(data.order.totalAmount);
      setIsOrderingAgain(false);

      // Clear cart after submitting the order
      setCart([]);

      alert(data.message);
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
};

  const handleGenerateReceipt = async () => {
    try {
      setIsGeneratingReceipt(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/receipt/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("RECEIPT RESPONSE:", data);

      if (!response.ok) {
        alert(
          data.message || "Failed to generate receipt"
        );
        return;
      }

      setReceiptSent(true);

      alert("Receipt sent to your email ✅");
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

const handleOrderAgain = () => {
    setOrderStatus(null);
    setReceiptSent(false);
    setIsOrderingAgain(true);

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

  const getStatusText = (status) => {
    switch (status) {
        case "pending":
            return "Order Placed";

        case "preparing":
            return "Preparing";

        case "served":
            return "Food Served";

        case "completed":
            return "Completed";

        case "cancelled":
            return "Order Cancelled";

        default:
            return "";
    }
};

const handleCancelOrder = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/order/${orderId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to cancel order");
      return;
    }

    setOrderStatus("cancelled");
    setOrderId(null);
    setOrderTotal(0);
    setCart([]);

    setSelectedTable("");
    localStorage.removeItem("selectedTable");

  } catch (error) {
    console.error("Cancel order error:", error);
    alert("Something went wrong while cancelling the order");
  }
};

  return (
    <div className="menu-page">

      <h1>Menu Page</h1>

      {/* Categories */}

      <div className="category-container">

        <button
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>

        <button
          onClick={() => setSelectedCategory("Starter")}
        >
          Starter
        </button>

        <button
          onClick={() =>
            setSelectedCategory("Main Course")
          }
        >
          Main Course
        </button>

        <button
          onClick={() => setSelectedCategory("Dessert")}
        >
          Dessert
        </button>

        <button
          onClick={() => setSelectedCategory("Beverage")}
        >
          Beverage
        </button>

      </div>


      {/* Menu */}

            {!paymentSuccess && (
              <div className="menu-container">

              {menus
        .filter(
          (menu) =>
            selectedCategory === "All" ||
            menu.category === selectedCategory
        )
        .filter((menu) =>
          menu.name
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
        .map((menu) => (
          <MenuCard
            key={menu._id}
            menu={menu}
            onAddToCart={addToCart}
            quantity={
              cart.find((item) => item._id === menu._id)?.quantity || 0
            }
            onUpdateQuantity={updateQuantity}
            disabled={!!orderId && !isOrderingAgain}
          />
        ))}

        </div>
      )}


      {/* Table Selection */}

      {!paymentSuccess && (
    <div className="table-section">

        <h2>Select Table</h2>

        <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            disabled={!!orderId}
        >
            <option value="">
                Select a table
            </option>

            {tables
                .filter(
                    (table) =>
                        table.status === "available" ||
                        table._id === selectedTable
                )
                .map((table) => (
                    <option
                        key={table._id}
                        value={table._id}
                    >
                        Table {table.tableNumber} -{" "}
                        {table.location}
                    </option>
                ))}
        </select>

    </div>
)}

            {/* Status bar Section */}
   {orderId && orderStatus && (!paymentSuccess || showCompletedStatus) && (
    <div className="order-status-section">
        <h3>Order Status</h3>

        <div className="order-status-bar">

            {/* Order Placed */}
            <div
                className={`status-step ${
                    ["pending", "preparing", "served", "completed"].includes(orderStatus)
                        ? "active"
                        : ""
                }`}
            >
                <span>1</span>
                <p>Order Placed</p>
            </div>

            <div
                className={`status-line ${
                    ["preparing", "served", "completed"].includes(orderStatus)
                        ? "active"
                        : ""
                }`}
            ></div>

            {/* Preparing */}
            <div
                className={`status-step ${
                    ["preparing", "served", "completed"].includes(orderStatus)
                        ? "active"
                        : ""
                }`}
            >
                <span>2</span>
                <p>Preparing</p>
            </div>

            <div
                className={`status-line ${
                    ["served", "completed"].includes(orderStatus)
                        ? "active"
                        : ""
                }`}
            ></div>

            {/* Food Served */}
            <div
                className={`status-step ${
                    ["served", "completed"].includes(orderStatus)
                        ? "active"
                        : ""
                }`}
            >
                <span>3</span>
                <p>Food Served</p>
            </div>

            <div
                className={`status-line ${
                    orderStatus === "completed" ? "active" : ""
                }`}
            ></div>

            {/* Completed */}
            <div
                className={`status-step ${
                    orderStatus === "completed" ? "active" : ""
                }`}
            >
                <span>4</span>
                <p>Completed</p>
            </div>
        </div>

        {orderStatus === "pending" && (
          <button
            className="cancel-order-btn"
            onClick={handleCancelOrder}
          >
            Cancel Order
          </button>
        )}

        {orderStatus === "cancelled" && (
            <div className="cancelled-status">
                Order Cancelled
            </div>
        )}
    </div>
)}

      {/* Create Order */}

     {(!orderId || isOrderingAgain) && !paymentSuccess && (
            <button
                className="create-order-button"
                onClick={createOrder}
                disabled={isCreatingOrder}
            >
                {isCreatingOrder ? "Creating Order..." : "Create Order"}
            </button>
        )}


      {/* Payment */}

      {orderId && orderStatus === "served" && !paymentSuccess && (
    <div className="served-order-actions">

        <PaymentButton
            orderId={orderId}
            amount={getCartTotal()}
           onPaymentSuccess={(paymentData) => {
              setPaidAmount(paymentData.payment.amount);
              setOrderStatus("completed");
              setShowCompletedStatus(true);
              setPaymentSuccess(true);
              setCart([]);
              setSelectedTable("");
              localStorage.removeItem("selectedTable");

              setTimeout(() => {
                  setShowCompletedStatus(false);
              }, 5000);
          }}
        />

        <button
            onClick={handleOrderAgain}
            className="order-again-button"
        >
            Order Again
        </button>

    </div>
)}

      {/* Payment Success */}

      {paymentSuccess && (
            <div className="payment-success">
                <h2>
                    Payment Successful ✅
                </h2>

                <div className="payment-success-container">
                    <button
                        onClick={handleGenerateReceipt}
                        disabled={
                            isGeneratingReceipt ||
                            receiptSent
                        }
                    >
                        {receiptSent
                            ? "Receipt Sent ✅"
                            : isGeneratingReceipt
                            ? "Sending Receipt..."
                            : "Generate Receipt"}
                    </button>
                </div>
            </div>
        )}


      <h3>
          Total: ₹{paymentSuccess ? paidAmount : orderTotal}
      </h3>

      <button
          className="cart-button"
          onClick={() => setIsCartOpen(true)}
      >
          🛒 Cart ({getCartItemCount()})
      </button>

      {isCartOpen && (
    <div className="cart-overlay">
        <div className="cart-popup">

            <div className="cart-popup-header">
                <h2>Your Cart</h2>

                <button
                    className="cart-close-button"
                    onClick={() => setIsCartOpen(false)}
                >
                    ✕
                </button>
            </div>

            {cart.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty</p>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div
                                className="cart-item"
                                key={item._id}
                            >
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <p>₹{item.price}</p>
                                </div>

                                <div className="cart-item-actions">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item._id, -1)
                                        }
                                        disabled={!!orderId && !isOrderingAgain}
                                    >
                                        −
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        onClick={() =>
                                            updateQuantity(item._id, 1)
                                        }
                                            disabled={!!orderId && !isOrderingAgain}
                                    >
                                        +
                                    </button>
                                </div>

                                <strong>
                                    ₹{item.price * item.quantity}
                                </strong>
                            </div>
                        ))}
                    </div>

                    <div className="cart-popup-total">
                        <strong>Total</strong>
                        <strong>₹{getCartTotal()}</strong>
                    </div>
                    {!orderId || isOrderingAgain ? (
                        <button
                            className="cart-create-order-button"
                            onClick={createOrder}
                            disabled={isCreatingOrder || cart.length === 0}
                        >
                            {isCreatingOrder ? "Creating Order..." : "Create Order"}
                        </button>
                    ) : null}
                </>
            )}

        </div>
    </div>
)}
    </div>

    
  );
}

export default Menu;