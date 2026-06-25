const express = require("express");
const router = express.Router({ mergeParams: true });

const campgroundFunctions = require("../controllers/campground");

// middlewares
const { isLoggedIn, isAuthor, validateCamp } = require("../middleware");

router
	.route("/")
	.get(campgroundFunctions.index)
	.post(isLoggedIn, validateCamp, campgroundFunctions.newCampground);

router.get("/new", isLoggedIn, campgroundFunctions.newForm);

router
	.route("/:id")
	.get(campgroundFunctions.showCampground)
	.put(isLoggedIn, isAuthor, validateCamp, campgroundFunctions.editCampground)
	.delete(isLoggedIn, isAuthor, campgroundFunctions.deleteCampground);

router.get("/:id/edit", isLoggedIn, isAuthor, campgroundFunctions.editForm);

module.exports = router;
