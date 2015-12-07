#!/bin/sh
docker run	\
	-d	\
	--name web	\
    -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro	\
    -v $(pwd)/contents:/usr/share/nginx/html:ro	\
	-p 80:80	\
	--restart always	\
	nginx:latest
