/*
 * debug.js
 * Author: Michael Friedman
 *
 * Some tools for debugging. Namely a print statement that can be toggled
 * by a 'debug' flag set in this file.
 */

// Set this variable true/false to toggle debugging tools defined below.
const debug = true;


// A print statement toggled by the debug flag above. Prints msg to stderr.
var log = function(msg) {
    if (debug) console.error(msg);
}


module.exports = {
    log
};
