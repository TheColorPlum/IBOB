# How to set up Blockstack development environment

> We no longer use the Blockstack development environment in this project. However, we put a lot of effort into figuring out how to make it work, so we are keeping this writeup here for now. Also we may end up using it in the future if we can get it to work, so we don't want to lose this writeup.

Before you can set up our project, you will first need to set up Blockstack on your machine. The easiest way to do this is to download Blockstack's Docker containers, which create a mini Blockstack network that runs locally.

1. Copy `setup-blockstack.sh` into a new directory of your choosing - just make sure it's *outside this repository*. Then run it:

  ```bash
  $ ./setup-blockstack.sh
  ```

  This will download the [Blockstack Todo App tutorial](https://github.com/blockstack/blockstack-todos), which includes the Docker containers, and launch the mini Blockstack network. *This will probably take a while to run*, since it needs to download a lot of stuff.

2. *Unfortunately, this part must be done manually - we could not automate it :(*.

  When the script is done, you will need to do a bit more configuration. First, set up a Blockstack account:

    - Open a browser to [localhost:8888](localhost:8888).
    - This will prompt you to set up a Blockstack account. Walk through the steps: use "password" as your password (it's only used on your local machine so it doesn't matter that this is a terrible password), make sure to copy the *identity key* somewhere, and when it comes up, you can skip entering an email.

  Next, you need to transfer (fake) money into this account so you can create an ID:

    - Go to the wallet tab and copy the address at the bottom (e.g. something like `19WWRiJwkEcqX7HsWUSDFfi8zpTRoMMfx1`).
    - Open a new tab in your browser to [localhost:8888/wallet/send-core](localhost:8888/wallet/send-core).
    - Enter your address into the "To" box, and enter `blockstack_integration_test_api_password` into the "Password" box. Then click "Send".
    - Once the money is transferred, you can close this tab.

  Finally, you have to create three ID names: alice, bob, and mallory (these are used in our project's tests). In your first tab:

    - Go to the profile (person) tab -> "More".
    - Click "Add username", enter the name, and then enter your password when prompted.
    - Go to the "More" tab again, click "Create New ID"
    - Repeat for the rest of the names.

  The Docker system will not retain this information when you turn off your computer, so whenever you reboot, you will have to remove your account and recreate it:

    - Open your browser to [localhost:8888](localhost:8888).
    - Navigate to the settings (cogwheel) tab.
    - Click "Remove Account".
    - Repeat this entire process (sad) from the beginning to recreate the account.
