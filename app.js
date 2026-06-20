// collecting packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const Campground = require('./models/campground');

// MongoDB connection 
mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp');

const db = mongoose.connection;
db.on('error',(e)=>console.error("Connection error:",e));
db.once('open',()=>console.log("Connection Successful!"));

//server set up
app.listen(3000, () => console.log("server started"));

// setting up ejs template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

// express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.get('/', (req, res) => res.send("Hello there !"));