#!/bin/bash
# setup-project.sh
# Author: Michael Friedman
#
# Automated setup script for installing dependencies and doing other
# setup for the project.

# Check usage
if [ $# -ne 0 ]; then
  echo "Usage: ./setup-project.sh"
  exit
fi

cd ..

#------------------------------------------------------------------------------

# App

echo "======================================="
echo "          Setting up app...            "
echo "======================================="

# Install npm dependencies
cd app
npm install

cd ..

echo "Done with app"

#------------------------------------------------------------------------------

# User server

echo "======================================="
echo "       Setting up user-server...       "
echo "======================================="

# Install npm dependencies
cd user-server
npm install

# Setup database
cd initialization
node createDatabase.js

cd ../..

echo "Done with user-server"

#------------------------------------------------------------------------------

# User server directory

echo "=========================================="
echo "    Setting up user-server directory...   "
echo "=========================================="

# Install dependencies
cd directory
npm install

# Setup database
cd initialization
node createDatabase.js

cd ../..

echo "Done with directory"

#------------------------------------------------------------------------------

echo "======================================="
echo "          Running all tests...         "
echo "======================================="

# Start servers
cd user-server
node server.js &
user_server_pid=$!
cd ..

cd directory
node server.js &
directory_pid=$!
cd ..

sleep 3


# User-server tests
echo "User-server tests..."
cd user-server
./test.sh
echo "Done with user-server tests"
echo
cd ..

# User-server directory tests
echo "Directory tests..."
cd directory
./test.sh
echo "Done with directory tests"


# Kill servers
kill $user_server_pid $directory_pid


echo "Done setting up project!"
