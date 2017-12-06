#!/bin/bash
# setup-blockstack.sh
# Author: Michael Friedman
#
# Automated setup script for downloading and installing the Blockstack
# Docker development environment.

# Check usage
if [ $# -ne 0 ]; then
  echo "Usage: ./setup-blockstack.sh"
fi

#------------------------------------------------------------------------------

# Clone the Blockstack Todo App tutorial
echo "Downloading Blockstack Todo App tutorial..."
git clone https://github.com/blockstack/blockstack-todos.git && cd blockstack-todos

# Start up the docker development environment
echo "Starting docker containers..."
docker-compose up -d

echo "Done!"
