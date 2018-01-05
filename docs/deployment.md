# Deployment

All components (app, user-server, directory) are deployed as Google App Engine instances. *More details on this coming soon...*.

## Admin scripts

We have a set of scripts for administrators/maintainers of the app, to help automate common tasks/requests made to the servers (e.g. adding an entry to the directory). They are located in the `admin-scripts/` folder. If they make changes to the servers, you must pass the admin *Blockstack ID* and *private key*, so not just anyone can run them.

We document each of the scripts below:

- putDirectoryEntry.js: Adds a (bsid, ip) entry to the directory. Usage:
  ```bash
  $ node putDirectoryEntry.js BSID IP ADMIN-BSID ADMIN-SK
  ```
