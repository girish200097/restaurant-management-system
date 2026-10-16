import "./Navbar.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
  const fetchCustomerProfile = async () => {
    const token = localStorage.getItem("token");

    if (!isLoggedIn || !token) {
      setCustomer(null);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCustomer(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch customer profile:", error);
    }
  };

  fetchCustomerProfile();
}, [isLoggedIn]);

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
  setCustomer(null);
  setIsProfileOpen(false);
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
            <li className="profile-menu">
              <button
                className="profile-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {customer?.name || "My Profile"}
                <span>{isProfileOpen ? "▲" : "▼"}</span>
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <h3>{customer?.name || "Customer"}</h3>

                  <div className="profile-detail">
                    <span>Email</span>
                    <p>{customer?.email || "Not available"}</p>
                  </div>

                  <div className="profile-detail">
                    <span>Phone</span>
                    <p>{customer?.phone || "Not available"}</p>
                  </div>

                  <Link
                    to="/order-history"
                    className="order-history-link"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    🕘 Order History
                  </Link>

                  <button
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
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