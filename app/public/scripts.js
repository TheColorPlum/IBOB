/*
 * scripts.js
 * Author: Michael Friedman
 *
 * Defines behavior for all pages in the app.
 */

$(document).ready(function() {

// Activate infinite scroll for posts
//   Ref: https://infinite-scroll.com/
$('.container').infiniteScroll({
    path: '.pagination__next',
    append: '.post',
    history: false,
});

});
