const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

1
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.minbj.mongodb.net/myFirstDatabase?r1etryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {

    try {
        await client.connect();
        const database = client.db("luxury_car");
        const sliderData = database.collection("slider_data");
        const products_collection = database.collection("products_collection");
        const orders_collection = database.collection("orders_collection");
        const user_data = database.collection("user_data");

        // get slider data
        app.get("/slider_data", async (req, res) => {
            const result = await sliderData.find({}).toArray();
            res.json(result);
        });

        // get products data
        app.get("/products_data", async (req, res) => {
            const result = await products_collection.find({}).toArray();
            res.json(result);
        });

     

        // get a specific product data
        app.get("/:product_id", async (req, res) => {
            const id = req.params.product_id;
            const result = await products_collection.findOne({ _id: ObjectId(id) });
            res.json(result);
        });


        // get all the user info to check admin role
        app.get("/test_email/:email", async (req, res) => {
            const email = req.params.email;
            const result = await user_data.findOne({ email: email });
            let isAdmin = false;
            if (result?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });


        // add to orders_collection
        app.post("/add_to_product", async (req, res) => {
            const data = req.body;
            const result = await orders_collection.insertOne(data);
            res.json(result);
        });

        // add register user data to db
        app.post("/add_user_data", async (req, res) => {
            const data = req.body;
            const result = await user_data.insertOne(data);
            res.json(result);
        });


        // add google user data to db
        app.put("/add_user_data", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: user };
            const options = { upsert: true };
            const result = await user_data.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make an admin
        app.put("/set_admin_role", async (req, res) => {
            const data = req.body;
            const filter = { email: data?.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await user_data.updateOne(filter, updateDoc);
            res.json(result);
        });

    }

    finally {

    }


}

run().catch(console.dir());

app.get("/", (req, res) => {
    res.send("Running Luxury Car");
});

app.listen(port, () => {
    console.log("Running project at", port);
})