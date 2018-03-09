const https = require('https');
const querystring = require('querystring');


const GET = function (options) {
    const reqOptions = {
        method: 'GET',
        hostname: options.hostname,
        path: options.path
    };
    return new Promise((resolve, reject) => {
        const req = https.request(reqOptions, (res) => {
            console.log(`状态码: ${res.statusCode}`);
            console.log(`响应头: ${JSON.stringify(res.headers)}`);
            let resData = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                // console.log(`响应主体: ${chunk}`);
                resData += chunk;
            });
            res.on('end', () => {
                resolve(resData);
                // console.log('响应中已无数据。', resData);
            });

        });
        req.on('error', (e) => {
            console.error(`请求遇到问题: ${e.message}`);
            reject(e);
        });
        req.end();
    });
};

const hostname = 'cnodejs.org';

const api = {
    getTopics(options) {
        return GET({
            hostname: hostname,
            path: '/api/v1/topics?' + querystring.stringify(options)
        });
    }
};

module.exports = api;