# Deployment

All components (app, user-server, directory) are deployed as Google App Engine instances. You'll need to have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/) (command-line tools) installed for this. You can refer to GAE's ["Hello World" app tutorial](https://cloud.google.com/nodejs/getting-started/hello-world) and [Complex app tutorial](https://cloud.google.com/nodejs/getting-started/hello-world) for more depth.

## Automated deployment

**Currently, this is not implemented.** Each component of the app will eventually have its own automated deployment script. Several of these are actually written on other branches, but they have not been merged and/or may be outdated.

We have instructions for manual deployment written in [this Google doc](https://docs.google.com/document/d/1HEz8ke7DDHz3HShVo8a9Hojq1TtEkDl_qS5K6n7w0hc/edit).

## Environment variables

Each component of the project also requires that we set several environment variables. These define the values for various constants used throughout the code. In production, these constants take their values from the environment variables, while in development, some of them do, and others are hard-coded in the source code.

It is better to set these with environment variables in production, as opposed to hard-coding them into the source code because (1) this makes it easier to change their values on the fly without having to change/commit/push the code; and (2) many of the variables contain sensitive information that we should keep private (e.g. private keys), and thus cannot put in the source code.

So environment variables that need to be set for each component of the project are specified below:

### App

Environment variables for the app are processed in `lib/projectMode.js`, `lib/serverConstants.js`, `lib/generateBrowserConstants.js`, and `lib/generateManifest.js`.

Main variable:

- `PROJECT_MODE`: "development" or "production". Indicates to the server whether we're in the production server or not, and thus which values to use for the rest of the constants.

Variables for the server:

- `PORT`: The port number the server will run on.
- `DIRECTORY_BASE_URL`: The base URL of the directory when it's deployed.
- `DEBUG_FLAG`: A boolean value to indicate whether to enable debugging logs.

Variables for the browser application:

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

### Directory

The environment variables for the directory are processed in `lib/constants.js`. This file is imported by all other files that use these shared constants.

Main variable:

- `PROJECT_MODE`: "development" or "production". Indicates to the server whether we're in production or not, and thus which values to use for the rest of the constants.

Variables for the server:

- `PORT`: The port number that the server runs on.

Variables about the admin (i.e. us):

- `ADMIN_BSID`: Admin's Blockstack ID.
- `ADMIN_PRIVATE_KEY`: Admin's private key (the one corresponding to the public key in our Blockstack zonefile).

URLs:

- `BLOCKSTACK_BASE_URL`: The base URL of the Blockstack API.
- `BLOCKSTACK_ZONEFILE_REGEX`: A regular expression that represents the format of Blockstack zonefile URLs.
- `SERVER_BASE_URL`: The base URL (IP address or domain name) of this server.

Variables for the database:

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

Misc. variables:

- `DEBUG_FLAG`: A boolean indicating whether or not to enable debugging logs.


### User-server

The environment variables for the user-server are processed in `lib/constants.js`. This file is imported by all other files that use these shared constants.

Main variable:

- `PROJECT_MODE`: "development" or "production". Indicates to the server whether we're in production or not, and thus which values to use for the rest of the constants.

Variables for the server:

- `PORT`: The port number that the server runs on.

Constant URLs:

- `BLOCKSTACK_BASE_URL`: The base URL for the Blockstack API.
- `SERVER_BASE_URL`: The base URL for this user-server.

Constants for the database:

- `CLEARDB_DATABASE_URL`: In production, the user-servers use ClearDB as the host for the MySQL database. This is the URL of the ClearDB database to connect to.
- `BSID`: The Blockstack ID of the user who owns this user-server.

Misc:

- `BLOCKSTACK_ZONEFILE_REGEX`: A regular expression that represents the format of Blockstack zonefile URLs.
- `DEBUG_FLAG`: "true" or "false". Indicates whether to print debug logs from the code.


## Admin scripts

This isn't directly related to deployment itself, but this is useful for testing the deployed instances.

We have a set of scripts for administrators/maintainers of the project, to help automate common tasks/requests made to the servers (e.g. adding an entry to the directory). They are located in the `admin-scripts/` folder. If the script makes changes to the servers, you must pass the admin *Blockstack ID* and *private key* - so not just anyone can run them.

- putDirectoryEntry.js: Adds a (bsid, ip) entry to the directory. Usage:
  ```bash
  $ node putDirectoryEntry.js BSID IP ADMIN-BSID ADMIN-SK
  ```
