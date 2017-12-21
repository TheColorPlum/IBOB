# Backend

The back end is divided into two components: the **app** and the **user-server**. In short, the app is the user-facing application (traditional web pages, web server, etc., common to all users). The user-server is a server that hosts an individual user's data. Both components are built with Node.js. More details on each in the following sections.

> Note that a third component will be coming, as described in our design document, but it is not yet created in the code base.

## App

*Documentation coming soon*

## User-server

When a user signs in for the first time, a server is created for them on the network - this is their *user-server*. This server is private to this particular user (the *owner*), and its role is to host all of its owner's data and expose it to the network. Through the app (running in their browser) the owner has read/write access to their data, while other users have restricted permissions (mostly read-only).

The user-server code is located in the `user-server/` directory and has three major components: *storage*, the *web API*, and an *authentication/permissions system* (which we abbreviate APS).

### Storage

User data is stored in a MySQL database... *Documentation coming soon*

### API

The API is implemented as a route in `routes/api.js`... *Documentation coming soon*

### APS

The APS is also implemented as a route in `routes/aps.js`... *Documentation coming soon*


## Testing

Tests for the back end are written using the Mocha testing framework. They are placed in the `tests/` subdirectory within each component (app and user-server). For instance, some of the user-server tests are shown below:

```
- user-server/
  - tests/
    - api.js
    - aps.js
```

To keep the organization simple, we use a simple convention that all tests for a file (e.g. `routes/api.js`) are written in a file with the same name under `tests/` (e.g. `tests/api.js`).

You can run all tests with our shortcut `test.sh` scripts (one in each component, app and user-server).

Also, we have a small library of functions to help with debugging defined in `debug.js`. Check them out and see their usage in current tests.
