import "./Navbar.css";
import { Link } from "react-router-dom";
function Navbar() {
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
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
