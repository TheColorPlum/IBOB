# create-database.sql
# Author: Pelumi Odimayo
#
# Creates the database for the user-server.

# Profile info
CREATE TABLE IF NOT EXISTS users_profile_info (
  id int NOT NULL auto_increment,
  bsid varchar(255),
    display_name varchar(255),
    bio varchar(255),
    profile_photo_path varchar(255),
    cover_photo_path varchar(255),
    PRIMARY KEY (ID)
    );

# Followers
CREATE TABLE IF NOT EXISTS followers (
  id int NOT NULL auto_increment,
    bsid varchar(255),
    primary key (id)
);


# Following
CREATE TABLE IF NOT EXISTS following (
  id int NOT NULL auto_increment,
    bsid varchar(255),
    primary key (id)
);

# Posts
CREATE TABLE IF NOT EXISTS posts (
  post_id int not null auto_increment,
    times_tamp timestamp,
    path varchar(255),
    primary key (post_id)
    );
