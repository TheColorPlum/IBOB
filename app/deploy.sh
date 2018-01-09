#!/bin/bash
# Author: Michael Friedman
#
# Automated deploy script.

project=the-feed-web-app
url=https://$project.appspot.com

# Check whether we need to pull app.yaml
echo "Checking for app.yaml..."
if [ ! -f app.yaml ]; then
  # Pull app.yaml file from our git repo for deployment
  echo "Don't have app.yaml. Pulling it from GitHub..."
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
fi

# Deploy
echo "Deploying..."
sleep 2
gcloud config set project $project
gcloud app deploy --quiet
echo "Done deploying!"
echo

echo "App is available at $url"