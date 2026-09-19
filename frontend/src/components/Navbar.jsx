import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

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
      <div className="navbar-container">

        <div className="navbar-left">
          <h2 className="logo">
            Restaurant
          </h2>

          
            <div className="search-box">
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={(e) => {
                  const value = e.target.value;

                  setSearch(value);

                  navigate(
                    value.trim()
                      ? `/menu?search=${encodeURIComponent(value)}`
                      : "/menu"
                  );
                }}
              />

              <span>🔍</span>
            </div>
        </div>

        <button
          className="checkbtn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

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
              <button className="logout-button" onClick={handleLogout}>
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

      </div>
    </nav>
  );
}

export default Navbar;