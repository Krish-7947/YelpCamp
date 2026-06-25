const User = require("../models/user");

module.exports.registerForm = (req, res) => {
	res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
	try {
		const { username, email, password } = req.body;
		const user = new User({ username, email });
		const registeredUser = await User.register(user, password);

		req.login(registeredUser, (e) => {
			if (e) {
				return next(e);
			}
			req.flash("success", "Welcome to YelpCamp !");
			res.redirect("/campgrounds");
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("/register");
	}
};

module.exports.loginForm = (req, res) => {
	res.render("users/login");
};

module.exports.loginUser = (req, res) => {
	const url = res.locals.returnTo || "/campgrounds";
	req.flash("success", "Welcome back to YelpCamp !");
	res.redirect(url);
};

module.exports.logoutUser = (req, res, next) => {
	req.logout((e) => {
		if (e) {
			return next(e);
		}
		req.flash("success", "Logged out");
		res.redirect("/campgrounds");
	});
};
