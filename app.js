if (process.env.NODE_ENV !== "production") {
	require("dotenv").config({ quiet: true });
}

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
const helmet = require("helmet");
const { MongoStore } = require("connect-mongo");

const app = express();

// MongoDB connection
const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/YelpCamp";
mongoose.set("sanitizeFilter", true);
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", (e) => console.error("Connection error:", e));
db.once("open", () => console.log("Connection Successful!"));

//server set up
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`serving on port ${port}`));

// Session Stuff
const secret = process.env.SECRET || "nothingfornow!";
const store = MongoStore.create({
	mongoUrl: dbURL,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret,
	},
});

store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e);
});

app.use(
	session({
		store,
		name: "session",
		secret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			// secure:true,
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		},
	}),
);

// Security stuff
app.use(helmet());

// allowed content
const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
	"https://kit.fontawesome.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net",
	"https://cdn.maptiler.com/",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	"https://stackpath.bootstrapcdn.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
	"https://cdn.jsdelivr.net",
	"https://cdn.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/z8occoni/",
				"https://images.unsplash.com",
				"https://images.pexels.com",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
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

app.get("/", (req, res) => {
	res.render("home");
});

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
	res.status(err.status).render("error", { err });
});
