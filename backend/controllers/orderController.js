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

        const existingActiveOrder = await Order.findOne({
        table: tableId,
        customer: req.user.userId,
        paymentStatus: { $ne: "paid" },
        orderStatus: { $in: ["preparing", "served"] },
        });

        if (existingActiveOrder) {
        return res.status(400).json({
            message: "You can only update an order while its status is pending.",
        });
        }

       const activeOrder = await Order.findOne({
            table: tableId,
            customer: req.user.userId,
            paymentStatus: { $ne: "paid" },
            orderStatus: "pending",
        });
        let totalAmount = 0;

        if (activeOrder) {
                        const existingOrderItems = activeOrder.items || [];

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

                        const existingItem = existingOrderItems.find(
                            (item) =>
                                item.menuItem.toString() === newItem.menuItem.toString()
                        );

                        if (existingItem) {
                            // Same item already exists → increase quantity
                            existingItem.quantity += newItem.quantity;
                            existingItem.price = menu.price;
                        } else {
                            // New item → add it to the existing order
                            existingOrderItems.push({
                                menuItem: newItem.menuItem,
                                quantity: newItem.quantity,
                                price: menu.price,
                            });
                        }
                    }

                    let totalAmount = 0;

                    for (const item of existingOrderItems) {
                        totalAmount += item.price * item.quantity;
                    }

                    activeOrder.items = existingOrderItems;
                    activeOrder.totalAmount = totalAmount;
                    activeOrder.customerUpdatedAt = new Date();
    // Assign waiter only if the existing order doesn't have one
    if (!activeOrder.waiter) {
        const availableWaiters = await User.find({
            role: "waiter",
            isAvailable: true,
        });

        if (availableWaiters.length === 0) {
            return res.status(400).json({
                message: "No waiters are available at the moment. Please try again later.",
            });
        }

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
    activeOrder.customerUpdatedAt = new Date();

    await activeOrder.save();

    const io = getIO();

    io.to(`order_${activeOrder._id}`).emit("orderStatusUpdated", {
        orderId: activeOrder._id.toString(),
        orderStatus: activeOrder.orderStatus,
    });

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

        if (availableWaiters.length === 0) {
            return res.status(400).json({
                message: "No waiters are available at the moment. Please try again later.",
            });
        }

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
        const orders = await Order.find()
        .populate("customer", "name email")
        .populate("waiter", "name email")
        .populate("table", "tableNumber")
        .populate("items.menuItem", "name price");

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
        .populate("table", "tableNumber")
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

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.user.userId,
        })
            .populate("items.menuItem", "name image")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: orders.length
                ? "Orders found"
                : "No orders found",
            orders,
        });
    } catch (error) {
        console.log("Get my orders error:", error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


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

        order.orderStatus = "cancelled";order.orderStatus = "cancelled";
        order.isActive = false;
        await order.save();

       if (order.table) {
        const table = await Table.findById(order.table);

        if (table) {
            table.status = "available";
            await table.save();
        }
    }

        
        const io = getIO();

        const table = await Table.findById(order.table);

        const cancellationData = {
            orderId: order._id.toString(),
            orderStatus: "cancelled",
            tableNumber: table?.tableNumber,
        };

        io.to(`order_${order._id}`).emit(
            "orderCancelled",
            cancellationData
        );

        if (order.waiter) {
            io.to(`waiter_${order.waiter.toString()}`).emit(
                "orderCancelled",
                cancellationData
            );
        }

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

//deleteOrder
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            message: "Order deleted successfully",
        });

    } catch (error) {
        console.log("Delete order error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// callWaiter
const callWaiter = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }

        const order = await Order.findById(id)
            .populate("table", "tableNumber")
            .populate("waiter", "name");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        // Make sure the customer owns this order
        if (order.customer.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only call the waiter for your own order",
            });
        }

        // Make sure a waiter is assigned
        if (!order.waiter) {
            return res.status(400).json({
                message: "No waiter is assigned to this order",
            });
        }

        const io = getIO();

        // Send notification only to the assigned waiter
        io.to(`waiter_${order.waiter._id}`).emit("waiterCall", {
            orderId: order._id.toString(),
            tableNumber: order.table?.tableNumber,
            message: "Table is calling you",
        });

        return res.status(200).json({
            message: "Waiter has been called",
        });

    } catch (error) {
        console.log("Call waiter error:", error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

//createDineOutOrder
const createDineOutOrder = async (req, res) => {
  try {
    const { items, orderType, fulfillmentType, deliveryAddress } = req.body;

    // Only Dine-Out orders are accepted here
    if (orderType !== "dine-out") {
      return res.status(400).json({
        message: "Order type must be dine-out",
      });
    }

    // Validate delivery or takeaway
    if (!["delivery", "takeaway"].includes(fulfillmentType)) {
      return res.status(400).json({
        message: "Choose delivery or takeaway",
      });
    }

    if (
      fulfillmentType === "delivery" &&
      (!deliveryAddress || !deliveryAddress.trim())
    ) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Please add items to your cart",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.menuItem)) {
        return res.status(400).json({
          message: "Invalid menu item",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be a positive integer",
        });
      }

      const menu = await Menu.findById(item.menuItem);

      if (!menu || !menu.isAvailable) {
        return res.status(400).json({
          message: "A selected menu item is unavailable",
        });
      }

      orderItems.push({
        menuItem: menu._id,
        quantity,
        price: menu.price,
      });

      totalAmount += menu.price * quantity;
    }

    const order = await Order.create({
      customer: req.user.userId,
      orderType: "dine-out",
      fulfillmentType,
      ...(fulfillmentType === "delivery"
        ? { deliveryAddress: deliveryAddress.trim() }
        : {}),
      items: orderItems,
      totalAmount,
    });

    return res.status(201).json({
      message: "Dine-Out order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Dine-Out Order Error:", error);

    return res.status(500).json({
      message: "Failed to create Dine-Out order",
    });
  }
};

//updateOrderItems
const updateOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Order items are required",
            });
        }

        const order = await Order.findOne({
            _id: id,
            customer: req.user.userId,
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                message: "Only pending orders can be updated",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                message: "Paid orders cannot be updated",
            });
        }

        let totalAmount = 0;
        const updatedItems = [];

        for (const item of items) {
            if (!item.menuItem || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({
                    message: "Invalid menu item or quantity",
                });
            }

            const menu = await Menu.findById(item.menuItem);

            if (!menu || !menu.isAvailable) {
                return res.status(400).json({
                    message: "A menu item is unavailable",
                });
            }

            updatedItems.push({
                menuItem: menu._id,
                quantity: item.quantity,
                price: menu.price,
            });

            totalAmount += menu.price * item.quantity;
        }

        order.items = updatedItems;
        order.totalAmount = totalAmount;

        await order.save();

        return res.status(200).json({
            message: "Order updated successfully",
            order,
        });
    } catch (error) {
        console.error("Update order items error:", error);

        return res.status(500).json({
            message: "Failed to update order items",
        });
    }
};

module.exports = {
    createOrder,
    updateOrderItems,
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
}