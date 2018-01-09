#!/bin/bash
# deploy.sh
# Author: Oluwapelumi Odimayo and Michael Friedman
#
# Automated deployment of a user-server and it's database, given its ID number.
# See Backend docs for details.

# Check usage
if [ $# -ne 1 ]; then
  echo "Usage: ./deploy.sh ID"
  exit
fi

rm -f app.yaml

export user_server_id=$1
export project=the-feed-user-server$user_server_id
export user_server_url=https://$project.appspot.com

# Message
echo "About to deploy a user-server at $user_server_url."
echo "This will take a few minutes so you have 5 seconds to stop"
echo "with Ctrl+C if you don't want to proceed..."
sleep 1

echo "5"
sleep 1
echo "4"
sleep 1
echo "3"
sleep 1
echo "2"
sleep 1
echo "1"
sleep 1
echo "GO!!!"
echo

#-------------------------------------------------------------------------------

# Initialize a database on Heroku

echo "========================================"
echo "   Initializing database on Heroku...   "
echo "========================================"
echo
sleep 2

# Create a new heroku app
export heroku_app=the-feed-user-server$user_server_id
heroku create $heroku_app


# Create/configure database
heroku addons:create cleardb:ignite --app $heroku_app

export database_url=$(heroku config --app $heroku_app | grep CLEARDB_DATABASE_URL | awk '{print $2}')

echo "Done initializing database"
echo

#-------------------------------------------------------------------------------

# Deploy to GAE

echo "========================================"
echo "          Deploying to GAE...           "
echo "========================================"
echo
sleep 2

# Get billing account ID
export billing_account=$(gcloud alpha billing accounts list | sed -n 2p | awk '{print $1}')

# Create the project
echo "Creating the GAE project..."
gcloud projects create $project --set-as-default

# Enable billing for this project
gcloud alpha billing projects link $project --billing-account=$billing_account
echo "Done creating GAE project"
echo

# Download the app.yaml file. Check whether we need to pull it
echo "Checking for app.yaml..."
if [ ! -f app.yaml ]; then
  # Pull app.yaml file from our git repo for deployment
  echo "Don't have app.yaml. Pulling it from GitHub..."

  export tmp_dir=_tmp
  mkdir $tmp_dir
  cd $tmp_dir

  git clone https://github.com/michaeljfriedman/the-feed-deployment.git
  cp the-feed-deployment/directory/app.yaml ../app.yaml

  cd ..
  rm -rf $tmp_dir

  # Add environment variables to app.yaml
  echo "  CLEARDB_DATABASE_URL: '$database_url'" >> app.yaml
  echo "  SERVER_BASE_URL: '$user_server_url'">> app.yaml
  echo "  BSID: '$user_server_id.id'" >> app.yaml

  echo "Done pulling app.yaml"
else
  echo "app.yaml is already present. Using that."
fi
echo

# Create the instance and deploy!
echo "Deploying the GAE instance..."
gcloud app create --quiet --region us-east4
gcloud app deploy --quiet
echo "Done deploying!"
echo

# Test
echo "Run a test. Making a request to the user-server..."
export test_output=_tmp.txt
export expected_output=_exp.txt

curl \
  -X POST \
  -d 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ0aW1lc3RhbXAiOiIyMDE4LTAxLTA4VDE3OjEyOjE4LjMzM1oifQ.8N6X1MMjaxIKl6Gxu9jkQesNaJckcPTffW2_MUQs4WENlNq1_LPz4HjHufPeXG_SKi5GzepF4V-9kDv0eRvKEQ' \
  $user_server_url/api/get-profile-info?requester=muneeb.id \
  > $test_output

echo "Denied: Signature is invalid" > $expected_output

if [ diff $test_output $expected_output ]; then
  echo "TEST FAILED: Expected '$(cat $expected_output) from request, but got $(cat $test_output)"
else
  echo "TEST PASSED!"
fi
echo
rm -f $test_output $expected_output

echo "==============================================="
echo

echo "All done! The user-server is deployed to $user_server_url."
echo "Thanks for your time :)"
