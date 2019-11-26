#!/bin/bash
cd backup
# BACKUPPATH=$(pwd)
# remote: 
BACKUPPATH='/root/backup'
cd ..
docker run -it --rm --network="backend_main" -v $BACKUPPATH:/backup mongo:3.6 bash
