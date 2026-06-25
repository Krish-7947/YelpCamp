module.exports.storeReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo = req.session.returnTo;
	}
	next();
};

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be logged in first!");
		return res.redirect("/login");
	}
	next();
};

const Campground = require("./models/campground");

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	if (!camp.author.equals(req.user._id)) {
		req.flash("error", "You do not have the permission");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

const Review = require("./models/review");

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "You do not have the permission");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

const ExpressError = require("./utils/ExpressError");
const { joiCampgroundSchema, joiReviewSchema } = require("./JOIschemas");

module.exports.validateCamp = (req, res, next) => {
	const { error } = joiCampgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, msg);
	} else {
		next();
	}
};

module.exports.validateReview = (req, res, next) => {
	const { error } = joiReviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, msg);
	} else {
		next();
	}
};
