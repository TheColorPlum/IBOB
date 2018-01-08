#!/bin/bash
# addPosts.sh
# Author: Michael Friedman
#
# Adds a specified number of posts, named in order 1.jpeg, 2.jpeg, etc.
#
# To avoid going over the maximum number of simultaneous connections to
# the database, we don't just make some number of posts in addPost.js.
# Instead, we contain the procedure for making one post, so the connection
# terminates when that script has finished. Then we rerun the script.

# Check usage
if [ $# -ne 1 ]; then
  echo "Usage: ./addPosts.sh NUM"
  exit
fi

num_posts=$1

#-------------------------------------------------------------------------------

# Add posts
for i in $(seq $num_posts); do
  filename=$i.jpeg
  node addPost.js $filename
done
