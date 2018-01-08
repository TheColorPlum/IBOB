# create-database.sql
# Author: Michael Friedman
#
# Creates the single database table for the user-server directory.

# Table for storing user servers' URLs
# |  id  |  bsid  |  ip  |
CREATE TABLE IF NOT EXISTS user_servers (
  id int NOT NULL auto_increment,
  bsid varchar(255),
  ip varchar(255),
  PRIMARY KEY (id)
);
