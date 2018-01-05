# Deployment

All components (app, user-server, directory) are deployed as Google App Engine instances. *More details on this coming soon...*.

## Directory

The directory's initialization is relatively simple. It needs to create the database/tables and start the server. This is automated by the script `main.sh` in the `initialization/` folder (the other scripts are run by `main.sh`).


### Constants

Additionally, there are a bunch of constants that are used throughout the code. They'are all defined in `lib/constants.js`. However, while they can be set in the code itself while in development, we *cannot* set their values in the code in production, since some of their values are sensitive and shouldn't be recorded in the source code.

In production, the values of these constants are instead read from the server's *environment variables*. We need to manually set each of these environment variables on the production server.

The constants are defined below. The main one:

- `PROJECT_MODE`: "development" or "production". Indicates to the server whether we're in production or not, and thus which values to use for the rest of the constants

Constants for the server:

- `SERVER_PORT`: The port number that the server runs on.

Constants about the admin (i.e. us):

- `ADMIN_BSID`: Admin's Blockstack ID.
- `ADMIN_PRVIATE_KEY`: Admin's private key (the one corresponding to the public key in our Blockstack zonefile).

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
