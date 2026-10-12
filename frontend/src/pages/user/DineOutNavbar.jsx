
import "./DineOutNavbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";


function DineOutNavbar() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedTable");

    setIsLoggedIn(false);
    setIsMenuOpen(false);

    navigate("/");
  };

  return (
    <nav className="dineout-nav">
      <div className="dineout-navbar-container">
        <h2 className="dineout-logo">DineOut</h2>

        <button
          className="dineout-checkbtn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <ul
          className={
            isMenuOpen
              ? "dineout-nav-links active"
              : "dineout-nav-links"
          }
        >
          <li>
            <Link to="/home" onClick={closeMenu}>
              Home
            </Link>
          </li>

          <li>
            <Link to="/dineout" onClick={closeMenu}>
              Menu
            </Link>
          </li>

          <li>
            <Link to="/table-reservation" onClick={closeMenu}>
              Reserve Table
            </Link>
          </li>

          <li>
            <Link to="/my-orders" onClick={closeMenu}>
              My Orders
            </Link>
          </li>

          <li>
            <button
              className="dineout-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default DineOutNavbar;
