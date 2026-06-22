const mongoose = require("mongoose");
const axios = require("axios");
const cities = require("./cities");
const { descriptors, places } = require("./helper");

const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/YelpCamp");

const db = mongoose.connection;
db.on("error", (e) => console.error("Connection error:", e));
db.once("open", () => console.log("Connection Successful!"));

const randomElement = (a) => a[Math.floor(Math.random() * a.length)];

const apirequest = async () => {
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      params: { query: "Nature", orientation: "square", per_page: 50 },
      headers: {
        Authorization:
          "IUEIbtcn6Dq5HGra9YljcnaqdVm46umYqrChP48ZFhfnE9tZVO2yjKKB",
      },
    });

    return response.data.photos;
  } catch (e) {
    throw new Error(`API Error : ${e.message}`);
  }
};

const Seed_Data_Base = async () => {
  try {
    await Campground.deleteMany({});
    const images = await apirequest();
    for (let i = 0; i < 50; i++) {
      let random = Math.floor(Math.random() * 1000);
      let price = Math.floor(Math.random() * 2000);

      const newCamp = new Campground({
        location: `${cities[random].city},${cities[random].state}`,
        title: `${randomElement(descriptors)} ${randomElement(places)}`,
        image: images[i].src.original,
        price,
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit fugiat eum quis, dolor placeat enim, aspernatur hic distinctio saepe nisi unde? Vero dicta quidem ut animi totam id, repudiandae reiciendis.",
      });
      await newCamp.save();
    }
  } catch (e) {
    throw new Error(`Error in seeding the database : ${e.message}`);
  } finally {
    db.close();
  }
};
Seed_Data_Base();
