# Project Setup

## Prerequisites

This requires that you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/get-npm). Before proceeding, make sure to have both installed.

## Quick Start

The project is divided into two components - the app and the user-server. These are written as separate Node apps, so to set up your development environment, you will need to install the npm dependencies for both. From the root of the project, run:

```bash
$ cd app
$ npm install
$ cd ../user-server
$ npm install
```

You should be all set! You can verify that it works by running the `start` scripts in each component. For the app (again, from the root):

```bash
$ cd app
$ ./start
```

or for the user-server:

```bash
$ cd user-server
$ ./start
```
