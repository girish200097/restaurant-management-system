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
                    Dashboard
                </Link>

                <button>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default WaiterNavbar;