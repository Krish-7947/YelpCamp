const express = require("express");
const router = express.Router({ mergeParams: true });

// model
const Review = require("../models/review");
const Campground = require("../models/campground");

// JOI schemas
const { joiReviewSchema } = require("../JOIschemas");

// error class
const ExpressError = require("../utils/ExpressError");

// Joi validation
const validateReview = (req, res, next) => {
	const { error } = joiReviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, msg);
	} else {
		next();
	}
};

// add a review
router.post("/", validateReview, async (req, res) => {
	const camp = await Campground.findById(req.params.id);
	const new_review = new Review(req.body.review);

	camp.reviews.push(new_review);
	await new_review.save();
	await camp.save();
	req.flash("success", "New review added");
	res.redirect(`/campgrounds/${camp._id}`);
});

// delete review
router.delete("/:reviewId", async (req, res) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, {
		$pull: { reviews: reviewId },
	});
	await Review.findByIdAndDelete(reviewId);
	req.flash("delete", "Review deleted");
	res.redirect(`/campgrounds/${id}`);
});

module.exports = router;
