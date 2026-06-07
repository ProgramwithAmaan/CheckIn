const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/signup" , userController.renderSignupForm);

router.post("/signup" , wrapAsync(userController.signup));

router.get("/login" , saveRedirectUrl, userController.renderLoginForm);

router.post("/login" , passport.authenticate("local" , {
        failureRedirect: "/login",
        failureFlash: "wrong username or password",
    }),
    saveRedirectUrl,
    userController.Login
);

router.get("/logout" , userController.Logout);

module.exports = router;