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
//getAllUsers
const getAllUsers = async(req,res) => {
    try{
        const users = await User.find({});
        if(users.length === 0){
            return res.status(200).json({
                message: "No users found",
                users: [],
            });
        }
        return res.status(200).json({
            message: "Users found",
            users,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Something went wrong"
        })
    }
};

module.exports = {
    updateProfile,
    getAllUsers,
};