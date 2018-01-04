/*
 * server.js
 *
 * Configures and starts the user-server.
 */

const express = require("express");
const app = express();
const port = 3000;

const api = require("./routes/api");

/******************************************************************************/

// Configuration

// Allow url endpoints to be accessed from other domains (i.e. the web app)
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
}

app.use(allowCrossDomain);

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

// Map /api URLs to routes/api.js
app.use("/api", api.app);

/******************************************************************************/

// Start server
app.listen(port, function() {
    console.log("User-server is running on port " + port);
});
