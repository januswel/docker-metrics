# usage:
#   gem install clockwork
#   clockwork data-collector.rb

require 'clockwork'
require 'json'
require 'net/https'
require 'uri'
require 'yaml'

class DockerDataCollector
    def initialize(influxdb_path, inventory_path)
        settings = YAML.load_file(influxdb_path)
        @influxdb = 'http://' + settings['hostname'] + ':' + settings['port'].to_s(10)
        @machines = YAML.load_file(inventory_path)
    end

    def make_connection(machine)
        host = machine[0]
        settings = machine[1]
        if !settings.nil? && (settings.has_key?('cert') && settings.has_key?('key'))
            uri = URI.parse('https://' + host + ':2376')
            cert = File.read(settings['cert'])
            key = File.read(settings['key'])
            request = Net::HTTP::Get.new(uri.request_uri)
            https = Net::HTTP.new(uri.host, uri.port)
            https.use_ssl = true
            https.cert = OpenSSL::X509::Certificate.new(cert)
            https.key = OpenSSL::PKey::RSA.new(key)
            https.verify_mode = OpenSSL::SSL::VERIFY_NONE
            return https
        else
            uri = URI.parse('http://' + host + ':2376')
            request = Net::HTTP::Get.new(uri.request_uri)
            http = Net::HTTP.new(uri.host, uri.port)
            return http
        end
    end

    def network_values(stats)
        if stats.has_key?('networks')
            stats['networks'].each do |interface|
                return interface[1]
            end
        else
            return stats['network']
        end
    end

    def collect(machine)
        connection = make_connection(machine)
        connection.start do |h|
            response = h.get('/containers/json');
            for container in JSON.parse(response.body) do
                id = container['Id']

                stats = h.get('/containers/' + id + '/stats?stream=false');
                result = JSON.parse(stats.body)

                values = network_values(result)
                insert(machine[0], id, values)
            end
        end
    end

    def traverse
        for machine in @machines
            collect(machine)
        end
    end

    def post_data(host, container, values)
        result = []
        values.each do |metrics|
            result.push("#{metrics[0]},container=#{container}@#{host} value=#{metrics[1]}")
        end
        return result
    end

    def insert(host, container, values)
        uri = URI.parse(@influxdb)
        http = Net::HTTP.new(uri.host, uri.port)
        request = Net::HTTP::Post.new('/write?db=docker')
        data = post_data(host, container, values)
        request.body = data.join("\n")
        http.request(request)
    end
end

module Clockwork
    handler do |job|
        influxdb_path = 'influxdb.yml'
        inventory_path = 'inventory.yml'
        collector = DockerDataCollector.new(influxdb_path, inventory_path)
        collector.traverse()
    end

    every(1.minute, 'minutely')
end
