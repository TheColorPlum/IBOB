#!/bin/bash
# deploy10.sh
# Author: Oluwapelumi Odimayo and Michael Friedman
#
# Automated deployment of 10 user-server instance and their database, given its ID number.
# See Backend docs for details.

counter=11
while [ $counter -le 20 ]
do
    ./deploy.sh $counter
    ((counter++))
done

echo All done