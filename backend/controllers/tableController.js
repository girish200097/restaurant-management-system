const mongoose = require("mongoose");
const Table = require("../models/tableModel");
//createTable

const createTable =async (req,res) => {
    try {
        const {capacity,tableNumber} = req.body;

        if(!capacity || !tableNumber){
            return res.status(400).json({
                message: "All Fields are Required",
            });
        }
        const tableNumberExist = await Table.findOne({
            tableNumber,
        });
        if(tableNumberExist){
            return res.status(400).json({
                message: "Table number already exists",
            });
        }

        const newTable = await Table.create({
            tableNumber,
            capacity,

        })

        return res.status(201).json({
            message: "Table created successfully",
            table : newTable,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}



//getAllTables

const getAllTables = async(req,res) => {
    try {
        const tables = await Table.find();

        if(tables.length===0) {
            return res.status(200).json({
                message: "No tables found",
                tables: [],
            });
        }
        return res.status(200).json({
            message: "Tables found",
            tables,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

//getTableById

const getTableById = async(req,res) => {
    try {
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Table ID",
            });
        }
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({
                message: "Table not found",
            });
        }
        return res.status(200).json({
            message: "Table found",
            table,
        });
    }

    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

//updateTableById

const updateTableById = async(req,res) => {
    try {
        const {id} = req.params;
        const {capacity,tableNumber} = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Table ID",
            });
        }
        const updateData= {};
        if(tableNumber) {
            updateData.tableNumber = tableNumber;
        }
        if(capacity) {
            updateData.capacity = capacity;
        }   
        
        if(Object.keys(updateData).length === 0) { 
            return res.status(400).json({
                message: "Please provide at least one field to update",
            });
        }
        const updatedTable = await Table.findByIdAndUpdate(id, updateData, { 
            new: true,
            runValidators: true,
         });

        if(!updatedTable) {
            return res.status(404).json({
                message: "Table not found",
            });
        }
        return res.status(200).json({
            message: "Table updated successfully",
            table: updatedTable,
        });

    }

    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

//deleteTableById
const deleteTableById = async(req,res) => {
    try {
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Table ID",
            });
        }

        const deletedTable = await Table.findByIdAndDelete(id);
        if(!deletedTable) {
            return res.status(404).json({
                message: "Table not found",
            });
        }
        return res.status(200).json({
            message: "Table deleted successfully",
            table: deletedTable,
        }); 
    }

    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
//updateTableAvailability
const updateTableAvailability = async(req,res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Table ID",
            });
        }

        const validStatuses = ["available", "occupied", "reserved"];
        if(!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
            }); 
        }

        const updatedTable = await Table.findByIdAndUpdate(id,
             {status},
            {
            new: true,
            runValidators: true,
            });

        if(!updatedTable) {
            return res.status(404).json({
                message: "Table not found",
            });
        }
        return res.status(200).json({
            message: "Table availability updated successfully",
            table: updatedTable,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

module.exports = {
    createTable, 
    getAllTables,
    getTableById,
    updateTableById, 
    deleteTableById, 
    updateTableAvailability,
};