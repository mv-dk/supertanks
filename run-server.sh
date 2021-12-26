#!/usr/bin/env bash 

sudo docker run --rm -d -p 8080:80 -v $(pwd)/src:/usr/share/nginx/html:ro --name nginx nginx:stable-alpine

