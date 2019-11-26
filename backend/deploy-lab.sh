#!/bin/bash
eval $(docker-machine env lab)
docker-machine scp ./crawler/myConfig.json lab:/root/
docker-compose --file docker-compose-lab.yml pull
docker-compose --file docker-compose-lab.yml up -d
