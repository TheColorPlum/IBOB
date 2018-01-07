# Deployment

All components (app, user-server, directory) are deployed as Google App Engine instances. *More details on this coming soon...*.


## App

### Initialization

The app's initialization process in deployment is the simplest, since it does not even have a database. It only serves static pages. All you should need to do on the production server to get it started is run `npm start`. But you will first need to set the environment variables (see next section).

### Constants and Environment Variables

Constants used throughout the code are defined by *environment variables* on the production server. This is because hard-coding them in would make their values visible in the source code, which is bad for secret values. So we wrote `lib/serverConstants.js`, `lib/generateBrowserConstants.js`, and `lib/generateManifest.js` to import their values from environment variables on the production server.

The constants are defined below. The main one:

- `PROJECT_MODE`: "development" or "production". Indicates to the server whether we're in the production server or not, and thus which values to use for the rest of the constants.

Constants for the server:

- `PORT`: The port number the server will run on.
- `DIRECTORY_BASE_URL`: The base URL of the directory when it's deployed.
- `DEBUG_FLAG`: A boolean value to indicate whether to enable debugging logs.

Constants for the browser application:

- `USER_SERVER_PROTOCOL`: The protocol (http or https) we should use to make requests to user-servers.
- `USER_SERVER_PORT`: The port number that user-servers accept requests on.
- `DIRECTORY_BASE_URL`: (Repeated from the server constants).
- `USER_PRIVATE_KEY_FILE`: The name of the file in the user's Blockstack storage, in which we store the their private key.
- `PRIVATE_KEY_VAR_NAME`: The name of the variable in which we cache the user's private key while they use the app.
- `USER_SERVER_IP_VAR_NAME`: The name of the variable in which we cache the IP address of the user's user-server.

Additionally, `generateBrowserConstants.js` generates a function that's imported into every web page:

- `makeUserServerBaseUrl(ip)`: Constructs the base URL for a user-server, given its IP address string `ip`. Returns the base URL as a string. Use this function when you want to make requests to a user-server once you have its IP address. e.g:
  ```javascript
  var ip = ... // get the IP address
  var url = makeUserServerBaseUrl(ip) + '/api/get-posts?requester=sample.id'
  // Make request for the url...
  ```

Lastly, for the `generateManifest.js` script, define:

- `MANIFEST_START_URL`: The base URL of the app when deployed.

## Directory

We mostly describe the process of deploying the directory in a [Google doc](https://docs.google.com/document/d/1HEz8ke7DDHz3HShVo8a9Hojq1TtEkDl_qS5K6n7w0hc/edit).

Below we also document some additional details.

### Initialization script

> Note: The main.sh currently does not work for deployment. We are working on a new way of scripting the deployment, once we figure out how to do it manually.

The directory's initialization is relatively simple. It needs to create the database/tables and start the server. This is automated by the script `main.sh` in the `initialization/` folder (the other scripts are run by `main.sh`).

### Constants and Environment Variables

Additionally, there are a bunch of constants that are used throughout the code. They'are all defined in `lib/constants.js`. However, while they can be set in the code itself while in development, we *cannot* set their values in the code in production, since some of their values are sensitive and shouldn't be recorded in the source code.

In production, the values of these constants are instead read from the server's *environment variables*. We need to manually set each of these environment variables on the production server.

The constants are defined below. The main one:

- `PROJECT_MODE`: "development" or "production". Indicates to the server whether we're in production or not, and thus which values to use for the rest of the constants

Constants for the server:

- `PORT`: The port number that the server runs on. This is set already by Google App Engine, so we don't need to specify it.

Constants about the admin (i.e. us):

- `ADMIN_BSID`: Admin's Blockstack ID.
- `ADMIN_PRIVATE_KEY`: Admin's private key (the one corresponding to the public key in our Blockstack zonefile).

URLs:

- `BLOCKSTACK_BASE_URL`: The base URL of the Blockstack API.
- `BLOCKSTACK_ZONEFILE_REGEX`: A regular expression that represents the format of Blockstack zonefile URLs.
- `SERVER_BASE_URL`: The base URL (IP address or domain name) of this server.

Constants for the database:

- `MYSQL_HOST`: The hostname (e.g. localhost) of the MySQL database.
- `MYSQL_USER`: Our username for logging into the MySQL database.
- `MYSQL_PASSWORD`: Our password for logging into the MySQL database.

IDs and private keys of names used for tests:

- `ALICE_BSID`: Blockstack ID of test user 1 ("Alice")
- `BOB_BSID`: Blockstack ID of test user 2 ("Bob")
- `MALLORY_BSID`: Blockstack ID of test user 3 ("Mallory")
- `ALICE_PRIVATE_KEY`: Private key of test user 1 (the one corresponding to the public key in her zonefile)
- `BOB_PRIVATE_KEY`: Private key of test user 2 (the one corresponding to the public key in his zonefile)
- `MALLORY_PRIVATE_KEY`: Private key of test user 3 (the one corresponding to the public key in her zonefile)

Misc. constants:

- `DEBUG_FLAG`: A boolean indicating whether or not to enable debugging logs.


## Admin scripts

We have a set of scripts for administrators/maintainers of the app, to help automate common tasks/requests made to the servers (e.g. adding an entry to the directory). They are located in the `admin-scripts/` folder. If they make changes to the servers, you must pass the admin *Blockstack ID* and *private key*, so not just anyone can run them.

We document each of the scripts below:

- putDirectoryEntry.js: Adds a (bsid, ip) entry to the directory. Usage:
  ```bash
  $ node putDirectoryEntry.js BSID IP ADMIN-BSID ADMIN-SK
  ```
