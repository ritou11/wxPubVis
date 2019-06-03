#!/bin/bash
eval $(docker-machine env aliyun)
docker-machine scp -r ./conf/* aliyun:/root/letsencrypt/
docker-machine scp ./crawler/myConfig.json aliyun:/root/
docker-compose --file docker-compose-deploy.yml pull
docker-compose --file docker-compose-deploy.yml up -d
