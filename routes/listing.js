const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); // use double dot bcz we are in routes folder and we want to access utils folder
const ExpressError = require("../utils/expressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

const listingController = require("../controllers/listing.js");
 
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

const parseListingBody = (req, res, next) => {
    const listing = req.body.listing || {};

    if (!req.body.listing) {
        for (const [key, value] of Object.entries(req.body)) {
            const match = key.match(/^listing\[(.+)\]$/);
            if (match) {
                listing[match[1]] = value;
            }
        }
    }

    if (listing.price !== undefined) {
        const parsedPrice = Number(listing.price);
        if (!Number.isNaN(parsedPrice)) {
            listing.price = parsedPrice;
        }
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    req.body.listing = listing;
    next();
};

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body, { abortEarly: false, convert: true });
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    } else {
        next();
    }
};


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), parseListingBody, validateListing, wrapAsync(listingController.createListing));

// New Route , we can move this from above the show route bcz it takes as an id instead of form
router.get("/new" ,isLoggedIn , listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, upload.single("listing[image]"), parseListingBody, validateListing ,  wrapAsync(listingController.updateListing))
.delete(isLoggedIn, wrapAsync(listingController.deleteListing));


// Index Route
// router.get("/", wrapAsync(listingController.index));



// Show Route
// router.get("/:id" , wrapAsync(listingController.showListing));

// Create Route
// router.post("/",isLoggedIn, wrapAsync(listingController.createListing));

//Edit Route
router.get("/:id/edit", isLoggedIn,wrapAsync(listingController.renderEditForm));

// Update Route
// router.put("/:id" ,isLoggedIn, wrapAsync(listingController.updateListing));

// Delete Route 
// router.delete("/:id" ,isLoggedIn, wrapAsync(listingController.deleteListing));

module.exports = router;