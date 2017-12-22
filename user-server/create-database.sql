# create-database.sql
# Author: Pelumi Odimayo
#
# Creates the database for the user-server.

# Photos
CREATE TABLE IF NOT EXISTS photos (
  id int NOT NULL auto_increment,
  path varchar(255),
  PRIMARY KEY (id)
);

# Posts
CREATE TABLE IF NOT EXISTS posts (
  id int NOT NULL auto_increment,
  timestamp timestamp,
  photoId int,
  PRIMARY KEY (id),
  FOREIGN KEY (photoId) REFERENCES photos(id)
);

# Profile info
CREATE TABLE IF NOT EXISTS profile_info (
  id int NOT NULL auto_increment,
  bsid varchar(255),
  displayName varchar(255),
  bio varchar(255),
  profilePhotoId int,
  coverPhotoId int,
  PRIMARY KEY (id),
  FOREIGN KEY (profilePhotoId) REFERENCES photos(id),
  FOREIGN KEY (coverPhotoId) REFERENCES photos(id)
);

# Followers
CREATE TABLE IF NOT EXISTS followers (
  id int NOT NULL auto_increment,
  bsid varchar(255),
  PRIMARY KEY (id)
);

# Following
CREATE TABLE IF NOT EXISTS following (
  id int NOT NULL auto_increment,
  bsid varchar(255),
  PRIMARY KEY (id)
);
