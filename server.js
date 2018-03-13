const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const router = require('./router');
const mime = require('./common/mime');
const config = require('./config');
const _ = require('underscore');

const port = config.port;
const assetsPath = config.assetsPath;

const sendError = function (res, err) {
    res.writeHead(500, {
        'Content-Type': mime.html
    });
    res.write(err.toString());
    res.end();
}

const sendNotFound = function (res) {
    fs.readFile(config.templatePath + '/404.ejs', (err, data) => {

        if (err) {
            return sendError(res, err);
        }

        res.writeHead(404, {
            'Content-Type': mime.html
        });
        res.write(data);
        res.end();

    });
};

const reg = /(\/[\S]+\/?)+:[\S]+/g;
let newRouter = {};
//转化路由规则
for (let route in router) {
    reg.lastIndex = 0;
    if (router.hasOwnProperty(route)) {
        let newKey = route,
            flag = false;
        if (reg.test(route)) {
            newKey = route.split(':')[0] + '[\\S]+[^\/]';
            flag = true;
        }
        newRouter['^' + newKey.replace(/\//g, '\\/') + '$'] = {
            flag: flag,
            handler: router[route]
        };
    }
}

const server = http.createServer((req, res) => {
    const reqUrl = req.url,
        pathname = url.parse(reqUrl).pathname;

    //搜索匹配路由
    let matchedRouter = _.find(newRouter, function (routeObj, route) {
        let reg = new RegExp(route);
        return pathname.match(reg);
    });

    if (matchedRouter) {
        let handler = matchedRouter.handler,
            param = matchedRouter.flag ? pathname.substr(pathname.lastIndexOf('/') + 1) : undefined;
        typeof handler === 'function' && handler(req, res, param);
    } else {
        let pathname = url.parse(reqUrl).pathname,
            ext = path.parse(pathname).ext,
            realPath = assetsPath + pathname;
        fs.stat(realPath, (err, stat) => {
            if (!err) {
                if (stat.isFile()) {
                    let contentType = mime[ext.substr(1)];
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    fs.readFile(realPath, (err, data) => {
                        if (!err) {
                            res.write(data);
                            res.end();
                        }
                    });
                } else {
                    sendNotFound(res)
                }
            } else {
                sendNotFound(res)
            }
        });
    }
});


module.exports = {
    start() {
        server.listen(port, function () {
            console.log(`app is running at port:${port}`);
            console.log(`url: http://localhost:${port}`);
        });
    }
};

