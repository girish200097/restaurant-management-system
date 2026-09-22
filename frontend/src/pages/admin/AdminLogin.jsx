import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();
            console.log("ADMIN LOGIN RESPONSE:", data);

            if (!response.ok) {
                setMessage(data.message || "Login failed");
                return;
            }

            localStorage.setItem("adminToken", data.token);

            navigate("/admin/dashboard");

        } catch (error) {
            console.log(error);
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
            <div className="admin-login-page">

                <div className="admin-login-card">

                    <h1>Admin Login</h1>

                    <form
                        className="admin-login-form"
                        onSubmit={handleLogin}
                    >

                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    {message && (
                        <p className="admin-login-message">
                            {message}
                        </p>
                    )}

                </div>

            </div>
        );
}

export default AdminLogin;