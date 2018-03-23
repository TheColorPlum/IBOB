# Project Setup

## Prerequisites

This requires that you have [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/get-npm), [MySQL Server](https://www.mysql.com/downloads/), and [Docker/docker-compose](https://docs.docker.com/) installed. Before proceeding, make sure to have those installed.


## How to set up the project

We have scripts that automate some of this setup (at least, the parts that *can* be automated) in the `setup-scripts/` directory. Any scripts we mention in the following sections can be found in there.


### Blockstack

The project depends on the Blockstack Core API to get information about Blockstack users. While this project is in development, we are not using the real Blockstack API, and instead we created a simple server that mimics the API calls that our project needs.

Whenever you go to work on the project, make sure to start the "Dummy Blockstack Core" server *before running anything else*. It's located in `dummy-blockstack-core/`:

```bash
$ cd dummy-blockstack-core
$ npm run devstart
```

However, the browser application still requires Blockstack so users can log in. You can get a simulated version of Blockstack running by setting up the Blockstack Docker environment. See [this page](blockstack.md) for details on that.

### Our project

**Project mode environment variable.** First, you need to set the environment variable `PROJECT_MODE` in your terminal. Set this to `development` when working on the project locally:

```bash
$ export PROJECT_MODE="development"
```

*You need to set this variable every time you go to work on the project (every terminal session).*

More details on the purpose of this variable are in the [Deployment](deployment.md) page. But for now, what you need to know is that the servers will *not* run unless this variable is set.

**Automated setup.** Most of the rest of our project setup is automated in a script. But before you can run it, you first need to add a MySQL user named "root" with the password "TuringP_lumRubik$9" (sorry, it's an odd password).

Now, change into the `setup-scripts/` directory and run the `setup-project.sh` script:

```bash
$ cd setup-scripts
$ ./setup-project.sh
```

This will install the npm dependencies required for the project, set up the database, and run our tests to ensure that everything is working.

**You should be all set!** See the [Frontend](frontend.md) and [Backend](backend.md) sections for details on how the project is built and how to work on it.
