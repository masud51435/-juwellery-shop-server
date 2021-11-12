const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0wmac.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("jewelery-shop");
    const allProduct = database.collection("products");
    const allUser = database.collection("users");
    const allReview = database.collection("reviews");
    const orderCollection = database.collection("order");
    const BlogCollection = database.collection("blogs");

    //POST product
    app.post('/product', async (req, res) => {
      const place = req.body;
      const result = await allProduct.insertOne(place)
      res.send(result)
    })

    //POST review
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await allReview.insertOne(review)
      res.send(result)
    })

    //GET all review
    app.get('/allreviews', async (req, res) => {
      const cursor = allReview.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //GET all products
    app.get('/allProducts', async (req, res) => {
      const cursor = allProduct.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //POST user data
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await allUser.insertOne(user);
      res.json(result);
    });

    //update user data
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log('put', user)
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await allUser.updateOne(filter, updateDoc);
      res.json(result);
    })

    //GET admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await allUser.findOne(query)
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.send({ admin: isAdmin })
    })

    //GET all blogs
    app.get('/allBlogs', async (req, res) => {
      const cursor = BlogCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });

    //GET products
    app.get('/products', async (req, res) => {
      const cursor = allProduct.find({}).limit(6);
      const products = await cursor.toArray();
      res.send(products);
    });

    //GET all orders
    app.get('/allorder', async (req, res) => {
      const cursor = orderCollection.find({});
      const allorder = await cursor.toArray();
      res.json(allorder);
    })

    //POST single order
    app.post('/placeOrder', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);

    })

    //update status
    app.put('/item/:id', async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const query = { _id: ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          status: 'Shipped'
        }
      }
      const result = await orderCollection.updateOne(query, updateDoc, options)
      res.send(result);
    })

    //GET my order
    app.get('/myorder', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const myorder = await cursor.toArray();
      res.json(myorder);
    })

    //Delete order
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    })


  }
  finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('every thing is okk', port)
})