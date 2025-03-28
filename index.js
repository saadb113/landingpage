require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const DATA_FILE = path.join(__dirname, "data.json");
app.use(express.json());
const adminPassword = process.env.PASSWORD
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.post("/all-orders", (req, res) => {
    let productsData = []
    const passwordData = req.body.password
    const adminAuthentication = req.body.adminAuthentication
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading data" });
        }
        productsData = JSON.parse(data)
        // console.log(productsData)
   
    if(!adminAuthentication && req.body.password == adminPassword ){
        res.json(productsData);
        console.log("productsData")
    }else if (adminAuthentication){
        res.json(productsData);
        console.log(productsData)
    }else{
        res.json({data : false});
    }
});
});
app.post("/tracking", (req, res) => {
    const tracking = req.body.trackingid; 

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading data" });
        }
        const productsData = JSON.parse(data).filter(x => x.trackingid == tracking);
        res.json(productsData.length > 0 ? productsData[0] : { data: false });
    });
});
app.post("/checkout", (req, res) => {
    let trackingid = 2312322

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let jsonData = [];
        console.log(req.body)
        if (!err && data) {
            jsonData = JSON.parse(data);
        }
        formData = {...req.body, trackingid : trackingid + jsonData.length}
        console.log(jsonData)
        jsonData.push(formData);


        fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error saving data" });
            }
            res.json({ message: "Form data saved successfully!", data: formData.trackingid });
        });
    });
});
app.post("/delete-order", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let jsonData = [];
        if (!err && data) {
            jsonData = JSON.parse(data);
        }
        const order = jsonData.filter(x=>x.trackingid != req.body.trackingid)
        console.log(order)


        fs.writeFile(DATA_FILE, JSON.stringify(order, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error saving data" });
            }
            res.json({ message: "Form data saved successfully!" });
        });
    });
});
app.post("/update-order-status", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let jsonData = [];
        if (!err && data) {
            jsonData = JSON.parse(data);
        }
        let order = jsonData.filter(x=>x.trackingid == req.body.trackingid)[0]
        order.orderStatus = req.body.status
        jsonData = jsonData.filter(x=>x.trackingid != req.body.trackingid)
        jsonData.push(order);
        fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error saving data" });
            }
            res.json({ message: "Form data saved successfully!" });
        });
    });
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
