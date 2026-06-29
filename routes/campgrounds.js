const express = require("express");
const router = express.Router({ mergeParams: true });

const campgroundFunctions = require("../controllers/campground");

// middlewares
const { isLoggedIn, isAuthor, validateCamp } = require("../middleware");

// for image upload stuff
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

router
	.route("/")
	.get(campgroundFunctions.index)
	.post(
		isLoggedIn,
		upload.array("campground[image]"),
		validateCamp,
		campgroundFunctions.newCampground,
	);

router.get("/new", isLoggedIn, campgroundFunctions.newForm);

router
	.route("/:id")
	.get(campgroundFunctions.showCampground)
	.put(
		isLoggedIn,
		isAuthor,
		upload.array("campground[image]"),
		validateCamp,
		campgroundFunctions.editCampground,
	)
	.delete(isLoggedIn, isAuthor, campgroundFunctions.deleteCampground);

router.get("/:id/edit", isLoggedIn, isAuthor, campgroundFunctions.editForm);

module.exports = router;
