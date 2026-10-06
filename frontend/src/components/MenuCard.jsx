import "./MenuCard.css";

function MenuCard({
  menu,
  onAddToCart,
  quantity,
  onUpdateQuantity,
  disabled,
  orderStatus,
}) {
  return (
   <div
  className={`menu-card ${
    !menu.isAvailable ? "menu-card-unavailable" : ""
  }`}
>
      <div className="menu-card-content">

        <h2>{menu.name}</h2>
        <p className="menu-card-price">
          ₹{menu.price}
        </p>

        {quantity === 0 ? (
          <button
            className={`add-button ${disabled ? "add-button-disabled" : ""}`}
            onClick={() => {
              if (!menu.isAvailable) {
                alert("This item is currently not available.");
                return;
              }

              if (disabled) {
                if (orderStatus === "preparing") {
                  alert(
                    "You can't add items while the order is preparing. Click Order Again to add more items."
                  );
                } else if (orderStatus === "served") {
                  alert(
                    "Click Order Again to add more items."
                  );
                } else if (orderStatus === "pending") {
                  alert(
                    "You can't add items now. Click Order Again to add more items."
                  );
                } else {
                  alert(
                    "You can't add items to this order. Click Order Again to continue."
                  );
                }

                return;
              }

              onAddToCart(menu);
            }}
            disabled={!menu.isAvailable}
          >
            Add
          </button>
        ) : (
          <div className="quantity-controls">

            <button
              onClick={() =>
                onUpdateQuantity(menu._id, -1)
              }
              disabled={disabled}
            >
              −
            </button>

            <span>{quantity}</span>

           <button
              onClick={() =>
                onUpdateQuantity(menu._id, 1)
              }
              disabled={disabled}
            >
              +
            </button>

          </div>
        )}

      </div>

      {menu.image && (
        <div className="menu-card-image">
          <img
            src={menu.image}
            alt={menu.name}
          />
        </div>
      )}

      {/* Unavailable ribbon */}

      {!menu.isAvailable && (
        <div className="not-available">
          CURRENTLY NOT AVAILABLE
        </div>
      )}

    </div>
  );
}

export default MenuCard;