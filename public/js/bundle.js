(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player");
var KeyboardControls = require("./KeyboardControls");

function Game() {
    this.width = 480;
    this.height = 640;

    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px serif";

    this.gameID = window.location.pathname.split("/")[2];

    this.ui = new Ui(this);
    this.network = new Network();
    //this.controls = new KeyboardControls();

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
    var newPlayer = new Player(id);
    this.entities.push(newPlayer);
    return newPlayer;
};

module.exports = Game;

},{"./KeyboardControls":2,"./Player":4,"./Ui":5,"./webRTC/WebRTC":10}],2:[function(require,module,exports){
function Controls(){
    this.keys = {
        w: false,
        s: false,
        a: false,
        d: false
    };

    this.keyDownHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (this.keys.w !== true){
                    window.game.network.client.conn.send( {event: "keyDown", key: 87} );
                    this.keys.w = true;
                }
                break;
            case 83: // S
                console.log("S");
        }
    };

    this.keyUpHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (this.keys.w === true){
                    window.game.network.client.conn.send( {event: "keyUp", key: 87} );
                    this.keys.w = false;
                }
                break;
            case 83: // S
                console.log("S");
        }
    };

    document.addEventListener("keydown",this.keyDownHandler.bind(this), false);
    document.addEventListener("keyup",this.keyUpHandler.bind(this), false);
}



module.exports = Controls;

},{}],3:[function(require,module,exports){
function Controls() {

}

module.exports = Controls;

},{}],4:[function(require,module,exports){
var helpers = require("./helpers");
var KeyboardControls = require("./KeyboardControls");
var NetworkControls = require("./NetworkControls");

function Player(playerData) {
    this.id = playerData.id;
    this.x = playerData.x || Math.floor(Math.random() * window.game.width) + 1;
    this.y = playerData.y || Math.floor(Math.random() * window.game.height) + 1;
    this.radius = playerData.radius || 20;
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 10;
    this.controls = (playerData.id === window.game.network.client.peer.id) ? new KeyboardControls("./KeyboardControls") : new NetworkControls("./NetworkControls") ;
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

},{"./KeyboardControls":2,"./NetworkControls":3,"./helpers":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * Math.PI / 180;
}


module.exports = {
    toRadians: toRadians
};

},{}],7:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":1}],8:[function(require,module,exports){
var Player = require("./../Player");

module.exports = function Client(){
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

    this.peer.on("open", function(id) {
        // ive got my peerID and gameID, lets send it to the server to join the host
        window.game.network.socket.emit("join", {peerID: id, gameID: window.game.gameID});
        console.log("my client peerID is ", id);
    });




    //
    // this.peer.on("connection", function(conn) {
    //     // the host has started the connection
    //     window.game.network.client.conn = conn;
    //     console.log("connection from server", this.peer, conn);
    //
    //     //create the player
    //     //window.game.player = window.game.addPlayer(conn.peer);
    //
    //
    //     //Listen for data events from the host
    //     conn.on("data", function(data) {
    //         if (data.event === "ping"){ // host sent a ping, answer it
    //             conn.send({ event: "pong", timestamp: data.timestamp });
    //         }
    //
    //         if(data.event === "pong") { // we've received a pong from the host, calucate pingtime
    //             var ping = Date.now() - data.timestamp;
    //             window.game.network.ping = ping;
    //         }
    //     });
    //
    //
    //
    //
    //
    //     // ping test
    //     window.game.network.client.pingInterval = setInterval(function(){
    //         window.game.network.client.conn.send({
    //             event: "ping",
    //             timestamp: Date.now()
    //         });
    //     }, 2000);
    //
    // });




};

},{"./../Player":4}],9:[function(require,module,exports){
module.exports = function Host(){
    this.peers = {};
    this.conns = {};

    this.connect = function(peers){
        console.log("connect", peers);
        peers.forEach(function(peerID) {
            // create a new peer
            var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
            // and once it's opened, connect with the remote peer
            peer.on("open", function() {
                console.log("connect with", peerID);
                var conn =  peer.connect(peerID);
                window.game.network.host.peers[peerID] = peer;
                window.game.network.host.conns[peerID] = conn;
            });
        });
    };
};

    //
    // network.socket.emit("hostStart", {gameID: this.game.gameID});
    //
    // /**
    //  * A user has joined. establish a new peer connection with it
    // */
    // network.socket.on("join", function(data) {
    //     // a peer wants to join. Create a new Peer and connect them
    //     var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //
    //     peer.on("open", function(id) {
    //         var conn =  peer.connect(data.peerID);
    //         this.peers[id] = peer;
    //         this.conns[data.peerID] = conn;
    //
    //         console.log("SADLASDASDAS", id, peer, conn);
    //         var newPlayer = window.game.addPlayer({id: conn.peer});
    //         this.broadcast({ event: "playerJoined", playerData: JSON.stringify(newPlayer) });
    //
    //
    //
    //
    //         //receiving data from a client
    //         conn.on("data", function(data) {
    //             console.log("=====\nHOST - data from client\n", data,"\n=====");
    //             if (data.event === "ping"){ // answer the ping
    //                 conn.send({ event: "pong", timestamp: data.timestamp });
    //             }
    //             if(data.event === "pong") {
    //                 var ping = Date.now() - data.timestamp;
    //                 window.game.network.host.peers[conn.peer].ping = ping;
    //             }
    //
    //         });
    //
    //         //this.game.ui.updateClientList(this.peers);
    //         // conn.on("close", function() {
    //         //     // a peer has disconnected
    //         //     console.log("disconnected!", conn, "PEER", peer);
    //         //     delete this.peers[conn.peer];
    //         //     delete this.conns[conn.peer];
    //         //     this.game.ui.updateClientList(this.peers);
    //         // }.bind(this));
    //         //
    //     }.bind(this));
    //
    // }.bind(this));
    //
    // this.broadcast = function(data) {
    //     console.log("Send", data);
    //     for (var conn in this.conns){
    //         this.conns[conn].send(data);
    //     }
    // };
    //
    // // just send data to a specific client
    // this.emit = function(data) {
    //     this.conns[data.clientID].send(data);
    // };
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // document.querySelector("#sendTest").addEventListener("click", function() {
    //     this.send("asdasdasdasdas");
    // }.bind(this));

},{}],10:[function(require,module,exports){
var Client = require("./Client");
var Host = require("./Host");

module.exports = function WebRTC(){
    this.socket = io();
    this.client = new Client();

    this.socket.on("youAreHost", function(data) {
        console.log("im the host", data);
        window.game.network.host = new Host();
        window.game.network.host.connect(data.peers);
    });

    this.socket.on("playerJoined", function(data) {
        window.game.network.host.connect([data.peerID]);
    });

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

},{"./Client":8,"./Host":9}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZENvbnRyb2xzLmpzIiwic3JjL2pzL05ldHdvcmtDb250cm9scy5qcyIsInNyYy9qcy9QbGF5ZXIuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvaGVscGVycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoXCIuL3dlYlJUQy9XZWJSVENcIik7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi9QbGF5ZXJcIik7XHJcbnZhciBLZXlib2FyZENvbnRyb2xzID0gcmVxdWlyZShcIi4vS2V5Ym9hcmRDb250cm9sc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcbiAgICB0aGlzLndpZHRoID0gNDgwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSA2NDA7XHJcblxyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc1wiKTtcclxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMTZweCBzZXJpZlwiO1xyXG5cclxuICAgIHRoaXMuZ2FtZUlEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KFwiL1wiKVsyXTtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsoKTtcclxuICAgIC8vdGhpcy5jb250cm9scyA9IG5ldyBLZXlib2FyZENvbnRyb2xzKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcblxyXG4gICAgdmFyIGxhc3QgPSAwOyAvLyB0aW1lIHZhcmlhYmxlXHJcbiAgICB2YXIgZHQ7IC8vZGVsdGEgdGltZVxyXG5cclxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMubG9vcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdhbWUgbG9vcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApe1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcbiAgICAgICAgLy90aGlzLmNvbnRyb2xzLmhhbmRsZUlucHV0KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKGR0KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXJpbmdcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIGNsZWFyIHNjcmVlblxyXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIodGhpcy5jYW52YXMsIHRoaXMuY3R4KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiRlBTOiAgXCIgKyB0aGlzLmZwcywgMTAsIDIwKTtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIlBJTkc6IFwiICsgdGhpcy5uZXR3b3JrLnBpbmcsIDEwLCA0Mik7XHJcbiAgICB9O1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRQbGF5ZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihpZCk7XHJcbiAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3UGxheWVyKTtcclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCl7XHJcbiAgICB0aGlzLmtleXMgPSB7XHJcbiAgICAgICAgdzogZmFsc2UsXHJcbiAgICAgICAgczogZmFsc2UsXHJcbiAgICAgICAgYTogZmFsc2UsXHJcbiAgICAgICAgZDogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcclxuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy53ICE9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoIHtldmVudDogXCJrZXlEb3duXCIsIGtleTogODd9ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLncgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLncgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCgge2V2ZW50OiBcImtleVVwXCIsIGtleTogODd9ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLncgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG59XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XHJcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xyXG52YXIgS2V5Ym9hcmRDb250cm9scyA9IHJlcXVpcmUoXCIuL0tleWJvYXJkQ29udHJvbHNcIik7XHJcbnZhciBOZXR3b3JrQ29udHJvbHMgPSByZXF1aXJlKFwiLi9OZXR3b3JrQ29udHJvbHNcIik7XHJcblxyXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IHBsYXllckRhdGEuaWQ7XHJcbiAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2luZG93LmdhbWUud2lkdGgpICsgMTtcclxuICAgIHRoaXMueSA9IHBsYXllckRhdGEueSB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5oZWlnaHQpICsgMTtcclxuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xyXG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcclxuICAgIHRoaXMuc3BlZWQgPSBwbGF5ZXJEYXRhLnNwZWVkIHx8IDEwO1xyXG4gICAgdGhpcy5jb250cm9scyA9IChwbGF5ZXJEYXRhLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSA/IG5ldyBLZXlib2FyZENvbnRyb2xzKFwiLi9LZXlib2FyZENvbnRyb2xzXCIpIDogbmV3IE5ldHdvcmtDb250cm9scyhcIi4vTmV0d29ya0NvbnRyb2xzXCIpIDtcclxufVxyXG5cclxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcblxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihjYW52YXMsIGN0eCl7XHJcbiAgICAvL2RyYXcgY2lyY2xlXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgaGVscGVycy50b1JhZGlhbnMoMzYwKSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgLy8gZHJhdyB2aWV3aW5nIGRpcmVjdGlvblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4Lm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LHRoaXMucmFkaXVzLCBoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbiAtIHRoaXMudmlld2luZ0FuZ2xlKSwgaGVscGVycy50b1JhZGlhbnModGhpcy5kaXJlY3Rpb24gKyB0aGlzLnZpZXdpbmdBbmdsZSkpO1xyXG4gICAgY3R4LmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIGN0eC5maWxsKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcclxuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xpZW50c1wiKTtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGVlcnMpIHtcclxuICAgICAgICAvL1RPRE86IHVzZSBoYW5kbGViYXJzXHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGVlcnMpe1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQpO1xyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcclxuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xyXG4gICAgcmV0dXJuIGRlZyAqIE1hdGguUEkgLyAxODA7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHRvUmFkaWFuczogdG9SYWRpYW5zXHJcbn07XHJcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENsaWVudCgpe1xyXG4gICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuXHJcbiAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGdhbWVJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pbiB0aGUgaG9zdFxyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuc29ja2V0LmVtaXQoXCJqb2luXCIsIHtwZWVySUQ6IGlkLCBnYW1lSUQ6IHdpbmRvdy5nYW1lLmdhbWVJRH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwibXkgY2xpZW50IHBlZXJJRCBpcyBcIiwgaWQpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xyXG4gICAgLy8gICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXHJcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIHRoaXMucGVlciwgY29ubik7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIC8vY3JlYXRlIHRoZSBwbGF5ZXJcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnBsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcihjb25uLnBlZXIpO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgLy9MaXN0ZW4gZm9yIGRhdGEgZXZlbnRzIGZyb20gdGhlIGhvc3RcclxuICAgIC8vICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxyXG4gICAgLy8gICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikgeyAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcclxuICAgIC8vICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xyXG4gICAgLy8gICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgLy8gcGluZyB0ZXN0XHJcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuICAgIC8vICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5zZW5kKHtcclxuICAgIC8vICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcclxuICAgIC8vICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9LCAyMDAwKTtcclxuICAgIC8vXHJcbiAgICAvLyB9KTtcclxuXHJcblxyXG5cclxuXHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSG9zdCgpe1xyXG4gICAgdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgdGhpcy5jb25ucyA9IHt9O1xyXG5cclxuICAgIHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKHBlZXJzKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3RcIiwgcGVlcnMpO1xyXG4gICAgICAgIHBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBwZWVyXHJcbiAgICAgICAgICAgIHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgICAgICAgICAgLy8gYW5kIG9uY2UgaXQncyBvcGVuZWQsIGNvbm5lY3Qgd2l0aCB0aGUgcmVtb3RlIHBlZXJcclxuICAgICAgICAgICAgcGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm4gPSAgcGVlci5jb25uZWN0KHBlZXJJRCk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbcGVlcklEXSA9IHBlZXI7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbcGVlcklEXSA9IGNvbm47XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gbmV0d29yay5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWUuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gLyoqXHJcbiAgICAvLyAgKiBBIHVzZXIgaGFzIGpvaW5lZC4gZXN0YWJsaXNoIGEgbmV3IHBlZXIgY29ubmVjdGlvbiB3aXRoIGl0XHJcbiAgICAvLyAqL1xyXG4gICAgLy8gbmV0d29yay5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdmFyIGNvbm4gPSAgcGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSBwZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IGNvbm47XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhcIlNBRExBU0RBU0RBU1wiLCBpZCwgcGVlciwgY29ubik7XHJcbiAgICAvLyAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vICAgICAgICAgdGhpcy5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogSlNPTi5zdHJpbmdpZnkobmV3UGxheWVyKSB9KTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIC8vcmVjZWl2aW5nIGRhdGEgZnJvbSBhIGNsaWVudFxyXG4gICAgLy8gICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09XFxuSE9TVCAtIGRhdGEgZnJvbSBjbGllbnRcXG5cIiwgZGF0YSxcIlxcbj09PT09XCIpO1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gYW5zd2VyIHRoZSBwaW5nXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcclxuICAgIC8vICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgLy90aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vICAgICAgICAgLy8gY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAvLyAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCBjb25uLCBcIlBFRVJcIiwgcGVlcik7XHJcbiAgICAvLyAgICAgICAgIC8vICAgICBkZWxldGUgdGhpcy5wZWVyc1tjb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAvLyAgICAgZGVsZXRlIHRoaXMuY29ubnNbY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgLy8gICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy8gICAgICAgICAvLyB9LmJpbmQodGhpcykpO1xyXG4gICAgLy8gICAgICAgICAvL1xyXG4gICAgLy8gICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAvL1xyXG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIlNlbmRcIiwgZGF0YSk7XHJcbiAgICAvLyAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vIH07XHJcbiAgICAvL1xyXG4gICAgLy8gLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcclxuICAgIC8vIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XHJcbiAgICAvLyB9O1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZW5kVGVzdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgdGhpcy5zZW5kKFwiYXNkYXNkYXNkYXNkYXNcIik7XHJcbiAgICAvLyB9LmJpbmQodGhpcykpO1xyXG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoZGF0YS5wZWVycyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoW2RhdGEucGVlcklEXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
