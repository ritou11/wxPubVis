#!/bin/bash
collections=(
  posts
  profiles
  perpub
  perdoc
  pubposts
)

for col in "${collections[@]}"; do
  head "$col.json" > "head/$col.head.json"
done
