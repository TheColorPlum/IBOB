/*
 * scripts.js
 * Author: Michael Friedman
 *
 * Defines behavior for all pages in the app.
 */

$(document).ready(function() {

// Some helper constants/functions for infinite scroll

var postRowHtmlTemplate = $('#post-row-template').html();  // defined in profile.html

/*
 * Simple micro templating. Returns the HTML string `html`, with all
 * occurrences of {{vars}} replaced by the vars in `vars`.
 *   Ref: Copied from one of the examples in the Infinite Scroll docs
 *        https://codepen.io/desandro/pen/LLjYgG/
 */
function microTemplate(html, vars) {
  // Replace {{tags}}
  return html.replace(/\{\{([\w\-_\.]+)\}\}/gi, function(match, key) {
    // Walk through objects to get value
    var value = vars;
    key.split('.').forEach(part => {
      value = value[part];
    });
    return value;
  });
}

/******************************************************************************/

// Configure infinite scroll for posts
//   Ref: https://infinite-scroll.com/options.html#responsetype

var unsplashId = '9ad80b14098bcead9c7de952435e937cc3723ae61084ba8e729adb642daf0251';

var $posts = $('.container').infiniteScroll({
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
    history: false
});

$posts.on('load.infiniteScroll', function(event, response) {
    // Parse JSON and construct HTML for the new posts
    var newPostsJson = JSON.parse(response);

    // Make sure there are an even number of posts to add
    if (newPostsJson.length % 2 != 0) {
        newPostsJson.pop();
    }

    // Add posts in rows of 2
    var newPosts = '';
    for (var i = 0; i < newPostsJson.length / 2; i += 2) {
        var post1 = newPostsJson[i];
        var post2 = newPostsJson[i+1];

        var vars = {
            photoSrc1: post1.urls.regular,
            caption1: 'Sample caption',
            timestamp1: new Date(post1.created_at).toDateString(),

            photoSrc2: post2.urls.regular,
            caption2: 'Sample caption',
            timestamp2: new Date(post2.created_at).toDateString(),
        };
        var newRow = microTemplate(postRowHtmlTemplate, vars);

        newPosts += newRow;
    }

    // Compile HTML
    var newPostsHtml = $(newPosts);

    // Append new posts
    $posts.infiniteScroll('appendItems', newPostsHtml);
});

// Load initial page
$posts.infiniteScroll('loadNextPage');

});
