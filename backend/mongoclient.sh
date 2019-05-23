#!/bin/bash
cd backup
BACKUPPATH=$(pwd)
cd ..
docker run -it --rm --network="backend_main" -v $BACKUPPATH:/backup mongo:3.6 bash