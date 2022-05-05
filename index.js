const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

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
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        // PUT API to update a product
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = req.body;
            const options = { upsert: true };
            const updateDor = {
                // _id: id,
                // name: product.name,
                // price: product.price,
                // description: product.description,
                quantity: product.quantity,
                // supplier: product.supplier,
                // picture: product.picture
            };
            const result = await productCollection.updateOne(query, updateDor, options);
            res.send(result);
        });

        // DELETE API to delete a product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
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