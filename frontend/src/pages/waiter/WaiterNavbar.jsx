import { Link } from "react-router-dom";
import "./WaiterNavbar.css";

function WaiterNavbar() {
    return (
        <nav className="waiter-navbar">
            <div className="waiter-navbar-logo">
                Restaurant
            </div>

            <div className="waiter-navbar-links">
                <Link to="/waiter-dashboard">
                    My Orders
                </Link>

                <div className="waiter-availability">
                    <span className="waiter-availability-text">
                        Unavailable
                    </span>

                    <button className="waiter-toggle">
                        <span className="waiter-toggle-circle"></span>
                    </button>
                </div>

                <button className="waiter-logout">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default WaiterNavbar;