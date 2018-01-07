#!/bin/bash
# Author: Michael Friedman
#
# Automated deploy script.

# Pull app.yaml file from our git repo for deployment
echo "Pulling app.yaml..."
sleep 2

tmp_dir=_tmp
mkdir $tmp_dir
cd $tmp_dir

git clone https://github.com/michaeljfriedman/the-feed-deployment.git
cp the-feed-deployment/app/app.yaml ../app.yaml

cd ..
rm -rf $tmp_dir
echo "Done pulling app.yaml"
echo

# Deploy
echo "Deploying..."
sleep 2
gcloud app deploy
echo "Done deploying"
