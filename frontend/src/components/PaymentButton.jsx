const PaymentButton = ({ orderId }) => {

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:3000/payment/${orderId}`,
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
                console.log(data);
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
                            "http://localhost:3000/payment/verify",
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
                            console.log(verifyData);
                            return;
                        }

                        console.log(verifyData);
                        alert(verifyData.message);
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
        }
    };

    return (
        <button onClick={handlePayment}>
            Pay Now
        </button>
    );
};

export default PaymentButton;