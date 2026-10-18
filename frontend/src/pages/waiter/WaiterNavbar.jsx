import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import "./WaiterNavbar.css";


function WaiterNavbar() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [waiterName, setWaiterName] = useState("");

    

    useEffect(() => {
            const fetchProfile = async () => {
                try {
                    const token = localStorage.getItem("token");

                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/user/profile`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        console.log(data.message);
                        return;
                    }
                    setWaiterName(data.user.name);
                    setIsAvailable(data.user.isAvailable);

                } catch (error) {
                    console.log(error);
                }
            };

            fetchProfile();
        }, []);
    const toggleAvailability = async () => {
        const newStatus = !isAvailable;

        try {
            setIsUpdating(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/availability`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        isAvailable: newStatus,
                    }),
                }
            );

            const data = await response.json();

            console.log("AVAILABILITY RESPONSE:", data);

            if (!response.ok) {
                alert(data.message || "Failed to update availability");
                return;
            }

            setIsAvailable(data.isAvailable);
        } catch (error) {
            console.log(error);
        } finally {
            setIsUpdating(false);
        }
    };

        const handleLogout = async () => {
            try {
                const token = localStorage.getItem("token");

                if (isAvailable) {
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/user/availability`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                isAvailable: false,
                            }),
                        }
                    );
                }

                localStorage.removeItem("token");
                window.location.href = "/";
            } catch (error) {
                console.log("Logout error:", error);

                // Logout even if availability update fails
                localStorage.removeItem("token");
                localStorage.removeItem("userId");  
                window.location.href = "/";
            }
        };

    return (
        <nav className="waiter-navbar">
            <div className="waiter-navbar-logo">
                Restaurant
            </div>

            <div className="waiter-navbar-links">

                <div className="waiter-availability">
                    <span className="waiter-availability-text">
                        {isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <button
                        className={`waiter-toggle ${
                            isAvailable ? "active" : ""
                        }`}
                        onClick={toggleAvailability}
                        disabled={isUpdating}
                    >
                        <span className="waiter-toggle-circle"></span>
                    </button>
                </div>
                  <div className="waiter-name">
                    {waiterName}
                </div>              
             <button
                className="waiter-logout"
                onClick={handleLogout}
            >
                Logout
            </button>
            </div>
        </nav>
    );
}

export default WaiterNavbar;