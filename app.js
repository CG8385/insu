var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./utils/database.js').connection;
var log4js = require('./utils/logger.js');
var User = require('./models/user.js')(db);

var routes = require('./routes/index');
var users = require('./routes/users');
var apis = require('./routes/APIs');
var compression = require('compression');

var app = express();
app.use(compression());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
var ejs = require('ejs'); 
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (app.get('env') === 'development') {
  app.use(logger('dev'));
}

app.use(log4jsLogger);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
app.use(cookieParser());
app.use(session({
  name: 'insu',
  secret: 'cg123456lalala',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: db })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apis);
app.use('/', routes);
app.use('/users', users);

// passport config
var User = require('./models/user')(db);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(function(username, done) {
  User.findOne({username: username}).populate('userrole org').exec()
  .then(function(user){
    done(null, user);
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// error handler
app.use(function(err, req, res, next) {
  if (process.env.NODE_ENV != 'production') {
    res.status(err.status || 500);
    console.log(err);
    res.json({status: err.status, message: err.message});
  }else{
    res.status(err.status || 500);
    res.json({status: err.status, message: err.message});
    // res.send('error occurs');
  }
});

function log4jsLogger(req, res, next) {
  if(app.get('env') === 'production')
  {
    // log4js.trace(getClientIp(req) + ":  " + req.url);
  }
  req.clientIP = getClientIp(req);
  next();
}

function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    };

module.exports = app;
