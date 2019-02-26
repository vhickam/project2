const express = require('express');
const router  = express.Router();

// ACTIVITY MODEL
const Activity = require("../models/activity");

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});


// GET new activity page
router.get("/new-activity", (req, res, next) => {
  res.render("new-activity");
});

router.post("/new-activity", (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const date = req.body.date;
  const category = req.body.category;
  const owner = req.user._id;

  const newActivity = new Activity({
    title,
    description,
    category,
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

module.exports = router;
