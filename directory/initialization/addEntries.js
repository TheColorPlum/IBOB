/*
 * addEntries.js
 * Authors: Michael Friedman
 *
 * Inserts entries for the user-servers defined below.
 */

// Constructs the URL of a user-server given its ID (one of those above)
const getUrl = function(id) {
    // return `https://the-feed-user-server${id}.appspot.com`;
    return 'http://localhost:3000';
};


/******************************************************************************/

// Insert entries for each user-server above

const dal = require('../lib/dal');

dal.put('101.id', getUrl('101'), () => {
dal.put('102.id', getUrl('102'), () => {
dal.put('103.id', getUrl('103'), () => {
dal.put('104.id', getUrl('104'), () => {
dal.put('1005.id', getUrl('1005'), () => {

dal.put('106.id', getUrl('106'), () => {
dal.put('107.id', getUrl('107'), () => {
dal.put('108.id', getUrl('108'), () => {
dal.put('109.id', getUrl('109'), () => {
dal.put('110.id', getUrl('110'), () => {

dal.put('112.id', getUrl('112'), () => {
dal.put('113.id', getUrl('113'), () => {
dal.put('114.id', getUrl('114'), () => {
dal.put('115.id', getUrl('115'), () => {
dal.put('116.id', getUrl('116'), () => {
dal.put('117.id', getUrl('117'), () => {
dal.put('118.id', getUrl('118'), () => {
dal.put('119.id', getUrl('119'), () => {
dal.put('120.id', getUrl('120'), () => {
dal.put('121.id', getUrl('121'), () => {
dal.put('thefeed.id', getUrl('thefeed.id'), () => {

})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
})
