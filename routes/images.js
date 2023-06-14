const joi = require('joi'); //joi Library for validation

const  Image   = require('../models/image'); //connectig from mongooseDB


const multer = require('multer');

const express = require('express');
const router = express.Router();

const imageSchema = joi.object({
  name: joi.string().min(2).max(50).required(),
  image: joi.string().uri().required(),
});


const Storage = multer.diskStorage({
  destination: 'uploads',
  filename:(req,file, cb) =>{
    cb(null, file.originalname);
  }, 
});

const upload = multer({
  storage:Storage
}).single('testImage')

//upload images
router.get("/", (req, res) => {
  res.send("upload file");
});

router.post("/upload", (req, res) => {
   upload (req, res, (err) => {
    if(err) {
      console.log(err);
    }
    else {
      const newProductImage = new Image({
        name: req.body.name,
        image: {
          data: req.file.filename,
          contentType: 'image/png'
        }
      });
      newProductImage
          .save()
          .then(()=> res.send('Successfully uploaded'))
          .catch((err) => console.log(err));
     }
   });
});

module.exports = imageSchema;
module.exports = router;