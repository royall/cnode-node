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

const reg=/(\/[a-zA-Z0-9]+\/?)+:[a-zA-Z0-9]+/g;
let newRouter={};
for(let route in router){
    reg.lastIndex=0;
    if(router.hasOwnProperty(route)){
        let newKey=route,
            flag=false;
        if(reg.test(route)){
            newKey = route.split(':')[0] + '[a-zA-Z0-9]+[^\/]';
            flag = true;
        }
        newRouter['^'+newKey.replace(/\//g,'\\/')+'$']={
            flag:flag,
            handler:router[route]
        };
    }
}

const server = http.createServer((req, res) => {
    const reqUrl = req.url;
    const pathname = url.parse(reqUrl).pathname;
    let flag=false;
    //搜索匹配路由
    for(let route in newRouter){
        if(newRouter.hasOwnProperty(route)){
            let reg=new RegExp(route);
            if(pathname.match(reg)){
                console.log('match');
                let handler = newRouter[route].handler;
                let param;
                if(newRouter[route].flag){
                    param=pathname.substr(pathname.lastIndexOf('/')+1)
                }
                typeof handler === 'function' && handler(req, res,param);
                flag=true;
                break;
            }
        }
    }

    if (!flag){
        let pathname=url.parse(reqUrl).pathname;
        let ext = path.parse(pathname).ext;
        let realPath = assetsPath + pathname;
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

