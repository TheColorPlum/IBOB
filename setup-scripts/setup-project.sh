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

cd ..

#------------------------------------------------------------------------------

# App

# Install npm dependencies
cd app
npm install

cd ..

#------------------------------------------------------------------------------

# User server

# Install npm dependencies
cd user-server
npm install

# Setup database
echo 'Setting up the user-server database. You will need to enter the MySQL root password.'
mysql The_Feed --user=root --password < create-database.sql

cd ..

#------------------------------------------------------------------------------

# User server directory

# Install dependencies
cd directory
npm install

# Setup database
echo 'Setting up the directory database. You will need to enter the MySQL root password.'
mysql User_Server_Directory --user=root --password < create-database.sql

cd ..

#------------------------------------------------------------------------------

echo "Running tests..."

# User-server
echo "User-server tests..."
cd ../user-server
./test.sh
echo "Done with user-server tests"
echo

# User-server directory
echo "Directory tests..."
cd ../directory
./test.sh
echo "Done with directory tests"

echo "Done!"
