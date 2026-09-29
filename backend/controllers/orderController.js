const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Menu = require("../models/Menu");
const mongoose = require("mongoose");
const User = require("../models/User");
const { getIO } = require("../socket");

//createOrder
const createOrder = async(req,res) => {
    try{
        const {tableId} = req.params;
        const {items} = req.body;

        if(!mongoose.Types.ObjectId.isValid(tableId)){
            return res.status(400).json({
                message: "Invalid table Id",
            });
        }

        if(!items || items.length === 0){
            return res.status(400).json({
                message: "Add atleast one item to the order",
            });
        }
        const table = await Table.findById(tableId);
        if(!table){
            return res.status(404).json({
                message: "Table not found",
            });
        }
        if(table.status === "reserved"){
            return res.status(400).json({
                message: "Table is reserved",
            });
        }

        const activeOrder = await Order.findOne({
            table: tableId,
            customer: req.user.userId,
            paymentStatus: { $ne: "paid" },
            orderStatus: {
                $in: ["pending", "preparing", "served"],
            },
        });
        let totalAmount = 0;

        if (activeOrder) {
    const updatedOrderItems = [];
    let totalAmount = 0;

    for (const newItem of items) {
        if (newItem.quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0",
            });
        }

        const menu = await Menu.findById(newItem.menuItem);

        if (!menu) {
            return res.status(404).json({
                message: "Menu item not found",
            });
        }

        if (!menu.isAvailable) {
            return res.status(400).json({
                message: "Menu item is not available",
            });
        }

        totalAmount += menu.price * newItem.quantity;

        updatedOrderItems.push({
            menuItem: newItem.menuItem,
            quantity: newItem.quantity,
            price: menu.price,
        });
    }

    activeOrder.items = updatedOrderItems;
    activeOrder.totalAmount = totalAmount;

    // Assign waiter only if the existing order doesn't have one
    if (!activeOrder.waiter) {
        const availableWaiters = await User.find({
            role: "waiter",
            isAvailable: true,
        });

        let assignedWaiter = null;

        if (availableWaiters.length > 0) {
            let fewestOrders = Infinity;

            for (const waiter of availableWaiters) {
                const orderCount = await Order.countDocuments({
                    waiter: waiter._id,
                    isActive: true,
                    orderStatus: {
                        $in: ["pending", "preparing", "served"],
                    },
                });

                if (orderCount < fewestOrders) {
                    fewestOrders = orderCount;
                    assignedWaiter = waiter._id;
                }
            }
        }

        if (assignedWaiter) {
            activeOrder.waiter = assignedWaiter;
        }
    }

    await activeOrder.save();

    return res.status(200).json({
        message: "Order updated successfully",
        order: activeOrder,
    });
}

       else {
        const orderItems = [];
        let totalAmount = 0;

        for(const newItem of items) {
            if (newItem.quantity <= 0) {
                return res.status(400).json({
                    message: "Quantity must be greater than 0",
                });
            }
            const menu = await Menu.findById(newItem.menuItem);
            if(!menu) {
                return res.status(404).json({
                    message: `Menu item not found`,
                });
            }
            if(!menu.isAvailable){
                return res.status(400).json({
                    message: "Menu item is not available",
                });
            }
            totalAmount += menu.price * newItem.quantity;
            orderItems.push({
            menuItem: newItem.menuItem,
            quantity: newItem.quantity,
            price: menu.price,
    });
        }

        console.log("REQ.USER:", req.user);
        console.log("USER ID:", req.user.userId);

        const availableWaiters = await User.find({
                role: "waiter",
                isAvailable: true,
            });

            let assignedWaiter = null;

            if (availableWaiters.length > 0) {
                let fewestOrders = Infinity;

                for (const waiter of availableWaiters) {
                    const orderCount = await Order.countDocuments({
                        waiter: waiter._id,
                        isActive: true,
                        orderStatus: {
                            $in: ["pending", "preparing", "served"],
                        },
                    });

                    if (orderCount < fewestOrders) {
                        fewestOrders = orderCount;
                        assignedWaiter = waiter._id;
                    }
                }
            }

            const newOrder = await Order.create({
                customer: req.user.userId,
                table: tableId,
                items: orderItems,
                totalAmount,
                waiter: assignedWaiter,
            });
        table.status = "occupied";
        await table.save(); 
        return res.status(201).json({
            message: "Order created successfully",
            order: newOrder,
        });
        }
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

//getAllOrders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        if (orders.length === 0) {
            return res.status(200).json({
                message: "No orders found",
                orders: [],
            });
        }

        return res.status(200).json({
            message: "Orders found",
            orders,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

//getOrderById
const getOrderById = async (req, res) => {
    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }

        const order = await Order.findById(id)
        .populate("customer", "email")
        .populate("table", "tableNumber capacity")
        .populate("items.menuItem", "name price");

        if(!order){
            return res.status(404).json({
                message: "Order not found",
            });
        }
        return res.status(200).json({
            message: "Order found",
            order,
        });
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });

    }
}

//updateOrderStatus
const updateOrderStatus = async (req,res) => {
    try{ 
        const {id} = req.params;
        const {orderStatus} = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }
      

        if(!orderStatus) {
            return res.status(400).json({
                message: "Order status is required",
            });
        }

        const validStatuses = [
            "pending",
            "preparing",
            "served",
            "completed",
            "cancelled"
            ];

        if(!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                message: `Invalid order status valid statuses are 
                ${validStatuses.join(", ")}`,
            });
        }

        if (orderStatus === "completed") {
            return res.status(400).json({
                message: "Order can only be completed after payment"
            });
        }

        const order = await Order.findById(id);
        if(!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.orderStatus === "completed") {
            return res.status(400).json({
                message: "Completed orders cannot be updated",
            });
        }
        if(!order.waiter || order.waiter.toString() !== req.user.userId){
            return res.status(403).json({
                message: "You can only update your assigned orders",
            })
        }

        order.orderStatus = orderStatus;
        await order.save();


        const io = getIO();

        io.to(`order_${order._id}`).emit("orderStatusUpdated", {
            orderId: order._id.toString(),
            orderStatus: order.orderStatus
        });

        return res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

//assignOrderToWaiter
const assignOrderToWaiter = async (req, res) => {
    try {
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }

        const order = await Order.findById(id);
        if(!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if(order.waiter) {
            return res.status(400).json({
                message: "Order is already assigned to a waiter",
            });
        }

        order.waiter = req.user.userId;
        await order.save();
        return res.status(200).json({
            message: "Order assigned to waiter successfully",
            order,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

//getMyOrders
const getMyOrders = async(req,res)=> {
    try{
        console.log("Logged in user:", req.user);
        console.log("User ID:", req.user.userId);
        const orders = await Order.find({
            customer:req.user.userId,
        })
        .populate("table")
        .populate("items.menuItem")
        .populate("waiter");

        if(orders.length === 0) {
            return res.status(200).json({
                message: "No orders found",
                orders: [],
            });
        }

        return res.status(200).json({
            message: "Orders found",
            orders,
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

//// getMyAssignedOrders
const getMyAssignedOrders = async(req,res) => {
    try{
        const orders = await Order.find({
            waiter:req.user.userId,
        })
        .populate("customer","name")
        .populate("table")
        .populate("items.menuItem")
        .populate("waiter","name email");

        if(orders.length ===0) {
            return res.status(200).json({
                message: "No assigned order found",
                orders: [],
            });
        }
        return res.status(200).json({
            message: "Assigned orders found",
            orders,
        })
    }
    catch(error) {
        console.log(error)

        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}

//cacelOrder
const cancelOrder = async(req,res) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }
        const order = await Order.findById(id);
        if(!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }
        if (order.customer.toString() !== req.user.userId) {
        return res.status(403).json({
        message: "You can only cancel your own orders",
        });
        }

        if(order.orderStatus !== "pending") {
            return res.status(400).json({
                message: "Only pending orders can be cancelled",
            });
        }

        order.orderStatus = "cancelled";
        order.isActive = false;
        await order.save();
        return res.status(200).json({
            message: "Order cancelled successfully",
            order,
        });

    }

    catch(error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

//removeOrderItem

const removeOrderItem = async (req, res) => {
    try {
        const { orderId, menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                message: "Invalid menu item Id",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.customer.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only remove items from your own orders",
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                message: "You can only remove items from a pending order",
            });
        }

        const itemIndex = order.items.findIndex(
            item => item.menuItem.toString() === menuItemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                message: "Item not found in the order",
            });
        }

        order.items.splice(itemIndex, 1);

        // If last item is removed
        if (order.items.length === 0) {
            order.orderStatus = "cancelled";
            order.isActive = false;
            order.totalAmount = 0;

            await order.save();

            return res.status(200).json({
                message: "Last item removed, order cancelled",
                order,
            });
        }

        // Recalculate total
        let totalAmount = 0;

        for (const item of order.items) {
            totalAmount += item.price * item.quantity;
        }

        order.totalAmount = totalAmount;

        await order.save();

        return res.status(200).json({
            message: "Item removed successfully",
            order,
        });
    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    assignOrderToWaiter,
    getMyOrders,
    getMyAssignedOrders,
    cancelOrder,
    removeOrderItem,
}