/*
 * server.js
 *
 * Configures and starts the server.
 */

const express = require('express');
const app = express();
const port = 5000;

const axios = require('axios');
const path = require('path');

/******************************************************************************/

// Configuration

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
}

app.use(allowCrossDomain);

// Expose static files at URLs with prefix /public/
app.use('/public', express.static(path.join(__dirname, 'public')));

/******************************************************************************/

// Serve pages

// Url endpoints
const urls = {
    index: '/',
    profile: '/profile/:bsid',
    feed: '/feed',
    error: '/error'
};

// Base directory of views
const viewsDir = path.join(__dirname, '/views');

// User-server directory url
const directoryBaseUrl = 'http://localhost:4000';

/*
 * Returns the index (login) page
 */
app.get(urls.index, function(req, res, next) {
    res.sendFile(path.join(viewsDir, 'index.html'));
});


/*
 * Returns the profile page
 */
app.get(urls.profile, function(req, res, next) {
    // Check that bsid requested has an account in the directory
    var bsid = req.params.bsid;
    var errorPage = path.join(viewsDir, '404.html');
    axios.get(directoryBaseUrl + '/api/get/' + bsid)
    .then(resp => {

        var json = resp.data;
        if (!json.success) {
            res.redirect(urls.error);
            return;
        }

        // Bsid exists, so we can send the profile page
        res.sendFile(path.join(viewsDir, 'profile.html'));
    })
    .catch(err => {
        res.redirect(urls.error);
    });
});


/*
 * Returns the feed page
 */
app.get(urls.feed, function(req, res, next) {
    res.sendFile(path.join(viewsDir, 'feed.html'));
});


/*
 * Returns a 404 error page
 */
app.get('/error', function(req, res, next) {
    res.sendFile(path.join(viewsDir, '404.html'));
});


/******************************************************************************/

// Start server
app.listen(port, function() {
    console.log("App is running on port " + port);
});
