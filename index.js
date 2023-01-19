/* 
 ==> Title: Main File of Luxury Car website's Server Side Project
 ==> Author: AB Siddik
 ==> Date: First Development: 24/11/2021. Modified on: 1/18/2023
*/

// Dependencies
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");

// Environment Variables
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// connection url of MongoDB Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.minbj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Main Function
async function run() {

    try {

        // connecting with MongoDB Database
        await client.connect();
        const database = client.db("luxury_car");
        const products_collection = database.collection("products_collection");
        const orders_collection = database.collection("orders_collection");
        const user_data = database.collection("user_data");
        const review = database.collection("review");


        app.get("/", (req, res) => {
            res.send("Running Luxury Car");
        });
        
        // get all review 
        app.get("/get_review", async (req, res) => {
            let result = await review.find({}).toArray();
            res.json(result);
        });

        // get all the user info to check admin role
        app.get("/test_email/:email", async (req, res) => {
            const email = req.params.email;
            const result = await user_data.findOne({ email: email });
            let isAdmin = false;
            if (result?.role === "admin") {
                isAdmin = true;
            };
            res.json({ admin: isAdmin });
        });


        // get user orders 
        app.get("/user_orders/:email", async (req, res) => {
            const email = req.params.email;
            let result = await orders_collection.find({ email: email }).toArray();
            res.json(result);
        });

        // get all orders 
        app.get("/orders", async (req, res) => {
            const email = req.query.email;
            let result = await orders_collection.find({}).toArray()
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

        // add a product to db
        app.post("/add_product_db", async (req, res) => {
            const data = req.body;
            const files = req.files.image.data;
            const convertString = files.toString("base64");
            const imageBuffer = Buffer.from(convertString, "base64");
            const { name, description, price, fuel, condition, cc } = data;
            const newPd = { image: imageBuffer, name, description, price, fuel, condition, cc };
            const result = await products_collection.insertOne(newPd);
            res.json(result);
        });

        // add a review data to db
        app.post("/add_review_db", async (req, res) => {
            const data = req.body;
            const result = await review.insertOne(data);
            res.json(result);
        });


        // add to orders_collection
        app.post("/add_to_order", async (req, res) => {
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

    // 404 Error Handler
    app.use((req, res, next) => {
        const error = new Error("The requested page does not exist!");
        error.status = 404;
        res.status(error.status).json(error.message);
    });
    
    //Default Error Handler
    app.use((err, req, res, next) => {
        if (res.headersSent) {
            next(err);
        };
        res.status(err.status || 500).json(err.message || "There was an Error");
    });



    }

    finally {
    }
}



run().catch((err) => console.log(err));

app.listen(port, () => {
    console.log("Running project at", port);
})