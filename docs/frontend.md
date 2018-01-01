# Frontend

## Frontend code

Below is the directory structure that makes up the front end, under the `app/` directory (key files highlighted).

```
- public/
  - index.html
  - feed.html
  - profile.html
  - styles.css
  - scripts.js
```

The front end is written in HTML/CSS with the Bootstrap v4.0.0 styling framework, and JavaScript/jQuery v3.1.1 for handling dynamic content. All the code is in the `public/` directory:

HTML:

- index.html is our landing/login page.
- feed.html is the page with the user's feed.
- profile.html is a user profile page.

CSS:

- styles.css contains styles for all pages, and is imported by every HTML page.

JavaScript:

- scripts.js contains code controlling the behavior of all pages.

## Libraries We Use

Below we list the libraries, frameworks, and other dependencies we use for the front end, as well as links to their tutorials/documentation for reference:

- [Bootstrap v4.0.0](https://v4-alpha.getbootstrap.com/): CSS styling framework. Used on all pages.
- [jQuery v3.1.1](http://jqfundamentals.com/): DOM manipulation library for handling dynamic content. Used on all pages.
- [Font Awesome Icons v4.7.0](http://fontawesome.io/icons/): CSS icon pack. Used on all pages.
- [Infinite Scroll for jQuery](https://infinite-scroll.com/): jQuery library for infinite scrolling on page content.
- [Masonry](https://masonry.desandro.com/): A grid/tiling library for JavaScript. Integrates with Infinite Scroll to make an infinite scrolling grid layout for our posts. ([Docs](https://masonry.desandro.com/options.html))

