import { useState } from "react";

function CallWaiter() {
    const [calling, setCalling] = useState(false);

    const handleCallWaiter = async () => {
        try {
            const token = localStorage.getItem("token");

            // Get customer's orders
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/order/my-orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to get your order");
                return;
            }

            const orders = data.orders || [];

            // Find the customer's active order
            const activeOrder = [...orders]
                .reverse()
                .find(
                    (order) =>
                        order.paymentStatus !== "paid" &&
                        ["pending", "preparing", "served"].includes(
                            order.orderStatus
                        )
                );

            if (!activeOrder) {
                alert("You don't have an active order");
                return;
            }

            setCalling(true);

            // Call the assigned waiter
            const callResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/order/${activeOrder._id}/call-waiter`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const callData = await callResponse.json();

            if (!callResponse.ok) {
                alert(callData.message || "Failed to call waiter");
                setCalling(false);
                return;
            }

            alert("Waiter has been called 🔔");

        } catch (error) {
            console.log("Call waiter error:", error);
            alert("Something went wrong");
            setCalling(false);
        }
    };

    return (
        <div>
            <h1>Call Waiter</h1>

            <button
                onClick={handleCallWaiter}
                disabled={calling}
            >
                {calling ? "Waiter Called ✓" : "🔔 Call Waiter"}
            </button>
        </div>
    );
}

export default CallWaiter;