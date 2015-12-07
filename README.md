docker-metrics
==============

collect and visualize docker metrics

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
