const User = require("../models/user.js");

module.exports.renderSignupForm = (req , res) => {
    res.render("users/signup.ejs");
};


module.exports.signup = async (req,res,next) => {
    try {
        let {username , email , password} = req.body;
        const newUser = new User({username , email});
        const registeredUser = await User.register(newUser , password);
        console.log(registeredUser);
        req.login(registeredUser , (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success" , "Welcome to Checkin");
            const redirectUrl = req.session.redirectUrl || "/listings/new";
            delete req.session.redirectUrl;
            res.redirect(redirectUrl);
        });
    } catch(err) {
        req.flash("error" , "Username already exists");
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.Login = (req,res) => {
    req.flash("success" , "Welcome back to Checkin , you are logged in successfully");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    // delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};

module.exports.Logout = (req,res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success" , "you are logged out successfully");
        res.redirect("/listings");
    })
};