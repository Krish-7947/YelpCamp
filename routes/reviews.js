const express = require("express");
const router = express.Router({ mergeParams: true });

// model
const Review = require("../models/review");
const Campground = require("../models/campground");

// middlewares
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// add a review
router.post("/", isLoggedIn, validateReview, async (req, res) => {
	const camp = await Campground.findById(req.params.id);
	const new_review = new Review(req.body.review);
	new_review.author = req.user._id;
	camp.reviews.push(new_review);
	await new_review.save();
	await camp.save();
	req.flash("success", "New review added");
	res.redirect(`/campgrounds/${camp._id}`);
});

// delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, async (req, res) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, {
		$pull: { reviews: reviewId },
	});
	await Review.findByIdAndDelete(reviewId);
	req.flash("delete", "Review deleted");
	res.redirect(`/campgrounds/${id}`);
});

module.exports = router;
