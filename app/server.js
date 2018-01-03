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
const requests = require('./lib/requests');

/******************************************************************************/

// Configuration

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
}

app.use(allowCrossDomain);

// Expose static files at URLs prefixed with /public/
const publicDir = path.join(__dirname, 'public');
app.use('/public', express.static(publicDir));

/******************************************************************************/

// Url endpoints
const urls = {
    // Logging in
    index: '/',
    manifest: '/manifest.json',
    initialization: '/initialization',
    createUserServer: '/create-user-server',

    // Main pages
    profile: '/profile/:bsid',
    feed: '/feed',
    error: '/error'
};

// Base directory of views
const viewsDir = path.join(__dirname, '/views');

// User-server directory url
const directoryBaseUrl = 'http://localhost:4000';

/******************************************************************************/

// Public pages, available to users

/*
 * Returns the index (login) page
 */
app.get(urls.index, function(req, res, next) {
    res.sendFile(path.join(viewsDir, 'index.html'));
});


/*
 * Returns the app's manifest file. We are required to have this page
 * for login to work.
 */
app.get(urls.manifest, function(req, res, next) {
    res.sendFile(path.join(publicDir, 'manifest.json'));
});


/*
 * Returns the initialization page. This page is loaded upon the user's
 * first login to help them initialize their user-server.
 */
app.get(urls.initialization, function(req, res, next) {
    res.sendFile(path.join(viewsDir, 'initialization.html'));
});



/*
 * This initializes the user-server for a given user. Requires a signature.
 * See docs for details.
 */
app.post(urls.createUserServer, function(req, res, next) {
    // Verify request
    // TODO: For simplicity of the first implementation, we are not requiring
    // that this request is signed. That will be implemented later.

    var body = req.data;
    var bsid = body.bsid;
    var privateKey = body.privateKey;

    // Check that a user-server has not already been created for this user
    axios.get(directoryBaseUrl + '/api/get/' + bsid)
    .then(resp => {

        var json = resp.data;
        if (json.success) {
            // User-server already exists. Respond with failure
            res.json({success: false, errorMsg: 'This user already has a user-server!'});
            return;
        }


        // Spin up user-server
        // TODO: In production, we will do this. In development, we don't. You
        // will just have to manually start up user-server. See docs.
        var ip = '127.0.0.1';

        // Add entry to the directory for the new user-server
        var data = {bsid: bsid, ip: ip, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, privateKey);
        axios.post(directoryBaseUrl + '/api/put?requester=' + bsid, reqBody)
        .then(resp => {

            var json = resp.data;
            if (!json.success) {
                // This would mean an entry exists for this user already. But
                // we already know it doesn't from the first request. So this
                // should never happen
                res.json({success: false, errorMsg: 'This should never happen'});
                return;
            }


            // All done!
            res.json({success: true, ip: json.ip});


        }).catch(err => { // failed to put entry into directory
            res.json({success: false, errorMsg: 'User-server has been created, but failed to put entry into directory. Directory never responded.'});
        });

    }).catch(err => {  // failed to get entry from directory
        res.json({success: false, errorMsg: 'Cannot determine if user already '
            + 'has a user-server. Directory never responded.'});
    });
})


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
app.get(urls.error, function(req, res, next) {
    res.sendFile(path.join(viewsDir, '404.html'));
});


/******************************************************************************/

// Start server
app.listen(port, function() {
    console.log('App is running on port ' + port);
});
