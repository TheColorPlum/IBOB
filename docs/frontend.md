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
  - intialization.html
  - feed.html
  - new-post.html
  - profile.html
- requires.js
- server.js
```

The front end is written in HTML/CSS with the Bootstrap v4.0.0 styling framework, and JavaScript/jQuery v3.1.1 for handling dynamic content. The HTML pages ("views") are in the `views/` directory. The CSS/JS ("static files") are in the `public/` directory. `server.js` is the web server that servers the pages.

`requires.js` is a file where we specify libraries we need to import into the *browser* using Browserify. Namely, this includes the *Blockstack library* and one of our own small libraries containing some helper functions (`lib/requests.js`). See the [Blockstack.js documentation](http://blockstack.github.io/blockstack.js/) for a reference on Blockstack.

HTML:

- 404.html is a custom 404 error page.
- index.html is our landing/login page.
- initialization.html is the page a user loads to initialize their user-server.
- feed.html is the page with the user's feed.
- new-post.html is the page where users upload photos/make posts.
- profile.html is a user profile page.

CSS:

- styles.css contains styles for all pages, and is imported by every HTML page.

JavaScript:

- bundle.js is the bundled up packages from Browserify (see above requires.js).
- scripts.js contains code controlling the behavior of all the pages, and is imported by every HTML page.

**Important note**: To use any static files in the HTML pages, you must place them in the `public/` directory, and then reference them from the HTML as `/public/<file>`. (This is how the app server is configured to load static files.) For example, `public/styles.css` must be imported as `/public/styles.css`.

## Running the app

To run the app, first run the web server:

```bash
$ npm run devstart
```

and then open [http://localhost:5000](http://localhost:5000) in your browser.

**But note**: Before using the app in the browser, *you must have the user-server running*. (In production, this would be handled for you. A user requires a Blockstack ID before using the app, and when they log into our app for the first time, we automatically spin up a user-server for them in the cloud.)

### Initializing the user-server

The very first time you use the app, you have to configure the user-server first. In subsequent times, you only need to start it up. This is mostly an automated process, using a script, but there are still a few steps to take before running it.

The first time:

- **Start the dummy Blockstack core** if it's not already running.
  ```bash
  $ cd dummy-blockstack-core
  $ npm run devstart
  ```

- **Start the directory** if it's not already running.
  ```bash
  $ cd directory
  $ npm run devstart
  ```

- **Create a Blockstack ID alice.id** in the Blockstack Docker environment. This process is kind of long (sorry! can't be automated), so we document it in a separate page: [The Blockstack Docker Environment](blockstack.md).
  > Caveat - you will still have to create the Blockstack ID on each  reboot of your computer. See the Blockstack page for details.

  > Although this environment technically simluates Blockstack, we only use it to simulate a login in the browser. We do *not* use it in the user-server to get alice.id's public key when it needs to verify signatures. This is because we do not know what the Blockstack Docker environment's private key for alice.id is (we have not been able to figure out where it's stored.) So instead, we just made up a sample private key that we sign requests with, the dummy Blockstack core knows the corresponding public key, and the user-server asks the dummy Blockstack core for this public key when it needs to verify signatures.

- **Finally, initialize alice.id's user-server.** Run the script below, and then start the server:
  ```bash
  $ cd user-server/initialization
  $ ./main.sh alice.id
  $ cd ..
  $ npm run devstart
  ```

Subsequent times:

- Start each of the servers:
  - Dummy Blockstack Core: `$ cd dummy-blockstack-core && npm run devstart`
  - User-Server Directory: `$ cd directory && npm run devstart`
  - User-Server: `$ cd user-server && npm run devstart`


### Logging into the app

When the user logs into the app for the first time, they must provide some information to "spin up" their user-server. So they are redirected to a page that asks them for this information. On this page, the user does the following:

- Type in their private key (so we can use it to sign requests to their user-server)
- Click "Go"

When the user clicks "Go", we:

- Spin up their user-server
- Store the private key in their Blockstack storage (so we don't have to ask them for it again)

But note that, in development, we do not actually spin up the user-server (you do that yourself with the procedure from the last section). We still store the private key, however.

## Frontend Behavior

This section just makes a few notes to help you understand what's going on in the front end scripts:

### Making signed requests

Any requests to the user-server or directory (except the directory's `/get` request) must be timestamped and signed in a particular format (see [Backend](backend.md) for specs of this format). To make this easy, we define a function near the top of `scripts.js` for making such requests. Use it so you don't have to worry about formatting. e.g:

```javascript
var url = ...
var body = {timestamp: requests.makeTimestamp(), ...};
makeSignedRequest(url, body,

// Executed if got a response. `resp` is the parsed JSON response
function(resp) {
  ...
},

// Executed if didn't get a response
function() {
  ...
});
```

### Populating the feed and profile

The feed and profile pages do not come with posts populated. The client must manually populate the page with posts once the "template" page has been retrieved from the app server (see [Backend](backend.md) for specs for the web API we use to populate data).

Both pages initially load one "page" of posts, and the user clicks a button at the bottom of this page to load more posts. Additional "pages" are appended to the bottom.

We refer to the logged-in user as Alice.

**Profile.** The profile is relatively easy to populate. For each page, we make a request to the Alice's user-server for the next set of posts, in order by timestamp (going backwards in time).

**Feed.** The feed is more complex, since posts come from different sources - the user-servers of people Alice is following. We show posts on the feed in (approximately) timestamp order (most recent first) among all the people in the following list ("followings"), using the following procedure. *For each page, pick a fixed number (e.g. 20) of random followings, and request the next set of posts from their user-servers.*

> Random selection is done with replacement, so a following could be chosen multiple times; each time they are selected, we get another post from them. This allows for multiple posts to appear from the same following in one page, but only probabilistically, which is a good effect.

Some optimizations are made in the code to reduce the number of requests made per page (e.g. caching user-server IP addresses after the first retrieval). Also, if at any point while loading a page, a request for a following's posts fails, we just skip that following (more posts could be loaded from them in future rounds).


## Testing

We would have liked to use browser automation to make tests, but unfortunately Blockstack's login system is not compatible with browser automation. So instead, we have some manual tests you can run to check basic functionality.

**Prerequisite** to all of these is that you have gone through the [Running the app](frontend.md#running-the-app) section and are logged in.

### Adding a post

- Click the "+" icon in the navbar. This should load the /new-post page
- Click "Browse" and choose a file.
- Click "Post".
- This should show a message while the post is pending, and redirect you to the profile when it is finished uploading. You should also see the post as the first one on the profile (since it's most recent).

### Loading the profile

**Case 1**: No posts

- Go to the profile page (using the account dropdown in the navbar).
- When the page loads, there should be a small message indicating that you have no posts.

**Case 2**: With posts

- First, make more than 20 posts manually (sorry!) using the procedure from [Adding a post](frontend.md#adding-a-post). Recommended that you use a different photo for each one.
- Load the profile. You should see the most recent 20 posts.
- Click the "More" button. You should see the remaining posts after the most recent 20.


### Loading the feed

**Case 1**: No followings

- Go to the feed page (using the account dropdown in the navbar).
- When the page, there should be a small message indicating that you're not following anyone.

**Case 2**: With followings. In order to follow other users, we have to simulate the creation of other users. We do not actually have to make user-servers for them; instead, we put fake entries in the directory mapping their bsids to a *single user-server*. When we retrieve posts from one of them, it'll always make the request to the same user-server, but as far as the code knows, it is a different user-server for each user.

- Double check that the single user-server is configured with its *actual* owner as alice.id.
- Put 30 entries into the directory named 1.id, 2.id, etc., with each mapping to the IP address 127.0.0.1 (the single user-server running on localhost).
- Add each of those 30 users (1.id, 2.id, etc.) to Alice's following list (e.g. using the DAL).
- Make 20 posts manually (sorry!) via Alice's account, using the procedure from [Adding a post](frontend.md#adding-a-post). Recommended that you use a different photo for each one.
- Go to the feed page. You should see posts from a relatively random assortment of users.
- Click the "More" button. You should see more relatively random posts, with posts from the same user going backwards in time.
