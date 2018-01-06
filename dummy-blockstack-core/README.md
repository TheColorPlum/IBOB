# Dummy Blockstack Core

Our project depends on the Blockstack Core API. We have a local, development version of it, but we are having trouble configuring it properly so we can use it (in particular, we cannot find a user's public/private key pair). Until we get this working, we have set up this directory with a *super* simple server that mimics one of Blockstack's API calls, and serves dummy zonefiles for users.

So this server has the following API:

- `GET /v1/names/<blockstack-id>`: Mimics Blockstack's corresponding API call. Returns profile info for the user with the provided `blockstack-id`, in the same format as Blockstack.
- `GET /zonefile/<blockstack-id>`: Returns a dummy zonefile for the user with the provided `blockstack.id`. The zonefile has the same format as those returned by Blockstack.

Each of these requests are only valid for *four* names used in testing: alice.id, bob.id, mallory.id, and admin.id.
