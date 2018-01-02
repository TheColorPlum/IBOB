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
- server.js
- start.sh
```

The front end is written in HTML/CSS with the Bootstrap v4.0.0 styling framework, and JavaScript/jQuery v3.1.1 for handling dynamic content. The HTML pages ("views") are in the `views/` directory. The CSS/JS ("static files") are in the `public/` directory. `server.js` is the web server that servers the pages, and `start.sh` is a shortcut script that runs the server.

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

## Running the server

You can run the web server with:

```bash
$ ./start.sh
```

**But note**: Before using the app in the browser, *you must (semi)manually "spin up" the local user-server*. (In production, this would be handled for you. A user requires a Blockstack ID before using the app, and when they log into our app for the first time, we automatically spin up a user-server for them in the cloud.)

### Initializing the user-server

*You only need to do the procedure below once.* Afterwards, when you wish to test the app in the browser, you only need to make sure the servers listed below are running, in addition to the app server:

- User-Server: `$ cd user-server && start.sh`
- User-Server Directory: `$ cd directory && start.sh`
- Dummy Blockstack Core: `$ cd dummy-blockstack-core && start.sh`

> Caveat - you have to create the Blockstack ID on each reboot of your computer. See the Blockstack page for details.

So now the procedure. First, some prerequisites:

- **Start the dummy Blockstack core** if it's not already running.
  ```bash
  $ cd dummy-blockstack-core
  $ ./start.sh
  ```
- **Start the directory** if it's not already running.
  ```bash
  $ cd directory
  $ ./start.sh
  ```
- **Create a Blockstack ID alice.id** in the Blockstack Docker environment. This process is kind of long (sorry! can't be automated), so we document it in a separate page: [The Blockstack Docker Environment](blockstack.md).
  > Although this environment technically simluates Blockstack, we only use it to simulate a login in the browser. We do *not* use it in the user-server to get alice.id's public key when it needs to verify signatures. This is because we do not know what the Blockstack Docker environment's private key for alice.id is (we have not been able to figure out where it's stored.) So instead, we just made up a sample private key that we sign requests with, the dummy Blockstack core knows the corresponding public key, and the user-server asks the dummy Blockstack core for this public key when it needs to verify signatures.

Now the actual initialization:

- **Initialize alice.id's user-server.** We have a script you can run that automates this for the most part. You will need to fill in private key argument (find this in `dummy-blockstack-core/private-keys.txt`).
  ```bash
  $ cd user-server/initialization
  $ ./main.sh alice.id <private-key> 127.0.0.1
  ```
  > Note: This will automatically start running the user-server in the background once it has been configured. Its process id (PID) will be printed for you. *Make sure to take note of it*. Then, when you want to kill the server, use this process ID: `$ kill <pid>`.
- **Store some info in alice.id's Blockstack storage.** This part must be done in the browser, since Blockstack does not allow us to log in and read/write to storage outside the browser. We have an extra page served by app server for this purpose.
  - Run the app server:
    ```bash
    $ cd app
    $ ./start.sh
    ```
  - Open a browser to [http://localhost:5000/initialization](http://localhost:5000/initialization). Sign in as alice.id, enter alice.id's private key (same as in the last step), and enter 127.0.0.1 as the IP address of the user-server (i.e. localhost). Then click "Save". This will store the information in alice.id's Blockstack storage.

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

