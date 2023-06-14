const jwt = require('jsonwebtoken');

function auth( req, res, next ){
    const header = req.header('Authorization');

    if ( !header ) { 
        return res.status(401).send( { "message": "Unauthorized" } );
    }
   
        try{
            const token = header.replace("Bearer ", "");
            const payload = jwt.verify( token, process.env.JWT_SECRET_KEY );

            req.userPayload = payload;

         //middleware for next callback function 
         next();  
        
        }catch(err) {
            return res.status(400).send( {"message":"Bad Request", "detail": err } );
        }
    
}

module.exports = auth;