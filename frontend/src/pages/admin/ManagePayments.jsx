import { useEffect, useRef, useState } from "react";
import "./ManagePayments.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ManagePayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPayment, setExpandedPayment] = useState(null);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [deletingSelected, setDeletingSelected] = useState(false);

    const longPressTimer = useRef(null);
    const suppressNextClick = useRef(false);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

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

    const interval = setInterval(fetchPayments, 2000);

    return () => {
        clearInterval(interval);
        clearTimeout(longPressTimer.current);
    };
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

        return paymentStatusMatch;
    });

    const togglePayment = (paymentId) => {
        setExpandedPayment((current) =>
            current === paymentId ? null : paymentId
        );
    };
const handlePointerDown = (paymentId) => {
    if (selectionMode || deletingSelected) return;

    clearTimeout(longPressTimer.current);

    longPressTimer.current = setTimeout(() => {
        suppressNextClick.current = true;
        setSelectionMode(true);
        setSelectedPaymentIds([paymentId]);
    }, 550);
};

const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
};

    const handlePaymentClick = (paymentId) => {
        if (suppressNextClick.current) {
            suppressNextClick.current = false;
            return;
        }

        if (selectionMode) {
            setSelectedPaymentIds((current) => {
                const updated = current.includes(paymentId)
                    ? current.filter((id) => id !== paymentId)
                    : [...current, paymentId];

                if (updated.length === 0) {
                    setSelectionMode(false);
                }

                return updated;
            });

            return;
        }

        togglePayment(paymentId);
    };

    const cancelSelection = () => {
        setSelectedPaymentIds([]);
        setSelectionMode(false);
    };

    const handleBulkDelete = async () => {
        if (selectedPaymentIds.length === 0 || deletingSelected) return;

        const confirmed = window.confirm(
            `Permanently delete ${selectedPaymentIds.length} selected payment(s)?`
        );

        if (!confirmed) return;

        setDeletingSelected(true);

        try {
            const token = localStorage.getItem("adminToken");

            const results = await Promise.allSettled(
                selectedPaymentIds.map(async (paymentId) => {
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
                        throw new Error(data.message || "Delete failed");
                    }

                    return paymentId;
                })
            );

            const deletedIds = results
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);

            const failedIds = results
                .filter((result) => result.status === "rejected")
                .map((result) => {
                    return selectedPaymentIds[
                        results.indexOf(result)
                    ];
                });

            setPayments((current) =>
                current.filter((payment) => !deletedIds.includes(payment._id))
            );

            setSelectedPaymentIds(failedIds);

            if (deletedIds.includes(expandedPayment)) {
                setExpandedPayment(null);
            }

            if (failedIds.length === 0) {
                cancelSelection();
                alert(`${deletedIds.length} payment(s) deleted successfully.`);
            } else {
                setSelectionMode(true);
                alert(
                    `${deletedIds.length} deleted. ` +
                    `${failedIds.length} failed. You can retry the remaining payments.`
                );
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            alert("Failed to delete selected payments.");
        } finally {
            setDeletingSelected(false);
        }
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
                                key={payment._id}
                                className={`payment-card ${
                                    expandedPayment === payment._id ? "expanded" : ""
                                } ${
                                    selectedPaymentIds.includes(payment._id)
                                        ? "payment-card-selected"
                                        : ""
                                }`}
                                onPointerDown={() => handlePointerDown(payment._id)}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                onContextMenu={(event) => {
                                    if (!selectionMode) event.preventDefault();
                                }}
                            >
                                <div
                                    className="payment-summary"
                                    onClick={() => handlePaymentClick(payment._id)}
                                >
                                    {selectionMode && (
                                        <span
                                            className={`payment-select-indicator ${
                                                selectedPaymentIds.includes(payment._id)
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            {selectedPaymentIds.includes(payment._id) ? "✓" : ""}
                                        </span>
                                    )}

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

                                {expandedPayment === payment._id && !selectionMode && (
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
            {selectionMode && (
            <div className="payment-bulk-actions">
                <span>{selectedPaymentIds.length} selected</span>

                <button
                    type="button"
                    onClick={cancelSelection}
                    disabled={deletingSelected}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="payment-bulk-delete-btn"
                    onClick={handleBulkDelete}
                    disabled={
                        deletingSelected || selectedPaymentIds.length === 0
                    }
                >
                    {deletingSelected
                        ? "Deleting..."
                        : `🗑️ Delete Selected (${selectedPaymentIds.length})`}
                </button>
            </div>
        )}
        </div>
    );
}

export default ManagePayments;