require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const flash = require("connect-flash");
const User = require('./models/user')
const ensureLogin = require("connect-ensure-login");

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

var handlebars = require('handlebars');
hbs.registerHelper('moment', require('helper-moment'))

// hbs.registerHelper("formatDate", function (datetime, format) {
//   return moment(datetime).format(format);
// });

// var moment = require('moment');
// moment().format();


// app.js
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// app.js
// Mongoose configuration
mongoose.Promise = Promise;
mongoose
  .connect(`mongodb+srv://fitpal:${process.env.DBPASS}@fitpal-ebrlo.mongodb.net/fitpal?retryWrites=true`)
  .then(() => {
    console.log('Connected to Mongo!')
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });

// ...other code




const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      
// app.js
app.use(session({
  secret: "yadayadayada",
  resave: true,
  saveUninitialized: true
}));



passport.serializeUser((user, cb) => {
  cb(null, user._id);
  //console.log('serialize')
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
    //console.log('unserialize')
  });

});
app.use(flash());
passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

// app.js
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'icon-color.png')));



// default value for title local
app.locals.title = 'FitPal';

// Routes
const authRoutes = require("./routes/auth-routes");
app.use('/', authRoutes);

const index = require('./routes/index');
app.use('/', index);


module.exports = app;
