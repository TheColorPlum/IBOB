# Frontend

## Codebase

Below is the directory structure that makes up the front end, under the `app/` directory (key files highlighted).

```
- public/
  - bundle.js
  - styles.css
  - scripts.js
- views/
  - 404.html
  - index.html
  - feed.html
  - profile.html
```

The front end is written in HTML/CSS with the Bootstrap v4.0.0 styling framework, and JavaScript/jQuery v3.1.1 for handling dynamic content. The HTML pages ("views") are in the `views/` directory. The CSS/JS ("static files") are in the `public/` directory.

HTML:

- 404.html is a custom 404 error page.
- index.html is our landing/login page.
- feed.html is the page with the user's feed.
- profile.html is a user profile page.

CSS:

- styles.css contains styles for all pages, and is imported by every HTML page.

JavaScript:

- bundle.js is the *Blockstack library*. Use the [Blockstack.js documentation](http://blockstack.github.io/blockstack.js/) as a reference for this library.
- scripts.js contains code controlling the behavior of all pages.

**Important note**: To use any static files in the HTML pages, you must place them in the `public/` directory, and then reference them from the HTML as `/public/<file>`. (This is how the app server is configured to load static files.) For example, `public/styles.css` must be imported as `/public/styles.css`.

## Frontend Behavior

This section just makes a few notes to help you understand what's going on in the front end scripts:

- The feed and profile pages do not come with user data populated. The client must manually populate the data once the "template" page has been retrieved (see [Backend](backend.md) for more details). *This has not been implemented yet, but you'll eventually see code for this at the beginning of the feed/profile scripts.*
- Any requests to the user-server or directory (except the directory's `/get` request) must be timestamped and signed in a particular format (see [Backend](backend.md) for specs of this format). To make this easy, `scripts.js` defines a function near the beginning for making such requests. Use it so you don't have to worry about formatting.

## Libraries We Use

Below we list the libraries, frameworks, and other dependencies we use for the front end, as well as links to their tutorials/documentation for reference:

- [Bootstrap v4.0.0](https://v4-alpha.getbootstrap.com/): CSS styling framework. Used on all pages.
- [jQuery v3.1.1](http://jqfundamentals.com/): DOM manipulation library for handling dynamic content. Used on all pages.
- [Font Awesome Icons v4.7.0](http://fontawesome.io/icons/): CSS icon pack. Used on all pages.
- [Infinite Scroll for jQuery](https://infinite-scroll.com/): jQuery library for infinite scrolling on page content.
- [Masonry](https://masonry.desandro.com/): A grid/tiling library for JavaScript. Integrates with Infinite Scroll to make an infinite scrolling grid layout for our posts. ([Docs](https://masonry.desandro.com/options.html))

