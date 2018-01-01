/*
 * scripts.js
 * Author: Michael Friedman
 *
 * Defines behavior for all pages in the app.
 */

$(document).ready(function() {

/******************************************************************************/

// Some setup so the client is ready to make requests to either the user-server
// or the directory.

// Load user-server's IP address from Blockstack storage
// TODO: implement
const userServerIp = '';

// Load user's private key from Blockstack storage (for signatures)
// TODO: implement
const userPrivateKey = '';

/*
 * Helper function for making signed requests to the user-server or the
 * directory. Makes a POST request to the url, with the body (JS object)
 * appended a timestamp, and then encoded/signed in the format accepted by
 * the servers. Returns a Promise for the response. Resolves if request
 * is successful; rejects with an error if the request fails.
 */
var makeSignedRequest = function(url, body) {
    // TODO: implement
    return new Promise((resolve, reject) => {
        reject();
    });
};


/******************************************************************************/


// Some helper constants/functions for infinite scroll

var postHtmlTemplate = $('#post-template').html();  // defined in profile.html

/*
 * Simple micro templating. Returns the HTML string `html`, with all
 * occurrences of {{vars}} replaced by the vars in `vars`.
 *   Ref: Copied from one of the examples in the Infinite Scroll docs
 *        https://codepen.io/desandro/pen/LLjYgG/
 */
var microTemplate = function(html, vars) {
  // Replace {{tags}}
  return html.replace(/\{\{([\w\-_\.]+)\}\}/gi, function(match, key) {
    // Walk through objects to get value
    var value = vars;
    key.split('.').forEach(part => {
      value = value[part];
    });
    return value;
  });
};

/******************************************************************************/

// Configure Masonry (tiling library for posts)
//   Ref: https://masonry.desandro.com/options.html (docs)
//        https://codepen.io/desandro/pen/QgMWzV/   (code sample)

var $posts = $('.posts-grid').masonry({
    itemSelector: '.post',
    columnWidth: '.posts-grid__col-sizer',
    gutter: '.posts-grid__gutter-sizer',
    percentPosition: true,
    stagger: 30,

    // Nicer reveal transition
    visibleStyle: { transform: 'translateY(0)', opacity: 1 },
    hiddenStyle: { transform: 'translateY(100px)', opacity: 0 }
});

var msnry = $posts.data('masonry');

/******************************************************************************/

// Configure infinite scroll for posts
//   Ref: https://infinite-scroll.com/options.html#responsetype

var unsplashId = '9ad80b14098bcead9c7de952435e937cc3723ae61084ba8e729adb642daf0251';

$posts.infiniteScroll({
    // Define url to request for next set of photos
    // TODO: Uncomment this when you're ready for dynamic content
    // path: function() {
    //     var count = 20;
    //     var offset = this.loadCount * count;
    //     return userServerBaseUrl + '/get-feed/' + count + '/' + offset;
    // },
    path: 'https://api.unsplash.com/photos?page={{#}}&client_id=' + unsplashId,

    // Do not immediately append, since the response is JSON (not HTML)
    append: false,
    responseType: 'text',
    history: false,

    // Integrate with Masonry
    outlayer: msnry
});

$posts.on('load.infiniteScroll', function(event, response) {
    // Parse JSON and construct HTML for the new posts
    var newPostsJson = JSON.parse(response);

    // Make sure there are an even number of posts to add
    if (newPostsJson.length % 2 != 0) {
        newPostsJson.pop();
    }

    // Construct HTML for new posts
    newPosts = newPostsJson.map(json => {
        var vars = {
            photoSrc: json.urls.regular,
            caption: 'Sample caption',
            timestamp: new Date(json.created_at).toDateString()
        };
        return microTemplate(postHtmlTemplate, vars);
    }).join('');

    // Compile HTML
    var newPostsHtml = $(newPosts);

    // Append new posts
    newPostsHtml.imagesLoaded(function() {
        $posts.infiniteScroll('appendItems', newPostsHtml);
        $posts.masonry('appended', newPostsHtml);
    });
});

// Load initial page
$posts.infiniteScroll('loadNextPage');

});
