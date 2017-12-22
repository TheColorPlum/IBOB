/*
 * app.js
 *
 * Sets up the server and API route.
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();

// Store raw request body in req.body. Needed to access signatures on
// requests.
// Ref: https://stackoverflow.com/questions/9920208/expressjs-raw-body/9920700#9920700
app.use(function(req, res, next) {
    var data = "";
    req.setEncoding("utf8");

    // Concatenate request body into `data`
    req.on("data", function(chunk) {
        data += chunk;
    });

    // Store in req.body
    req.on("end", function() {
        req.body = data;
        next();
    });
});

// Link API route to app
var api = require('./routes/api');
app.use('/api', api.router);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
