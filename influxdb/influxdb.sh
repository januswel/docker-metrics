#!/bin/sh

docker run	\
	-d	\
	--name influxdb	\
    -v $(pwd)/influxdb.conf:/etc/influxdb/influxdb.conf	\
	-v /var/lib/influxdb/data	\
	-p 8083:8083	\
	-p 8086:8086	\
	-p 8088:8088	\
	--restart always	\
	januswel/influxdb
