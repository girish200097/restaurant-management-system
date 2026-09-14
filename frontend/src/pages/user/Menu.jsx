import { useState, useEffect } from "react";
import PaymentButton from "../../components/PaymentButton";
import MenuCard from "../../components/MenuCard";
import "./Menu.css";
function Menu() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [orderId, setOrderId] = useState(null);
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
      } 
      catch (error) {
        console.log(error);
      }
    };

    fetchMenus();
  }, []);

  
      const addToCart = (menu) => {
          const existingItem = cart.find(
              (item) => item._id === menu._id
          );

          if (existingItem) {
              setCart(
                  cart.map((item) =>
                      item._id === menu._id
                          ? { ...item, quantity: item.quantity + 1 }
                          : item
                  )
              );
          } else {
              setCart([
                  ...cart,
                  { ...menu, quantity: 1 }
              ]);
          }
      };

const updateQuantity = (menuId, change) => {
  setCart(
    cart
      .map((item) =>
        item._id === menuId
          ? { ...item, quantity: item.quantity + change }
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
              "Authorization": `Bearer ${token}`,
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

        alert("Order created successfully");
      } catch (error) {
        console.log(error);
      }
    };
    const getCartTotal = () => {
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
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

        setReceiptSent(true);

        alert("Receipt sent to your email ✅");

    } catch (error) {
        console.log(error);
        alert("Something went wrong");
    } finally {
        setIsGeneratingReceipt(false);
    }
};

  return (
    <div>
      {/* menu */}
      <h1>Menu Page</h1>
    <div className="menu-page">
      <button onClick={() => setSelectedCategory("All")}>
        All
      </button>

      <button onClick={() => setSelectedCategory("Starter")}>
        Starter
      </button>

      <button onClick={() => setSelectedCategory("Main Course")}>
        Main Course
      </button>

      <button onClick={() => setSelectedCategory("Dessert")}>
        Dessert
      </button>

      <button onClick={() => setSelectedCategory("Beverage")}>
        Beverage
      </button>
    </div>

    {!paymentSuccess && (
      <div className="menu-container">
        {menus
          .filter((menu) => menu.isAvailable)
          .filter(
            (menu) =>
              selectedCategory === "All" ||
              menu.category === selectedCategory
          )
          .map((menu) => (
            <MenuCard
              key={menu._id}
              menu={menu}
              onAddToCart={addToCart}
            />
          ))}
      </div>
    )}
{/* table */}
        <h2>Select Table</h2>

        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">Select a table</option>

          {tables
            .filter((table) => table.status === "available")
            .map((table) => (
              <option key={table._id} value={table._id}>
                Table {table.tableNumber} - {table.location}
              </option>
            ))}
        </select>
{/* cart */}
        <h2>Cart</h2>

        {cart.map((item) => (
          <div key={item._id}>
            <p>{item.name}</p>
            <p>₹{item.price}</p>
            <p> {item.quantity}</p>
            <button onClick={() => updateQuantity(item._id, -1)}>
              -
            </button>

            <span>{item.quantity}</span>

            <button onClick={() => updateQuantity(item._id, 1)}>
              +
            </button>
            
          </div>
        ))}
                <button
                  onClick={createOrder}
                  disabled={isCreatingOrder || paymentSuccess}
                >
                  {isCreatingOrder
                    ? "Creating Order..."
                    : paymentSuccess
                      ? "Order Completed"
                      : "Create Order"}
                </button>

       {orderId && !paymentSuccess && (
          <PaymentButton
            orderId={orderId}
            onPaymentSuccess={() => {
              setPaymentSuccess(true);
              setCart([]);
              setSelectedTable("");
            }}
          />
        )}
        
        {paymentSuccess && (
          <div>
            <h2>Payment Successful ✅</h2>

            <button
                onClick={handleGenerateReceipt}
                disabled={isGeneratingReceipt || receiptSent}
            >
                {receiptSent
                    ? "Receipt Sent ✅"
                    : isGeneratingReceipt
                    ? "Sending Receipt..."
                    : "Generate Receipt"}
            </button>
          </div>
        )}
        <h3>Total: ₹{getCartTotal()}</h3>
    </div>
  );
}

export default Menu;