import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");

   const handleSubmit = async (event) => {
        event.preventDefault();

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

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <button type="submit">
                    Send Login Link
                </button>
            </form>
        </div>
    );
}

export default Login;