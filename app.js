var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

const cors = require('cors')



var app = express();

var MongoClient = require("mongodb").MongoClient;

require('dotenv').config()


app.use(cors())

//Connecting to Atlas database
MongoClient.connect("mongodb+srv://" + process.env.ATLAS_USERNAME + ":" + process.env.ATLAS_PASSWORD + "@cluster1.zaes7.mongodb.net/?retryWrites=true&w=majority", {

        useUnifiedTopology: true
    })
    .then(client => {
        console.log("Vi är uppkopplade mot databasen på Atlas!");

        const db = client.db("Assignment_1_users");
        app.locals.db = db
    })





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
app.use(express.static(path.join(__dirname, 'public'), {
    index: false
}));

app.use('/users', usersRouter);
app.use('/admin', adminRouter)




module.exports = app;