#!/bin/bash
# main.sh
# Author: Michael Friedman
#
# The "main" script to run. Automated initialization of the user-server.
# See Backend docs for details.

# Check usage
if [ $# -ne 1 ]; then
  echo "Usage: ./main.sh BSID"
  exit
fi

bsid=$1

#-------------------------------------------------------------------------------

# Create the database
node createDatabase.js


# Set the owner to bsid
node setOwner.js $bsid


echo "Done! User-server is set up for $bsid. You can start the server now."
