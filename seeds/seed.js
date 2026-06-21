const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./helper");

const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/YelpCamp");

const db = mongoose.connection;
db.on("error", (e) => console.error("Connection error:", e));
db.once("open", () => console.log("Connection Successful!"));

const randomElement = (a) => a[Math.floor(Math.random() * a.length)];

const Seed_Data_Base = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    let random = Math.floor(Math.random() * 1000);
    let price = Math.floor(Math.random() * 2000);
    const newCamp = new Campground({
      location: `${cities[random].city},${cities[random].state}`,
      title: `${randomElement(descriptors)} ${randomElement(places)}`,
      image: `https://picsum.photos/400?random=${Math.random()}`,
      price,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit fugiat eum quis, dolor placeat enim, aspernatur hic distinctio saepe nisi unde? Vero dicta quidem ut animi totam id, repudiandae reiciendis.",
    });
    await newCamp.save();
  }
};
Seed_Data_Base();
