# Backend

The back end is divided into three components: the **app**, the **user-server**, and the **user-server directory** (or directory, for short). In a nutshell: the app is the user-facing application (traditional web pages, web server, etc., common to all users). The user-server is a server that hosts an individual user's data. The directory stores the mapping from each user (by name) to the IP address of their user server, and provides this to all user-servers via a web API. All three components are built with Node.js. More details on each are in the following sections.

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


## Directory

This wouldn’t be much of a social network if there’s no interaction between users. Up to this point, all we have is a bunch of users with their own independent, isolated user-servers. But without some other component, there is no way for users to find *each other's* user-servers.

That’s where the directory comes into play; it is just a mapping from a user (by their Blockstack ID) to the IP address of their user-server. This mapping is hosted on a central server that all user-servers know the address of, and it's provided through a simple put/get web API.

The structure of the directory is very similar to the user-server - it also has the three main components *storage*, the *web API*, and an *authentication/permissions system* (APS). But each is much simpler, since there's not as much to store/serve here. Each of these is described in the sections below.

### Codebase structure

The code is located in the `directory/` folder. Within that is the following structure:

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

Storage is implemented in a MySQL database. It has one table called `user_servers`, with the following schema:

```
+------+--------+------+
|  id  |  bsid  |  ip  |
+------+--------+------+
```

- `id` is an int that auto-increments
- `bsid` is a string. It holds the user's Blockstack ID (e.g. alice.id)
- `ip` is a 32-bit unsigned int. It holds the user's IP address.

Storing IP addresses as integers is convenient for storage, but not so much for reading/writing, since we have to convert from the usual decimal notation (e.g. 192.168.0.1) to the corresponding integer. But we can do this pretty easily in MySQL. e.g.

- Insert: `INSERT INTO user_servers (bsid, ip) VALUES ("alice.id", INET_ATON("192.168.0.1"));`
- Select: `SELECT bsid, INET_NTOA(ip) AS ip FROM user_servers WHERE bsid = "alice.id";`. This will return something like:
  ```
  +-----------+-----------------+
  | bsid      |  ip             |
  +-----------+-----------------+
  | alice.id  |  192.168.0.1    |
  +-----------+-----------------+
  ```

The actual SQL queries used to insert/select entries are abstracted in a data-access layer written in Node. It's located in `lib/dal.js`, and it defines the two main operations we make to the database:

- `get(bsid, callback)`: Gets the IP address corresponding to `bsid` (string user name).
  - Returned to callback: JS object in format `{success: true, ip: "192.168.0.1"}` if there is an entry for that user, or `{success: false}` if not.
- `put(bsid, ip, callback)`: Adds a mapping from `bsid` (string user name) to `ip` (string IP address in decimal notation), or overwrites the entry for `bsid` if there already is one.
  - Returned to callback: `{success: true}`

And it also defines a function for clearing the database, which is helpful when writing tests.

- `clearDatabase(callback)`: Clears the contents of all tables in the database. (Nothing is passed to the callback.)

### Web API

The API is implemented as a set of HTTP request handlers in `routes/api.js`. We have a spec of the API in a [Google doc here](https://docs.google.com/document/d/1wykWWzwd8LasOF8lJKZEpNwXCW-B3se33YUEtK8M2OY). We will move it into this section once it has been finalized.

### APS

The APS is also implemented as one of our libraries in `lib/aps.js`. Like the API, we wrote the spec of the APS in the same [Google doc](https://docs.google.com/document/d/1wykWWzwd8LasOF8lJKZEpNwXCW-B3se33YUEtK8M2OY), and we will move it to these docs when it is finalized.



## Testing

Tests for the back end are written using the Mocha testing framework. They are placed in the `test/` subdirectory within each component (app and user-server - e.g. `user-server/test`).

To keep the organization simple, our convention for testing is to put all tests for a file `x.js` in `test/x.js`. See the [Mocha documentation](https://mochajs.org/) and our existing tests for a reference on how to write them.

You can run all tests with our shortcut scripts called `test.sh` (there is one at the root level of each component, app and user-server).

Also for the user-server and the directory, we have a small library of functions to help with debugging defined in `lib/debug.js`. Check them out and see their usage in current tests for a reference on how to use them.
