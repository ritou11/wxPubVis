#!/bin/bash
cd backup
BACKUPPATH=$(pwd)
# remote: BACKUPPATH='/root/backup'
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
#! dangerous: will drop before import
for col in "${collections[@]}"; do
    echo "exporting $col..."
    docker run --rm --network="backend_main" -v $BACKUPPATH:/backup mongo:3.6 \
    bash -c "mongoimport --db wechat_spider --collection $col --host mongo:27017 --drop --file /backup/$col.json"
done
