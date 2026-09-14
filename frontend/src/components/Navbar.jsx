import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  return (
    <nav>
      <h2>Restaurant Management System</h2>

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/menu">Menu</Link>
        </li>
        <li>
  <Link to="/room-booking">Book Room</Link>
</li>
        <li>
  <Link to="/table-reservation">Reserve Table</Link>
</li>
        <li>
  <Link to="/call-waiter">Call Waiter</Link>
</li>
        {isLoggedIn ? (
          <li>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                navigate("/");
              }}
            >
              Logout
            </button>
          </li>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
