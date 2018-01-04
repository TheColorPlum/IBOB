# The Blockstack Docker Environment

The guys at Blockstack offer a simulated Blockstack network for developers, so that they don't need to use the real one when developing apps. It's implemented as a Docker container. This page describes how to install and use it for our purposes.

## Installation

Go into our `setup-scripts/` directory, and copy `setup-blockstack.sh` into a new directory of your choosing - just make sure it's **outside this repository**. Then run it:

```bash
$ ./setup-blockstack.sh
```

This will download the [Blockstack Todo App tutorial](https://github.com/blockstack/blockstack-todos), which includes the Docker environment, and launch the simulated Blockstack network. *This will probably take a while to run*, since it needs to download a lot of stuff.

## Creating a Blockstack ID for a user Alice

> Unfortunately, this part must be done manually - we could not automate it :(

First, make sure the Docker container is running:

- Change into the directory where you stored the Blockstack Todo App from the last section.
- Run:
  ```bash
  $ docker-compose up -d
  ```

Now, start by creating a (nameless) account:

- Open a browser to [http://localhost:8888](http://localhost:8888).
- This will prompt you to set up a Blockstack account. Walk through the steps: use "password" as your password (we know this is a terrible password, but it's only used in the local, simulated Blockstack network, so it's ok), make sure to copy the *identity key* somewhere, use the default storage provider, and when it comes up, you can skip entering an email.

Next, you need to transfer (fake) money into this account so you can buy an ID name:

- In the same browser window, go to your wallet tab and copy your wallet address at the bottom (e.g. something like `19WWRiJwkEcqX7HsWUSDFfi8zpTRoMMfx1`).
- Open a new tab in your browser to [http://localhost:8888/wallet/send-core](http://localhost:8888/wallet/send-core).
- Enter your address into the "To" box, and enter `blockstack_integration_test_api_password` into the "Password" box. Then click "Send".
- Once the money is transferred, you can close this tab.

Finally, you can buy an ID for Alice:

- Go to the profile (person silhouette) tab -> "More".
- Click "Add username"
- Enter "alice"
- Enter your password when prompted

**Note**: The Docker environment will not retain this information when you turn off your computer, so whenever you reboot, you will have to remove your account and recreate it:

- Open your browser to [http://localhost:8888](http://localhost:8888).
- Navigate to the settings (cogwheel) tab.
- Click "Remove Account".
- Repeat this entire process from the beginning to recreate the account - sorry! :(
