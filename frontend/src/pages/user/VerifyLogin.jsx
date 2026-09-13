import { useEffect } from "react";

function VerifyLogin() {
    useEffect(() => {
        const verifyUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            console.log("LOGIN TOKEN:", token);
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