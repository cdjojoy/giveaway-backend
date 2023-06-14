require("dotenv").config();

const cors = require('cors');






//............Loading the routes / endpoins
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const loginRouter = require('./routes/login');
const imageRouter = require('./routes/images');


const mongoose = require('mongoose');
const http = require('http');
const express = require('express');

const app = express();
app.use(cors());
app.options('*', cors())

//frontend => Views template
app.set( 'view engine', 'ejs' );

//Middleware is the only way express can read the HTTP request and parser JSON
app.use(express.json());


/*Connect to Mongoose Compass  */
mongoose.connect(`${process.env.DB_CONNECTION}://${process.env.DB_USERNAME}:${process.env.BD_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE }`, {
  useNewUrlParser: true
})
.then( () => console.log("Mongoose is connected ..."))
.catch( err => console.error(err));




//HOME PAGE endpoint/router http:localhost:3000/api/products
const readHome = async (req, res) => {

  const Product = require('./models/ product'); // class Product from mongoose DB
  const products = await Product.find();        //Instance of the class

  res.render("home.ejs", { products: products }); // render into Views
  //res.send('Hello, Joy...Let me coding');
}
app.get('/', readHome);



//render products details BY ID
app.get("/products/:id", async (req, res) => {
  const Product = require('./models/ product'); // Class Product from mongoose DB

  try {
    const product = await Product.findById( req.params.id );
    
    if( !product ) {
      return res.status(404).render('404error.ejs');
    }

    return res.render("productdetails.ejs", {product: product});

  } catch(err){
   return res.status(400).send("<h1>Bad Request</h1>"); 
  } 
});

//Log in
app.get('/login', (req, res) => {
  res.render('login', { error: 'Invalid username or password.' });
});



  //................Middleware.............
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/login', loginRouter);
app.use('/api/images', imageRouter);



//Server connection
const server = http.createServer(app);

server.listen( process.env.SERVER_PORT, () => {
  console.log(`http://localhost:3000`)
});