import "./MenuCard.css";

function MenuCard({
  menu,
  onAddToCart,
  quantity,
  onUpdateQuantity,
}) {
  return (
    <div className="menu-card">

      <div className="menu-card-content">

        <h2>{menu.name}</h2>

        <p className="menu-card-description">
          {menu.description}
        </p>

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

    </div>
  );
}

export default MenuCard;