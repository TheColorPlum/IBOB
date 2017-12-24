# create-database.sql
# Author: Michael Friedman
#
# Creates the single database table for the user-server directory.

# Table for storing user servers IP addresses
# |  id  |  bsid  |  ip  |
#
# When *inserting* into this table, you can insert an IP address from
# decimal notation as follows:
#   INSERT INTO user_servers (bsid, ip) VALUES ("alice.id", INET_ATON("192.168.0.12"))
#
# Likewise, when *selecting* from this table, you can convert from the
# integer back to the decimal notation in the select statement:
#   SELECT bsid, INET_NTOA(ip) FROM user_servers WHERE bsid = "alice.id";
# This will return something like:
#   | bsid      |  INET_NTOA(ip)  |
#   +-----------+-----------------+
#   | alice.id  |  192.168.0.12   |
CREATE TABLE IF NOT EXISTS user_servers (
  id int NOT NULL auto_increment,
  bsid varchar(255),
  ip int unsigned,
  PRIMARY KEY (id)
);
