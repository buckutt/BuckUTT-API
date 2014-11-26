#!/bin/bash

echo "Buckutt - Etu replication"

# Remote config
host='127.0.0.1'
db='pay_etu_server_fake'
user='root'
pwd='toor'

# Local config
lhost='127.0.0.1'
ldb='buckutt_dev'
luser='root'
lpwd='toor'

# Get dump from etu server
# --complete-insert     : insert rows without pay_password field
# --skip-add-drop-table : do not drop the current table (else every pay_password are reset)
# --extended-insert     : multiple inserts to sed them all
echo "Getting dump from etu server"
echo "  mysqldump -h ${host} -u ${user} -p${pwd} ${db} etu_events etu_organizations etu_organizations_members etu_users --complete-insert --skip-add-drop-table --extended-insert=FALSE > drop.sql"
mysqldump -h ${host} -u ${user} -p${pwd} ${db} etu_events etu_organizations etu_organizations_members etu_users --complete-insert --skip-add-drop-table --extended-insert=FALSE > drop.sql
echo "Done."

# CREATE TABLE -> CREATE TABLE IF NOT EXISTS
# Do not throw an error if the table already exists
sed -i 's/CREATE TABLE/CREATE TABLE IF NOT EXISTS/g' drop.sql

# INSERT -> INSERT IGNORE
# Do not override current rows.
sed -i 's/^INSERT/INSERT IGNORE/g' drop.sql

# Import the dump to the database
echo "Importing the dump to the database"
mysql -h ${lhost} -u ${luser} -p${lpwd} ${ldb} < drop.sql
echo "  mysql -h ${lhost} -u ${luser} -p${lpwd} ${ldb} < drop.sql"
echo "Done."

# Create if not exists the missing field (password)
echo "Checking the field password"
pwdField=$(mysql -h ${lhost} -u ${luser} -p${lpwd} -e "select * from information_schema.COLUMNS where TABLE_SCHEMA = '${ldb}' and TABLE_NAME = 'etu_users' and COLUMN_NAME = 'pay_password'")
sizePwd=${#pwdField}

if [ $sizePwd -eq 0 ]; then
  echo "  Pay password field does not exist"
  echo "  Creating password field"
  mysql -h ${lhost} -u ${luser} -p${lpwd} ${ldb} -e "alter table etu_users add pay_password varchar(60);"
  echo "    mysql -h ${lhost} -u ${luser} -p${lpwd} ${ldb} -e \"alter table etu_users add pay_password varchar(60);\""
  echo "  Done."
else
  echo "  Pay password field does exist"
fi
echo "Done."

# For each missing fields, generate the password and send it
echo "Running node script to generate and send missing pay_password(s)"
npm run-script sendpwd
echo "   npm run-script sendpwd"
echo "Done."

echo "Removing sql drop file"
#rm drop.sql
echo "  rm drop.sql"
echo "Done."

echo "Goodbye."
