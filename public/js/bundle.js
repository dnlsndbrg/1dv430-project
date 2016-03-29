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
var Ui = require("./Ui");
var Network = require("./webRTC");
var Circle = require("./Circle");
function Game() {
    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ui = new Ui(this);
    this.network = new Network(this);

    this.entitites = [];

    var last = 0;
    var dt;


    this.start = function(){
        this.entitites.push(new Circle());
        this.loop();
    };

    this.loop = function(timestamp){
        requestAnimationFrame(this.loop.bind(this)); // queue up next loop

        dt = timestamp - last; // time elapsed in ms since last loop
        last = timestamp;
        this.update(dt);
        this.render();
    };

    this.update = function(dt){
        this.entitites.forEach(function(entity) {
            entity.update(dt);
        });
    };

    this.render = function(){
        this.entitites.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));
    };

    //window.requestAnimationFrame(this.loop);

}

module.exports = Game;

},{"./Circle":1,"./Ui":3,"./webRTC":5}],3:[function(require,module,exports){
module.exports = function(game){
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
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    var game = new Game();
    game.start();
});

},{"./Game.js":2}],5:[function(require,module,exports){
module.exports = function(game){
    this.game = game;
    this.socket = io();
    this.peers = {};
    this.conns = {};
    this.gameID = document.querySelector("#gameID").textContent;

    this.socket.emit("hostStart", {gameID: gameID});

    this.socket.on("join", function(data) {
        // a peer wants to join. Create a new Peer and connect them
        this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
        this.peer.on("open", function(id) {
            this.conn = this.peer.connect(data.peerID);
            console.log(id, data.peerID);
            this.peers[id] = this.peer;
            this.conns[data.peerID] = this.conn;



            this.game.ui.updateClientList(this.peers);

            this.conn.on("close", function() {
                // a peer has disconnected
                console.log("disconnected!", this.conn, "PEER", this.peer);
                delete this.peers[this.conn.peer];
                delete this.conns[this.conn.peer];
                this.game.ui.updateClientList();
            });
        });
    });
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQ2lyY2xlLmpzIiwic3JjL2pzL0dhbWUuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy93ZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gQ2lyY2xlKCkge1xyXG4gICAgdGhpcy54ID0gMTA7XHJcbiAgICB0aGlzLnkgPSAxMDtcclxuICAgIHRoaXMucmFkaXVzID0gMTA7XHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZT0gZnVuY3Rpb24oZHQpe1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjYW52YXMsIGN0eCl7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJKjIpO1xyXG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7XHJcbiIsInZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoXCIuL3dlYlJUQ1wiKTtcclxudmFyIENpcmNsZSA9IHJlcXVpcmUoXCIuL0NpcmNsZVwiKTtcclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNcIik7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsodGhpcyk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGl0ZXMgPSBbXTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7XHJcbiAgICB2YXIgZHQ7XHJcblxyXG5cclxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuZW50aXRpdGVzLnB1c2gobmV3IENpcmNsZSgpKTtcclxuICAgICAgICB0aGlzLmxvb3AoKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5sb29wID0gZnVuY3Rpb24odGltZXN0YW1wKXtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wLmJpbmQodGhpcykpOyAvLyBxdWV1ZSB1cCBuZXh0IGxvb3BcclxuXHJcbiAgICAgICAgZHQgPSB0aW1lc3RhbXAgLSBsYXN0OyAvLyB0aW1lIGVsYXBzZWQgaW4gbXMgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgICAgbGFzdCA9IHRpbWVzdGFtcDtcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcbiAgICAgICAgdGhpcy5lbnRpdGl0ZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmVudGl0aXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKHRoaXMuY2FudmFzLCB0aGlzLmN0eCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH07XHJcblxyXG4gICAgLy93aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcCk7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZ2FtZSl7XHJcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NsaWVudHNcIik7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBlZXJzKSB7XHJcbiAgICAgICAgLy9UT0RPOiB1c2UgaGFuZGxlYmFyc1xyXG4gICAgICAgIHRoaXMuY2xpZW50TGlzdC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIGZvciAodmFyIGlkIGluIHBlZXJzKXtcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkKTtcclxuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50TGlzdC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIiwidmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lLmpzXCIpO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGdhbWUpe1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8oKTtcclxuICAgIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIHRoaXMuZ2FtZUlEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lSURcIikudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiBnYW1lSUR9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufTtcclxuIl19
