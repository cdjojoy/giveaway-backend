const joi = require('joi'); //joi Library for validation

const  Product   = require('../models/ product'); //connectig from mongooseDB

const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();

//..........joi Validatation Data...........

const productSchema = joi.object({
  name: joi.string().min(1).max(255).required(),
  description: joi.string().required(),
  price: joi.number().min(1).max(99999).required(),
  imageUrl: joi.string().required(),
});

//...........Implememt API endpoint/ router
/**  
 * A = Getting a list of Products 
   B = Getting a single of Product by ID
   C = Adding a product to the mongoose Database
   D = Updating a product to the mongoose DB
   E = Deleting a product from the mongoose DB

   F = Registering a new user
   G = Logging in a user 
   H = Placing an order
 */


//A = Getting a list of Products 
const readProducts = async (req, res) => {
    //True => 1 READ ALL 
    const choiceProducts = await Product.find();
      res.send( choiceProducts );
}
router.get('/', readProducts);

//B = Getting a single of Product by ID
const readProductId = async (req, res) => {
 
    try {
        //true => 1 req. Single ID
        const productId = req.params.id;
        const product = await Product.findById( productId );
        
        //false => 0 req. Single ID ERROR
         if( !product ) {  
          return res.status(404).send( {"message": "Not Found"} ); 
         }else { 
          return res.send( product );  
         }

       } catch(err) { // false => 0 res. ERROR
          res.status(400).send({ "message": "Bad Request", "detail": err });
      }   
  }      
  router.get('/:id', readProductId);

//C = Adding a product to the mongoose Database
const createProduct = async (req, res) => {

  if( !req.userPayload.isAdmin) {
    return res.status(403).send( {message: "Forbidden"} );
  }
    const newProduct = req.body;
  
    try { // True => 1 validation
        await productSchema.validateAsync( newProduct );

    } catch(err) { // False => 0 validation ERROR
      return res.status(400).send({ message: err.details[0].message });
    }
     
    const product = new Product (newProduct);
    await product.save();
    res.status(202).send( product );
}
router.post('/', auth, createProduct);
  

//D = Updating a product to the mongoose DB
const updateProductId =  async (req, res) => {

  if( !req.userPayload.isAdmin) {
    return res.status(403).send( {message: "Forbidden"} );
  }
    const product = req.body;

    try {
      //True => 1 req. Validatation Data
      await productSchema.validateAsync( product );

  } catch(err) { //False 0 res. Validatation Data ERROR
    return res.status(400).send({ message: err.details[0].message });
  }  

  try {
     const updateProduct = await Product.findByIdAndUpdate(req.params.id, product,  { new: true });
    
       if( updateProduct ) { // True => 1 being updated
          res.status(202).send( updateProduct );
        } else {  //False => 0 not updated ERROR
         res.status(404).send({"message":"Not Found"});
      }
  }catch(e){ //False => res. ERROR
    res.status(400).send({"message":"Bad Request", "details": e});
  }
   
}
router.put('/:id', auth, updateProductId);

//E = Deleting a product from the mongoose DB
const deleteProductId = async (req, res) => {
  if( !req.userPayload.isAdmin) {
    return res.status(403).send( {message: "Forbidden"} );
  }
    try{
          const result = await Product.findByIdAndDelete( req.params.id );
  
          if( result ) {
             res.status(202).send({ "message": "Delete ID " + req.params.id });
          }
          else {
            res.status(404).send({"message":"Not Found"});
          }
    }catch(err){
      res.status(400).send({ "message":"Bad Request", "detail": err });
    }
  }
  router.delete('/:id', auth, deleteProductId);

module.exports = productSchema;
module.exports = router;