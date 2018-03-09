const mime=require('../common/mime');


const response=function (res,type,data) {
    res.writeHead(200, {
        'Content-Type': type
    });
    res.write(data);
    res.end();
};

const user = function (req, res,id) {
    response(res,mime.html,'user:'+id);
};

module.exports = user;