'use strict';

(function () {
    const PORT = 8086;
    const HOSTNAME = location.hostname || '127.0.0.1';
    const INFLUXDB = HOSTNAME + ':' + PORT;
    const DB = 'docker';

    let flatten = function (array) {
        return Array.prototype.concat.apply([], array);
    };

    let generateLinkElement = function (id) {
        let li = document.createElement('li');
        li.setAttribute('id', id);
        li.innerHTML = '<a href="container.html?id=' + id + '">' + id + '</a>';
        return li;
    };

    window.addEventListener('load', function () {
        let influxdbUrl = 'http://' + INFLUXDB + '/query?db=' + DB;
        let containersUrl = influxdbUrl + '&q=SHOW TAG VALUES FROM rx_bytes WITH KEY = container';

        let containersElement = document.getElementById('containers');

        get(containersUrl).then(function (response) {
            let containers = flatten(JSON.parse(response).results[0].series[0].values).sort();

            for (let i = 0, length = containers.length; i < length; ++i) {
                let id = containers[i];
                let linkElement = generateLinkElement(id);
                containersElement.appendChild(linkElement);
            }
        });
    });
})();
