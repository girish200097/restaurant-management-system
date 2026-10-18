const mongoose = require("mongoose");
const menuSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        description:{
            type:String,
            trim:true,
        },
        price:{
            type:Number,
            required:true,
            min:0,

        },
        category:{
            type:String,
             enum: [
        "Starter",
        "Main Course",
        "Dessert",
        "Beverage"
    ],
            required:true,
            
        },

        foodType: {
            type: String,
            enum: ["veg", "non-veg"],
            default: "veg",
            required: true,
        },
        
        image:{
            type:String,
            default:"",
        },
        isAvailable:{
            type:Boolean,
            default:true,
        },

    },
    {
        timestamps:true,
    }
)

module.exports = mongoose.model("Menu",menuSchema);