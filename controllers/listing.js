const Listing = require("../models/listing.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/expressError.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  
  // Handle search functionality
  if (req.query.search) {
    const searchQuery = req.query.search.trim().toLowerCase();
    allListings = allListings.filter(listing => 
      listing.title.toLowerCase().includes(searchQuery) ||
      (listing.country && listing.country.toLowerCase().includes(searchQuery)) ||
      (listing.location && listing.location.toLowerCase().includes(searchQuery)) ||
      (listing.description && listing.description.toLowerCase().includes(searchQuery))
    );
  }
  
  // Handle filter by category (match by category field OR by keywords in title/description)
  if (req.query.filter) {
    const filterQuery = req.query.filter.trim().toLowerCase();
    const filterKeywords = {
      'trending': ['popular', 'best', 'trending'],
      'rooms': ['room', 'bedroom', 'bed', 'apartment', 'cozy'],
      'iconic cities': ['city', 'urban', 'downtown', 'metropolis'],
      'mountains': ['mountain', 'peak', 'alpine', 'trek', 'hill'],
      'castels': ['castle', 'fortress', 'historic', 'medieval'],
      'amazing pools': ['pool', 'swimming', 'water', 'resort'],
      'camping': ['camping', 'camp', 'tent', 'outdoor', 'wilderness'],
      'farms': ['farm', 'rural', 'countryside', 'harvest', 'agricultural'],
      'beaches': ['beach', 'coast', 'seaside', 'sand', 'ocean'],
      'pet-friendly': ['pet', 'dog', 'cat', 'animal'],
      'hiking': ['hiking', 'trail', 'trek', 'nature', 'adventure'],
      'city breaks': ['city', 'break', 'urban', 'explore'],
      'skiing': ['ski', 'slope', 'snow', 'winter', 'resort'],
      'family': ['family', 'kids', 'children', 'spacious'],
      'business': ['business', 'work', 'office', 'corporate'],
      'historic': ['historic', 'heritage', 'ancient', 'old'],
      'nightlife': ['nightlife', 'night', 'club', 'entertainment']
    };
    
    allListings = allListings.filter(listing => {
      // Check if listing has matching category
      if (listing.category && listing.category.toLowerCase() === filterQuery) {
        return true;
      }
      
      // Check if filter keywords match title or description
      const keywords = filterKeywords[filterQuery] || [filterQuery];
      const titleLower = (listing.title || '').toLowerCase();
      const descLower = (listing.description || '').toLowerCase();
      
      return keywords.some(keyword => 
        titleLower.includes(keyword) || descLower.includes(keyword)
      );
    });
  }
  
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "owner"
            }
        })
        .populate("owner");
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs" , { listing });
};

module.exports.createListing = async (req, res , next) => {
    let geometry = null;
    if (mapToken && req.body && req.body.listing && req.body.listing.location) {
        try {
            const geocodingClient = mbxGeocoding({ accessToken: mapToken });
            const response = await geocodingClient
                .forwardGeocode({
                    query: req.body.listing.location,
                    limit: 1,
                })
                .send();
            geometry = (response && response.body && response.body.features && response.body.features[0]) ? response.body.features[0].geometry : null;
        } catch (e) {
            console.warn('Mapbox geocoding failed:', e.message || e);
        }
    }

    const listingData = req.body.listing || {};
    if (req.file) {
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }
    if (geometry) listingData.geometry = geometry;
    const newListing = new Listing({ ...listingData, owner: req.user._id });

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success" , "New listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
};


module.exports.updateListing = async (req,res)=>{
    let { error } = listingSchema.validate(req.body, { abortEarly: false, convert: true });
    if(error){
        throw new ExpressError(400 , error);
    }
    let { id } = req.params;
    const listingData = req.body.listing || {};
    const listing = await Listing.findById(id);
    if(!listing){
        throw new ExpressError(404, "Listing not found");
    }

    listing.title = listingData.title;
    listing.description = listingData.description;
    // geocode when location changed (only if MAP token present)
    const oldLocation = listing.location;
    listing.country = listingData.country;
    listing.price = listingData.price;
    listing.category = listingData.category;

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    // If location provided and changed, fetch new geometry
    if (mapToken && listingData.location && listingData.location !== oldLocation) {
        try {
            const geocodingClient = mbxGeocoding({ accessToken: mapToken });
            const resp = await geocodingClient
                .forwardGeocode({ query: listingData.location, limit: 1 })
                .send();
            const newGeom = (resp && resp.body && resp.body.features && resp.body.features[0]) ? resp.body.features[0].geometry : null;
            if (newGeom) {
                listing.geometry = newGeom;
            }
        } catch (e) {
            console.warn('Mapbox geocoding failed during update:', e.message || e);
        }
    }

    // finally update stored location value
    listing.location = listingData.location;

    await listing.save();
    req.flash("success" , "Listing Updated");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
};