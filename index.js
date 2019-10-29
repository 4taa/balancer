const express = require('express');
const morgan = require('morgan');
const optimist = require('optimist');
const apiMetrics = require('prometheus-api-metrics');

const client = require('prom-client');

const registry = new client.Registry();

const requestM = new client.Counter({
    name: 'request',
    help: 'kek',
    labelNames: ['req_200', 'req_500'],
});

registry.registerMetric(requestM);

const args = optimist
    .alias('h', 'help')
    .alias('h', '?')
    .options('p', {
        describe: 'Main server port'
    })
    .options('m', {
        describe: 'Metrics server port'
    })
    .argv;

const appServer = express();
const appMetric = express();
appServer.use(morgan('dev'));
appMetric.use(morgan('dev'));
appMetric.use(apiMetrics());

let serverStatus = true;

appServer.get('/api/check', (req, res) => {
    requestM.inc(serverStatus ? {'req_200': '/api/check'} : {'req_500': '/api/check'}, 1);
    res.sendStatus(serverStatus ? 200 : 500);
});

appServer.post('/api/off', (req, res) => {
    if (serverStatus) {
        requestM.inc({'req_200': '/api/off'}, 1);
        serverStatus = false;
        res.sendStatus(200);
        return;
    }
    requestM.inc({'req_500': '/api/off'}, 1);
    res.sendStatus(500);
});

appServer.post('/api/on', (req, res) => {
    const ok = true;
    if (!serverStatus) {
        requestM.inc({'req_200': '/api/on'}, 1);
        serverStatus = true;
        res.sendStatus(200);

        setTimeout(() => {
            if (ok) {
                requestM.reset();
            }
        }, 5000);
        return;
    }
    requestM.inc({'req_500': '/api/on'}, 1);
    res.sendStatus(500);
});

appServer.get('/api/data', (req, res) => {
    if (serverStatus) {
        setTimeout(() => {
            const data = {
                string: 'Request paused for 10 seconds',
                timstamp: Date.now(),
            }
            requestM.inc({'req_200': '/api/data'}, 1);
            res.send(JSON.stringify(data));
        }, 200);
        return;
    }
    requestM.inc({'req_500': '/api/data'}, 1);
    res.sendStatus(500);
});

console.log(`Server for slow requests started on ${args.p || 80} port`);
appServer.listen(args.port || 80);


console.log(`Server for metrics started on ${args.m || 8080} port`);
appMetric.listen(args.metric || 8080);