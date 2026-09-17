import "./MenuCard.css";

function MenuCard({ menu, onAddToCart }) {
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

        <button onClick={() => onAddToCart(menu)}>
          Add
        </button>
      </div>

      {menu.image && (
        <div className="menu-card-image">
          <img src={menu.image} alt={menu.name} />
        </div>
      )}
    </div>
  );
}

export default MenuCard;