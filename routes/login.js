const jwt = require('jsonwebtoken');
const joi = require('joi');
const bcrypt = require('bcrypt');
const express = require('express');

const router = express.Router();

const User = require('../models/user');

//joi validation is needed to Login inputs
const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).max(1000).required()
});

//api POST 
const readLogin = async (req, res) => {

    const login = req.body;

    try {
        await userSchema.validateAsync( login );
    }catch(err){ 
        return res.status(400).send({ message: err.details[0].message });
    }

        try {
           const user = await User.findOne( { email: login.email } );

              if( !user ) {
                 return res.status(401).send({ message: "Invalid email or password"} );
              }
           
              const success = await bcrypt.compare( login.password, user.password );

              if( !success ) {
                return res.status(401).send({ message: "Invalid email or password"} );
             }
             
             const payload = {
                "_id": user._id,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "phone": user.phone,
                "isAdmin": user.isAdmin
             }

             const token = jwt.sign( payload, process.env.JWT_SECRET_KEY );

             return res
                 .header({"Authorization": "Bearer " + token})
                 .send({"Authorization": "Bearer " + token, 
                       token: token, 
                       message: "Use correct header with token on other request" 
                    });

        }catch(err){
            return res.status(400).send({message: "Bad Request", "details": err });
        }             
};
router.post('/', readLogin);

module.exports = router;