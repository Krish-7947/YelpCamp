const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

// register form
router.get("/register", (req, res) => {
	res.render("users/register");
});

const { storeReturnTo } = require("../middleware");

// register user
router.post("/register", async (req, res, next) => {
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
});

// login form
router.get("/login", (req, res) => {
	res.render("users/login");
});

// log in the user
router.post(
	"/login",
	storeReturnTo,
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/login",
	}),
	(req, res) => {
		const url = res.locals.returnTo || "/campgrounds";
		delete req.session.returnTo;
		req.flash("success", "Welcome back to YelpCamp !");
		res.redirect(url);
	},
);

router.get("/logout", (req, res, next) => {
	req.logout((e) => {
		if (e) {
			return next(e);
		}
		req.flash("success", "Logged out");
		res.redirect("/campgrounds");
	});
});

module.exports = router;
