const express = require("express");

const {addMenu,getAllMenu,getMenuById,updateMenu,deleteMenu,updateMenuAvailability,} = require("../controllers/menuController");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();
     
router.post("/", adminMiddleware, upload.single("image"), addMenu);

router.get("/", getAllMenu);

router.get("/:id", getMenuById);

router.put("/:id", adminMiddleware, updateMenu);

router.delete("/:id", adminMiddleware, deleteMenu);

router.patch("/:id/availability", adminMiddleware, updateMenuAvailability);

module.exports = router;