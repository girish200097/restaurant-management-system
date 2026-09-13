import "./MenuCard.css";
function MenuCard({ menu, onAddToCart }) {
  return (
    <div className="menu-card">
      <h2>{menu.name}</h2>
      <p>{menu.description}</p>
      <p className="menu-card-price">₹{menu.price}</p>

      <button onClick={() => onAddToCart(menu)}>
        Add to Cart
      </button>
    </div>
  );
}

export default MenuCard;