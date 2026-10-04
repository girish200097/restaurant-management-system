const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    tableNumber : {
        type : Number,
        required: true,
        unique : true,
    },
    status : {
        type: String,
        enum:["available","occupied","reserved"],
        default: "available",
    },


},
    {
        timestamps: true,   
    })

const Table = mongoose.model("Table",tableSchema);
module.exports = Table;