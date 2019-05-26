#!/bin/bash
eval $(docker-machine env aliyun)
docker-machine scp -r ./conf/* aliyun:/root/letsencrypt/
docker-compose --file docker-compose-deploy.yml up -d
