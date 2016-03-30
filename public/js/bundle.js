(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player"); // test entity

function Game() {
    this.width = 480;
    this.height = 640;

    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px serif";

    this.gameID = document.querySelector("#gameID").textContent;

    this.ui = new Ui(this);
    this.network = new Network(this);

    this.entitites = []; // game entities

    var last = 0; // time variable
    var dt; //delta time

    this.start = function(){
        this.loop();
    };

    /**
     * Game loop
     */
    this.loop = function(timestamp){
        requestAnimationFrame(this.loop.bind(this)); // queue up next loop
        dt = timestamp - last; // time elapsed in ms since last loop
        last = timestamp;
        this.update(dt);
        this.render();
    };

    /**
     * Update
     */
    this.update = function(dt){
        // calculate fps
        this.fps = Math.round(1000 / dt);

        // Update entities
        this.entitites.forEach(function(entity) {
            entity.update(dt);
        });
    };

    /**
     * Rendering
     */
    this.render = function(){
        // clear screen
        this.ctx.clearRect(0, 0, this.width, this.height);

        // render all entities
        this.entitites.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));

        // render fps and ping
        this.ctx.fillText("FPS:  " + this.fps, 10, 20);
        this.ctx.fillText("PING: " + this.network.ping, 10, 42);
    };
}

module.exports = Game;

},{"./Player":2,"./Ui":3,"./webRTC/WebRTC":8}],2:[function(require,module,exports){
var helpers = require("./helpers");

function player() {
    this.x = 50;
    this.y = 50;
    this.radius = 20;
    this.direction = 0;
    this.viewingAngle = 45;
    this.speed = 10;
    this.update = function(){

    };

    this.update= function(dt){

    };

    this.render = function(canvas, ctx){
        //draw circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, helpers.toRadians(360), false);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        // draw viewing direction
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y,this.radius, helpers.toRadians(this.direction - this.viewingAngle), helpers.toRadians(this.direction + this.viewingAngle));
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.fillStyle = "red";
        ctx.fill();
    };
}

module.exports = player;

},{"./helpers":4}],3:[function(require,module,exports){
module.exports = function Ui(game){
    this.clientList = document.querySelector("#clients");
    this.game = game;

    this.updateClientList = function(peers) {
        //TODO: use handlebars
        this.clientList.innerHTML = "";
        for (var id in peers){
            var li = document.createElement("li");
            var content = document.createTextNode(id);
            li.appendChild(content);
            this.clientList.appendChild(li);
        }
    };
};

},{}],4:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * Math.PI / 180;
}


module.exports = {
    toRadians: toRadians
};

},{}],5:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":1}],6:[function(require,module,exports){
module.exports = function Client(network){
    this.game = network.game;
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

    this.peer.on("open", function(id) {
        // ive got my peerID and hostID, lets send it to the server to join
        this.game.network.socket.emit("join", {peerID: id, gameID: this.game.gameID});
    }.bind(this));

    this.peer.on("connection", function(conn) {
        // the host has started the connection
        window.game.network.client.conn = conn;
        console.log("connection from server", conn);

        //Listen for data events from the host
        conn.on("data", function(data) {
            if (data.event === "ping"){ // host sent a ping, answer it
                conn.send({ event: "pong", timestamp: data.timestamp });
            }

            if(data.event === "pong") { // we've received a pong from the host, calucate pingtime
                var ping = Date.now() - data.timestamp;
                window.game.network.ping = ping;
            }
        });





        // ping test
        window.game.network.client.pingInterval = setInterval(function(){
            console.log(window.game);
            window.game.network.client.conn.send({
                event: "ping",
                timestamp: Date.now()
            });
        }, 2000);

    });




};

},{}],7:[function(require,module,exports){
module.exports = function Host(network){
    this.game = network.game;
    this.peers = {};
    this.conns = {};

    network.socket.emit("hostStart", {gameID: this.game.gameID});

    /**
     * A user has joined. establish a new peer connection with it
    */
    network.socket.on("join", function(data) {
        // a peer wants to join. Create a new Peer and connect them
        var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

        peer.on("open", function(id) {
            var conn =  peer.connect(data.peerID);
            this.peers[id] = peer;
            this.conns[data.peerID] = conn;

            this.send({event: "userJoined"});

            //receiving data from a client
            conn.on("data", function(data) {
                if (data.event === "ping"){ // answer the ping
                    conn.send({ event: "pong", timestamp: data.timestamp });
                }
                if(data.event === "pong") {
                    var ping = Date.now() - data.timestamp;
                    window.game.network.host.peers[conn.peer].ping = ping;
                }

            });

            //this.game.ui.updateClientList(this.peers);
            // conn.on("close", function() {
            //     // a peer has disconnected
            //     console.log("disconnected!", conn, "PEER", peer);
            //     delete this.peers[conn.peer];
            //     delete this.conns[conn.peer];
            //     this.game.ui.updateClientList(this.peers);
            // }.bind(this));
            //
        }.bind(this));

    }.bind(this));

    this.send = function(data) {
        console.log("Send", data);
        for (var conn in this.conns){
            this.conns[conn].send(data);
        }
    };





















    document.querySelector("#sendTest").addEventListener("click", function() {
        this.send("asdasdasdasdas");
    }.bind(this));
};

},{}],8:[function(require,module,exports){
var Client = require("./Client");
var Host = require("./Host");

module.exports = function WebRTC(game){
    this.game = game;
    this.socket = io();

    //im the host
    if (document.querySelector("#host") !== null) this.host = new Host(this);

    setTimeout(function(){ //TODO: better implementation (promise?)
        this.client = new Client(this);
    }.bind(this), 2000);

    //
    // this.peers = {};
    // this.conns = {};
    // this.socket.emit("hostStart", {gameID: this.gameID});
    //
    // this.socket.on("join", function(data) {
    //     // a peer wants to join. Create a new Peer and connect them
    //     this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //     this.peer.on("open", function(id) {
    //         this.conn = this.peer.connect(data.peerID);
    //         console.log(id, data.peerID);
    //         this.peers[id] = this.peer;
    //         this.conns[data.peerID] = this.conn;
    //
    //
    //
    //         this.game.ui.updateClientList(this.peers);
    //
    //         this.conn.on("close", function() {
    //             // a peer has disconnected
    //             console.log("disconnected!", this.conn, "PEER", this.peer);
    //             delete this.peers[this.conn.peer];
    //             delete this.conns[this.conn.peer];
    //             this.game.ui.updateClientList();
    //         });
    //     });
    // });
};

},{"./Client":6,"./Host":7}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9QbGF5ZXIuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvaGVscGVycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpOyAvLyB0ZXN0IGVudGl0eVxyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMud2lkdGggPSA0ODA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDY0MDtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCIxNnB4IHNlcmlmXCI7XHJcblxyXG4gICAgdGhpcy5nYW1lSUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVJRFwiKS50ZXh0Q29udGVudDtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsodGhpcyk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGl0ZXMgPSBbXTsgLy8gZ2FtZSBlbnRpdGllc1xyXG5cclxuICAgIHZhciBsYXN0ID0gMDsgLy8gdGltZSB2YXJpYWJsZVxyXG4gICAgdmFyIGR0OyAvL2RlbHRhIHRpbWVcclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmxvb3AoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHYW1lIGxvb3BcclxuICAgICAqL1xyXG4gICAgdGhpcy5sb29wID0gZnVuY3Rpb24odGltZXN0YW1wKXtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wLmJpbmQodGhpcykpOyAvLyBxdWV1ZSB1cCBuZXh0IGxvb3BcclxuICAgICAgICBkdCA9IHRpbWVzdGFtcCAtIGxhc3Q7IC8vIHRpbWUgZWxhcHNlZCBpbiBtcyBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKGR0KTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXHJcbiAgICAgICAgdGhpcy5mcHMgPSBNYXRoLnJvdW5kKDEwMDAgLyBkdCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpdGVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUoZHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcmluZ1xyXG4gICAgICovXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGFsbCBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpdGVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIodGhpcy5jYW52YXMsIHRoaXMuY3R4KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoXCJGUFM6ICBcIiArIHRoaXMuZnBzLCAxMCwgMjApO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB0aGlzLm5ldHdvcmsucGluZywgMTAsIDQyKTtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xyXG5cclxuZnVuY3Rpb24gcGxheWVyKCkge1xyXG4gICAgdGhpcy54ID0gNTA7XHJcbiAgICB0aGlzLnkgPSA1MDtcclxuICAgIHRoaXMucmFkaXVzID0gMjA7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XHJcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IDQ1O1xyXG4gICAgdGhpcy5zcGVlZCA9IDEwO1xyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy51cGRhdGU9IGZ1bmN0aW9uKGR0KXtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY2FudmFzLCBjdHgpe1xyXG4gICAgICAgIC8vZHJhdyBjaXJjbGVcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIGhlbHBlcnMudG9SYWRpYW5zKDM2MCksIGZhbHNlKTtcclxuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAvLyBkcmF3IHZpZXdpbmcgZGlyZWN0aW9uXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksdGhpcy5yYWRpdXMsIGhlbHBlcnMudG9SYWRpYW5zKHRoaXMuZGlyZWN0aW9uIC0gdGhpcy52aWV3aW5nQW5nbGUpLCBoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbiArIHRoaXMudmlld2luZ0FuZ2xlKSk7XHJcbiAgICAgICAgY3R4LmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHBsYXllcjtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcclxuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xpZW50c1wiKTtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGVlcnMpIHtcclxuICAgICAgICAvL1RPRE86IHVzZSBoYW5kbGViYXJzXHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGVlcnMpe1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQpO1xyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcclxuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xyXG4gICAgcmV0dXJuIGRlZyAqIE1hdGguUEkgLyAxODA7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHRvUmFkaWFuczogdG9SYWRpYW5zXHJcbn07XHJcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUuc3RhcnQoKTtcclxufSk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ2xpZW50KG5ldHdvcmspe1xyXG4gICAgdGhpcy5nYW1lID0gbmV0d29yay5nYW1lO1xyXG4gICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuXHJcbiAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGhvc3RJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pblxyXG4gICAgICAgIHRoaXMuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB0aGlzLmdhbWUuZ2FtZUlEfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xyXG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIGNvbm4pO1xyXG5cclxuICAgICAgICAvL0xpc3RlbiBmb3IgZGF0YSBldmVudHMgZnJvbSB0aGUgaG9zdFxyXG4gICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XHJcbiAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxyXG4gICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAvLyBwaW5nIHRlc3RcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5waW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuZ2FtZSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XHJcbiAgICAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXHJcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgMjAwMCk7XHJcblxyXG4gICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhvc3QobmV0d29yayl7XHJcbiAgICB0aGlzLmdhbWUgPSBuZXR3b3JrLmdhbWU7XHJcbiAgICB0aGlzLnBlZXJzID0ge307XHJcbiAgICB0aGlzLmNvbm5zID0ge307XHJcblxyXG4gICAgbmV0d29yay5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWUuZ2FtZUlEfSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHVzZXIgaGFzIGpvaW5lZC4gZXN0YWJsaXNoIGEgbmV3IHBlZXIgY29ubmVjdGlvbiB3aXRoIGl0XHJcbiAgICAqL1xyXG4gICAgbmV0d29yay5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgICAgIHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuXHJcbiAgICAgICAgcGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICAgICAgdmFyIGNvbm4gPSAgcGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSBwZWVyO1xyXG4gICAgICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IGNvbm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbmQoe2V2ZW50OiBcInVzZXJKb2luZWRcIn0pO1xyXG5cclxuICAgICAgICAgICAgLy9yZWNlaXZpbmcgZGF0YSBmcm9tIGEgY2xpZW50XHJcbiAgICAgICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGFuc3dlciB0aGUgcGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAgICAgICAgIC8vIGNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gICAgIC8vIGEgcGVlciBoYXMgZGlzY29ubmVjdGVkXHJcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgY29ubiwgXCJQRUVSXCIsIHBlZXIpO1xyXG4gICAgICAgICAgICAvLyAgICAgZGVsZXRlIHRoaXMucGVlcnNbY29ubi5wZWVyXTtcclxuICAgICAgICAgICAgLy8gICAgIGRlbGV0ZSB0aGlzLmNvbm5zW2Nvbm4ucGVlcl07XHJcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgICAgICAgICAgLy8gfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2VuZFwiLCBkYXRhKTtcclxuICAgICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xyXG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2VuZFRlc3RcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2VuZChcImFzZGFzZGFzZGFzZGFzXCIpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuIiwidmFyIENsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcclxudmFyIEhvc3QgPSByZXF1aXJlKFwiLi9Ib3N0XCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJSVEMoZ2FtZSl7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG5cclxuICAgIC8vaW0gdGhlIGhvc3RcclxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2hvc3RcIikgIT09IG51bGwpIHRoaXMuaG9zdCA9IG5ldyBIb3N0KHRoaXMpO1xyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgLy9UT0RPOiBiZXR0ZXIgaW1wbGVtZW50YXRpb24gKHByb21pc2U/KVxyXG4gICAgICAgIHRoaXMuY2xpZW50ID0gbmV3IENsaWVudCh0aGlzKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMjAwMCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIC8vIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIC8vIHRoaXMuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxufTtcclxuIl19
