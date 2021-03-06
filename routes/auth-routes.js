const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");
const flash = require("connect-flash");
const ensureLogin = require("connect-ensure-login");

// User model
const User = require("../models/user");

// Activity model
const Activity = require("../models/activity");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


// SIGNUP
authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name
  const zip = req.body.zip;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
      name,
      zip
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/home');
        })
      }
    });
  })
  .catch(error => {
    next(error)
  })
});


//LOGIN
authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});
authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

// PRIVATE PAGE
authRoutes.get("/private-page", isLoggedIn, (req, res) => {
  res.render("private", { user: req.user });
});

// PROFILE PAGE
// authRoutes.get("/profile", isLoggedIn, (req, res) => {
//   Activity.find({owner: req.user._id}) 
//     .then((err, myActivities) => {
//       Activity.find({buddies: req.user.name})
//       .then((err, joinedActivities) => {
//         console.log("THESE ARE MY JOINED ACTIVITIES:");
//         console.log(joinedActivities);
//         res.render("profile", { user: req.user, activities: myActivities, joinedActivities});      
//       })
//   });
   
// });

// authRoutes.get("/profile", isLoggedIn, (req, res) => {
//   Activity.find({owner: req.user._id}, (err, myActivities) => {
//     if (err) {return next(err); }
//     res.render("profile", { user: req.user, activities: myActivities });
//   });
   
// });

authRoutes.get("/profile", isLoggedIn, (req, res) => {
  Activity.find({owner: req.user._id})
  .then(myActivities => {
    Activity.find({buddies: req.user.name})
      .then(joinedActivities => {
        res.render("profile", { user: req.user, activities: myActivities, joined: joinedActivities });
        console.log(joinedActivities);
      })
    })
  });



// ACTIVITY DETAILS
authRoutes.get('/profile/:activityId', isLoggedIn, (req, res, next) => {
  Activity.findById(req.params.activityId)
  .then(theActivity =>{
    res.render('activity-info', {activity: theActivity});
  })
  .catch(error => {
    console.log('Error while retrieving activity details: ', error);
  })
});

// EDIT ACTIVITY
authRoutes.get('/edit-activity/:id', (req,res,next) => {
  Activity.findById(req.params.id)
  .then(theActivity => {
    res.render('edit-activity', {activity: theActivity});
    console.log(theActivity);
  })
  .catch(error => {
    console.log('Error while retrieving activity details: ', error);
  })
});

authRoutes.post('/edit-activity/:id', (req, res, next) => {
  const { title, description, category, date } = req.body;
  Activity.updateOne({_id: req.params.id}, { $set: {title, description, category, date}}, {new: true})
  .then((activity) => {
    res.redirect('/profile');
  })
  .catch((error) => {
    console.log(error);
  })
});

/*DELETE ACTIVITY */
authRoutes.get('/delete-activity/:thisid', (req,res,next) => {
  Activity.findByIdAndRemove(req.params.thisid)
  .then(() => {
    res.redirect('/profile')
  })
  .catch(error => {
    console.log('Error while retrieving activity details: ', error);
  })
});

// LOGOUT
authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/login');
}

module.exports = authRoutes;