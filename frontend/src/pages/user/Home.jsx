import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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

            navigate("/menu");

        } catch (error) {
            console.log(error);
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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

                    <div className="form-group">
                        <label>Phone Number</label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

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