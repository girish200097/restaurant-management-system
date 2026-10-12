
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MenuCard from "../../components/MenuCard";
import "./DineOut.css";


function DineOut() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") || "";
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fulfillment, setFulfillment] = useState("delivery");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState("delivery");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/menu`
        );

        const data = await response.json();

        if (response.ok) {
          setMenus(data.menus || []);
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      }
    };

    fetchMenus();
  }, []);

  const addToCart = (menu) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item._id === menu._id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item._id === menu._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...menu, quantity: 1 }];
    });
  };

  const updateQuantity = (menuId, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === menuId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartTotal = () =>
    cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

  const filteredMenus = menus
    .filter(
      (menu) =>
        selectedCategory === "All" ||
        menu.category === selectedCategory
    )
    .filter((menu) =>
      menu.name.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <div className="dineout-page">
      <h1>DineOut</h1>

      <div className="dineout-fulfillment">
        <button
          className={fulfillment === "delivery" ? "selected" : ""}
          onClick={() => setFulfillment("delivery")}
        >
          Home Delivery
        </button>

        <button
          className={fulfillment === "takeaway" ? "selected" : ""}
          onClick={() => setFulfillment("takeaway")}
        >
          Takeaway
        </button>
      </div>
      
<div className="dineout-search">
  <input
    type="search"
    placeholder="Search for dishes..."
    aria-label="Search for dishes"
    value={searchText}
    onChange={(e) => {
      const value = e.target.value;

      setSearchParams(
        (currentParams) => {
          const params = new URLSearchParams(currentParams);

          if (value) {
            params.set("search", value);
          } else {
            params.delete("search");
          }

          return params;
        },
        { replace: true }
      );
    }}
  />
</div>

      <div className="dineout-categories">
        {["All", "Starter", "Main Course", "Dessert", "Beverage"].map(
          (category) => (
            <button
              key={category}
              className={
                selectedCategory === category ? "selected" : ""
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          )
        )}
      </div>

      {filteredMenus.length === 0 ? (
        <p className="dineout-empty">
          No menu items found.
        </p>
      ) : (
        <div className="dineout-menu-container">
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
              disabled={false}
              orderStatus={null}
            />
          ))}
        </div>
      )}

      <div className="dineout-cart">
        <h2>Your Cart ({cart.reduce(
          (total, item) => total + item.quantity,
          0
        )})</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div className="dineout-cart-item" key={item._id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>₹{item.price * item.quantity}</strong>
              </div>
            ))}

            <h3>Total: ₹{getCartTotal()}</h3>

            <button
              className="dineout-checkout-button"
              onClick={() =>
                alert(
                  "Your cart is ready. Order submission will be connected next."
                )
              }
            >
              Continue
            </button>
          </>
        )}

           
      </div>

     {fulfillment === "delivery" && (
  <div className="dineout-address">
    <label htmlFor="delivery-address">Delivery address</label>
    <input
      id="delivery-address"
      type="text"
      placeholder="Enter your delivery address"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
    />
  </div>
)}
    </div>
  );
}

export default DineOut;
