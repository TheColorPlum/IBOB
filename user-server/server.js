/*
 * server.js
 *
 * Configures and starts the user-server.
 */

const constants = require("./lib/constants");
const express = require("express");
const app = express();

const api = require("./routes/api");

// Package for easily handling file uploads.
//   Ref: https://github.com/richardgirges/express-fileupload
const fileUpload = require("express-fileupload");

/******************************************************************************/

// Configuration

// Allow url endpoints to be accessed from other domains (i.e. the web app)
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
}

app.use(allowCrossDomain);

// Stores raw request body in req.body. Needed to access signatures on
// requests.
// Ref: https://stackoverflow.com/questions/9920208/expressjs-raw-body/9920700#9920700
var storeRequestBody = function(req, res, next) {
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
};

var apiPrefix = "/api";

// Store the raw request body for the following API calls:
var urlsUsingRequestBody = [
  api.urls.getProfileInfo, api.urls.getPosts, api.urls.updateProfileInfo,
  api.urls.followUser, api.urls.addPost
];
urlsUsingRequestBody.forEach(url => {
    app.use(apiPrefix + url, storeRequestBody);
});


// But for photo uploads, handle the request body with file upload package
app.use(apiPrefix + api.urls.addPhoto, fileUpload());


// Map /api URLs to routes/api.js
app.use(apiPrefix, api.app);

/******************************************************************************/

// Start server
app.listen(constants.port, function() {
    console.log("User-server is running on port " + constants.port);
});
