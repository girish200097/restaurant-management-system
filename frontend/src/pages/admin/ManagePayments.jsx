import { useEffect, useState } from "react";
import "./ManagePayments.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ManagePayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPayment, setExpandedPayment] = useState(null);

    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [orderStatusFilter, setOrderStatusFilter] = useState("all");

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(`${VITE_API_URL}/payment`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setPayments(data.payments || []);
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.log("Payments error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleDeletePayment = async (paymentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this payment?"
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${VITE_API_URL}/payment/${paymentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.log(data.message);
                return;
            }

            setPayments((currentPayments) =>
                currentPayments.filter(
                    (payment) => payment._id !== paymentId
                )
            );

            if (expandedPayment === paymentId) {
                setExpandedPayment(null);
            }
        } catch (error) {
            console.log("Delete payment error:", error);
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const paymentStatusMatch =
            paymentStatusFilter === "all" ||
            payment.paymentStatus === paymentStatusFilter;

        const orderStatusMatch =
            orderStatusFilter === "all" ||
            payment.order?.orderStatus === orderStatusFilter;

        return paymentStatusMatch && orderStatusMatch;
    });

    const togglePayment = (paymentId) => {
        setExpandedPayment((current) =>
            current === paymentId ? null : paymentId
        );
    };

    if (loading) {
        return (
            <div className="manage-payments">
                <p className="payments-loading">Loading payments...</p>
            </div>
        );
    }

    return (
        <div className="manage-payments">
            <div className="manage-payments-header">
                <div>
                    <h1>Payments</h1>
                    <p>View customer payment details</p>
                </div>

                <div className="payments-filters">
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) =>
                            setPaymentStatusFilter(e.target.value)
                        }
                    >
                        <option value="all">All Payment Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                    </select>

                    <select
                        value={orderStatusFilter}
                        onChange={(e) =>
                            setOrderStatusFilter(e.target.value)
                        }
                    >
                        <option value="all">All Order Status</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {filteredPayments.length === 0 ? (
                <div className="no-payments">
                    <h3>No payments found</h3>
                    <p>No payments match the selected filters.</p>
                </div>
            ) : (
                <div className="payments-list">
                    {filteredPayments.map((payment) => {
                        const isExpanded =
                            expandedPayment === payment._id;

                        return (
                            <div
                                className={`payment-card ${
                                    isExpanded ? "expanded" : ""
                                }`}
                                key={payment._id}
                            >
                                <div
                                    className="payment-summary"
                                    onClick={() =>
                                        togglePayment(payment._id)
                                    }
                                >
                                    <div className="payment-main-info">
                                        <strong>
                                            ₹{payment.amount}
                                        </strong>

                                        <span>
                                            {payment.customer?.name ||
                                                "N/A"}
                                        </span>

                                        <span>
                                            {payment.customer?.email ||
                                                "N/A"}
                                        </span>
                                    </div>

                                    <div className="payment-summary-right">
                                        <span
                                            className={`payment-status ${payment.paymentStatus}`}
                                        >
                                            {payment.paymentStatus}
                                        </span>

                                        <span className="payment-expand">
                                            {isExpanded ? "▲" : "▼"}
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="payment-details">
                                        <div className="payment-detail">
                                            <strong>Order ID</strong>
                                            <p>
                                                {payment.order?._id ||
                                                    payment.order ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Table</strong>
                                            <p>
                                                {payment.order?.table
                                                    ?.tableNumber || "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Order Status</strong>
                                            <p>
                                                {payment.order
                                                    ?.orderStatus || "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Payment Status</strong>
                                            <p>
                                                {payment.paymentStatus}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Payment Method</strong>
                                            <p>
                                                {payment.paymentMethod ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Transaction ID</strong>
                                            <p>
                                                {payment.transaction ||
                                                    payment.razorpayPaymentId ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Razorpay Order ID</strong>
                                            <p>
                                                {payment.razorpayOrderId ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Date</strong>
                                            <p>
                                                {payment.createdAt
                                                    ? new Date(
                                                          payment.createdAt
                                                      ).toLocaleString()
                                                    : "N/A"}
                                            </p>
                                        </div>

                                        <div className="payment-detail">
                                            <strong>Receipt</strong>
                                            <p>
                                                {payment.receiptSent
                                                    ? "Sent"
                                                    : "Not Sent"}
                                            </p>
                                        </div>

                                        <div className="payment-actions">
                                            <button
                                                className="delete-payment-btn"
                                                onClick={() =>
                                                    handleDeletePayment(
                                                        payment._id
                                                    )
                                                }
                                                title="Delete payment"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ManagePayments;