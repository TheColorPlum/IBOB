#!/bin/bash
# setup-project.sh
# Author: Michael Friedman
#
# Automated setup script for installing dependencies and doing other
# setup for the project.

# Check usage
if [ $# -ne 0 ]; then
  echo "Usage: ./setup-project.sh"
fi

#------------------------------------------------------------------------------

# Install npm dependencies for app
cd ../app
npm install

# Install npm dependencies for user-server
cd ../user-server
npm install


# Run tests for app
echo "Running app tests..."
cd ../app
./test.sh
echo "Done with app tests"
echo

# Run tests for user-server
echo "Running user-server tests..."
cd ../user-server
./test.sh
echo "Done with user-server tests"
echo

echo "Done!"
