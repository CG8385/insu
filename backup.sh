#!/bin/bash
 
MONGO_DATABASE="insu"
APP_NAME="insu"

MONGO_HOST="127.0.0.1"
MONGO_PORT="27017"
TIMESTAMP=`date +%F-%H%M`
MONGODUMP_PATH="/usr/bin/mongodump"
BACKUPS_DIR="/home/www/backups/$APP_NAME"
BASE_DIR="/home/www"
BACKUP_NAME="$APP_NAME-$TIMESTAMP"
ARCHIVE_PATH="$BACKUPS_DIR/$BACKUP_NAME.gz"
PYTHON=$(which python)

uploadToOSS()
{
    $PYTHON $BASE_DIR/oss.upload.py LTAIAeRG47QcIkh0 ao9TlY0TJaKPzsnWy39j9E5RXBTXMt oss-cn-hangzhou-internal.aliyuncs.com insubackup $1
}
 
$MONGODUMP_PATH --db $MONGO_DATABASE
 
mkdir -p $BACKUPS_DIR
mv dump $BACKUP_NAME
tar -zcvf $BACKUPS_DIR/$BACKUP_NAME.tgz $BACKUP_NAME
uploadToOSS $BACKUPS_DIR/$BACKUP_NAME.tgz

rm -rf $BACKUP_NAME