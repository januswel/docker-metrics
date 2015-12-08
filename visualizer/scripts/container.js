'use strict';

(function () {
    const PORT = 8086;
    const HOSTNAME = location.hostname || '127.0.0.1';
    const INFLUXDB = HOSTNAME + ':' + PORT;
    const DB = 'docker';

    let zeroPadding = function (number, digit) {
        return (Array(digit + 1).join('0') + number).substr(-digit);
    }

    const optionsTemplate = {
        // global options
        animation: true,
        animationSteps: 60,
        animationEasing: 'easeOutQuart',

        showScale: true,
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: 'rgb(0, 0, 0 .1)',
        scaleLineWidth: 1,
        scaleShowLabels: true,
        scaleLabel : '<%=value%>',
        scaleIntegersOnly: true,
        scaleBeginAtZero: false,
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        scaleFontSize: 12,
        scaleFontStyle: 'normal',
        scaleFontColor: '#666',

        responsive: false,
        maintainAspectRatio: true,

        showTooltips: true,
        customTooltips: false,
        tooltipEvents: ['mousemove', 'touchstart', 'touchmove'],
        tooltipFillColor: 'rgba(0, 0, 0, 0.8)',
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipFontSize: 14,
        tooltipFontStyle: 'normal',
        tooltipFontColor: '#fff',
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipTitleFontSize: 14,
        tooltipTitleFontStyle: 'bold',
        tooltipTitleFontColor: '#fff',
        tooltipYPadding: 6,
        tooltipXPadding: 6,
        tooltipCaretSize: 8,
        tooltipCornerRadius: 6,
        tooltipXOffset: 10,
        tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= value %>',
        multiTooltipTemplate: '<%= value %>',

        onAnimationProgress: function () {},
        onAnimationComplete: function () {},

        // line options
        scaleShowGridLines : true,
        scaleGridLineColor : "rgba(0,0,0,.05)",
        scaleGridLineWidth : 1,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: true,

        bezierCurve : false,
        bezierCurveTension : 0.4,

        pointDot : false,
        pointDotRadius : 4,
        pointDotStrokeWidth : 1,
        pointHitDetectionRadius : 20,

        datasetStroke : true,
        datasetStrokeWidth : 2,
        datasetFill : true,

        legendTemplate : '<% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>">&nbsp;&nbsp;</span>&nbsp;<%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%>',
    };

    let convertTimeToLabel = function (times) {
        return times.map(function (item) {
            let time = new Date(item[0]);
            return [
                zeroPadding(time.getHours(), 2),
                zeroPadding(time.getMinutes(), 2),
            ].join(':');
        });
    }

    let convertCountersToIncreases = function (counters) {
        let is_first = true;
        let previous;
        return counters.map(function (item) {
            let current = item[1];
            let result = current - previous;
            previous = current;
            if (is_first) {
                is_first = false;
                return NaN;
            }
            return result;
        }).slice(1);
    };

    const colors = [
        {
            fillColor: 'rgba(220, 220, 220, 0.2)',
            strokeColor: 'rgba(220, 220, 220, 1)',
            pointColor: 'rgba(220, 220, 220, 1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220, 220, 220, 1)',
        },
        {
            fillColor : 'rgba(151, 187, 205, 0.5)',
            strokeColor : 'rgba(151, 187, 205, 1)',
            pointColor : 'rgba(151, 187, 205, 1)',
            pointStrokeColor : '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke : 'rgba(151, 187, 205, 1)',
        },
    ];

    let generateNetworkChartData = function (raws) {
        let result = {
            labels: convertTimeToLabel(raws[0].values).slice(1),
            datasets: [],
        };
        let datasets = result.datasets;
        for (let i = 0, length = raws.length; i < length; ++i) {
            let raw = raws[i]
            console.log(raw);
            let dataset = Object.assign({}, colors[i]);
            dataset.data = convertCountersToIncreases(raw.values);
            dataset.label = raw.name;
            datasets.push(dataset);
        }
        return result;
    };

    // 60sec -> nanosec
    const DENOMINATOR = 60 * 1000 * 1000 * 1000;
    let generateCpuChartData = function (raws) {
        let result = {
            labels: convertTimeToLabel(raws[0].values).slice(1),
            datasets: [],
        };
        let datasets = result.datasets;
        for (let i = 0, length = raws.length; i < length; ++i) {
            let raw = raws[i]
            console.log(raw);
            let dataset = Object.assign({}, colors[i]);
            dataset.data = convertCountersToIncreases(raw.values).map(function (item) {
                return item / DENOMINATOR;
            });
            dataset.label = raw.name;
            datasets.push(dataset);
        }
        return result;
    };

    let generateChartElement = function (id) {
        let li = document.createElement('li');
        li.setAttribute('id', id);
        li.innerHTML = '<canvas class="chart" width="900" height="300"></canvas><ul class="legend"></ul>';
        return li;
    };

    let getContainerId = function () {
        let queryString = location.search.replace(/^\?/, '');
        let result = queryString.match(/id=([^&]+)/);
        return result[1];
    };

    let generateNetworkChart = function (raws, chartsElement) {
        let chartData = generateNetworkChartData(raws);
        console.log(chartData);

        let chartElement = generateChartElement('network');
        chartsElement.appendChild(chartElement);
        let context = chartElement.querySelector('canvas.chart').getContext('2d');
        let options = Object.assign({}, optionsTemplate);
        options.scaleLabel = '<%=value%> bytes';
        let chart = new Chart(context).Line(chartData, options);
        chartElement.querySelector('ul.legend').innerHTML = chart.generateLegend();
    };

    let generateCpuChart = function (raws, chartsElement) {
        let chartData = generateCpuChartData(raws);
        console.log(chartData);

        let chartElement = generateChartElement('cpu');
        chartsElement.appendChild(chartElement);
        let context = chartElement.querySelector('canvas.chart').getContext('2d');
        let options = Object.assign({}, optionsTemplate);
        options.scaleLabel = '<%=value%> %';
        let chart = new Chart(context).Line(chartData, options);
        chartElement.querySelector('ul.legend').innerHTML = chart.generateLegend();
    };

    window.addEventListener('load', function () {
        let influxdbUrl = 'http://' + INFLUXDB + '/query?db=' + DB;
        let chartsElement = document.getElementById('charts');
        let id = getContainerId();

        let networkUrl = influxdbUrl + "&q=SELECT value FROM rx_bytes,tx_bytes WHERE time > now() - 1h AND container = '" + id + "'";
        get(networkUrl).then(function (response) {
            let raws = JSON.parse(response).results[0].series;
            console.log(raws);

            generateNetworkChart(raws, chartsElement);
        }).catch(function (cause) {
            console.log(cause);
        });


        let cpuUrl = influxdbUrl + "&q=SELECT value FROM cpu_total_usage WHERE time > now() - 1h AND container = '" + id + "'";
        get(cpuUrl).then(function (response) {
            let raws = JSON.parse(response).results[0].series;
            console.log(raws);

            generateCpuChart(raws, chartsElement);
        }).catch(function (cause) {
            console.log(cause);
        });

    }, false);
})();
