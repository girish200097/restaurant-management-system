import { useState } from "react";
const PaymentButton = ({ orderId, onPaymentSuccess  }) => {
const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);
    const handlePayment = async () => {
        try {
            setError("");
            setIsLoading(true);
            const token = localStorage.getItem("token");
 
            if (!token) {
                setError("Please login first");
                setIsLoading(false);
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/payment/${orderId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            console.log("PAYMENT RESPONSE:", data);

           if (!response.ok) {
                setError(data.message || "Unable to start payment");
                return;
            }
            const options = {
                key: data.key_id,
                amount: data.razorpayOrder.amount,
                currency: data.razorpayOrder.currency,
                name: "Restaurant",
                description: "Restaurant Order",
                order_id: data.razorpayOrder.id,

                handler: async function (response) {
                    try {
                        const token = localStorage.getItem("token");

                        const verifyResponse = await fetch(
                            `${import.meta.env.VITE_API_URL}/payment/verify`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                },

                                body: JSON.stringify({
                                    razorpay_order_id:
                                        response.razorpay_order_id,

                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_signature:
                                        response.razorpay_signature,
                                }),
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok) {
                            setError(verifyData.message || "Payment verification failed");
                            return;
                        }

                        console.log(verifyData);
                        onPaymentSuccess(verifyData);
                    }
                    catch (error) {
                        console.log(error);
                    }
                },
                modal :{
                    ondismiss: function() {
                        console.log("Payment cancelled by user")
                    }
                }
                
            };

            const razorpay = new window.Razorpay(options);

            razorpay.open();
        }

        catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again.");
        }
        finally {
        setIsLoading(false);
    }
    };

    return (
       <button
    onClick={handlePayment}
        disabled={isLoading}
    >
        {isLoading ? "Opening Payment..." : "Pay Now"}
        {error && (
            <p>{error}</p>
        )}
    </button>
    
    );
};

export default PaymentButton;