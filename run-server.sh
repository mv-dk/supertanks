#!/usr/bin/env bash 

sudo docker run --rm -d -p 8080:80 -v $(pwd)/dist:/usr/share/nginx/html:ro --name supertanks nginx:stable-alpine

