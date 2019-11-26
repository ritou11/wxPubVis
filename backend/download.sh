#!/bin/bash
# remote: 
BACKUPPATH='/root/backup'
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
    echo "downloading $col..."
    scp root@wxpub-api.nogeek.top:$BACKUPPATH/$col.json backup/remote/
done
