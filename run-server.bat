@echo off

docker run --rm -d -p 8080:80 -v "%cd%\src":/usr/share/nginx/html:ro --name nginx nginx:stable-alpine

