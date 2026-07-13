const express = require("express");

const router = express.Router();

const menuItems = [
  {
    id: 1,
    name: "Pizza",
    price: 250,
  },
  {
    id: 2,
    name: "Burger",
    price: 150,
  },
];

router.get("/", (req, res) => {
  res.json(menuItems);
});



router.post("/", (req, res) => {
  menuItems.push(req.body);

  res.json({
    message: "Menu item added",
  });
});

// router.delete("/:id", (req, res) => {
//   const id = Number(req.params.id);

//   const updatedMenu = menuItems.filter(item => item.id !== id);

//   menuItems.length = 0;
//   menuItems.push(...updatedMenu);

//   res.json({
//     message: "Menu item deleted successfully",
//   });
// }); 
// router.delete("/:id",(req,res)=> {
//   const id = Number(req.params.id)
// const index= menuItems.findIndex(item => item.id===id);
// if (index===-1){
//   res.status(404).json({message:"Menu item not found"});
// }
// menuItems.splice(index,1);
// res.json({
//   message:"Menu item deleted successfully"
// })

// })

router.delete("/:id",(req,res)=>{
  const id = Number(req.params.id);
  const index = menuItems.findIndex(item=>item.id===id);

  if(index===-1) {
    return res.status(404).json({
      message: "item not found"
    })
  }
  menuItems.splice(index,1);
  res.json({
    message:"deleted successsfully"
  })
})
module.exports = router;

router.put("/:id",(req,res)=> {
  const id = Number(req.params.id);

  const menuItem = menuItems.find(item=> item.id===id);
  if(!menuItem){
    return res.status(404).json({
      message:"item not found",
    })
  }
  menuItem.name=req.body.name;
  menuItem.price= req.body.price;

  res.json({
    message:"item updated successfully",
    menuItem
  })

})