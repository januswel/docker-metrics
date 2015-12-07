docker-metrics
==============

collect and visualize docker metrics

setup
-----

### InfluxDB

scripts in this repository use InfluxDB as backend.

you can set up database in another way, but the directory "influxdb" has some scripts and settings to run InfluxDB container.

```sh
cd influxdb
# if your env available docker-compose
docker-compose up -d
# otherwise
# some env need "sudo"
./influxdb.sh
```

create a database named "docker".

```sh
# some env need "sudo"
docker exec influxdb "influx -execute 'CREATE DATABASE docker'"
```

### collector

directory "collector" has a docker metrics collector script and its sample files for settings.

- collector.rb
    - metrics collector
- influxdb.yml.sample
    - sample file to specify InfluxDB settings
- inventory.yml.sample
    - sample file to specify target machines

for your env, copy sample files and edit them.

```sh
cd collector
cp influxdb.yml.sample influxdb.yml
cp inventory.yml.sample inventory.yml
```

collector.rb needs "clockwork" gem.

https://github.com/tomykaira/clockwork

```sh
gem install clockwork
```

then, run a collector.

```sh
nohup clockwork collector.rb &
```

to stop collector, use the "kill" command

```sh
ps aux | grep collector.rb | grep -v grep
kill <pid>
```

### visualizer

the "visualizer" directory has htmls, javascripts and csses to show metrics charts.

host these directories and files in the hostname or the IP address of same of your InfluxDB.

### web

you can use docker container to host "visualizer".

```sh
cd web
# if your env available docker-compose
docker-compose up -d
# otherwise
# some env need "sudo"
./web.sh
```

make a symbolic link to "visualizer".

```sh
ln -s ../visualizer ./contents
```

now, setup has all done.
you can see charts in your machine's address with your web browser.


demo
----

http://52.193.71.92/
