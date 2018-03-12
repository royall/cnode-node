const ejs = require('ejs');
const url = require('url');
const querystring = require('querystring');
const api = require('../common/api');
const mime = require('../common/mime');
const config = require('../config');
const utils = require('../common/utils');
const _ = require('underscore');

const tplPath = config.templatePath + '/index.ejs';

const topics = function (req, res) {

    const reqUrl = req.url,
        qs = url.parse(reqUrl).query,
        params = querystring.parse(qs),
        tab = params.tab || 'all',
        page = params.page || 1;

    api.getTopics({
        tab: tab,
        page: page
    }).then(function (data) {
        res.writeHead(200, {
            'Content-Type': mime.html
        });
        let tplData=JSON.parse(data);
        _.extend(tplData,{
            tab,
            page,
            utils
        });
        ejs.renderFile(tplPath, tplData, function (err, str) {
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

module.exports = topics;