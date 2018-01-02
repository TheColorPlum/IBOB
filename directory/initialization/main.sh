#!/bin/bash
# main.sh
# Author: Michael Friedman
#
# The "main" script to run. Automated initialization of the directory.
# See Backend docs for details.

# Check usage
if [ $# -ne 0 ]; then
  echo "Usage: ./main.sh"
  exit
fi

#-------------------------------------------------------------------------------

# Create the database
node createDatabase.js

# Start the server in background
cd ..
node server.js &
echo "Server running as process $!"
