#!/bin/bash
cd backup
BACKUPPATH=$(pwd)
cd ..
docker run --rm --network="backend_default" -v $BACKUPPATH:/backup mongo:3.6 \
bash -c 'mongodump --gzip --archive=/backup/wePubAnal.tar.gz --host mongo:27017'
# without gzip
# bash -c 'mongodump --out /backup --host mongo:27017'
