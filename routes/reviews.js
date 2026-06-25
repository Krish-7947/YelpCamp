const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewFunctions = require("../controllers/review");

// middlewares
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// add a review
router.post("/", isLoggedIn, validateReview, reviewFunctions.addReview);

// delete review
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	reviewFunctions.deleteReview,
);

module.exports = router;
