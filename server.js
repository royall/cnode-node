const http = require('http');
const fs = require('fs');
const url = require('url');
const path=require('path');
const router = require('./router');
const mime = require('./common/mime');
const config = require('./config');

const port = config.port;
const assetsPath = config.assetsPath;

const sendNotFound = function (res) {
    res.writeHead(404, {
        'Content-Type': mime.html
    });
    res.write('<html><head><title>404</title></head><body><h1>404 NOT FOUND</h1></body></html>');
    res.end();
};

const server = http.createServer((req, res) => {
    const reqUrl = req.url;
    const pathname = url.parse(reqUrl).pathname;
    let handler = router[pathname];
    if (handler) {
        typeof handler === 'function' && handler(req, res);
    } else {
        let ext = path.parse(reqUrl).ext;
        let realPath = assetsPath + reqUrl;
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

