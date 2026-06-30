if (process.env.NODE_ENV !== "production") {
	require("dotenv").config({ quiet: true });
}

const mongoose = require("mongoose");
const passport = require("passport");
const axios = require("axios");
const cities = require("./cities");
const { descriptors, places } = require("./helper");

const Campground = require("../models/campground");
const Review = require("../models/review");
const User = require("../models/user");

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/YelpCamp";
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", (e) => console.error("Connection error:", e));
db.once("open", () => console.log("Connection Successful!"));

const randomElement = (a) => a[Math.floor(Math.random() * a.length)];

const apirequest = async () => {
	try {
		const response = await axios.get("https://api.pexels.com/v1/search", {
			params: { query: "Nature", orientation: "square", per_page: 50 },
			headers: {
				Authorization: process.env.PEXELS_API_KEY,
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
		await Review.deleteMany({});
		await User.deleteMany({});
		const dummyUser = new User({
			username: "a",
			email: "a@a.com",
		});
		const registeredUser = await User.register(dummyUser, "a");
		const api_images = await apirequest();
		for (let i = 0; i < 50; i++) {
			let random = Math.floor(Math.random() * 1000);
			let price = Math.floor(Math.random() * 2000);

			const newCamp = new Campground({
				author: registeredUser._id,
				location: `${cities[random].city},${cities[random].state}`,
				title: `${randomElement(descriptors)} ${randomElement(places)}`,
				images: [
					{
						url: api_images[i].src.original,
						filename: "seed_image",
					},
				],
				price,
				geometry: {
					type: "Point",
					coordinates: [
						cities[random].longitude,
						cities[random].latitude,
					],
				},
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
