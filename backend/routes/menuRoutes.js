const express = require("express");

const {addMenu,getAllMenu,getMenuById,updateMenu,deleteMenu,updateMenuAvailability,} = require("../controllers/menuController");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

router.post("/menu",adminMiddleware,addMenu);
router.get("/menu",getAllMenu);
router.get("/menu/:id",getMenuById);
router.put("/menu/:id",adminMiddleware,updateMenu);
router.delete("/menu/:id",adminMiddleware,deleteMenu);
router.patch("/menu/:id/availability",adminMiddleware,updateMenuAvailability)


module.exports = router;