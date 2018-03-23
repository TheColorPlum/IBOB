# Backend

The back end is divided into three components: the **app**, the **user-server**, and the **user-server directory** (or directory, for short). In a nutshell: the app is the user-facing application (traditional web pages, web server, etc., common to all users). The user-server is a server that hosts an individual user's data. The directory stores the mapping from each user (by name) to the IP address of their user server, and provides this to all user-servers via a web API. All three components are built with Node.js. More details on each are in the following sections.

## App

This section describes the back end for the user-facing application. It is very simple, since most of the heavy-lifting work is done by the user-server and directory.

### Codebase structure

Code for the app is located in `app/`. The general layout of this directory is shown below:

```
- lib/
  - ...
- public/
  - ...
- views/
  - ...
- server.js
```

The `lib/` directory contains some JS libraries written by us (e.g. helper functions, global variables, etc.). The `public/` and `views/` directories contain all the frontend files (see [Frontend](frontend.md)). The crux of this app is `server.js`, which is the web server that serves all the pages (more details below).

### Main Web Server

There is *one* server that provides the pages of the app to all users. These pages are just templates; they are populated with user data on the *client side* via requests to the user's user-server.

> This is not a traditional way of handling requests. Usually, data is pulled on the app server itself, populated into the page, and only then is the page sent to the client. This is not possible here, since the *user-server* stores the data we need to populate the page, and it will not serve data without a *signature* from the client. Thus, only the client can pull the data, not the app server.

The app defines the following URL endpoints. All of them are implemented in `server.js`. For logging in:

- `GET /`: Returns the sign-in page.
- `GET /manifest.json`: Returns the app's Blockstack manifest. Blockstack requires that this URL is defined in order to log users in.
- `GET /initialization`: Returns a page to start up the user's user-server. They have to enter some info, and then click a button to spin it up.
- `POST /create-user-server?requester=<requester>`: **Currently, this request is not implemented.** However, it will eventually spin up a new user-server for the requester. Specifically, it deploys a new user-server, registers it with the directory, and returns its URL. This request must be *signed* by the sender, to ensure that only that user can create their user-server.
  - Request body (sample):
    ```json
    {"bsid": "alice.id", "timestamp": "2017-10-23T18:25:43.511Z"}
    ```

  - Response (sample), if successful.
    ```json
    {"success": true, "url": "https://example.herokuapp.com"}
    ```

  - Response (sample), if failed. The response will fail if either the signature was invalid, or the user-server has already been created. The reason will be specified in `msg`.
    ```json
    {"success": false, "msg": "This user already has a user-server!"}
    ```

  > Note: If you look in `app/server.js`, some of the code for this is already written, but it returns before it gets to that point. Parts that are not implemented are labeled with `TODO` comments.

And main pages:

- `GET /feed`: Returns the logged-in user's feed page.
- `GET /profile/<bsid>`: Returns the profile page for the user given by `bsid`, if they have an account on the network. If not, redirects to the error page.
- `GET /error`: Returns a 404 error page.

Additionally, `server.js` serves static files (i.e. CSS/JS) located in the `app/public/` directory. It is configured to serve these at the URL endpoint `/public/<file>` (e.g. `/public/styles.css`).


## User-server

When a user signs in for the first time, a server is created for them on the network - this is their *user-server*. This server is private to this particular user (the *owner*), and its role is to host all of its owner's data and expose it to the network. Through the app (running in their browser) the owner has read/write access to their data, while other users have restricted permissions (mostly read-only).

The user-server has three major components: *storage*, the *web API*, and an *authentication/permissions system* (which we abbreviate APS). These are described in detail in the following sections. But first, we lay out the structure of the codebase in the next section.

### Codebase structure

The user-server code is located in the `user-server/` directory. We show the structure of this directory below (we only show the main pieces here):

```
- initialization/
  - main.sh
  - ...
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
- test.sh
```

In summary: the root directory contains mostly configuration files and some helpful shortcut scripts. Most notably, it contains `server.js`, which configures the server (at a high level) and runs it. `initialization/` contains the scripts for automating the initialization of the user-server, when it is first spun up. `lib/` contains helper libraries that are written by us and used in the other components; `routes/` contains code to handle HTTP requests; and `test/` contains all of our tests.

### Storage

User data is stored in a MySQL database. It has the following tables: `photos`, `posts`, `profile_info`, and `following`. Schemas are below:

- `photos`
  ```
  +------+--------+
  |  id  |  path  |
  +------+--------+
  ```

  - `id` is an int that auto-increments
  - `path` is a string path to the photo (e.g. a URL to its location)

- `posts`
  ```
  +------+-----------+-----------+
  |  id  |  photoId  | timestamp |
  +------+-----------+-----------+
  ```

  - `id` is an int that auto-increments
  - `photoId` is a foreign key into the `photos` table
  - `timestamp` is a string timestamp (JSON formatted) representing the time this post was made.

- `profile_info`
  ```
  +------+--------+-------------+-----+---------------+--------------+
  |  id  |  bsid  | displayName | bio | profileInfoId | coverPhotoId |
  +------+--------+-------------+-----+---------------+--------------+
  ```

  - `id` is an int that auto-increments
  - `bsid` is the Blockstack ID for this user
  - `displayName` is the user's full name
  - `bio` is an optional bio of the user
  - `profilePhotoId` is a foreign key into `photos`, which is the profile photo
  - `coverPhotoId` is also a foreign key into `photos`, and is the cover photo

- `following`
  ```
  +------+--------+
  |  id  |  bsid  |
  +------+--------+
  ```

  - `id` is an int that auto-increments
  - `bsid` is a string Blockstack ID of the user that this user follows

The actual SQL queries used to insert/select entries are abstracted in a data-access layer written in Node. It's located in `lib/dal.js`, and it defines the following operations to the database.

Put requests (none of these have return values):

- `followUser(bsid, callback)`: Adds `bsid` (string Blockstack ID) to the `following` table.
- `addPhoto(path, callback)`: Adds a photo to the `photos` table, given its string `path`.
- `addPost(photoId, timestamp, callback)`: Adds a post to the `posts` table, given a `photoId` (int id into `photos` table) and a `timestamp` (string in JSON timestamp format).
- `updateProfileInfo(bsid, profile, callback)`: Overwrites the entry in the `profile_info` table for `bsid` (string Blockstack ID) with new profile info in the `profile` object. `profile` can contain any of the attributes: `displayName`, `bio`, `profilePhotoId`, and `coverPhotoId` (analogous to the columns of the table).
- `setOwner(bsid, callback)`: Sets the owner of this user-server to `bsid` (string Blockstack ID) by initializing their entry in the `profile_info` table. Note this must be called before calling `updateProfileInfo()`.


Get requests:

- `getPhoto(photoId, callback)`: Retrieves the entry in the `photos` table given its id `photoId`. Returns the following object to the callback:
  - If it exists: `{success: true, id: 26, path: 'path/to/photo.png'}`
  - If not: `{success: false}`
- `getPosts(callback)`: Retrieves all entries in the `posts` table. Returns an array of them to the callback.
- `getProfileInfo(callback)`: Retrieves the owner's profile info from the `profile_info` table. Returns to the callback an object whose attributes are the columns of the table.
- `getFollowing(callback)`: Retrieves all entries in the `following` table. Returns an array of them to the callback.

The DAL also defines three other functions: one that creates the database and the table shown above (for initialization); one that closes the connection to the database; and one that clears the database (helpful when writing tests).

- `createDatabase(callback)`: Creates the directory's database and the table shown above. Calls the callback when done.
- `closeConnection([callback])`: Closes the DAL's current connection to the database. You should call this before any code that uses the DAL terminates; otherwise, it will hang at the end. You can still continue to make queries after calling this, though; a new connection will be made for the next query. `callback` is optional, but if one is present, nothing is passed to it when it is called.
  > Note that you do *not* need to call this in the server, since it does not terminate, and thus can use a persistent connection.
- `clearDatabase(callback)`: Clears the contents of all tables in the database. (Nothing is passed to the callback.)

### Web API

The API is implemented as a set of HTTP request handlers in `routes/api.js`. We have a spec of the API in a [Google doc here](https://docs.google.com/document/d/1wykWWzwd8LasOF8lJKZEpNwXCW-B3se33YUEtK8M2OY).

> This is temporary. We will migrate the specs into these docs at some point in the future when it has been finalized.

### APS

The APS is also implemented as one of our libraries in `lib/aps.js`. Like the API, we wrote the spec of the APS in the same [Google doc](https://docs.google.com/document/d/1wykWWzwd8LasOF8lJKZEpNwXCW-B3se33YUEtK8M2OY), and we will move it to these docs when it is finalized.

### Initialization upon spinning up

There are a collection of scripts in the `initialization/` folder that configure the user-server when it first spins up. The only one we explicitly run is `main.sh`, which in turn runs the other scripts. It takes one arguments: the Blockstack ID of the user-server's owner.

```bash
$ ./main.sh BSID
```


## Directory

This wouldn’t be much of a social network if there’s no interaction between users. Up to this point, all we have is a bunch of users with their own independent, isolated user-servers. But without some other component, there is no way for users to find *each other's* user-servers.

That’s where the directory comes into play; it is just a mapping from a user (by their Blockstack ID) to the IP address of their user-server. This mapping is hosted on a central server that all user-servers know the address of, and it's provided through a simple put/get web API.

The structure of the directory is very similar to the user-server - it also has the three main components *storage*, the *web API*, and an *authentication/permissions system* (APS). But each is much simpler, since there's not as much to store/serve here. Each of these is described in the sections below.

### Codebase structure

The code is located in the `directory/` folder. Within that is the following structure:

```
- initialization/
  - main.sh
  - ...
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
- test.sh
```

In summary: the root directory contains mostly configuration files and some helpful shortcut scripts. Most notably, it contains `server.js`, which configures the server (at a high level) and runs it. `initialization/` contains the scripts that automate the initialization of the directory. `lib/` contains helper libraries that are written by us and used in the other components; `routes/` contains code to handle HTTP requests; and `test/` contains all of our tests.

### Storage

Storage is implemented in a MySQL database. It has one table called `user_servers`, with the following schema:

```
+------+--------+------+
|  id  |  bsid  |  ip  |
+------+--------+------+
```

- `id` is an int that auto-increments
- `bsid` is a string. It holds the user's Blockstack ID (e.g. alice.id)
- `ip` is the URL of the user-server (e.g. https://example.herokuapp.com). Sorry for the name `ip`; it was originally designed as an IP address, but it was changed to a URL and the name `ip` was grandfathered in because other components use this convention. Perhaps we can change this at a later time.

The actual SQL queries used to insert/select entries are abstracted in a data-access layer written in Node. It's located in `lib/dal.js`, and it defines the two main operations we make to the database:

- `get(bsid, callback)`: Gets the IP address corresponding to `bsid` (string user name).
  - Returned to callback: JS object in format `{success: true, ip: "192.168.0.1"}` if there is an entry for that user, or `{success: false}` if not.
- `put(bsid, ip, callback)`: Adds a mapping from `bsid` (string user name) to `ip` (string URL of the user-server), or overwrites the entry for `bsid` if there already is one.
  - Returned to callback: `{success: true}`

It also defines three other functions: one that creates the database and the table shown above (for initialization); one that closes the connection to the database; and one that clears the database (helpful when writing tests).

- `createDatabase(callback)`: Creates the directory's database and the table shown above. Calls the callback when done.
- `closeConnection([callback])`: Closes the DAL's current connection to the database. You should call this before any code that uses the DAL terminates; otherwise, it will hang at the end. You can still continue to make queries after calling this, though; a new connection will be made for the next query. `callback` is optional, but if one is present, nothing is passed to it when it is called.
  > Note that you do *not* need to call this in the server, since it does not terminate, and thus can use a persistent connection.
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
