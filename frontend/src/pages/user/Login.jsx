import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("EMAIL:", email);
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