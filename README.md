# YelpCamp

YelpCamp is a full-stack web app for browsing, sharing, and reviewing campgrounds. It works like a simple campground directory: anyone can view listings and read reviews, while registered users can add their own spots and share their experience.

The index page combines a map and a card grid so you can browse geographically or scroll through listings. Each campground has a detail page with photos, pricing, location, and reviews from other users. Search lets you narrow results by campground name or place.

Logged-in users can create listings with a title, description, nightly price, and one or more photos. When a location is entered, it is geocoded and stored as map coordinates so the campground shows up in the right place. Authors can update or remove their listings; other users can leave 1–5 star ratings and written reviews.

The app is built with Node.js and Express, uses EJS for server-rendered pages, and stores data in MongoDB. Images are hosted on Cloudinary, and maps plus geocoding are handled by MapTiler.

**Live demo:** [https://yelp-camp-ivory.vercel.app/](https://yelp-camp-ivory.vercel.app/)

---

## Features

### Campground Discovery

The main campground page is built around a full-width map and a searchable list below it.

- **Cluster map** — All campgrounds are plotted on a MapTiler map. Nearby markers group into clusters at lower zoom levels; zoom in or click a cluster to explore individual sites. Each marker opens a popup with the campground title and a link to its page.
- **Search** — A search bar filters listings by title or location using case-insensitive matching. Useful when you already know where you want to go or remember a campground name.
- **Card grid** — Every listing appears as a card with a cover image, title, short description, location, and a button to view full details.

### Campground Details

Each campground has its own page with everything needed to decide whether to visit.

- **Photos & map** — Multiple images are shown in a carousel. A separate map on the page marks the exact location with a pin and popup.
- **Listing info** — Shows the full description, resolved location name, nightly price in ₹, and the username of whoever submitted the listing.
- **Owner actions** — If you created the listing, edit and delete buttons appear on the page. Other users can only view and review.

### Create & Manage Campgrounds

Creating a campground requires an account. The form collects basic details and handles images and location in one flow.

- **Image uploads** — Upload one or more photos in JPEG, JPG, or PNG format. Files are sent to Cloudinary and linked to the campground record.
- **Geocoding** — The location field is passed to MapTiler's geocoding API. The returned place name and coordinates are saved so the listing appears correctly on both the index and detail maps.
- **Edit & cleanup** — When editing, you can add new images or remove existing ones (removed files are deleted from Cloudinary). Deleting a campground removes all of its reviews from the database as well.

### Reviews & Ratings

Reviews are tied to individual campgrounds and require a logged-in account.

- **Star ratings** — Submit a rating from 1 to 5 stars along with a short written review. Ratings use an accessible star widget on the detail page.
- **Manage reviews** — Each review shows the reviewer's username. Only the person who wrote a review can delete it.

### User Authentication

Authentication uses username and password with sessions stored in the database.

- **Accounts** — Register with a username, email, and password. After registration you are logged in automatically and redirected to the campground index.
- **Return-to redirect** — If you try to visit a protected page while logged out, you are sent to login first and then returned to the page you originally requested.
- **Flash messages** — Success and error messages appear at the top of the page after actions like logging in, creating a campground, or deleting a review.

### Security & Validation

Input is validated on both the client and server, and protected routes check ownership before allowing changes.

- **Helmet CSP** — Sets security headers and a Content Security Policy that limits scripts, styles, and images to trusted sources (Bootstrap, MapTiler, Cloudinary, etc.).
- **Server validation** — Campground and review forms are validated with Joi. A custom rule rejects HTML in text fields to reduce XSS risk.
- **Access control** — Creating campgrounds and reviews requires login. Editing or deleting a campground or review is limited to its author.
- **Sessions** — Login sessions are stored in MongoDB via connect-mongo and expire after seven days. Forms also use Bootstrap's client-side validation for immediate feedback.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Web framework** | Express 5 |
| **Template engine** | EJS with EJS-Mate layouts |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | Passport.js, passport-local, passport-local-mongoose |
| **Session store** | connect-mongo |
| **File uploads** | Multer + multer-storage-cloudinary |
| **Image hosting** | Cloudinary |
| **Maps & geocoding** | MapTiler SDK & Geocoding API |
| **Validation** | Joi + sanitize-html |
| **Security** | Helmet |
| **UI** | Bootstrap 5, custom CSS |
| **Deployment** | Vercel (`@vercel/node`) |

---

## Application Architecture

YelpCamp follows a classic MVC-style structure on Express. Incoming requests hit a route, pass through middleware for authentication, validation, or file upload, then reach a controller that reads or writes Mongoose models and renders an EJS view.

```
Request → Route → Middleware (auth, validation, upload) → Controller → Model → View (EJS)
```

Campground reviews use nested routes under `/campgrounds/:id/reviews`, keeping review logic separate from campground CRUD. Errors are handled by a custom `ExpressError` class and a global error handler that renders a dedicated error page.

### Routes

| Path | Description |
|------|-------------|
| `GET /` | Home / landing page |
| `GET /campgrounds` | List all campgrounds (with optional `?search=` query) |
| `GET /campgrounds/new` | New campground form (auth required) |
| `POST /campgrounds` | Create campground (auth required) |
| `GET /campgrounds/:id` | Campground detail page |
| `GET /campgrounds/:id/edit` | Edit form (author only) |
| `PUT /campgrounds/:id` | Update campground (author only) |
| `DELETE /campgrounds/:id` | Delete campground (author only) |
| `POST /campgrounds/:id/reviews` | Add review (auth required) |
| `DELETE /campgrounds/:id/reviews/:reviewId` | Delete review (review author only) |
| `GET /register`, `POST /register` | User registration |
| `GET /login`, `POST /login` | User login |
| `GET /logout` | User logout |

### Data Models

**User**
- `email` (required)
- `username` and `password` (managed by passport-local-mongoose)

**Campground**
- `title`, `price`, `description`, `location`
- `images[]` — `{ url, filename }` with a virtual `thumbnail` URL for resized previews
- `author` — reference to User
- `reviews[]` — references to Review documents
- `geometry` — GeoJSON Point (`type: "Point"`, `coordinates: [lng, lat]`)

**Review**
- `body`, `rating` (1–5)
- `author` — reference to User

---

## Project Structure

```
YelpCamp/
├── app.js                  # Application entry point, middleware, and route mounting
├── vercel.json             # Vercel deployment configuration
├── JOIschemas.js           # Joi validation schemas with HTML sanitization
├── middleware.js           # Auth, authorization, and validation middleware
├── cloudinary/
│   └── index.js            # Cloudinary and Multer storage configuration
├── controllers/
│   ├── campground.js       # Campground CRUD and search logic
│   ├── review.js           # Review create and delete logic
│   └── user.js             # Registration, login, logout logic
├── models/
│   ├── campground.js       # Campground Mongoose schema
│   ├── review.js           # Review Mongoose schema
│   └── user.js               # User Mongoose schema
├── routes/
│   ├── campgrounds.js      # Campground routes
│   ├── reviews.js          # Nested review routes
│   └── users.js            # Authentication routes
├── views/
│   ├── home.ejs            # Landing page
│   ├── error.ejs           # Error page
│   ├── layouts/boilerplate.ejs
│   ├── partials/           # Navbar, footer, flash messages
│   ├── campgrounds/        # Index, new, edit, details templates
│   └── users/              # Login and register templates
├── public/
│   ├── javascripts/        # Map scripts and form validation
│   ├── stylesheets/        # Home page and star rating styles
│   └── logo.png
├── seeds/                  # Database seeding utilities
└── utils/
    └── ExpressError.js     # Custom error class
```

---

## External Services

YelpCamp relies on a few external services in production:

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Stores users, campgrounds, reviews, and session data. Campgrounds include GeoJSON geometry for map placement. |
| **Cloudinary** | Handles image upload, storage, and deletion. Campground photos are stored in a dedicated `YelpCamp` folder. |
| **MapTiler** | Powers the cluster map on the index page, the location map on detail pages, and forward geocoding when locations are entered. |
| **Vercel** | Hosts the application as a serverless Node.js deployment. |

---

## Deployment

The application is deployed on **Vercel** using the `@vercel/node` builder. The `vercel.json` config routes all requests to `app.js`, which bootstraps Express, connects to MongoDB, and serves the app.

Environment variables for the database URL, session secret, Cloudinary credentials, and MapTiler API key are set in the Vercel project dashboard. These are required for authentication, image uploads, maps, and geocoding to work in production.

---

## Repository

Source code is available on GitHub:

**[https://github.com/Krish-7947/YelpCamp](https://github.com/Krish-7947/YelpCamp)**
