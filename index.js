const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// verify jwt
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    // console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  });
  
}

// connection to MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2liqx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('warehouseManagement').collection('product');
      const itemCollection = client.db("warehouseManagement").collection('item');
      

      // For JWT (login)
      // AUTH
      app.post('/login', async (req, res) => {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '1d'
        });
        res.send({ accessToken });
      });



        // API to get all products data
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // API to get single product data
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });        


        // POST API to add item
        // app.post('/item', async (req, res) => {
        //     const newItem = req.body;
        //     const result = await itemCollection.insertOne(newItem);
        //     res.send(result);
        // });
        
        // POST API to add input field value to quantity
        app.put("/product/:id", async (req, res) => {
          const id = req.params.id;
          const updateProduct = req.body;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              quantity: updateProduct.quantity,
            },
          };
          const result = await productCollection.updateOne(
            filter,
            updateDoc,
            options
          );
          res.send(result);
        });


        // PUT API to update a product quantity
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
              $set: {
                quantity: updateQuantity.quantity,
              },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // DELETE API to delete a product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        // API to get item
      app.get('/item', verifyJWT, async (req, res) => {
        const decodedEmail = req.decoded.email;
          const email = req.query.email;
        if (email === decodedEmail) {
              const query = { email: email };
              const cursor = itemCollection.find(query);
              const items = await cursor.toArray();
              res.send(items);
        }
        else {
          res.status(403).send({ message: 'Forbidden access' });
        }
        });      
      

        // API to post item
        app.post('/item', async (req, res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            res.send(result);
        });

    }
    finally {
        
    }
}

run().catch(console.dir);


// Root API
app.get('/', (req, res) => {
    res.send('Running Warehouse Server');
});


// App Listener
app.listen(port, () => {
    console.log('Listening to port', port);
});