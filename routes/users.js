const joi = require('joi'); //joi Library for validation
const bcrypt = require('bcrypt');

const auth = require("../middleware/auth"); //Import auth middleware function

const User = require('../models/user'); //connectig from mongooseDB

const express = require('express');
const router = express.Router();

//..........joi Validatation Data...........
const userSchema = joi.object({
  firstName: joi.string().min(3).max(60).required(),
  lastName: joi.string().min(3).max(60).required(),
  email: joi.string().email().min(3).max(258).required(),
  DOB: joi.date().iso().required(),
  phone: joi.string().max(32).required(),
  password: joi.string().min(8).max(1000).required()
});

//...........Implememt API endpoint/ router
/**  
 * A = Getting a list of Users 
   B = Getting a single of User by ID
   C = Adding a user to the mongoose Database
   D = Updating a user to the mongoose DB
   E = Deleting a user from the mongoose DB

   F = Registering a new user
   G = Logging in a user 
   H = Placing an order
 */

 //middleware function
 function checkOwner(req, res, next) {

  if(req.userPayload._id != req.params.id && !req.userPayload.isAdmin) {
    return res.status(403).send( {message: 'Forbidden'} );
  }
  next();
 }

//A = Getting a list of Users 
const readUsers = async (req, res) => {
    //True => 1 READ ALL 
    const choiceUsers = await User.find().select('firstName email');
      res.send( choiceUsers );
}
router.get('/', readUsers);

//B = Getting a single of user by ID
const readUserId = async (req, res) => {

    try {
        //true => 1 REQUEST Single ID
        const userId = req.params.id;
        const user = await User
                    .findById( userId )
                    .select("firstName email phone DOB");
        
        //false => 0 req. Single ID ERROR
         if( !user ) {  
          return res.status(404).send( {message: "Not Found"} ); 
         }else {  //true => 1 RESPONSE Single ID
          return res.send( user );  
         }

       } catch(err) { // false => 0 res. ERROR
          res.status(400).send({ message: "Bad Request", "detail": err });
      }   
  }      
  router.get('/:id', auth, checkOwner, readUserId);

//C = Adding/ Creating a user to the mongoose Database
const createUser = async (req, res) => {
    const user = req.body;
  
    try { // True => 1 validation
        await userSchema.validateAsync( user );

    } catch(err) { // False => 0 validation ERROR
      return res.status(400).send({ message: err.details[0].message });
    }
     //Encrypt the User Pw => varibale Salt (KEYS) + hash(STORAGE) method
      //user.password = encrypt(user.password);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

    
    try { // True => 1 new req.
    const newUser = new User( user );
    await newUser.save();
    
    //False => 0 res. ERROR
    res.status(202).send( newUser );

    }catch(err){ // False => 0 validation ERROR
      return res.status(400).send({message:"Bad Request", "details": err });
    }
   
}
router.post('/', createUser);

//D = Updating a product to the mongoose DB
const updateUserId =  async (req, res) => {
 

    const user = req.body;

    try {
      //True => 1 req. Validatation Data
      await userSchema.validateAsync( user );

  } catch(err) { //False 0 res. Validatation Data ERROR
    return res.status(400).send({ message: err.details[0].message });
  }  

   //Encrypt the User Pw => varibale Salt + hash method
      //user.password = encrypt(user.password); 
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

  try {
     const updateUser = await User.findByIdAndUpdate(req.params.id, user,  { new: true });
    
       if( updateUser ) { // True => 1 being updated
          res.status(202).send( updateUser );
        } else {  //False => 0 not updated ERROR
         res.status(404).send({"message":"Not Found"});
      }
  }catch(err){ //False => res. ERROR
    res.status(400).send( {message:"Bad Request", "details": err } );
  }  
}
router.put('/:id', auth, checkOwner, updateUserId);

//E = Deleting a product from the mongoose DB
const deleteUserId = async (req, res) => {

    try{
          const deleteUser = await User.findByIdAndDelete( req.params.id );
  
          if( deleteUser ) {
             res.status(202).send({ message: "Delete ID " + req.params.id });
          }
          else {
            res.status(404).send( {message: "Not Found"} );
          }
    }catch(err){
      return res.status(400).send({ message: "Bad Request", "detail": err });
    }
  }
  router.delete('/:id', auth, checkOwner, deleteUserId);

//F = Registering a new user
//G = Logging in a user 
//H = Placing an order



module.exports = userSchema;
module.exports = router;

