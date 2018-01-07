/*
 * projectMode.js
 * Author: Michael Friedman
 *
 * Defines the PROJECT_MODE environment variable and its values.
 */

const varName = 'PROJECT_MODE';
const development = 'development';
const production = 'production';

// Check if one of the modes is set
const isDevelopment = (process.env[varName] === development);
const isProduction = (process.env[varName] === production);

const errorMessage = "Error: " + projectMode.varName + " environment variable \
is not set. Set it to " + projectMode.development + " if project is in \
development, or " + projectMode.production + " if in production.";
if (!isDevelopment && !isProduction) {
    // Invalid value for project mode
    console.error(errorMessage);
    process.exit(1);
}

module.exports = {
    varName,
    development,
    production,
    isDevelopment,
    isProduction
};
