const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

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
	newcamp.images = req.files.map((obj) => ({
		url: obj.path,
		filename: obj.filename,
	}));

	const geoData = await maptilerClient.geocoding.forward(
		req.body.campground.location,
		{ limit: 1 },
	);
	console.log(geoData.features[0].geometry);
	if (!geoData.features?.length) {
		req.flash(
			"error",
			"Could not geocode that location. Please try again and enter a valid location.",
		);
		return res.redirect("/campgrounds/new");
	}

	newcamp.geometry = geoData.features[0].geometry;
	newcamp.location = geoData.features[0].place_name;

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
	const camp = await Campground.findByIdAndUpdate(
		req.params.id,
		req.body.campground,
	);
	const imgs = req.files.map((obj) => ({
		url: obj.path,
		filename: obj.filename,
	}));
	camp.images.push(...imgs);
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await camp.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}

	const geoData = await maptilerClient.geocoding.forward(
		req.body.campground.location,
		{ limit: 1 },
	);
	if (!geoData.features?.length) {
		req.flash(
			"error",
			"Could not geocode that location. Please try again and enter a valid location.",
		);
		return res.redirect(`/campgrounds/${id}/edit`);
	}

	camp.geometry = geoData.features[0].geometry;
	camp.location = geoData.features[0].place_name;

	await camp.save();
	req.flash("success", "Campground updated successfully");
	res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampground = async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	req.flash("delete", "Campground deleted successfully");
	res.redirect("/campgrounds");
};
