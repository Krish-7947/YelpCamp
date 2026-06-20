// collecting packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodoverride = require('method-override');

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
app.use(methodoverride('_method'))

// routes
// all
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
});

// new campground form
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})

// adding new campground to db
app.post('/campgrounds',async (req,res)=>{
    const newcamp = new Campground(req.body);
    await newcamp.save();
    res.redirect(`/campgrounds/${newcamp._id}`);
})

// show
app.get('/campgrounds/:id',async (req,res)=>{
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/details",{camp});
})

// edit form
app.get('/campgrounds/:id/edit',async (req,res)=>{
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{camp});
})

// edit in db
app.put('/campgrounds/:id',async (req,res)=>{
    await Campground.findByIdAndUpdate(req.params.id,req.body);
    res.redirect(`/campgrounds/${req.params.id}`);
})

// delete
app.delete('/campgrounds/:id',async (req,res)=>{
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds')
})