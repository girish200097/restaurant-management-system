import "./Navbar.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
const [searchParams] = useSearchParams();

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Keep input synchronized with URL
  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
  }, [searchParams]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
  const value = e.target.value;

  setSearch(value);

  if (value.trim()) {
    navigate(
      `/menu?search=${encodeURIComponent(value)}`
    );
  } else {
    navigate("/menu");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedTable");
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
              onChange={handleSearch}
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

        <ul
          className={
            isMenuOpen
              ? "nav-links active"
              : "nav-links"
          }
        >

          <li>
            <Link to="/home" onClick={closeMenu}>
              Home
            </Link>
          </li>

          <li>
            <Link to="/menu" onClick={closeMenu}>
              Menu
            </Link>
          </li>

          {isLoggedIn ? (
            <li>
              <button
                className="logout-button"
                onClick={handleLogout}
              >
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