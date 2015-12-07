#!/bin/sh
docker run	\
	-d	\
	--name web	\
	-v ./nginx.conf:/etc/nginx/nginx.conf:ro	\
	-v ./contents:/usr/share/nginx/html:ro	\
	-p 80:80	\
	--restart always	\
	nginx:latest
