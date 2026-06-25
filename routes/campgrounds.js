const express = require("express");
const router = express.Router({ mergeParams: true });

// model
const Campground = require("../models/campground");

// middlewares
const { isLoggedIn, isAuthor, validateCamp } = require("../middleware");

// all campgrounds
router.get("/", async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
});

// new campground form
router.get("/new", isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// adding new campground to db
router.post("/", isLoggedIn, validateCamp, async (req, res) => {
	const newcamp = new Campground(req.body.campground);
	newcamp.author = req.user._id;
	await newcamp.save();
	req.flash("success", "New campground added successfully");
	res.redirect(`/campgrounds/${newcamp._id}`);
});

// show
router.get("/:id", async (req, res) => {
	const camp = await Campground.findById(req.params.id)
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		})
		.populate("author");
	if (!camp) {
		req.flash("error", "Campground not found !!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/details", { camp });
});

// edit form
router.get("/:id/edit", isLoggedIn, isAuthor, async (req, res) => {
	const camp = await Campground.findById(req.params.id);
	if (!camp) {
		req.flash("error", "Campground not found !!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { camp });
});

// edit in db
router.put("/:id", isLoggedIn, isAuthor, validateCamp, async (req, res) => {
	await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
	req.flash("success", "Campground updated successfully");
	res.redirect(`/campgrounds/${req.params.id}`);
});

// delete
router.delete("/:id", isLoggedIn, isAuthor, async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	req.flash("delete", "Campground deleted successfully");
	res.redirect("/campgrounds");
});

module.exports = router;
