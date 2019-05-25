#!/bin/bash
cd backup
BACKUPPATH=$(pwd)
# remote: BACKUPPATH='/root/backup'
cd ..
docker run --rm --network="backend_main" -v $BACKUPPATH:/backup mongo:3.6 \
bash -c 'mongodump --gzip --archive=/backup/wxPubAnal.tar.gz --host mongo:27017'
# without gzip
# bash -c 'mongodump --out /backup --host mongo:27017'
