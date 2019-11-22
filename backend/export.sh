#!/bin/bash
cd backup
# BACKUPPATH=$(pwd)
BACKUPPATH='/root/backup'
cd ..
collections=(
  categories
  comments
  perdoc
  perpub
  posts
  profilepubrecords
  profiles
  pubposts
  sim
)
for col in "${collections[@]}"; do
    echo "exporting $col..."
    docker run --rm --network="backend_main" -v $BACKUPPATH:/backup mongo:3.6 \
    bash -c "mongoexport --db wechat_spider --collection $col --host mongo:27017 --out /backup/$col.json"
done
