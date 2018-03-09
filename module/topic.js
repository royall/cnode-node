const ejs = require('ejs');
const url = require('url');
const querystring = require('querystring');
const api = require('../common/api');
const mime = require('../common/mime');
const config = require('../config');


const tplPath = config.templatePath + '/topic.ejs';

const topic = function (req, res,id) {

    api.getTopic(id).then(function (data) {
        res.writeHead(200, {
            'Content-Type': mime.html
        });
        ejs.renderFile(tplPath, JSON.parse(data), function (err, str) {
            if (err) {
                console.log('ejs error', err);
            } else {
                res.write(str);
                res.end();
            }
        });
    }, function () {

    });
};

module.exports = topic;