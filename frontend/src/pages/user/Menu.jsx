import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import PaymentButton from "../../components/PaymentButton";
import MenuCard from "../../components/MenuCard";
import "./Menu.css";
import { useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";

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
  const [previousOrderTotal, setPreviousOrderTotal] = useState(0);
  const [showCompletedStatus, setShowCompletedStatus] = useState(false);
  const [callingWaiter, setCallingWaiter] = useState(false);

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

    socket.on("orderCancelled", (data) => {
    console.log("Order cancelled:", data);

    if (data.orderId === orderId) {
        setOrderStatus("cancelled");
        setCart([]);
        setOrderTotal(0);
        setPaymentSuccess(false);
        setPaidAmount(0);
        setReceiptSent(false);
        setIsOrderingAgain(false);
    }
});

    return () => {
        socket.disconnect();
    };
}, [orderId]);

const showOrderRestrictionMessage = () => {
  if (orderStatus === "preparing") {
    alert(
      "You can't modify items while the order is preparing. Click Order Again to add more items."
    );
  } else if (orderStatus === "served") {
    alert("Click Order Again to add more items.");
  } else if (orderStatus === "pending") {
    alert(
      "You can't modify items now. Click Order Again to add more items."
    );
  } else {
    alert(
      "You can't modify items in this order. Click Order Again to continue."
    );
  }
};

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
      setWaiterAvailable(!!data.order.waiter);

      // Clear cart after submitting the order
      setCart([]);
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
            alert(data.message || "Failed to generate receipt");
            return;
        }

        const { order, payment } = data.receipt;

        const receiptDate = new Date(order.createdAt);

        const formattedDate = receiptDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const formattedTime = receiptDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });

        // 80mm receipt width
        const pageWidth = 80;

        // Calculate receipt height based on number of items
        const baseHeight = 145;
        const itemHeight = 10;
        const pageHeight = baseHeight + order.items.length * itemHeight;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [pageWidth, pageHeight],
        });

        const centerX = pageWidth / 2;
        const left = 5;
        const right = pageWidth - 5;

        let y = 8;

        // Restaurant name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("RESTAURANT", centerX, y, {
            align: "center",
        });

        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("Restaurant & Cafe", centerX, y, {
            align: "center",
        });

        y += 6;

        doc.setLineWidth(0.3);
        doc.line(left, y, right, y);

        y += 7;

        // Receipt title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("RECEIPT", centerX, y, {
            align: "center",
        });

        y += 7;

        // Receipt details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(`Receipt No: RCP-${order._id.slice(-8)}`, left, y);
        y += 4;

        doc.text(`Order No: ${order._id.slice(-8)}`, left, y);
        y += 4;

        doc.text(`Date: ${formattedDate}`, left, y);
        y += 4;

        doc.text(`Time: ${formattedTime}`, left, y);
        y += 4;

        doc.text(
            `Customer: ${order.customer?.name || "Customer"}`,
            left,
            y
        );
        y += 4;

        doc.text(
            `Table: ${order.table?.tableNumber || "-"}`,
            left,
            y
        );

        y += 6;

        doc.line(left, y, right, y);

        y += 6;

        // Items heading
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        doc.text("ITEM", left, y);
        doc.text("QTY", 48, y, { align: "right" });
        doc.text("TOTAL", right, y, { align: "right" });

        y += 4;

        doc.line(left, y, right, y);

        y += 6;

        // Items
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        order.items.forEach((item) => {
            const itemName = item.menuItem?.name || "Item";
            const quantity = item.quantity;
            const itemTotal = item.price * quantity;

            // Split long item names
            const itemLines = doc.splitTextToSize(itemName, 38);

            doc.text(itemLines, left, y);

            doc.text(String(quantity), 48, y, {
                align: "right",
            });

            doc.text(`${itemTotal}`, right, y, {
                align: "right",
            });

            y += Math.max(itemLines.length * 4, 6);
        });

        y += 2;

        doc.line(left, y, right, y);

        y += 7;

        // Total
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        doc.text("TOTAL", left, y);

        doc.text(`${order.totalAmount}`, right, y, {
            align: "right",
        });

        y += 8;

        // Payment information
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text("Payment Method: Razorpay", left, y);

        y += 5;

        doc.setFont("helvetica", "bold");
        doc.text("Payment Status: PAID", left, y);

        y += 5;

        if (payment.razorpayPaymentId) {
            doc.setFont("helvetica", "normal");
            doc.text(
                `Payment ID: ${payment.razorpayPaymentId.slice(-12)}`,
                left,
                y
            );

            y += 6;
        }

        doc.line(left, y, right, y);

        y += 8;

        // Thank you message
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);

        doc.text(
            "Thank you for dining with us!",
            centerX,
            y,
            {
                align: "center",
            }
        );

        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        doc.text(
            "Please visit us again.",
            centerX,
            y,
            {
                align: "center",
            }
        );

        // Download PDF
        const fileName = `Restaurant-Receipt-${order._id.slice(-8)}.pdf`;

        doc.save(fileName);

        setReceiptSent(true);
    } catch (error) {
        console.log("Receipt error:", error);
        alert("Something went wrong while generating the receipt");
    } finally {
        setIsGeneratingReceipt(false);
    }
};

const handleOrderAgain = () => {
    // Only keep the previous amount when ordering again
    // from a served but unpaid order.
    if (orderStatus === "served" && !paymentSuccess) {
        setPreviousOrderTotal(orderTotal);
    } else {
        // Cancelled-order Order Again keeps the old behavior.
        setPreviousOrderTotal(0);
    }

    setOrderId(null);
    setOrderStatus(null);
    setOrderTotal(0);

    setPaymentSuccess(false);
    setPaidAmount(0);
    setReceiptSent(false);

    setCart([]);
    setIsOrderingAgain(true);
    setIsCartOpen(false);

    // Keep the same selected table
    // Do NOT clear selectedTable
    // Do NOT remove it from localStorage

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

    const confirmCancel = window.confirm(
        "Would you like to cancel your order?"
    );

    if (!confirmCancel) {
        return;
    }
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/order/${orderId}/cancel`,
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

        // Show cancelled order
        setOrderStatus("cancelled");

        // Reset cart and order amount
        setCart([]);
        setOrderTotal(0);

        // Reset payment and receipt state
        setPaymentSuccess(false);
        setPaidAmount(0);
        setReceiptSent(false);

        // Keep the order ID so "Order Cancelled" can still be displayed
        // and Order Again can be clicked.

        setIsOrderingAgain(false);

    } catch (error) {
        console.error("Cancel order error:", error);
        alert("Something went wrong while cancelling the order");
    }
};

const handleCallWaiter = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (!orderId) {
      alert("You don't have an active order");
      return;
    }

    setCallingWaiter(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/order/${orderId}/call-waiter`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to call waiter");
      return;
    }

    alert("Waiter has been called 🔔");

  } catch (error) {
    console.log("Call waiter error:", error);
    alert("Something went wrong");
  } finally {
    setCallingWaiter(false);
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

            {/* Menu */}
{!paymentSuccess && (() => {
  const filteredMenus = menus
    .filter(
      (menu) =>
        selectedCategory === "All" ||
        menu.category === selectedCategory
    )
    .filter((menu) =>
      menu.name
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );

  return (
    <>
      {filteredMenus.length === 0 ? (
        <div className="no-menu-items">
          There are no items
        </div>
      ) : (
        <div className="menu-container">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu._id}
              menu={menu}
              onAddToCart={addToCart}
              quantity={
                cart.find((item) => item._id === menu._id)
                  ?.quantity || 0
              }
              onUpdateQuantity={updateQuantity}
              disabled={!!orderId && !isOrderingAgain}
              orderStatus={orderStatus}
            />
          ))}
        </div>
      )}
    </>
  );
})()}

{/* Table Selection */}
{!selectedTable && !orderId && !paymentSuccess ? (
  <div className="table-section">
    <h2>Select Table</h2>

    <select
      value={selectedTable}
      onChange={(e) => setSelectedTable(e.target.value)}
    >
      <option value="">Select a table</option>

      {tables
        .filter(
          (table) =>
            table.status === "available" ||
            table._id === selectedTable
        )
        .map((table) => (
          <option key={table._id} value={table._id}>
            Table {table.tableNumber} - {table.location}
          </option>
        ))}
    </select>
  </div>
) : !paymentSuccess && selectedTable ? (
  <div className="table-number-badge">
    {(() => {
      const table = tables.find(
        (table) => table._id === selectedTable
      );

      return table ? `T${table.tableNumber}` : "Table selected";
    })()}
  </div>
) : null}

{/* Fixed Order Panel */}
{orderId && (
    <div className="fixed-order-panel">

        {/* Status bar Section */}
        {orderStatus && (!paymentSuccess || showCompletedStatus) && (
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
                            orderStatus === "completed"
                                ? "active"
                                : ""
                        }`}
                    ></div>

                    {/* Completed */}
                    <div
                        className={`status-step ${
                            orderStatus === "completed"
                                ? "active"
                                : ""
                        }`}
                    >
                        <span>4</span>
                        <p>Completed</p>
                    </div>

                </div>

                <button
                    className="menu-call-waiter-button"
                    onClick={handleCallWaiter}
                    disabled={callingWaiter}
                >
                    {callingWaiter
                        ? "Calling Waiter..."
                        : "🔔 Call Waiter"}
                </button>

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

                        <div>Order Cancelled</div>

                        <button
                            onClick={handleOrderAgain}
                            className="order-again-button"
                        >
                            Order Again
                        </button>

                    </div>
                )}

            </div>
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

        {/* Total */}
        <h3>
            Total: ₹
            {paymentSuccess
                ? paidAmount
                : isOrderingAgain
                ? previousOrderTotal + getCartTotal()
                : orderTotal || getCartTotal()}
        </h3>

    </div>
)}

{/* Create Order */}
{(!orderId || isOrderingAgain) && !paymentSuccess && (
    <button
        className="create-order-button"
        onClick={createOrder}
        disabled={isCreatingOrder}
    >
        {isCreatingOrder
            ? "Creating Order..."
            : "Create Order"}
    </button>
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
                    ? "Receipt Downloaded ✅"
                    : isGeneratingReceipt
                    ? "Sending Receipt..."
                    : "Generate Receipt"}
            </button>

        </div>

    </div>
)}

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
                                        onClick={() => {
                                            if (orderId && !isOrderingAgain) {
                                            showOrderRestrictionMessage();
                                            return;
                                            }

                                            updateQuantity(item._id, -1);
                                        }}
                                        disabled={false}
                                        >
                                        −
                                        </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        onClick={() => {
                                            if (orderId && !isOrderingAgain) {
                                            showOrderRestrictionMessage();
                                            return;
                                            }

                                            updateQuantity(item._id, 1);
                                        }}
                                        disabled={false}
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