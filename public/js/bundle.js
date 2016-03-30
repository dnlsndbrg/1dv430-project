(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function keyDownHandler(e){
    console.log("down", e);
}

function keyUpHandler(e){
    console.log("up", e);
}

function Controls(){
    document.addEventListener("keydown",keyDownHandler, false);
    document.addEventListener("keyup",keyUpHandler, false);
}



module.exports = Controls;

},{}],2:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player");
var Controls = require("./Controls");

function Game() {
    this.width = 480;
    this.height = 640;

    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px serif";

    this.gameID = document.querySelector("#gameID").textContent;

    this.ui = new Ui(this);
    this.network = new Network(this);
    this.controls = new Controls();

    this.entities = []; // game entities

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
        //this.controls.handleInput();
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
        this.entities.forEach(function(entity) {
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
        this.entities.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));

        // render fps and ping
        this.ctx.fillStyle = "black";
        this.ctx.fillText("FPS:  " + this.fps, 10, 20);
        this.ctx.fillText("PING: " + this.network.ping, 10, 42);
    };
}

Game.prototype.addPlayer = function(id){
    console.log(this);
    var newPlayer = new Player(id);
    this.entities.push(newPlayer);
    return newPlayer;
};

module.exports = Game;

},{"./Controls":1,"./Player":3,"./Ui":4,"./webRTC/WebRTC":9}],3:[function(require,module,exports){
var helpers = require("./helpers");

function Player(playerData) {
    this.id = playerData.id;
    this.x = playerData.x || Math.floor(Math.random() * window.game.width) + 1;
    this.y = playerData.y || Math.floor(Math.random() * window.game.height) + 1;
    this.radius = playerData.radius || 20;
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 10;
}

Player.prototype.update = function(dt){

};

Player.prototype.render = function(canvas, ctx){
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

module.exports = Player;

},{"./helpers":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * Math.PI / 180;
}


module.exports = {
    toRadians: toRadians
};

},{}],6:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":2}],7:[function(require,module,exports){
var Player = require("./../Player");

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

        //create the player
        //window.game.player = window.game.addPlayer(conn.peer);


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
            window.game.network.client.conn.send({
                event: "ping",
                timestamp: Date.now()
            });
        }, 2000);

    });




};

},{"./../Player":3}],8:[function(require,module,exports){
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

            var newPlayer = window.game.addPlayer({id: id});
            this.broadcast({ event: "playerJoined", playerData: JSON.stringify(newPlayer) });




            //receiving data from a client
            conn.on("data", function(data) {
                //console.log("=====\nHOST - data from client\n", data,"\n=====");
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

    this.broadcast = function(data) {
        console.log("Send", data);
        for (var conn in this.conns){
            this.conns[conn].send(data);
        }
    };

    // just send data to a specific client
    this.emit = function(data) {
        this.conns[data.clientID].send(data);
    };





















    document.querySelector("#sendTest").addEventListener("click", function() {
        this.send("asdasdasdasdas");
    }.bind(this));
};

},{}],9:[function(require,module,exports){
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

},{"./Client":7,"./Host":8}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQ29udHJvbHMuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9QbGF5ZXIuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvaGVscGVycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBrZXlEb3duSGFuZGxlcihlKXtcclxuICAgIGNvbnNvbGUubG9nKFwiZG93blwiLCBlKTtcclxufVxyXG5cclxuZnVuY3Rpb24ga2V5VXBIYW5kbGVyKGUpe1xyXG4gICAgY29uc29sZS5sb2coXCJ1cFwiLCBlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gQ29udHJvbHMoKXtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsa2V5RG93bkhhbmRsZXIsIGZhbHNlKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLGtleVVwSGFuZGxlciwgZmFsc2UpO1xyXG59XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XHJcbiIsInZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoXCIuL3dlYlJUQy9XZWJSVENcIik7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi9QbGF5ZXJcIik7XHJcbnZhciBDb250cm9scyA9IHJlcXVpcmUoXCIuL0NvbnRyb2xzXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMud2lkdGggPSA0ODA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDY0MDtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCIxNnB4IHNlcmlmXCI7XHJcblxyXG4gICAgdGhpcy5nYW1lSUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVJRFwiKS50ZXh0Q29udGVudDtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsodGhpcyk7XHJcbiAgICB0aGlzLmNvbnRyb2xzID0gbmV3IENvbnRyb2xzKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcblxyXG4gICAgdmFyIGxhc3QgPSAwOyAvLyB0aW1lIHZhcmlhYmxlXHJcbiAgICB2YXIgZHQ7IC8vZGVsdGEgdGltZVxyXG5cclxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMubG9vcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdhbWUgbG9vcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApe1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcbiAgICAgICAgLy90aGlzLmNvbnRyb2xzLmhhbmRsZUlucHV0KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKGR0KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXJpbmdcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIGNsZWFyIHNjcmVlblxyXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIodGhpcy5jYW52YXMsIHRoaXMuY3R4KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiRlBTOiAgXCIgKyB0aGlzLmZwcywgMTAsIDIwKTtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIlBJTkc6IFwiICsgdGhpcy5uZXR3b3JrLnBpbmcsIDEwLCA0Mik7XHJcbiAgICB9O1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRQbGF5ZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGlkKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgcmV0dXJuIG5ld1BsYXllcjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xyXG5cclxuZnVuY3Rpb24gUGxheWVyKHBsYXllckRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBwbGF5ZXJEYXRhLmlkO1xyXG4gICAgdGhpcy54ID0gcGxheWVyRGF0YS54IHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdpbmRvdy5nYW1lLndpZHRoKSArIDE7XHJcbiAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2luZG93LmdhbWUuaGVpZ2h0KSArIDE7XHJcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwO1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBwbGF5ZXJEYXRhLmRpcmVjdGlvbiB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMTtcclxuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gcGxheWVyRGF0YS52aWV3aW5nQW5nbGUgfHwgNDU7XHJcbiAgICB0aGlzLnNwZWVkID0gcGxheWVyRGF0YS5zcGVlZCB8fCAxMDtcclxufVxyXG5cclxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcblxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihjYW52YXMsIGN0eCl7XHJcbiAgICAvL2RyYXcgY2lyY2xlXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgaGVscGVycy50b1JhZGlhbnMoMzYwKSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgLy8gZHJhdyB2aWV3aW5nIGRpcmVjdGlvblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4Lm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LHRoaXMucmFkaXVzLCBoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbiAtIHRoaXMudmlld2luZ0FuZ2xlKSwgaGVscGVycy50b1JhZGlhbnModGhpcy5kaXJlY3Rpb24gKyB0aGlzLnZpZXdpbmdBbmdsZSkpO1xyXG4gICAgY3R4LmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcclxuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xpZW50c1wiKTtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGVlcnMpIHtcclxuICAgICAgICAvL1RPRE86IHVzZSBoYW5kbGViYXJzXHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGVlcnMpe1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQpO1xyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcclxuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xyXG4gICAgcmV0dXJuIGRlZyAqIE1hdGguUEkgLyAxODA7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHRvUmFkaWFuczogdG9SYWRpYW5zXHJcbn07XHJcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENsaWVudChuZXR3b3JrKXtcclxuICAgIHRoaXMuZ2FtZSA9IG5ldHdvcmsuZ2FtZTtcclxuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcblxyXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBob3N0SUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW5cclxuICAgICAgICB0aGlzLmdhbWUubmV0d29yay5zb2NrZXQuZW1pdChcImpvaW5cIiwge3BlZXJJRDogaWQsIGdhbWVJRDogdGhpcy5nYW1lLmdhbWVJRH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcclxuICAgICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCBjb25uKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIHBsYXllclxyXG4gICAgICAgIC8vd2luZG93LmdhbWUucGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKGNvbm4ucGVlcik7XHJcblxyXG5cclxuICAgICAgICAvL0xpc3RlbiBmb3IgZGF0YSBldmVudHMgZnJvbSB0aGUgaG9zdFxyXG4gICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XHJcbiAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxyXG4gICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAvLyBwaW5nIHRlc3RcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5waW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoe1xyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxyXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDIwMDApO1xyXG5cclxuICAgIH0pO1xyXG5cclxuXHJcblxyXG5cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KG5ldHdvcmspe1xyXG4gICAgdGhpcy5nYW1lID0gbmV0d29yay5nYW1lO1xyXG4gICAgdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgdGhpcy5jb25ucyA9IHt9O1xyXG5cclxuICAgIG5ldHdvcmsuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lLmdhbWVJRH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSB1c2VyIGhhcyBqb2luZWQuIGVzdGFibGlzaCBhIG5ldyBwZWVyIGNvbm5lY3Rpb24gd2l0aCBpdFxyXG4gICAgKi9cclxuICAgIG5ldHdvcmsuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgICAgICB2YXIgcGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcblxyXG4gICAgICAgIHBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBjb25uID0gIHBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XHJcbiAgICAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gcGVlcjtcclxuICAgICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSBjb25uO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGlkfSk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IEpTT04uc3RyaW5naWZ5KG5ld1BsYXllcikgfSk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvL3JlY2VpdmluZyBkYXRhIGZyb20gYSBjbGllbnRcclxuICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIj09PT09XFxuSE9TVCAtIGRhdGEgZnJvbSBjbGllbnRcXG5cIiwgZGF0YSxcIlxcbj09PT09XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gYW5zd2VyIHRoZSBwaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy90aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgICAgICAgICAgLy8gY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCBjb25uLCBcIlBFRVJcIiwgcGVlcik7XHJcbiAgICAgICAgICAgIC8vICAgICBkZWxldGUgdGhpcy5wZWVyc1tjb25uLnBlZXJdO1xyXG4gICAgICAgICAgICAvLyAgICAgZGVsZXRlIHRoaXMuY29ubnNbY29ubi5wZWVyXTtcclxuICAgICAgICAgICAgLy8gICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgICAgICAgICAvLyB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRcIiwgZGF0YSk7XHJcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcclxuICAgICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcclxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZW5kVGVzdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZW5kKFwiYXNkYXNkYXNkYXNkYXNcIik7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQyhnYW1lKXtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvKCk7XHJcblxyXG4gICAgLy9pbSB0aGUgaG9zdFxyXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaG9zdFwiKSAhPT0gbnVsbCkgdGhpcy5ob3N0ID0gbmV3IEhvc3QodGhpcyk7XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpeyAvL1RPRE86IGJldHRlciBpbXBsZW1lbnRhdGlvbiAocHJvbWlzZT8pXHJcbiAgICAgICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KHRoaXMpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAyMDAwKTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
