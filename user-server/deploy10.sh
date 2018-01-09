#!/bin/bash
# deploy10.sh
# Author: Oluwapelumi Odimayo and Michael Friedman
#
# Automated deployment of 10 user-server instance and their database, given its ID number.
# See Backend docs for details.

# Check usage
if [ $# -ne 2 ]; then
  echo "Usage: ./deploy10.sh MIN MAX"
  exit 1
fi

# Deploy 10
counter=$1
max=$2
while [ $counter -le $max ]
do
    ./deploy.sh $counter
    ((counter++))
done

echo All done
