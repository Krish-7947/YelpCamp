const express = require("express");
const router = express.Router();
const passport = require("passport");

const userFunctions = require("../controllers/user");

const { storeReturnTo } = require("../middleware");

router
	.route("/register")
	.get(userFunctions.registerForm)
	.post(userFunctions.registerUser);

router
	.route("/login")
	.get(userFunctions.loginForm)
	.post(
		storeReturnTo,
		passport.authenticate("local", {
			failureFlash: true,
			failureRedirect: "/login",
		}),
		userFunctions.loginUser,
	);

router.get("/logout", userFunctions.logoutUser);

module.exports = router;
