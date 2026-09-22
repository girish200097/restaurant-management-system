import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [profileCompleted, setProfileCompleted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/user/profile`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        name,
                        phone,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Something went wrong");
                return;
            }

            setProfileCompleted(true);

        } catch (error) {
            console.log(error);
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (profileCompleted) {
            return (
                <div className="home-page">
                    <div className="profile-card welcome-card">

                        <div className="welcome-icon">
                            🍽️
                        </div>

                        <h1>Welcome to Our Restaurant! 🎉</h1>

                        <p>
                            Your profile has been completed successfully.
                        </p>

                        <p>
                            We're happy to have you here. Explore our menu
                            and discover something delicious!
                        </p>

                        <button onClick={() => navigate("/menu")}>
                            Explore Menu
                        </button>

                    </div>
                </div>
            );
        }

    return (
        <div className="home-page">

            <div className="profile-card">

                <h1>Welcome! 👋</h1>

                <p>
                    Tell us a little about yourself before you continue.
                </p>

                <form className="profile-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
{/* 
                    <div className="form-group"> */}
                        <label>Phone Number</label>

                        <div className="phone-input">
                            <span className="country-code">+91</span>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                maxLength="10"
                                required
                            />
                        </div>
                    {/* </div> */}

                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Continue to Restaurant"}
                    </button>

                </form>

                {message && (
                    <p className="profile-message">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default Home;