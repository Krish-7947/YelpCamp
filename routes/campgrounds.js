const express = require("express");
const router = express.Router({ mergeParams: true });

// model
const Campground = require("../models/campground");

// JOI schemas
const { joiCampgroundSchema } = require("../JOIschemas");

// error class
const ExpressError = require("../utils/ExpressError");

const { isLoggedIn } = require("../middleware");

// Joi validation
const validateCamp = (req, res, next) => {
	const { error } = joiCampgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, msg);
	} else {
		next();
	}
};

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
	await newcamp.save();
	req.flash("success", "New campground added successfully");
	res.redirect(`/campgrounds/${newcamp._id}`);
});

// show
router.get("/:id", async (req, res) => {
	const camp = await Campground.findById(req.params.id).populate("reviews");
	if (!camp) {
		req.flash("error", "Campground not found !!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/details", { camp });
});

// edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
	const camp = await Campground.findById(req.params.id);
	if (!camp) {
		req.flash("error", "Campground not found !!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { camp });
});

// edit in db
router.put("/:id", validateCamp, isLoggedIn, async (req, res) => {
	await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
	req.flash("success", "Campground updated successfully");
	res.redirect(`/campgrounds/${req.params.id}`);
});

// delete
router.delete("/:id", isLoggedIn, async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	req.flash("delete", "Campground deleted successfully");
	res.redirect("/campgrounds");
});

module.exports = router;
