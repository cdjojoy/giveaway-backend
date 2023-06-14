const joi = require('joi'); //joi Library for validation

const Order = require('../models/order'); //connectig from mongooseDB
const Product = require('../models/ product');
//const Product = require('../models/product'); //connectig from mongooseDB
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

//..........joi Validatation Data...........
const orderSchema = joi.object({
  orderId: joi.string().required(),
  userId: joi.string().alphanum().min(24).max(24).required(),
  products: joi.array()
    .items(
      joi.object({
        productId: joi.string().alphanum().min(24).max(24).required(),
        quantity: joi.number().integer().min(1).required(),
        price_each: joi.number().min(1).required(),
      })
    )
    .required(),
  totalAmount: joi.number().min(1).required(),
  createdAt: joi.date().default(Date.now),
});


//...........Implememt API endpoint/ router
/**  
 * A = Getting a list of Orders 
   B = Getting a single of Order by ID
   C = Adding a order to the mongoose Database
   D = Updating a order to the mongoose DB
   E = Deleting a order from the mongoose DB

   F = Registering a new user
   G = Logging in a user 
   H = Placing an order
 */

// checkOwner 
async function checkOwner(req, res, next) {
  try {
    const order = await Order.findById( req.params.id);

    if(!order ) {
      return res.status(404).send({ message: "Forbidden"});
    }

    if(order.userId != req.userPayload._id && !req.userPayload.isAdmin) {
      return res.status(403).send({message: "Forbidden"})
    }
    console.log('CheckOwner successful');
    next();

  }catch(err) {
   return res.status(400).send({ message: "Bad Request"});
  }
}

//A = Getting a list of Orders 
const readOrders = async (req, res) => {
    //True => 1 READ ALL 
    const choiceOrders = await Order.find({}).select("userId price date").sort({ date: "desc" });
      res.send( choiceOrders );
}
router.get('/', readOrders);

//B = Getting a single of Order by ID
const readOrderId = async (req, res) => {
 
    try {
        //true => 1 req. Single ID
        const orderId = req.params.id;
        const order = await Order.findById( orderId );
        
        //false => 0 req. Single ID ERROR
         if( !order ) {  
          return res.status(404).send( {"message": "Not Found"} ); 
         }else { 
          return res.send( order );  
         }

       } catch(err) { // false => 0 res. ERROR
          res.status(400).send({ "message": "Bad Request", "detail": err });
      }   
  }      
  router.get('/:id', auth, checkOwner, readOrderId);

//C = Adding a order to the mongoose Database
const createOrder = async (req, res) => {

    const newOrder = req.body;
  
    try { // True => 1 validation
        await orderSchema.validateAsync( newOrder );

    } catch(err) { // False => 0 validation ERROR
      return res.status(400).send({ message: err.details[0].message });
    }


    for( let i = 0; i < order.items.length; i++ ) {
      const item = order.items[i];

      try {
        const product = await Product.findById( item.item_id );
        
        if(product) {
          order.items[i].price_each = product.price;
          order.items[i].name = product.name;
          order.items[i].description = product.description;
          order.items[i].imageUrl = product.imageUrl;
        }
      }catch(err) {
        res.status(400).send({ "message": "Bad Request", "detail": err });
      }
    }
    // True => 1 new req.
    const order = new Order( newOrder );
    await order.save();
    
    //False => 0 res. ERROR
    res.status(202).send( order );
}
router.post('/', auth, checkOwner, createOrder);

//D = Updating a order to the mongoose DB
const updateOrderId =  async (req, res) => {
    const order = req.body;

    try {
      //True => 1 req. Validatation Data
      await orderSchema.validateAsync( order );

  } catch(err) { //False 0 res. Validatation Data ERROR
    return res.status(400).send({ message: err.details[0].message });
  }  

  try {
     const updateOrder = await Order.findByIdAndUpdate(req.params.id, order,  { new: true });
    
       if( updateOrder ) { // True => 1 being updated
          res.status(202).send( updateOrder );
        } else {  //False => 0 not updated ERROR
         res.status(404).send( {"message":"Not Found"} );
      }
  }catch(err){ //False => res. ERROR
    res.status(400).send( {"message":"Bad Request", "details": err } );
  }
   
}
router.put('/:id', auth, checkOwner, updateOrderId);

//E = Deleting a order from the mongoose DB
const deleteOrderId = async (req, res) => {
    try{
          const deleteOrder = await Order.findByIdAndDelete( req.params.id );
  
          if( deleteOrder ) {
             res.status(202).send({ "message": "Delete ID " + req.params.id });
          }
          else {
            res.status(404).send( {"message":"Not Found"} );
          }
    }catch(err){
      res.status(400).send({ "message":"Bad Request", "detail": err });
    }
  }
  router.delete('/:id', auth, checkOwner, deleteOrderId);

//F = Registering a new user
//G = Logging in a user 
//H = Placing an order

module.exports = orderSchema;
module.exports = router;

