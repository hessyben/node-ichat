var http = require('http');
var fs = require('fs');
var express = require('express'), //引入express模块
    app = express();
app.use('/', express.static(__dirname + '/www')); //指定静态HTML文件的位置

var documentRoot = 'D:/process/nodeJs/node-ichat/www';
var httpServer = http.createServer(function (req,res) {
    var file = documentRoot+req.url;
    fs.readFile(file,function (err,data) {
        if (err){
            res.writeHead(404,{
                'content-type':'text/html;charset="utf-8"'
            });
            res.write('网页被leo吃掉了~~~');
            res.end();
        }else{
            res.writeHead(200,{
                'content-type':'text/html;charset="utf-8"'
            });
            res.write(data);
            res.end();
        }
    });

}).listen(8889);
var io = require('socket.io')(httpServer);
var users = [];

io.on('connection',function (socket) {
    socket.on('foo',function (data) {
        console.log(data);
    });
    socket.on('login',function (nickname) {
        if(users.indexOf(nickname)>-1){
            socket.emit('nickExisted');
        }else{
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname,users.length,'login');
        }
    });
    socket.on('disconnect',function () {
       users.splice(socket.userIndex,1);
       socket.broadcast.emit('system',socket.nickname,users.length,'logout');
    });
    socket.on('postMsg',function (msg) {
        socket.broadcast.emit('newMsg',socket.nickname, msg);
    });
    //接收用户发来的图片
    socket.on('img', function(imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
});
console.log('server started');