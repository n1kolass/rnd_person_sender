'use strict';
// TODO: add logger

const http = require('http');
const URL = require('url').URL;
const axios = require('axios');
const server = new http.Server();
const {getChosenOne, forgetAlreadyChosen} = require('./utils');

const config = require('./config.json');
const PORT = config.serverPort;

server.listen(PORT, 'localhost');
console.log(`Server started on port ${PORT}`);

server.on('request', (req, res) => {
    console.log(`Got request: ${req.method} ${req.url}`);
    const urlParsed = new URL(req.url, `http://localhost:${PORT}`);

    console.log(urlParsed);
    if (urlParsed.pathname === '/generate') {
        let isDebugEnabled = urlParsed.searchParams.get('debug') === 'true';
        let webhookUrl = isDebugEnabled ? config.debugWebhookUrl : config.webhookUrl;

        if (urlParsed.searchParams.get('forget') === 'true') {
            forgetAlreadyChosen();
        }

        let chosenOne = getChosenOne();
        let body = {
            activity: 'Daily leader generator',
            title: 'Today\'s daily leader is...',
            body: chosenOne
        };
        axios.post(webhookUrl, body)
            .then(res => {
                console.log('Got response on attempt to send webhook post:');
                try {
                    console.log(`${res.status}\n${JSON.stringify(res.data, '', 2)}`);
                } catch (e) {
                    console.error(`Got error on attempt to stringify response: ${e}`);
                }
            })
            .catch(err => {
                console.log('Got error on attempt to send webhook post:');
                console.error(err);
            });
        res.end();
    } else {
        res.statusCode = 404;
        res.end('Page not found');
    }
});