import "./MenuCard.css";

function MenuCard({
  menu,
  onAddToCart,
  quantity,
  onUpdateQuantity,
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
            className="add-button"
            onClick={() => onAddToCart(menu)}
          >
            Add
          </button>
        ) : (
          <div className="quantity-controls">

            <button
              onClick={() =>
                onUpdateQuantity(menu._id, -1)
              }
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              onClick={() =>
                onUpdateQuantity(menu._id, 1)
              }
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