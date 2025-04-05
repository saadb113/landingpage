require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const DATA_FILE = path.join(__dirname, "./db/orders.json");
const PRODUCTS = path.join(__dirname, "./db/products.json");
app.use(express.json());
const adminPassword = process.env.PASSWORD
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/"); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueName = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
        req.savedImageName = uniqueName;
        cb(null, uniqueName);
    }
});
// File filter (only accept images)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        return cb(new Error("Only images (JPG, PNG, GIF) are allowed!"));
    }
};
// Initialize multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});
// Route to handle image upload
app.post("/add-product", upload.single("img"), (req, res) => {
    console.log(req.file)
    let productId = 1
    if (!req.file) {
        return res.status(500).json({ message: "No file uploaded or invalid file type!" });
    }
    
    
    fs.readFile(PRODUCTS, "utf8", (err, data) => {
        let jsonData = [];
   
        if (!err && data) {
            jsonData = JSON.parse(data);
        }
        formData = {...req.body, price : parseInt(req.body.price), productId : productId + jsonData.length, img : `./uploads/${req.savedImageName}`}
        jsonData.push(formData);


        fs.writeFile(PRODUCTS, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Error saving data" });
            }
            res.json({ message: "Product Uploaded Successfully!", data: formData.trackingid });
        });
    });
});
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
app.get("/all-products", (req, res) => {
    let productsData = []
    console.log(productsData)
    fs.readFile(PRODUCTS, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading data" });
        }
        productsData = JSON.parse(data)
        res.json(productsData);

});

});
app.post("/product-by-id", (req, res) => {
    const productId = req.body.productId;
    console.log(productId)
    fs.readFile(PRODUCTS, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading data" });
        }

        try {
            const productsData = JSON.parse(data);
            const product = productsData.find(x => x.productId == productId);
            console.log(product)
            res.json(product || { data: "No Products Found" });
        } catch (parseError) {
            res.status(500).json({ error: "Error parsing data" });
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
app.post("/delete-product", (req, res) => {
    fs.readFile(PRODUCTS, "utf8", (err, data) => {
        let jsonData = [];
        if (!err && data) {
            jsonData = JSON.parse(data);
        }
        const order = jsonData.filter(x=>x.productId != req.body.productId)
        fs.writeFile(PRODUCTS, JSON.stringify(order, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error saving data" });
            }
            res.json({ message: "Form data saved successfully!" });
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
