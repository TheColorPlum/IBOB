var dal = require("./lib/dal");
var requests = require("./lib/requests");

dal.addPhoto("photo.png", () => {
dal.addPost(1, requests.makeTimestamp(), () => {

dal.getPosts(rows => {

    console.log(JSON.stringify(rows));

});


})});
