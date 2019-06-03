#!/bin/bash
cd backup
BACKUPPATH=$(pwd)
# remote: BACKUPPATH='/root/backup'
cd ..
docker run --rm --network="backend_main" -d -v $BACKUPPATH:/backup mongo:3.6 \
bash -c 'mongorestore --drop --gzip --archive=/backup/wxPubVis.tar.gz --host mongo:27017'
# without gzip
# bash -c 'mongorestore /backup --host mongo:27017'
