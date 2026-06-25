const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

module.exports.newForm = async (req, res) => {
	res.render("campgrounds/new");
};

module.exports.newCampground = async (req, res) => {
	const newcamp = new Campground(req.body.campground);
	newcamp.author = req.user._id;
	await newcamp.save();
	req.flash("success", "New campground added successfully");
	res.redirect(`/campgrounds/${newcamp._id}`);
};

module.exports.showCampground = async (req, res) => {
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
};

module.exports.editForm = async (req, res) => {
	const camp = await Campground.findById(req.params.id);
	if (!camp) {
		req.flash("error", "Campground not found !!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { camp });
};

module.exports.editCampground = async (req, res) => {
	await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
	req.flash("success", "Campground updated successfully");
	res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampground = async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	req.flash("delete", "Campground deleted successfully");
	res.redirect("/campgrounds");
};
