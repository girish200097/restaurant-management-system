const mongoose = require("mongoose");
const Menu = require("../models/Menu");
const cloudinary = require("../config/cloudinary");

//addMenu
const addMenu = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({
                message: "All Fields are required",
            });
        }

        const existingMenu = await Menu.findOne({
            name: new RegExp(`^${name.trim()}$`, "i"),
        });

        if (existingMenu) {
            return res.status(409).json({
                message: "Menu Item is Already exist",
            });
        }

        let imageUrl = "";

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "restaurant-menu",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                uploadStream.end(req.file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        const menu = new Menu({
            name,
            description,
            price,
            category,
            image: imageUrl,
        });

        await menu.save();

        return res.status(201).json({
            message: "Menu Items Added Successfully",
            menu,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

//getAllMenu
const getAllMenu = async(req,res) => {
try{
    const menus =await Menu.find()
    if(menus.length === 0){
        return res.status(200).json({
    message: "Menu fetched successfully",
    menus: [],
});
    }
    return res.status(200).json({
        message: "Menu fetched successfully",
        menus,
    })
}

catch(error){
    return res.status(500).json({
        message:"Internal Server Error"
    })
}
}

//getMenuById
const getMenuById = async(req,res)=> {
    try{
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid menu Id",
            });
        }

        const menu = await Menu.findById(id);

        if(!menu) {
            return res.status(404).json({
                message: "Menu item not found",
            })
        }
        return res.status(200).json({
    message: "Menu fetched successfully",
    menu,
});

    }
    
    catch(error) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

//updateMenu
  //updateMenu
const updateMenu = async(req,res) => {
    try{
        const {id} = req.params;
        const {name,description,price,category,isAvailable} = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid menu ID",
            });
        }

        const updateData = {};

        if(name !== undefined) {
            updateData.name = name;
        }

        if(price !== undefined) {
            updateData.price = price;
        }

        if(description !== undefined) {
            updateData.description = description;
        }

        if(category !== undefined) {
            updateData.category = category;
        }

        if(isAvailable !== undefined) {
            updateData.isAvailable = isAvailable;
        }

        // Upload new image if admin selected one
        if(req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "restaurant-menu",
                    },
                    (error, result) => {
                        if(error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                uploadStream.end(req.file.buffer);
            });

            updateData.image = uploadResult.secure_url;
        }

        if(Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No fields provided to update"
            });
        }

        const updatedMenu = await Menu.findByIdAndUpdate(
            id,
            updateData,
            {
                new:true
            }
        );

        if(!updatedMenu){
            return res.status(404).json({
                message: "Menu item not found",
            });
        }

        return res.status(200).json({
            message: "Menu updated successfully",
            menu: updatedMenu
        });

    }
    catch(error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

    const deleteMenu = async(req,res) => {
        try {
            const {id} = req.params;
             if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message : "Invalid menu Id",
                });
             }

             const deletedMenu = await Menu.findByIdAndDelete(id);
             if(!deletedMenu) {
                 return res.status(404).json({
                    message: "Menu item not found",
                });
             }

             return res.status(200).json({
                message: "Menu deleted successfully",
                menu: deletedMenu
            });

        }
        catch(error) {
            return res.status(500).json({
                message : "Internal Server Error",
            });
        }

    }

    //updateMenuAvailability
    const updateMenuAvailability = async(req,res) => {
        try{
            const {id} = req.params;
            const {isAvailable} = req.body;

             if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message : "Invalid menu Id",
                });
             }
             if(typeof(isAvailable)  !== "boolean"){
                return res.status(400).json({
                    message: "The input is not a Boolean",
                });
             }

             const updatedMenu = await Menu.findByIdAndUpdate(
                id,
                {
                isAvailable,
                },
                {
                    new:true,
                }
             )

             if (!updatedMenu) {
                return res.status(404).json({
                    message: "Menu item not found",
                });
             }

             return res.status(200).json({
                 message: "Menu availability updated successfully",
                 menu : updatedMenu,
             });

        }
        catch(error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

module.exports = {
    addMenu,
    getAllMenu,
    getMenuById,
    updateMenu,
    deleteMenu,
    updateMenuAvailability,
}