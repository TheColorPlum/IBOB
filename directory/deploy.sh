#!/bin/bash
# main.sh
# Author: Oluwapelumi Odimayo
#
# The deployment script for the user directory. Automated deployment of the user server directory and it's database.
# See Backend docs for details.

# Check usage
if [ $# -ne 0 ]; then
  echo "Usage: ./deploy.sh"
  exit
fi

#-------------------------------------------------------------------------------

# Create a new heroku app
heroku create user-server-directory
export heroku_app=user-server-directory

# Create/configure database
heroku addons:create cleardb:ignite --app $heroku_app

export database_url=$(heroku config --app $heroku_app | grep CLEARDB_DATABASE_URL | awk '{print $2}')

# Get billing account ID
export billing_account=$(gcloud alpha billing accounts list | sed -n 2p | awk '{print $1}')

# Create a project
export project=the-feed-directory-12871

gcloud projects create $project --set-as-default

# Enable billing for this project
gcloud alpha billing projects link $project --billing-account=$billing_account

# Create the app.yaml file
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
  cp the-feed-deployment/directory/app.yaml ../app.yaml

  cd ..
  rm -rf $tmp_dir
  echo "Done pulling app.yaml"
  echo
fi

echo "  CLEARDB_DATABASE_URL: '$database_url'" >> app.yaml

# Create the app
gcloud app create --quiet --region us-east4

# Deploy!
gcloud app deploy --quiet

#Test
curl https://$project.appspot.com/api/get/sample.id