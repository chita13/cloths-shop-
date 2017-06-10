var Request = require('tedious').Request;
var squel = require("squel");

//----------------------------------------------------------------------------------------------------------------------
exports.Select = function(connection, query, callback) {
    var req = new Request(query, function (err, rowCount) {
        if (err) {
            console.log(err);
        }
    });
    var ans = [];
    var properties = [];
    req.on('columnMetadata', function (columns) {
        columns.forEach(function (column) {
            if (column.colName !== null)
                properties.push(column.colName);
        });
    });
    req.on('row', function (row) {
        var item = {};
        for (i=0; i<row.length; i++) {
            item[properties[i]] = row[i].value;
        }
        ans.push(item);
    });

    req.on('requestCompleted', function () {
        console.log('request Completed: '+ req.rowCount + ' row(s) returned');
        callback(ans);
    });

    connection.execSql(req);
};

//----------------------------------------------------------------------------------------------------------------------

exports.Insert = function(connection, table, values, callback){
    var query = '';
    var ans = true;
    switch(table) {
        case 'Users':
            query = squel.insert()
            .into("Users")
            .set("userName", values[0])
            .set("userPassword", values[1])
            .set("userMail", values[2])
            .set("color", values[3])
            .set("pet", values[4])
            .set("categories", values[5])
            .toString();
            break;

        case 'Orders':
            query = squel.insert()
                .into("Orders")
                .set("orderID", values[0])
                .set("OrderDate", values[1])
                .set("totalPrice", values[2])
                .set("coin", values[3])
                .set("deliveryDate", values[4])
                .set("userName", values[5])
                .set("orderStatus", values[6])
                .set("quantity", values[7])
                .set("products", values[8])
                .toString();
            break;

        case 'ProductsInOrder':
            query = squel.insert()
                .into("ProductsInOrder")
                .set("productID", values[0])
                .set("orderID", values[1])
                .set("quantity", values[2])
                .toString();
            break;

        case 'Products':
            query = squel.insert()
                .into("Products")
                .set("productID", values[0])
                .set("productName", values[1])
                .set("ProductCaterory", values[2])
                .set("price", values[3])
                .set("color", values[4])
                .set("size", values[5])
                .set("quantity", values[6])
                .set("dateAdded", values[7])
                .set("Purchased", values[8])
                .toString();
            break;
    }

    var req = new Request(query, function(err, rowCount){
        if(err){
            console.log("Create new request for query: " + query + "failed");
            console.log("---------------------------------------");
            console.log(err);
            ans = false;
        }
    });

    req.on('requestCompleted',function(){
        console.log('requestCompleted with '+ req.rowCount + ' row(s)');
        callback(ans);
    });
    connection.execSql(req);
};

//----------------------------------------------------------------------------------------------------------------------

exports.Update = function(connection, query, callback){
    var ans = true;
    var req = new Request(query, function(err, rowCount){
        if(err){
            console.log("Create new request for query: " + query + "failed");
            console.log("---------------------------------------");
            console.log(err);
            ans = false;
        }
    });

    req.on('requestCompleted',function(){
        console.log('requestCompleted with '+ req.rowCount + ' row(s)');
        callback(ans);
    });
    connection.execSql(req);
};


//----------------------------------------------------------------------------------------------------------------------

exports.Delete = function(connection, query, callback){
    var ans = true;
    var req = new Request(query, function(err, rowCount){
        if(err){
            console.log("Create new request for query: " + query + "failed");
            console.log("---------------------------------------");
            console.log(err);
            ans = false;
        }
    });

    req.on('requestCompleted',function(){
        console.log('requestCompleted with '+ req.rowCount + ' row(s)');
        callback(ans);
    });
    connection.execSql(req);
};




