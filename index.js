const express = require('express');
const morgan = require('morgan');
const optimist = require('optimist');
const apiMetrics = require('prometheus-api-metrics');

const client = require('prom-client');

const registry = new client.Registry();

const requestM = new client.Counter({
    name: 'request',
    'help': 'kek'
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
    res.sendStatus(serverStatus ? 200 : 500);
});

appServer.post('/api/off', (req, res) => {
    if (serverStatus) {
        requestM.labels('200', toString(Date.now), '/api/off');
        serverStatus = false;
        res.sendStatus(200);
        return;
    }
    requestM.labels('500', toString(Date.now), '/api/off');
    res.sendStatus(500);
});

appServer.post('/api/on', (req, res) => {
    if (!serverStatus) {
        requestM.labels('200', toString(Date.now), '/api/on');
        serverStatus = true;
        res.sendStatus(200);
        return;
    }
    requestM.labels('500', toString(Date.now), '/api/on');
    res.sendStatus(500);
});

appServer.get('/api/data', (req, res) => {
    if (serverStatus) {
        setTimeout(() => {
            const data = {
                string: 'Request paused for 10 seconds',
                timstamp: Date.now(),
            }
            requestM.labels('200', toString(Date.now), '/api/data');
            res.send(JSON.stringify(data));
        }, 10000);
        return;
    }
    requestM.labels('500', toString(Date.now), '/api/data');
    res.sendStatus(500);
});

console.log(`Server for slow requests started on ${args.p || 80} port`);
appServer.listen(args.port || 80);

// appMetric.get('/metric', (req, res) => {
//     res.send('kekkekkek');
// })

console.log(`Server for metrics started on ${args.m || 8080} port`);
appMetric.listen(args.metric || 8080);