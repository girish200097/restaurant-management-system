const express = require("express");
const { createTable,
        getAllTables,
        getTableById,
        updateTableById, 
        deleteTableById, 
        updateTableAvailability,
 } = require("../controllers/tableController");
const adminMiddleware = require("../middleware/adminMiddleware");

const router =express.Router();

router.post(
    "/table",
    adminMiddleware,
    createTable,
)
router.get(
    "/table",
    getAllTables,
)
router.get(
    "/table/:id",
    getTableById,
)
router.put(
    "/table/:id",
    adminMiddleware,
    updateTableById,
)
router.delete(
    "/table/:id",
    adminMiddleware,
    deleteTableById,
)
router.patch(
    "/table/:id/status",
    adminMiddleware,
    updateTableAvailability,
)
module.exports = router;