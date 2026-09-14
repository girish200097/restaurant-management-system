import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function VerifyLogin() {
    const navigate = useNavigate();
    localStorage.setItem("token", data.token);

    console.log("Login successful");

    navigate("/");
    
    useEffect(() => {
        const verifyUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            if (!token) {
                console.log("No login token found");
                return;
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/verify?token=${token}`
                );

                const data = await response.json();

                console.log("VERIFY RESPONSE:", data);

                if (!response.ok) {
                    console.log(data.message);
                    return;
                }

                localStorage.setItem("token", data.token);

                console.log("Login successful");
            } catch (error) {
                console.log(error);
            }
        };

        verifyUser();
    }, []);

    return (
        <div>
            <h1>Verifying Login...</h1>
        </div>
    );
}

export default VerifyLogin;