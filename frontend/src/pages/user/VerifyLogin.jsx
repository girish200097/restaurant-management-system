import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

function VerifyLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { setIsLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        const verifyUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            if (!token) {
                setError("No login token found");
                return;
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/verify?token=${token}`
                );

                const data = await response.json();

                console.log("VERIFY RESPONSE:", data);

                if (!response.ok) {
                    setError(data.message || "Login verification failed");
                    return;
                }

                localStorage.setItem("token", data.token);
                setIsLoggedIn(true);

                console.log("Login successful");

                if (data.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (data.profileCompleted) {
                    navigate("/menu");
                } else {
                    navigate("/home");
                }
            } catch (error) {
                console.log(error);
                setError("Something went wrong. Please try again.");
            }
        };

        verifyUser();
    }, [navigate]);

    return (
        <div>
            {error ? (
                <>
                    <h1>Login Failed</h1>
                    <p>{error}</p>

                    <button onClick={() => navigate("/login")}>
                        Back to Login
                    </button>
                </>
            ) : (
                <h1>Verifying Login...</h1>
            )}
        </div>
    );
}

export default VerifyLogin;