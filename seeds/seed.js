const mongoose = require('mongoose');
const cities = require('./cities')
const {descriptors,places} = require('./helper')

const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp');

const db = mongoose.connection;
db.on('error',(e)=>console.error("Connection error:",e));
db.once('open',()=>console.log("Connection Successful!"));

const randomElement = (a) => a[Math.floor(Math.random()*a.length)];

const Seed_Data_Base  = async ()=>{
    await Campground.deleteMany({});
    for(let i = 0;i<50;i++){
        let random = Math.floor(Math.random()*1000);
        const newCamp = new Campground({
            location:`${cities[random].city},${cities[random].state}`,
            title: `${randomElement(descriptors)} ${randomElement(places )}`
        });
        await newCamp.save();
    }
}
Seed_Data_Base();