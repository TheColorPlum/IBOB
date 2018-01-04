#!/bin/bash
# main.sh
# Author: Michael Friedman
#
# The "main" script to run. Automated initialization of the user-server.
# See Backend docs for details.

# Check usage
if [ $# -ne 3 ]; then
  echo "Usage: ./main.sh BSID PRIVATE-KEY IP"
  exit
fi

bsid=$1
private_key=$2
ip=$3

#-------------------------------------------------------------------------------

# Create the database
node createDatabase.js


# Set the owner to bsid
node setOwner.js $bsid


# Store the private key in the database
node storePrivateKey.js $private_key


# Register this user-server with the directory
node registerWithDirectory.js $ip


# Start the server in background
cd ..
node server.js &
echo "Server running as process $!"
