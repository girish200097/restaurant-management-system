import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");

       if (token) {
        navigate("/home");
    }
    }, [navigate]);

   const handleSubmit = async (event) => {
    event.preventDefault();    
        
        setMessage("");
        setError("");
        setIsLoading(true);
        

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                    }),
                }
            );

            const data = await response.json();
            console.log("LOGIN RESPONSE:", data);
            if (!response.ok) {
                setError(data.message || "Unable to send login link");
                return;
            }
            setMessage("Login link sent! Please check your email.");

        } catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
       <div className="login-container">
            <h1>Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Login Link"}
                </button>
                {message && <p className="login-message">{message}</p>}
                {error && <p className="login-error">{error}</p>}
            </form>
        </div>
    );
}

export default Login;