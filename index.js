const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5bgr9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("cycle-service");
    const productsCollection = database.collection("products");
    const ordersCollection = client.db("cycle-service").collection("orders");
    const usersCollection = client.db("cycle-service").collection("users");
    const reviewCollection = client.db("cycle-service").collection("review");
    // users insert in db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });
    // google users update
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.put("/makeadmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await usersCollection.find(filter).toArray();
      if (result) {
        const documents = await usersCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
        console.log(documents);
      }
    });
    /* // check admin or not
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await usersCollection
            .find({ email: req.params.email })
            .toArray();
            console.log(result);
            res.send(result);
        }); */

    //post api for add product insert
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);
      const result = await productsCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });
    // GET API for show data
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const product = await cursor.toArray();
      res.send(product);
    });
    // GET Single Products id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.json(result);
    });
    // delete product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      console.log("deleting user with id ", result);
      res.json(result);
    });

    // Add Orders API
    app.post("/purchase", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    //post api for add review insert
    app.post("/review", async (req, res) => {
      const review = req.body;
      console.log("hit the post api", review);
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
    });
    // GET API for show review
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });
    // cancel an order
    // cancel an order
    app.delete("/myorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      console.log("deleting user with id ", result);
      res.json(result);
    });
    // show my orders
    app.get("/myorders/:email", async (req, res) => {
      const result = await ordersCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(result);

    });



    // show my orders
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const product = await cursor.toArray();
      res.send(product);
  });
  // cancel an order
  app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      console.log('deleting user with id ', result);
      res.json(result);
    })
    //update orders api 
    app.put('/updateStatusOrders/:id' , async(req , res) => {
      const id = req.params.id;
      const updatedOrders = req.body;
      const query = {_id:ObjectId(id)};
      const options = { upsert : true}
      const updatedDoc = {
          $set: {  
            status:updatedOrders.status
          },
      };
      const result =await ordersCollection.updateOne(query,updatedDoc,options)
      res.json(result)
  })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running my cyclewala server");
});
app.listen(port, () => {
  console.log("listening on port", port);
});
