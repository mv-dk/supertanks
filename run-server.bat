@echo off

docker run --rm -d -p 8080:80 -v "%cd%\dist":/usr/share/nginx/html:ro --name supertanks nginx:stable-alpine

