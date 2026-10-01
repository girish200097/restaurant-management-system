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

                setOrderId(latestOrder._id);
                setOrderStatus(latestOrder.orderStatus);

                // Restore payment state
                if (latestOrder.paymentStatus === "paid") {
                    setPaymentSuccess(true);
                    setPaidAmount(latestOrder.totalAmount);
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
    setOrderId(null);
    setOrderStatus(null);
    setPaymentSuccess(false);
    setPaidAmount(0);
    setReceiptSent(false);
    setSelectedTable("");

    localStorage.removeItem("selectedTable");

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
          />
        ))}

        </div>
      )}


      {/* Table Selection */}

      <div className="table-section">

        <h2>Select Table</h2>

        <select
          value={selectedTable}
          onChange={(e) =>
            setSelectedTable(e.target.value)
          }
        >
          <option value="">
            Select a table
          </option>

          {tables
            .filter(
              (table) => table.status === "available"
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

            {/* Status bar Section */}
     {orderId && orderStatus && (
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

        {orderStatus === "cancelled" && (
            <div className="cancelled-status">
                Order Cancelled
            </div>
        )}
    </div>
)}

      {/* Create Order */}

      <button
        className="create-order-button"
        onClick={createOrder}
        disabled={
          isCreatingOrder || paymentSuccess
        }
      >
        {isCreatingOrder
        ? "Creating Order..."
        : paymentSuccess
        ? "Order Completed"
        : orderId
        ? "Update Your Order"
        : "Create Order"}
      </button>


      {/* Payment */}

      {orderId && orderStatus === "served" && !paymentSuccess && (
        <PaymentButton
          orderId={orderId}
          onPaymentSuccess={() => {
              setPaidAmount(getCartTotal());
              setPaymentSuccess(true);
              setCart([]);
              setSelectedTable("");
              localStorage.removeItem("selectedTable");
          }}
        />
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

          {paymentSuccess && (
              <button
                  onClick={handleOrderAgain}
                  className="order-again-button"
              >
                  Order Again
              </button>
          )}
            
          </div>

        </div>

      )}


      <h3>
          Total: ₹{paymentSuccess ? paidAmount : getCartTotal()}
      </h3>

    </div>
  );
}

export default Menu;