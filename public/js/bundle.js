(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Circle() {
    this.x = 10;
    this.y = 10;
    this.radius = 10;
    this.update = function(){

    };

    this.update= function(dt){

    };

    this.render = function(canvas, ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.closePath();
        ctx.fill();
    };
}

module.exports = Circle;

},{}],2:[function(require,module,exports){
module.exports = function Client(network){
    this.game = network.game;

    //this.socket = io();
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //this.gameID = document.querySelector("#gameID").textContent;

    this.peer.on("open", function(id) {
        // ive got my peerID and hostID, lets send it to the server to join
        this.game.network.socket.emit("join", {peerID: id, gameID: this.game.gameID});
    }.bind(this));

    this.peer.on("connection", function(conn) {
        // the server has started the connection
        console.log("connection from server", conn);

        conn.on("data", function(data) {
            console.log("RECEIVED!", data);
        });
    });
};

},{}],3:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./WebRTC");
var Circle = require("./Circle"); // test entity

function Game() {
    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");

    this.gameID = document.querySelector("#gameID").textContent;

    this.ui = new Ui(this);
    this.network = new Network(this);

    this.entitites = []; // game entities

    var last = 0; // time variable
    var dt; //delta time

    this.start = function(){
        this.entitites.push(new Circle());
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
     * Update entities
     */
    this.update = function(dt){
        this.entitites.forEach(function(entity) {
            entity.update(dt);
        });
    };

    /**
     * Rendering
     */
    this.render = function(){
        this.entitites.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));
    };
}

module.exports = Game;

},{"./Circle":1,"./Ui":5,"./WebRTC":6}],4:[function(require,module,exports){
module.exports = function Host(network){
    this.game = network.game;
    //this.socket = io();
    this.peers = {};
    this.conns = {};
    //this.gameID = document.querySelector("#gameID").textContent;

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

            this.send("new user joined! id:" + conn);

            //this.game.ui.updateClientList(this.peers);

            // conn.on("close", function() {
            //     // a peer has disconnected
            //     console.log("disconnected!", conn, "PEER", peer);
            //     delete this.peers[conn.peer];
            //     delete this.conns[conn.peer];
            //     this.game.ui.updateClientList(this.peers);
            // }.bind(this));
        }.bind(this));
    }.bind(this));

    this.send = function(data) {
        console.log("Send", data);
        for (var conn in this.conns){
            this.conns[conn].send(data);
        }
    };
};

},{}],5:[function(require,module,exports){
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
var Client = require("./Client");
var Host = require("./Host");

module.exports = function WebRTC(game){
    this.game = game;
    this.socket = io();

    if (document.querySelector("#host") !== null) {
        //im the host
        this.mode = new Host(this);
    } else {
        // im a client
        this.mode = new Client(this);
    }

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

},{"./Client":2,"./Host":4}],7:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    var game = new Game();
    game.start();
});

},{"./Game.js":3}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQ2lyY2xlLmpzIiwic3JjL2pzL0NsaWVudC5qcyIsInNyYy9qcy9HYW1lLmpzIiwic3JjL2pzL0hvc3QuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvV2ViUlRDLmpzIiwic3JjL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIENpcmNsZSgpIHtcclxuICAgIHRoaXMueCA9IDEwO1xyXG4gICAgdGhpcy55ID0gMTA7XHJcbiAgICB0aGlzLnJhZGl1cyA9IDEwO1xyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy51cGRhdGU9IGZ1bmN0aW9uKGR0KXtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY2FudmFzLCBjdHgpe1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSoyKTtcclxuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENsaWVudChuZXR3b3JrKXtcclxuICAgIHRoaXMuZ2FtZSA9IG5ldHdvcmsuZ2FtZTtcclxuXHJcbiAgICAvL3RoaXMuc29ja2V0ID0gaW8oKTtcclxuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcbiAgICAvL3RoaXMuZ2FtZUlEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lSURcIikudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBob3N0SUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW5cclxuICAgICAgICB0aGlzLmdhbWUubmV0d29yay5zb2NrZXQuZW1pdChcImpvaW5cIiwge3BlZXJJRDogaWQsIGdhbWVJRDogdGhpcy5nYW1lLmdhbWVJRH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcclxuICAgICAgICAvLyB0aGUgc2VydmVyIGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIGNvbm4pO1xyXG5cclxuICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUkVDRUlWRUQhXCIsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn07XHJcbiIsInZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoXCIuL1dlYlJUQ1wiKTtcclxudmFyIENpcmNsZSA9IHJlcXVpcmUoXCIuL0NpcmNsZVwiKTsgLy8gdGVzdCBlbnRpdHlcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5nYW1lSUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVJRFwiKS50ZXh0Q29udGVudDtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsodGhpcyk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGl0ZXMgPSBbXTsgLy8gZ2FtZSBlbnRpdGllc1xyXG5cclxuICAgIHZhciBsYXN0ID0gMDsgLy8gdGltZSB2YXJpYWJsZVxyXG4gICAgdmFyIGR0OyAvL2RlbHRhIHRpbWVcclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmVudGl0aXRlcy5wdXNoKG5ldyBDaXJjbGUoKSk7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcbiAgICAgICAgZHQgPSB0aW1lc3RhbXAgLSBsYXN0OyAvLyB0aW1lIGVsYXBzZWQgaW4gbXMgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgICAgbGFzdCA9IHRpbWVzdGFtcDtcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgZW50aXRpZXNcclxuICAgICAqL1xyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcbiAgICAgICAgdGhpcy5lbnRpdGl0ZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmVudGl0aXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKHRoaXMuY2FudmFzLCB0aGlzLmN0eCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KG5ldHdvcmspe1xyXG4gICAgdGhpcy5nYW1lID0gbmV0d29yay5nYW1lO1xyXG4gICAgLy90aGlzLnNvY2tldCA9IGlvKCk7XHJcbiAgICB0aGlzLnBlZXJzID0ge307XHJcbiAgICB0aGlzLmNvbm5zID0ge307XHJcbiAgICAvL3RoaXMuZ2FtZUlEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lSURcIikudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgbmV0d29yay5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWUuZ2FtZUlEfSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHVzZXIgaGFzIGpvaW5lZC4gZXN0YWJsaXNoIGEgbmV3IHBlZXIgY29ubmVjdGlvbiB3aXRoIGl0XHJcbiAgICAqL1xyXG4gICAgbmV0d29yay5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgICAgIHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgICAgICBwZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgICAgICB2YXIgY29ubiA9ICBwZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHBlZXI7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gY29ubjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChcIm5ldyB1c2VyIGpvaW5lZCEgaWQ6XCIgKyBjb25uKTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIGNvbm4sIFwiUEVFUlwiLCBwZWVyKTtcclxuICAgICAgICAgICAgLy8gICAgIGRlbGV0ZSB0aGlzLnBlZXJzW2Nvbm4ucGVlcl07XHJcbiAgICAgICAgICAgIC8vICAgICBkZWxldGUgdGhpcy5jb25uc1tjb25uLnBlZXJdO1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAgICAgICAgIC8vIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2VuZFwiLCBkYXRhKTtcclxuICAgICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xyXG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcclxuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xpZW50c1wiKTtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGVlcnMpIHtcclxuICAgICAgICAvL1RPRE86IHVzZSBoYW5kbGViYXJzXHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGVlcnMpe1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQpO1xyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQyhnYW1lKXtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvKCk7XHJcblxyXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaG9zdFwiKSAhPT0gbnVsbCkge1xyXG4gICAgICAgIC8vaW0gdGhlIGhvc3RcclxuICAgICAgICB0aGlzLm1vZGUgPSBuZXcgSG9zdCh0aGlzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaW0gYSBjbGllbnRcclxuICAgICAgICB0aGlzLm1vZGUgPSBuZXcgQ2xpZW50KHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXJzID0ge307XHJcbiAgICAvLyB0aGlzLmNvbm5zID0ge307XHJcbiAgICAvLyB0aGlzLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcbiAgICAvLyAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4gPSB0aGlzLnBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGlkLCBkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gdGhpcy5wZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IHRoaXMuY29ubjtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGEgcGVlciBoYXMgZGlzY29ubmVjdGVkXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgdGhpcy5jb25uLCBcIlBFRVJcIiwgdGhpcy5wZWVyKTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlZXJzW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5zW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KCk7XHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gfSk7XHJcbn07XHJcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgZ2FtZS5zdGFydCgpO1xyXG59KTtcclxuIl19
