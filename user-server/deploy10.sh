#!/bin/bash
# deploy10.sh
# Author: Oluwapelumi Odimayo and Michael Friedman
#
# Automated deployment of 10 user-server instance and their database, given its ID number.
# See Backend docs for details.

# Check usage
if [ $# -ne 1 ]; then
  echo "Usage: ./deploy10.sh START-NUM"
  exit 1
fi

# Deploy 10
counter=$1
max=$(($counter+9))
while [ $counter -le $max ]
do
    ./deploy.sh $counter
    ((counter++))
done

echo All done
