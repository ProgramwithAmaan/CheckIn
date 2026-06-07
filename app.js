if(process.env.NODE_ENV != "production" ){
    require('dotenv').config();
};



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local"); 
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// app.use( "/listings" ,listings);
// app.use("/listings/:id/reviews" , reviews);

const Review = require("./models/review.js");

// const { wrap } = require("module");


const dbUrl = process.env.ATLASDB_URL;
console.log(dbUrl);


main()
    .then(()=>{
    console.log("connected to DB");
    })
    .catch(err => {
        console.log(err);
    });

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto: {
//     secret: "mysupersecretcode",
//   },
//   touchAfter: 24 * 3600,
// });

// store.on("error", (err) => {
//     console.log("ERROR in MONGO SESSION STORE" , err);
// });

const sessionOptions = {
    // store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true
    },
};

// app.get("/" , (req,res)=>{
//     res.send("Hi ! I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // it is a method provided by passport-local-mongoose to authenticate user

// serialize and deserialize user
passport.serializeUser(User.serializeUser()); // user related data store in the session 
passport.deserializeUser(User.deserializeUser()); // user related data to be deserialized when the session will end 


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user; // it is provided by passport to access the currently logged in user in all the templates
    next();
});


// DEMO USER CREATION ROUTE
// app.get("/demouser" , async (req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
//     let registeredUser = await User.register(fakeUser , "helloworld"); // it is a method provided by passport-local-mongoose to register user
//     res.send(registeredUser);
// });

app.use("/listings" , listingsRouter);
app.use("/listings/:id/reviews" , reviewsRouter);
app.use("/" , userRouter);

// app.all("*" , (req,res,next) => {  
//     next(new ExpressError(404 , "Page Not Found"));
// });

const validatelisting = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    } else {
        next();
    }
};


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080 , ()=>{
    console.log("server is listening to port 8080");
});