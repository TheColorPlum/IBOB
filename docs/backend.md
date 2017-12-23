# Backend

The back end is divided into two components: the **app** and the **user-server**. In short, the app is the user-facing application (traditional web pages, web server, etc., common to all users). The user-server is a server that hosts an individual user's data. Both components are built with Node.js. More details on each in the following sections.

> Note that a third component will be coming, as described in our design document, but it is not yet created in the code base.

## App

*Documentation coming soon*

## User-server

When a user signs in for the first time, a server is created for them on the network - this is their *user-server*. This server is private to this particular user (the *owner*), and its role is to host all of its owner's data and expose it to the network. Through the app (running in their browser) the owner has read/write access to their data, while other users have restricted permissions (mostly read-only).

The user-server has three major components: *storage*, the *web API*, and an *authentication/permissions system* (which we abbreviate APS). These are described in detail in the following sections. But first, we lay out the structure of the codebase in the next section.

### Codebase structure

The user-server code is located in the `user-server/` directory. We show the structure of this directory below (we only show the main pieces here):

```
- lib/
  - ...
  - ...
- routes/
  - ...
  - ...
- test/
  - ...
  - ...
- server.js
- start.sh
- test.sh
```

In summary: the root directory contains mostly configuration files and some helpful shortcut scripts. Most notably, it contains `server.js`, which configures the server (at a high level) and runs it. `lib/` contains helper libraries that are written by us and used in the other components; `routes/` contains code to handle HTTP requests; and `test/` contains all of our tests.

### Storage

User data is stored in a MySQL database... *Documentation coming soon*

### Web API

The API is implemented as a set of HTTP request handlers in `routes/api.js`. We have a spec of the API in a [Google doc here](https://docs.google.com/document/d/1wykWWzwd8LasOF8lJKZEpNwXCW-B3se33YUEtK8M2OY).

> This is temporary. We will migrate the specs into these docs at some point in the future when it has been finalized.

### APS

The APS is also implemented as one of our libraries in `lib/aps.js`. Like the API, we wrote the spec of the APS in the same [Google doc](https://docs.google.com/document/d/1wykWWzwd8LasOF8lJKZEpNwXCW-B3se33YUEtK8M2OY), and we will move it to these docs when it is finalized.


## Testing

Tests for the back end are written using the Mocha testing framework. They are placed in the `test/` subdirectory within each component (app and user-server - e.g. `user-server/test`).

To keep the organization simple, our convention for testing is to put all tests for a file `x.js` in `test/x.js`. See the [Mocha documentation](https://mochajs.org/) and our existing tests for a reference on how to write them.

You can run all tests with our shortcut scripts called `test.sh` (there is one at the root level of each component, app and user-server).

Also for the user-server, we have a small library of functions to help with debugging defined in `user-server/lib/debug.js`. Check them out and see their usage in current tests for a reference on how to use them.
