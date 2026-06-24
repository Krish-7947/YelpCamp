// collecting packages
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodoverride = require("method-override");
const ejs_mate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");

const app = express();

// Session Stuff
app.use(
	session({
		secret: "nothingfornow",
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
		},
	}),
);

// Passport Authentication
const User = require("./models/user");

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash stuff
app.use(flash());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.deleteSuccess = req.flash("delete");
	next();
});

// Router exports
const campgroundRouter = require("./routes/campgrounds");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/users");

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/YelpCamp");

const db = mongoose.connection;
db.on("error", (e) => console.error("Connection error:", e));
db.once("open", () => console.log("Connection Successful!"));

//server set up
app.listen(3000, () => console.log("server started"));

// setting up ejs template
app.engine("ejs", ejs_mate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Router Set Up
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/reviews", reviewRouter);
app.use("/", userRouter);

// error handeling
app.all("/{*path}", (req, res, next) => {
	next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
	if (!err.message) err.message = "Something Went Wrong !!";
	if (!err.status) err.status = 500;
	res.status(err.status).render("campgrounds/error", { err });
});
