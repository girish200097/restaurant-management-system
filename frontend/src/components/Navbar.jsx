import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <nav>
      <div className="navbar-header">
        <h2>Restaurant Management System</h2>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      <ul className={isMenuOpen ? "nav-links active" : "nav-links"}>
        <li>
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>
        </li>

        <li>
          <Link to="/menu" onClick={closeMenu}>
            Menu
          </Link>
        </li>

        <li>
          <Link to="/room-booking" onClick={closeMenu}>
            Book Room
          </Link>
        </li>

        <li>
          <Link to="/table-reservation" onClick={closeMenu}>
            Reserve Table
          </Link>
        </li>

        <li>
          <Link to="/call-waiter" onClick={closeMenu}>
            Call Waiter
          </Link>
        </li>

        {isLoggedIn ? (
          <li>
            <button onClick={handleLogout}>
              Logout
            </button>
          </li>
        ) : (
          <li>
            <Link to="/login" onClick={closeMenu}>
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;