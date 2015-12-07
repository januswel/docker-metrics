docker-metrics
==============

collect and visualize docker metrics

InfluxDB
--------

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

collector
---------

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
clockwork collector.rb
```
