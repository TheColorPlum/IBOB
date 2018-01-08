/*
 * debug.js
 * Author: Michael Friedman
 *
 * Some tools for debugging. Namely a print statement that can be toggled
 * by a 'debug' flag set in this file.
 */

const constants = require("./constants");

// A print statement toggled by the debug flag above. Prints msg to stderr.
var log = function(msg) {
    if (constants.debugFlag) console.error(msg);
}


module.exports = {
    log
};
