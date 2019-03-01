const express = require('express');
const router  = express.Router();

// ACTIVITY MODEL
const Activity = require("../models/activity");
const User = require("../models/user");

/* GET index page */
router.get('/', (req, res, next) => {
  res.redirect('home');
});

// GET HOME PAGE
router.get("/home", isLoggedIn, (req, res) => {
  Activity.find().sort('date')
  .then(allActivities => {
    console.log(allActivities)
    res.render("home", { user: req.user, activities: allActivities });
  })
 
});
// GET ACTIVITY INFO (FROM HOME PAGE)
router.get('/home/:actId', isLoggedIn, (req, res, next) => {
  Activity.findById(req.params.actId)
  
  .then(theActivity =>{
    User.findById(theActivity.owner)
      .then(theOwner => {
        res.render('activity', {activity: theActivity, owner: theOwner});
      })
    
  })
  .catch(error => {
    console.log('Error while retrieving activity details: ', error);
  })
});

// JOIN ACTIVITY
router.post('/activity/join/:id', isLoggedIn, (req, res, next) => {
    Activity.update({_id: req.params.id}, {$push: {buddies: req.user.name}})
    .then(mod => {
      res.redirect('back');
    })
    
})




// NEW ACTIVITY
router.get("/new-activity", (req, res, next) => {
  res.render("new-activity");
});


router.post("/new-activity", (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const date = req.body.date;
  const category = req.body.category;
  const address = req.body.address;
  const owner = req.user._id;


  const newActivity = new Activity({
    title,
    description,
    category,
    address,
    date,
    owner
  });

  newActivity.save((err) => {
    if (err) {
      res.render("new-activity", { message: "Something went wrong" });
    } else {
        res.redirect('/profile');
    }
  });
});




function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/login');
}

module.exports = router;
