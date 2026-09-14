import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function VerifyLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

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

                console.log("Login successful");

                navigate("/");
            } catch (error) {
                console.log(error);
            }
        };

        verifyUser();
    }, [navigate]);

    return (
        <div>
            <h1>Verifying Login...</h1>
        </div>
    );
}

export default VerifyLogin;