const express = require('express');
const morgan = require('morgan');
const optimist = require('optimist');
const apiMetrics = require('prometheus-api-metrics');

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
        serverStatus = false;
        res.sendStatus(200);
        return;
    }
    res.sendStatus(500);
});

appServer.post('/api/on', (req, res) => {
    if (!serverStatus) {
        serverStatus = true;
        res.sendStatus(200);
        return;
    }
    res.sendStatus(500);
});

appServer.get('/api/data', (req, res) => {
    if (serverStatus) {
        setTimeout(() => {
            const data = {
                string: 'Request paused for 10 seconds',
                timstamp: Date.now(),
            }
            res.send(JSON.stringify(data));
        }, 10000);
        return;
    }
    res.sendStatus(500);
});

console.log(`Server for slow requests started on ${args.p || 4000} port`);
appServer.listen(args.port || 4000);

// appMetric.get('/metric', (req, res) => {
//     res.send('kekkekkek');
// })

console.log(`Server for metrics started on ${args.m || 5000} port`);
appMetric.listen(args.metric || 5000);