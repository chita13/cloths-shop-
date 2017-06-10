var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DBUtils');
var squel = require("squel");
var moment = require('moment');
moment().format('YYYY-MM-DD');

var numOfOrders = 0;
var numOfProducts = 0;
var allProducts = {};

var config = {
    userName: 'sevradmin',
    password: 'qweR1234',
    server: 'servnew.database.windows.net',
    requestTimeout: 15000,
    options: {encrypt: true, database: 'ourShop'}
};

//-------------------------------------------------------------------------------------------------------------------
connection = new Connection(config);
var connected = false;
connection.on('connect', function(err) {
    if (err) {
        console.error('error connecting: ' + err.message);
    }
    else {
        console.log("Connected Azure");
        updateNumOfRows();
        connected = true;
    }
});

//-------------------------------------------------------------------------------------------------------------------
app.use(function(req, res, next){
    if (connected)
        next();
    else
        res.status(503).send('Server is down');
});

//-------------------------------------------------------------------------------------------------------------------
var port = 4000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

//-------------------------------------------------func #1
app.get('/exchangeRates', function (req, res) {
    var coins = [];
    coins.push(3.14);
    coins.push(4.5);
    res.send(coins);
});

//-------------------------------------------------func #2
app.post('/login', function (req,res) {
    var _userName = req.body.userName;
    var _pass = req.body.userPassword;
    var query = squel.select()
        .from("Users")
        .where("userName = ?", _userName)
        .where("userPassword = ?", _pass)
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        res.send(result);
    });
});

//-------------------------------------------------func #3
app.post('/register', function (req,res) {
    var values = [];
    var _userName = req.body.userName;
    var _pass = req.body.userPassword;
    var isExist;
    //check if user already exist
    var query = squel.select()
        .from("Users")
        .where("userName = ?", _userName)
        .toString();

    DButilsAzure.Select(connection, query ,function (result) {
        if(result.length>0)
            res.send("userName already exists in db");
        //check user name is letters only & 3-8 chars
        else if(!(/^[a-zA-Z]+$/.test(_userName)) || _userName.length <=2 || _userName.length >=9)
            res.send("userName should contain letters only and length should be between 3-8 characters");
        //check password contains letters and numbers only & 5-10 chars
        else if(!(/^[a-zA-Z0-9]+$/.test(_pass)) || _pass.length <=4 || _pass.length >=11)
            res.send("password should contain letters & numbers only and length should be between 5-10 characters");
        else
        {
            values.push(_userName);
            values.push(req.body.userPassword);
            values.push(req.body.userMail);
            values.push(req.body.color);
            color = req.body.color;
            values.push(req.body.pet);
            values.push(req.body.categories);
            DButilsAzure.Insert(connection, 'Users', values, function (result) {
                res.send(result);
            });
        }
    });
});

//-------------------------------------------------func #4
app.get('/listOfProducts', function (req, res){
    var query = squel.select()
        .from("Products")
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        for (i=0; i<result.length; i++)
            allProducts[result[i]["productID"]] = result[i]["quantity"];
        res.send(result);
    });
});

//-------------------------------------------------func #5
app.get('/topFive', function (req, res){
    var today = new Date();
    var date = moment((today.getTime() - 7*24*60*60*1000)).format('YYYY-MM-DD');

    var query = squel.select()
        .field("TOP 5 productID")
        .from("products")
        .where("dateAdded > ?", date)
        .order("purchased", false)
        .toString();

    DButilsAzure.Select(connection, query ,function (result) {
        res.send(result);
    });
});

//-------------------------------------------------func #6
app.get('/newProducts', function (req, res){
    var today = new Date();
    var date = moment((today.getTime() - 31*24*60*60*1000)).format('YYYY-MM-DD');

    var query = squel.select()
        .field("productID")
        .from("products")
        .where("dateAdded > ?", date)
        .order("purchased", false)
        .toString();

    DButilsAzure.Select(connection, query ,function (result) {
        res.send(result);
    });
});

//-------------------------------------------------func #7
app.get('/product', function (req, res){
    var prodId = req.query.productID;
    var query = squel.select()
        .from("Products")
        .where("productID = ?", prodId)
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        res.send(result);
    });
});

//-------------------------------------------------func #8
app.get('/restorePassword', function (req, res){
    var _userName = req.query.userName;
    var _color = req.query.color;
    var _pet = req.query.pet;

    var query = squel.select()
        .field("userPassword")
        .from("Users")
        .where("userName = ?", _userName)
        .where("color = ?", _color)
        .where("pet = ?", _pet)
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        if(result.length>0)
            res.send(result);
        else
            res.send("one or more parameters is incorrect");
    });
});

//-------------------------------------------------func #9
app.get('/UserByUserName', function (req, res){
    var _userName = req.query.userName;
    var query = squel.select()
        .from("Users")
        .where("userName = ?", _userName)
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        if(result.length>0)
            res.send(result);
        else
            res.send("This user did not found");
    });
});

//-------------------------------------------------func #10
app.get('/RecommendedProducts', function (req, res){ //search for products with color user chose if there'sn't search for user's first category
    //get user color
    var _userName = req.query.userName;
    var query = squel.select()
        .from("Users")
        .where("userName = ?", _userName)
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        var color = result[0]['color'];
        var category = result[0]['categories'].split(',')[0];
        var query = squel.select()
            .field("productID")
            .from("products")
            .where("color = ?", color)
            .toString();
        DButilsAzure.Select(connection, query ,function (result) {
            if(result.length>0)
                res.send(result);
            else
            {
                var query = squel.select()
                    .field("productID")
                    .from("products")
                    .where("productCaterory = ?", category)
                    .toString();
                DButilsAzure.Select(connection, query ,function (result) {
                    res.send(result);
                });
            }
        });
    });
});

//-------------------------------------------------func #11
app.get('/orders', function (req, res){
    var _userName = req.query.userName;
    var query = squel.select()
        .from("orders")
        .where("userName = ?", _userName)
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        res.send(result);
    });
});

//-------------------------------------------------func #13
app.post('/buy', function (req,res) {
    var values = [];
    var _userName = req.body.userName;
    var _products = req.body.products;
    var _paymentDetails = req.body.paymentDetails;
    var _deliveryDate = moment(req.body.deliveryDate).format('YYYY-MM-DD');
    var _amount = req.body.amount;
    var _coin = req.body.coin;

    //check if the delivery date is valid (at least one week from now)
    var daysToMillisec = 24*60*60*1000;
    var date1 = new Date(_deliveryDate);
    var date2 = new Date();
    if(date1.getTime() - date2.getTime() < 7*daysToMillisec){
        res.send("delivery date is not valid (should be at least one week from now)");
    }
    else {
        //check if all products are valid
        var allProductsExistAns = allProductsExist(_products);
        if(allProductsExistAns.ans){
            //add to orders table
            numOfOrders++;
            values.push(numOfOrders);// order id
            values.push(moment(new Date()).format('YYYY-MM-DD'));// order date
            values.push(_amount);
            values.push(_coin);
            values.push(_deliveryDate);
            values.push(_userName);
            values.push("waiting"); //status
            values.push(_products.length); //quantity- number of products in the order
            values.push(productsToString(_products)); //products id
            DButilsAzure.Insert(connection, 'Orders', values, function (result) {
                //if the insert success
                if (result){
                    //update products quantities!!
                    //update purchased value for every product
                    DButilsAzure.Update(connection, createUpdateQuantityQuery(_products), function (result) {
                        if(result){
                            updateProductsDict(_products);
                        }
                        res.send("order id:" + numOfOrders + "completed successfully");
                    });
                }
                else{
                    res.send("Insert did not worked");
                }
            });
        }
        else{
            res.send(allProductsExistAns.problem);
        }
    }
});

//-------------------------------------------------bonus functions

//-------------------------------------------------func #14
app.post('/addProductByManager', function (req,res) {
    var values = [];
    var _productName = req.body.productName;
    var _productCategory = req.body.productCategory;
    var _color = req.body.color;
    var _size = req.body.size;
    var _price = req.body.price;
    var _quantity = req.body.quantity;
    var _dateAdded = moment(new Date()).format('YYYY-MM-DD');

    var isExist;
    //check if product name already exist
    var query = squel.select()
        .from("Products")
        .where("productName = ?", _productName)
        .where("ProductCaterory = ?", _productCategory)
        .where("color = ?", _color)
        .where("size = ?", _size)
        .toString();

    DButilsAzure.Select(connection, query ,function (result) {
        if(result.length>0)
            res.send("product already exists in db");
        else
        {
            numOfProducts++;
            values.push(numOfProducts);
            values.push(_productName);
            values.push(_productCategory);
            values.push(_price);
            values.push(_color);
            values.push(_size);
            values.push(_quantity);
            values.push(_dateAdded);
            values.push(0);
            DButilsAzure.Insert(connection, 'Products', values, function (result) {
                res.send(result);
            });
        }
    });
});


//-------------------------------------------------help functions
function productsToString(products) {
    var str = '';
    for (i=0; i<products.length; i++)
        str += products[i][0] + ',';
    return str;
}

function updateProductsDict(productsToUpdate) {
    for (i = 0; i < productsToUpdate.length; i++) {
        allProducts[productsToUpdate[i][0]] = allProducts[productsToUpdate[i][0]] - productsToUpdate[i][1];
    }
}

function allProductsExist(products){
    for (var i=0; i<products.length; i++){
        if(!(products[i][0] in allProducts && products[i][1]<=allProducts[products[i][0]]))
            return {"ans": false, "problem": "There is not enough items of product : " + products[i][0]};
    }
    return {"ans": true};
}

function updateNumOfRows(){
    var query = squel.select()
        .from("Orders")
        .toString();
    DButilsAzure.Select(connection, query ,function (result) {
        numOfOrders = result.length;
        var query = squel.select()
            .from("Products")
            .toString();
        DButilsAzure.Select(connection, query ,function (result) {
            numOfProducts = result.length;
        });
    });
}

function createUpdateQuantityQuery(productsToUpdate){
    query = '';
    for (i=0; i<productsToUpdate.length; i++){
        var newQuantity = allProducts[productsToUpdate[i][0]] - productsToUpdate[i][1];
        query += "update products set quantity = " + newQuantity + " where productID = "+ productsToUpdate[i][0] + ";";
        query += "update products set purchased = purchased" + productsToUpdate[i][1] + " where productID = "+ productsToUpdate[i][0] + ";";
    }
    return query;
}

