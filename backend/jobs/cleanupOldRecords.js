const cron = require("node-cron");
const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const cleanupOldRecords = () => {
    // Run every day at midnight
    cron.schedule("0 0 * * *", async () => {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 31);

            // Find orders older than 7 days
            const oldOrders = await Order.find({
                createdAt: { $lt: cutoffDate },
            }).select("_id");

            const orderIds = oldOrders.map(order => order._id);

            // Delete payments associated with old orders
            await Payment.deleteMany({
                $or: [
                    { order: { $in: orderIds } },
                    { createdAt: { $lt: cutoffDate } },
                ],
            });

            // Delete old orders
            const result = await Order.deleteMany({
                createdAt: { $lt: cutoffDate },
            });

            console.log(
                `Cleanup completed. Deleted ${result.deletedCount} old orders.`
            );
        } catch (error) {
            console.error("Automatic cleanup failed:", error);
        }
    });
};

module.exports = cleanupOldRecords;