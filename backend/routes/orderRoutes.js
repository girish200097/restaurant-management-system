const express = require("express");

const {createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    assignOrderToWaiter,
    getMyOrders,
    getMyAssignedOrders,
    cancelOrder,
    removeOrderItem,
    deleteOrder,
    callWaiter,
    createDineOutOrder,
    updateOrderItems,
} = require("../controllers/orderController");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const waiterMiddleware = require("../middleware/waiterMiddleware");
const router = express.Router();

router.post("/dineout", authMiddleware, createDineOutOrder);

router.post(
    "/:tableId",
     authMiddleware,
     createOrder
);

router.patch(
    "/:id/items",
    authMiddleware,
    updateOrderItems);

router.get(
    "/",
    adminMiddleware,
    getAllOrders
);
router.get(
    "/my-orders",
    authMiddleware,
    getMyOrders
);
router.get(
    "/my-assigned-orders",
    waiterMiddleware,
    getMyAssignedOrders
);

router.post(
    "/:id/call-waiter",
    authMiddleware,
    callWaiter
);

router.patch(
    "/:id/cancel",
    authMiddleware,
    cancelOrder
);
router.delete(
    "/:orderId/item/:menuItemId",
    authMiddleware,
    removeOrderItem
);

router.delete(
    "/:id",
    adminMiddleware,
    deleteOrder
);

router.get(
    "/:id",
    authMiddleware,
    getOrderById
);
router.patch(
    "/:id/status",
    waiterMiddleware,
    updateOrderStatus
);
router.patch(
    "/:id/assign",
    waiterMiddleware,
    assignOrderToWaiter
);


module.exports = router;