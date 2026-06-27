const Joi = require("joi");

module.exports.joiCampgroundSchema = Joi.object({
	campground: Joi.object({
		title: Joi.string().required(),
		location: Joi.string().required(),
		// image: Joi.array().required(),
		description: Joi.string().required(),
		price: Joi.number().required().min(0),
	}).required(),
	deleteImages: Joi.array(),
});

module.exports.joiReviewSchema = Joi.object({
	review: Joi.object({
		body: Joi.string().required(),
		rating: Joi.number().required().min(1).max(5),
	}).required(),
});
