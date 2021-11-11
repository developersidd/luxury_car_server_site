const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());


const { MongoClient } = require('mongodb');
const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {

    try {
        await client.connect();
        const database = client.db("luxury_car");
        const sliderData = database.collection("slider_data");

        // get slider data

        app.get("/slider_data", async (req, res) => {
            const result = await sliderData.find({}).toArray();
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