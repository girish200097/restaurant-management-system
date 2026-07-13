const User = require("../models/User");

const updateProfile = async (req, res) => {
 const user = await User.findById(req.user.userId);

 if(!user){
    return res.status(404).json({
        message:"user not found",
    });
 }
 const {name,phone} =req.body;

 if(!name || !phone) {
    return res.status(400).json({
        message:"name  and phone are required",
    });
 }

 user.name= name;
 user.phone= phone;
 user.profileCompleted=true;
 await user.save();

 return res.json({
    message:"profile completed successfully",
    user,
 })

};

module.exports = {
    updateProfile,
};