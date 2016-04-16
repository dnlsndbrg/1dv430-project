(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player");

function Game() {
    this.started = false;

    this.width = 240;
    this.height = 320;

    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px serif";

    this.gameID = window.location.pathname.split("/")[2];

    this.ui = new Ui(this);
    this.network = new Network();

    this.entities = []; // game entities
    this.players = {};

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

        // update and render game
        this.update(dt);
        this.render();

        // networking update
        if (this.network.host) {
            this.network.host.update(dt); // if im the host do host stuff
        } else {
            this.network.client.update(dt); // else update client stuff
        }
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

Game.prototype.addPlayer = function(data){

    // check if player already exists.
    if(data.id in this.players) return;

    var newPlayer = new Player(data);
    this.entities.push(newPlayer);
    this.players[data.id] = newPlayer;

    this.ui.updateClientList(this.players);

    return newPlayer;
};

Game.prototype.removePlayer = function(data) {
    console.log("game removing player", data);

    // remove from players object
    delete this.players[data.id];

    // remove from entitites array
    for (var i = 0; i <= this.entities.length; i += 1) {
        if (this.entities[i].id === data.id) {
            console.log("found him , removing");
            this.entities.splice(i, 1);
            break;
        }
    }

    this.ui.updateClientList(this.players);
};

Game.prototype.getGameState = function() {
    return {
        // entities: this.entities.map(function(entity) {
        //     console.log("entity:", entity);
        //     return JSON.stringify(entity);
        // }),
        entities: this.entities.map(function(entity) { return entity.getState();        }),
        //players: Object.keys(this.players).map(function(key){ return JSON.stringify(window.game.players[key]); })
        players: this.getPlayersState()
    };
};

Game.prototype.getPlayersState = function() {
    return Object.keys(this.players).map(function(key){ return window.game.players[key].getState(); });
};

module.exports = Game;

},{"./Player":5,"./Ui":6,"./webRTC/WebRTC":11}],2:[function(require,module,exports){
function Keyboard(player){
    this.player = player;

    this.keys = {
        w: false,
        s: false,
        a: false,
        d: false
    };

    this.lastState = _.clone(this.keys);

    this.keyDownHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (this.keys.w !== true){
                    console.log("AAASDOKASODKASODKAOSKDOASK");
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



module.exports = Keyboard;

},{}],3:[function(require,module,exports){
function Mouse(player){
    this.player = player;
    this.click = function(e){
        this.player.turnTowards(e.offsetX, e.offsetY);

        window.game.network.client.actions.push({
            action: "turnTowards",
            data: {
                x: e.offsetX,
                y: e.offsetY
            }
        });
    };
    //
    // this.keyUpHandler = function(e){
    //     switch(e.keyCode) {
    //         case 87: // W
    //             if (this.keys.w === true){
    //                 window.game.network.client.conn.send( {event: "keyUp", key: 87} );
    //                 this.keys.w = false;
    //             }
    //             break;
    //         case 83: // S
    //             console.log("S");
    //     }
    // };

    window.game.canvas.addEventListener("click",this.click.bind(this));
    //window.game.canvas.addEventListener("keyup",this.keyUpHandler.bind(this), false);
}



module.exports = Mouse;

},{}],4:[function(require,module,exports){
function Controls() {

}

module.exports = Controls;

},{}],5:[function(require,module,exports){
var helpers = require("./helpers");
var Mouse = require("./Mouse");
var Keyboard = require("./Keyboard");
var NetworkControls = require("./NetworkControls");

function Player(playerData) {
    this.id = playerData.id;
    this.radius = playerData.radius || 20; // circle radius
    this.x = playerData.x || (Math.floor(Math.random() * (window.game.width - this.radius)) + this.radius / 2);
    this.y = playerData.y || (Math.floor(Math.random() * (window.game.height - this.radius)) + this.radius / 2);
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 10;

    this.keys = null;

    this.actions = [];
    this.lastState = this.getState();

    //is this me or another player
    this.controls = (playerData.id === window.game.network.client.peer.id) ? {mouse: new Mouse(this), keyboard: new Keyboard(this)} : new NetworkControls();

    console.log("Spawning player at", this.x, this.y);
}

Player.prototype.update = function(dt){

    // go through all the queued up actions and perform them
    for (var i = 0; i < this.actions.length; i += 1){
        for (var j = 0; j < this.actions[i].data.length; j += 1){
                    var action = this.actions[i].data[j];
                    this.performAction(action);
        }
    }

    this.actions = [];
};

Player.prototype.change = function(change){
    // changes from the host
    console.log("update", this, "with ", change);

    delete change.playerID;
    for (var key in change) {
        this[key] = change[key];
    }
};

Player.prototype.performAction = function(action){
    switch(action.action){
        case "turnTowards":
            this.turnTowards(action.data.x, action.data.y);
            break;
    }
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

Player.prototype.turnTowards = function(x,y) {
    console.log("turn towards",x,y);
    console.log("im at", this.x, this.y, "and looking in direction", this.direction);

    var xDiff = x - this.x;
    var yDiff = y - this.y;
    this.direction = Math.atan2(yDiff, xDiff) * (180 / Math.PI);

    console.log(xDiff, yDiff, this.direction);
};

Player.prototype.getState = function() {
    return {
        x: this.x,
        y: this.y,
        id: this.id,
        radius: this.radius,
        direction: this.direction,
        viewingAngle: this.viewingAngle,
        speed: this.speed
    };
};

module.exports = Player;

},{"./Keyboard":2,"./Mouse":3,"./NetworkControls":4,"./helpers":7}],6:[function(require,module,exports){
module.exports = function Ui(game){
    this.clientList = document.querySelector("#players");
    this.game = game;

    this.updateClientList = function(players) {

        var myID = window.game.network.client.peer.id;

        //var hostID = window.game.network.client.conn.peer;

        //TODO: use handlebars
        this.clientList.innerHTML = "";
        for (var id in players){
            var li = document.createElement("li");
            var content = document.createTextNode(id);

            if (id === myID) {
                li.classList.add("me");
            }
            li.appendChild(content);
            this.clientList.appendChild(li);
        }
    };
};

},{}],7:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * Math.PI / 180;
}


module.exports = {
    toRadians: toRadians
};

},{}],8:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":1}],9:[function(require,module,exports){
"use strict";
// var Player = require("./../Player");

function Client(){
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

    // Stress test
    this.testsReceived = 0;

    this.actions = []; //here we will store client actions before we send them to the host
    this.changes = []; // here we will store received changes from the host

    this.peer.on("open", function(id) {
        // ive got my peerID and gameID, lets send it to the server to join the host
        window.game.network.socket.emit("join", {peerID: id, gameID: window.game.gameID});
        console.log("my client peerID is ", id);
    });

    this.peer.on("connection", function(conn) {
        // the host has started the connection

        // close out any old connections
        if(Object.keys(this.connections).length > 1) {
            for (var connPeer in this.connections){
                if (connPeer !== conn.peer) {
                    this.connections[connPeer][0].close();
                    delete this.connections[connPeer];
                }
            }
        }
        // store it
        window.game.network.client.conn = conn;

        conn.on("data", function(data) {
            switch(data.event){
                case "playerJoined":
                    console.log("player joined", data);
                    window.game.addPlayer(data.playerData);
                    break;

                case "test": // stress testing
                    console.log("test!");
                    //window.game.network.client.testsReceived += 1;
                    break;

                case "gameState":
                    console.log("receiving game state", data.gameState.entities, data.gameState.players);
                    data.gameState.players.forEach(function(player){
                        window.game.addPlayer(player);
                    });
                    break;

                case "changes":
                    console.log("Hey there has been changes!", data);
                    window.game.network.client.changes.push(data.changes);
                    break;

                case "ping": // host sent a ping, answer it
                   conn.send({ event: "pong", timestamp: data.timestamp });
                   break;

               case "pong": // we've received a pong from the host, calucate pingtime
                   var ping = Date.now() - data.timestamp;
                   window.game.network.ping = ping;
                   break;
            }
        });


    });
}

Client.prototype.update = function()
{
    // check if my keystate has changed
    var myPlayer = window.game.players[this.peer.id];

     if (!_.isEqual(myPlayer.controls.keyboard.keys, myPlayer.controls.keyboard.lastState)) {
        // send keystate to host
     }

    myPlayer.controls.keyboard.lastState = _.clone(myPlayer.controls.keyboard.keys);


    if (this.actions.length > 0) {
        // send all performed actions to the host
        this.conn.send({
            event: "actions",
            data: this.actions
        });
        this.actions = []; // clear actions queue
    }

    // update with changes received from host
    for (var i = 0; i < this.changes.length; i += 1) {
        for (var j = 0; j < this.changes[i].length; j += 1)  {
            var change = this.changes[i][j];
            window.game.players[change.playerID].change(change);
        }
    }

    this.changes = [];

};

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

module.exports = Client;

},{}],10:[function(require,module,exports){
module.exports = function Host(){
    this.conns = {};
    this.actions = {}; // here we will store all the actions received from clients
    this.lastPlayersState = [];
    this.bajs = 0;
    this.diff = null;

    this.connect = function(peers){
        console.log("connect", peers);
        this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

        this.peer.on("open", function() {

            // create the hosts player object if it doesnt already exists
            if (!(window.game.network.client.peer.id in window.game.players)) {
                window.game.addPlayer({id: window.game.network.client.peer.id});
            }

            // send a ping every 2 seconds, to track ping time
            setInterval(function(){
                window.game.network.host.broadcast({event: "ping", timestamp: Date.now()});
            },2000);

            peers.forEach(function(peerID) {
                //connect with each remote peer
                var conn =  window.game.network.host.peer.connect(peerID);
                console.log("hostID:", window.game.network.host.peer.id, " connect with", peerID);
                //window.game.network.host.peers[peerID] = peer;
                window.game.network.host.conns[peerID] = conn;

                // create the player
                var newPlayer = window.game.addPlayer({id: conn.peer});

                conn.on("open", function() {
                    // send new player data to everyone
                    if (newPlayer) {
                        window.game.network.host.broadcast({ event: "playerJoined", playerData: newPlayer.getState() });
                        // send the new player the full game state
                        window.game.network.host.emit( {clientID: conn.peer, event: "gameState", gameState: window.game.getGameState()} );
                    }
                });

                conn.on("close", function() {
                    delete window.game.network.host.conns[conn.peer];
                    window.game.network.host.broadcast({ event: "playerLeft", id: conn.peer});
                    window.game.removePlayer({id: conn.peer});
                });

                conn.on("error", function(err) {
                    console.log("ERROR EVENT", err);
                });

                conn.on("data", function(data) {
                    switch(data.event){
                        case "ping":
                           conn.send({ event: "pong", timestamp: data.timestamp }); // answer the ping
                           break;

                       case "pong": // we've received a pong from the client, calucate pingtime
                           var ping = Date.now() - data.timestamp;
                           window.game.players[conn.peer].ping = ping;
                           break;

                       case "actions": // receiving actions from a player
                           console.log("actions received from", conn.peer, data);
                           window.game.players[conn.peer].actions.push(data);
                           break;
                    }
                });
            });
        });
    };

    this.broadcast = function(data) {
        for (var conn in this.conns){
            //console.log("SEND!", conn, data);
            this.conns[conn].send(data);
        }
    };

    // just send data to a specific client
    this.emit = function(data) {
        console.log("EMIT!", data);
        this.conns[data.clientID].send(data);
    };


    document.querySelector("#btnTest").addEventListener("click", function(){
        window.game.network.host.broadcast({event: "test", message: "asdasdas"});
    });

    this.update = function()
    {
        // get the difference since last time

        var currentPlayersState = [];
        var changes = [];

        for (var key in window.game.players) {
            var lastState = window.game.players[key].lastState;
            var newState = window.game.players[key].getState();

            // compare this players new state with it's last state
            var change = _.omit(newState, function(v,k) { return lastState[k] === v; });
            if (!_.isEmpty(change)) {
                // there's been changes
                console.log("changes!!!!!!!!!!!!!!!!!!");
                change.playerID = window.game.players[key].id;
                changes.push(change);
            }

            window.game.players[key].lastState = newState;
        }


        //
        // for(var i = 0; i < this.lastPlayersState.length; i += 1){
        //
        //     // get the players last and new state
        //     var id = this.lastPlayersState[i].id;
        //     var lastState = this.lastPlayersState[i];
        //     var newState = window.game.players[id].getState();
        //
        //
        //
        //     // compare this players new state with it's last state
        //     var change = _.omit(newState, function(v,k) { return lastState[k] === v; });
        //     if (!_.isEmpty(change)) {
        //         // there's been changes
        //         console.log("changes!!!!!!!!!!!!!!!!!!");
        //         change.playerID = id;
        //         changes.push(change);
        //     }
        //
        //     currentPlayersState.push(newState);
        // }
        //
        // this.lastPlayersState = currentPlayersState;
        // if (this.lastPlayersState.length === 0) this.lastPlayersState = window.game.getPlayersState(); // if newly started game..


        if (changes.length > 0){
             console.log("changes!", changes);
            // there are changes
            this.broadcast({
                event: "changes",
                changes: changes
            });
        }

        //console.log(currentPlayersState);
        //
        // compare current state to earlier getGameState
        // send difference to players

        // window.game.players.forEach(function(player) {
        //
        // });

        // send actions to all clients
        // this.broadcast({
        //     event: "actions",
        //     actions:
        // })

    };
};















// // stress test
// setInterval(function(){
//     window.game.network.host.broadcast({
//         type: "test",
//         data: "asdasdas dasdsadas dasasdasd asdasd asdadsdqw23qwklp gklp"
//     });
// },16);
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

},{}],11:[function(require,module,exports){
var Client = require("./Client");
var Host = require("./Host");

module.exports = function WebRTC(){
    this.ping = 0;
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

},{"./Client":9,"./Host":10}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2hlbHBlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy93ZWJSVEMvQ2xpZW50LmpzIiwic3JjL2pzL3dlYlJUQy9Ib3N0LmpzIiwic3JjL2pzL3dlYlJUQy9XZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSAyNDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDMyMDtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCIxNnB4IHNlcmlmXCI7XHJcblxyXG4gICAgdGhpcy5nYW1lSUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpWzJdO1xyXG5cclxuICAgIHRoaXMudWkgPSBuZXcgVWkodGhpcyk7XHJcbiAgICB0aGlzLm5ldHdvcmsgPSBuZXcgTmV0d29yaygpO1xyXG5cclxuICAgIHRoaXMuZW50aXRpZXMgPSBbXTsgLy8gZ2FtZSBlbnRpdGllc1xyXG4gICAgdGhpcy5wbGF5ZXJzID0ge307XHJcblxyXG4gICAgdmFyIGxhc3QgPSAwOyAvLyB0aW1lIHZhcmlhYmxlXHJcbiAgICB2YXIgZHQ7IC8vZGVsdGEgdGltZVxyXG5cclxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMubG9vcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdhbWUgbG9vcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApe1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxyXG5cclxuICAgICAgICBkdCA9IHRpbWVzdGFtcCAtIGxhc3Q7IC8vIHRpbWUgZWxhcHNlZCBpbiBtcyBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgYW5kIHJlbmRlciBnYW1lXHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIG5ldHdvcmtpbmcgdXBkYXRlXHJcbiAgICAgICAgaWYgKHRoaXMubmV0d29yay5ob3N0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5ob3N0LnVwZGF0ZShkdCk7IC8vIGlmIGltIHRoZSBob3N0IGRvIGhvc3Qgc3R1ZmZcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ldHdvcmsuY2xpZW50LnVwZGF0ZShkdCk7IC8vIGVsc2UgdXBkYXRlIGNsaWVudCBzdHVmZlxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGZwc1xyXG4gICAgICAgIHRoaXMuZnBzID0gTWF0aC5yb3VuZCgxMDAwIC8gZHQpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUoZHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcmluZ1xyXG4gICAgICovXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGFsbCBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlbmRlcih0aGlzLmNhbnZhcywgdGhpcy5jdHgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIC8vIHJlbmRlciBmcHMgYW5kIHBpbmdcclxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoXCJGUFM6ICBcIiArIHRoaXMuZnBzLCAxMCwgMjApO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB0aGlzLm5ldHdvcmsucGluZywgMTAsIDQyKTtcclxuICAgIH07XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLmFkZFBsYXllciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIHBsYXllciBhbHJlYWR5IGV4aXN0cy5cclxuICAgIGlmKGRhdGEuaWQgaW4gdGhpcy5wbGF5ZXJzKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIoZGF0YSk7XHJcbiAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3UGxheWVyKTtcclxuICAgIHRoaXMucGxheWVyc1tkYXRhLmlkXSA9IG5ld1BsYXllcjtcclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3UGxheWVyO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUucmVtb3ZlUGxheWVyID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coXCJnYW1lIHJlbW92aW5nIHBsYXllclwiLCBkYXRhKTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBwbGF5ZXJzIG9iamVjdFxyXG4gICAgZGVsZXRlIHRoaXMucGxheWVyc1tkYXRhLmlkXTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBlbnRpdGl0ZXMgYXJyYXlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5pZCA9PT0gZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGhpbSAsIHJlbW92aW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0R2FtZVN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC8vIGVudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJlbnRpdHk6XCIsIGVudGl0eSk7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShlbnRpdHkpO1xyXG4gICAgICAgIC8vIH0pLFxyXG4gICAgICAgIGVudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHsgcmV0dXJuIGVudGl0eS5nZXRTdGF0ZSgpOyAgICAgICAgfSksXHJcbiAgICAgICAgLy9wbGF5ZXJzOiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkod2luZG93LmdhbWUucGxheWVyc1trZXldKTsgfSlcclxuICAgICAgICBwbGF5ZXJzOiB0aGlzLmdldFBsYXllcnNTdGF0ZSgpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0UGxheWVyc1N0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRTdGF0ZSgpOyB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiZnVuY3Rpb24gS2V5Ym9hcmQocGxheWVyKXtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG5cclxuICAgIHRoaXMua2V5cyA9IHtcclxuICAgICAgICB3OiBmYWxzZSxcclxuICAgICAgICBzOiBmYWxzZSxcclxuICAgICAgICBhOiBmYWxzZSxcclxuICAgICAgICBkOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmxhc3RTdGF0ZSA9IF8uY2xvbmUodGhpcy5rZXlzKTtcclxuXHJcbiAgICB0aGlzLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLncgIT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQUFBU0RPS0FTT0RLQVNPREtBT1NLRE9BU0tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLncgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLncgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy53ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcclxufVxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xyXG4iLCJmdW5jdGlvbiBNb3VzZShwbGF5ZXIpe1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIudHVyblRvd2FyZHMoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xyXG5cclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLnB1c2goe1xyXG4gICAgICAgICAgICBhY3Rpb246IFwidHVyblRvd2FyZHNcIixcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgeDogZS5vZmZzZXRYLFxyXG4gICAgICAgICAgICAgICAgeTogZS5vZmZzZXRZXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5rZXlVcEhhbmRsZXIgPSBmdW5jdGlvbihlKXtcclxuICAgIC8vICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XHJcbiAgICAvLyAgICAgICAgIGNhc2UgODc6IC8vIFdcclxuICAgIC8vICAgICAgICAgICAgIGlmICh0aGlzLmtleXMudyA9PT0gdHJ1ZSl7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5zZW5kKCB7ZXZlbnQ6IFwia2V5VXBcIiwga2V5OiA4N30gKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLmtleXMudyA9IGZhbHNlO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAvLyAgICAgICAgIGNhc2UgODM6IC8vIFNcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU1wiKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9O1xyXG5cclxuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgLy93aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG59XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XHJcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xyXG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcclxudmFyIEtleWJvYXJkID0gcmVxdWlyZShcIi4vS2V5Ym9hcmRcIik7XHJcbnZhciBOZXR3b3JrQ29udHJvbHMgPSByZXF1aXJlKFwiLi9OZXR3b3JrQ29udHJvbHNcIik7XHJcblxyXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IHBsYXllckRhdGEuaWQ7XHJcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwOyAvLyBjaXJjbGUgcmFkaXVzXHJcbiAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS53aWR0aCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xyXG4gICAgdGhpcy55ID0gcGxheWVyRGF0YS55IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUuaGVpZ2h0IC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xyXG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcclxuICAgIHRoaXMuc3BlZWQgPSBwbGF5ZXJEYXRhLnNwZWVkIHx8IDEwO1xyXG5cclxuICAgIHRoaXMua2V5cyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5hY3Rpb25zID0gW107XHJcbiAgICB0aGlzLmxhc3RTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKTtcclxuXHJcbiAgICAvL2lzIHRoaXMgbWUgb3IgYW5vdGhlciBwbGF5ZXJcclxuICAgIHRoaXMuY29udHJvbHMgPSAocGxheWVyRGF0YS5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgPyB7bW91c2U6IG5ldyBNb3VzZSh0aGlzKSwga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZCh0aGlzKX0gOiBuZXcgTmV0d29ya0NvbnRyb2xzKCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJTcGF3bmluZyBwbGF5ZXIgYXRcIiwgdGhpcy54LCB0aGlzLnkpO1xyXG59XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuXHJcbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGlvbnMubGVuZ3RoOyBpICs9IDEpe1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5hY3Rpb25zW2ldLmRhdGEubGVuZ3RoOyBqICs9IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb24gPSB0aGlzLmFjdGlvbnNbaV0uZGF0YVtqXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1BY3Rpb24oYWN0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hY3Rpb25zID0gW107XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNoYW5nZSA9IGZ1bmN0aW9uKGNoYW5nZSl7XHJcbiAgICAvLyBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcclxuICAgIGNvbnNvbGUubG9nKFwidXBkYXRlXCIsIHRoaXMsIFwid2l0aCBcIiwgY2hhbmdlKTtcclxuXHJcbiAgICBkZWxldGUgY2hhbmdlLnBsYXllcklEO1xyXG4gICAgZm9yICh2YXIga2V5IGluIGNoYW5nZSkge1xyXG4gICAgICAgIHRoaXNba2V5XSA9IGNoYW5nZVtrZXldO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5wZXJmb3JtQWN0aW9uID0gZnVuY3Rpb24oYWN0aW9uKXtcclxuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcclxuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcclxuICAgICAgICAgICAgdGhpcy50dXJuVG93YXJkcyhhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGNhbnZhcywgY3R4KXtcclxuICAgIC8vZHJhdyBjaXJjbGVcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBoZWxwZXJzLnRvUmFkaWFucygzNjApLCBmYWxzZSk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICAvLyBkcmF3IHZpZXdpbmcgZGlyZWN0aW9uXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcclxuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksdGhpcy5yYWRpdXMsIGhlbHBlcnMudG9SYWRpYW5zKHRoaXMuZGlyZWN0aW9uIC0gdGhpcy52aWV3aW5nQW5nbGUpLCBoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbiArIHRoaXMudmlld2luZ0FuZ2xlKSk7XHJcbiAgICBjdHgubGluZVRvKHRoaXMueCwgdGhpcy55KTtcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xyXG4gICAgY3R4LmZpbGwoKTtcclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUudHVyblRvd2FyZHMgPSBmdW5jdGlvbih4LHkpIHtcclxuICAgIGNvbnNvbGUubG9nKFwidHVybiB0b3dhcmRzXCIseCx5KTtcclxuICAgIGNvbnNvbGUubG9nKFwiaW0gYXRcIiwgdGhpcy54LCB0aGlzLnksIFwiYW5kIGxvb2tpbmcgaW4gZGlyZWN0aW9uXCIsIHRoaXMuZGlyZWN0aW9uKTtcclxuXHJcbiAgICB2YXIgeERpZmYgPSB4IC0gdGhpcy54O1xyXG4gICAgdmFyIHlEaWZmID0geSAtIHRoaXMueTtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpICogKDE4MCAvIE1hdGguUEkpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHhEaWZmLCB5RGlmZiwgdGhpcy5kaXJlY3Rpb24pO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgIGlkOiB0aGlzLmlkLFxyXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXHJcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcclxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxyXG4gICAgICAgIHNwZWVkOiB0aGlzLnNwZWVkXHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVWkoZ2FtZSl7XHJcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcclxuXHJcbiAgICAgICAgdmFyIG15SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkO1xyXG5cclxuICAgICAgICAvL3ZhciBob3N0SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnBlZXI7XHJcblxyXG4gICAgICAgIC8vVE9ETzogdXNlIGhhbmRsZWJhcnNcclxuICAgICAgICB0aGlzLmNsaWVudExpc3QuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBmb3IgKHZhciBpZCBpbiBwbGF5ZXJzKXtcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpZCA9PT0gbXlJRCkge1xyXG4gICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcIm1lXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudExpc3QuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcbiIsIi8vIGRlZ3JlZXMgdG8gcmFkaWFuc1xyXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XHJcbiAgICByZXR1cm4gZGVnICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgdG9SYWRpYW5zOiB0b1JhZGlhbnNcclxufTtcclxuIiwidmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lLmpzXCIpO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5zdGFydCgpO1xyXG59KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XHJcblxyXG5mdW5jdGlvbiBDbGllbnQoKXtcclxuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcblxyXG4gICAgLy8gU3RyZXNzIHRlc3RcclxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XHJcblxyXG4gICAgdGhpcy5hY3Rpb25zID0gW107IC8vaGVyZSB3ZSB3aWxsIHN0b3JlIGNsaWVudCBhY3Rpb25zIGJlZm9yZSB3ZSBzZW5kIHRoZW0gdG8gdGhlIGhvc3RcclxuICAgIHRoaXMuY2hhbmdlcyA9IFtdOyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgY2hhbmdlcyBmcm9tIHRoZSBob3N0XHJcblxyXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBnYW1lSUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW4gdGhlIGhvc3RcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xyXG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXHJcblxyXG4gICAgICAgIC8vIGNsb3NlIG91dCBhbnkgb2xkIGNvbm5lY3Rpb25zXHJcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcclxuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl1bMF0uY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3RvcmUgaXRcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcclxuXHJcbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVySm9pbmVkXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgam9pbmVkXCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0ZXN0XCI6IC8vIHN0cmVzcyB0ZXN0aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0IVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnRlc3RzUmVjZWl2ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWNlaXZpbmcgZ2FtZSBzdGF0ZVwiLCBkYXRhLmdhbWVTdGF0ZS5lbnRpdGllcywgZGF0YS5nYW1lU3RhdGUucGxheWVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5nYW1lU3RhdGUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihwbGF5ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5wdXNoKGRhdGEuY2hhbmdlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjogLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XHJcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxyXG4gICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgfSk7XHJcbn1cclxuXHJcbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxyXG57XHJcbiAgICAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxyXG4gICAgdmFyIG15UGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xyXG5cclxuICAgICBpZiAoIV8uaXNFcXVhbChteVBsYXllci5jb250cm9scy5rZXlib2FyZC5rZXlzLCBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUpKSB7XHJcbiAgICAgICAgLy8gc2VuZCBrZXlzdGF0ZSB0byBob3N0XHJcbiAgICAgfVxyXG5cclxuICAgIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSA9IF8uY2xvbmUobXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQua2V5cyk7XHJcblxyXG5cclxuICAgIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vIHNlbmQgYWxsIHBlcmZvcm1lZCBhY3Rpb25zIHRvIHRoZSBob3N0XHJcbiAgICAgICAgdGhpcy5jb25uLnNlbmQoe1xyXG4gICAgICAgICAgICBldmVudDogXCJhY3Rpb25zXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuYWN0aW9uc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBjbGVhciBhY3Rpb25zIHF1ZXVlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmNoYW5nZXNbaV0ubGVuZ3RoOyBqICs9IDEpICB7XHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV1bal07XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XHJcblxyXG59O1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcclxuICAgIC8vICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxyXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAvL2NyZWF0ZSB0aGUgcGxheWVyXHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XHJcbiAgICAvLyAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcclxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXHJcbiAgICAvLyAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcclxuICAgIC8vICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIC8vIHBpbmcgdGVzdFxyXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XHJcbiAgICAvLyAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXHJcbiAgICAvLyAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSwgMjAwMCk7XHJcbiAgICAvL1xyXG4gICAgLy8gfSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XHJcbiAgICB0aGlzLmNvbm5zID0ge307XHJcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIGFsbCB0aGUgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGNsaWVudHNcclxuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xyXG4gICAgdGhpcy5iYWpzID0gMDtcclxuICAgIHRoaXMuZGlmZiA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5jb25uZWN0ID0gZnVuY3Rpb24ocGVlcnMpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdFwiLCBwZWVycyk7XHJcbiAgICAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgaG9zdHMgcGxheWVyIG9iamVjdCBpZiBpdCBkb2VzbnQgYWxyZWFkeSBleGlzdHNcclxuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzZW5kIGEgcGluZyBldmVyeSAyIHNlY29uZHMsIHRvIHRyYWNrIHBpbmcgdGltZVxyXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7ZXZlbnQ6IFwicGluZ1wiLCB0aW1lc3RhbXA6IERhdGUubm93KCl9KTtcclxuICAgICAgICAgICAgfSwyMDAwKTtcclxuXHJcbiAgICAgICAgICAgIHBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XHJcbiAgICAgICAgICAgICAgICAvL2Nvbm5lY3Qgd2l0aCBlYWNoIHJlbW90ZSBwZWVyXHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubiA9ICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5jb25uZWN0KHBlZXJJRCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xyXG4gICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbcGVlcklEXSA9IHBlZXI7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbcGVlcklEXSA9IGNvbm47XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25uLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIG5ldyBwbGF5ZXIgZGF0YSB0byBldmVyeW9uZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckpvaW5lZFwiLCBwbGF5ZXJEYXRhOiBuZXdQbGF5ZXIuZ2V0U3RhdGUoKSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5lbWl0KCB7Y2xpZW50SUQ6IGNvbm4ucGVlciwgZXZlbnQ6IFwiZ2FtZVN0YXRlXCIsIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKCl9ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBFVkVOVFwiLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pOyAvLyBhbnN3ZXIgdGhlIHBpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBjbGllbnQsIGNhbHVjYXRlIHBpbmd0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYWN0aW9uc1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWN0aW9ucyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlNFTkQhXCIsIGNvbm4sIGRhdGEpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxyXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRU1JVCFcIiwgZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNidG5UZXN0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe2V2ZW50OiBcInRlc3RcIiwgbWVzc2FnZTogXCJhc2Rhc2Rhc1wifSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXHJcblxyXG4gICAgICAgIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XHJcbiAgICAgICAgdmFyIGNoYW5nZXMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3RTdGF0ZSA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5sYXN0U3RhdGU7XHJcbiAgICAgICAgICAgIHZhciBuZXdTdGF0ZSA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gY29tcGFyZSB0aGlzIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBfLm9taXQobmV3U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdFN0YXRlW2tdID09PSB2OyB9KTtcclxuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2hhbmdlcyEhISEhISEhISEhISEhISEhIVwiKTtcclxuICAgICAgICAgICAgICAgIGNoYW5nZS5wbGF5ZXJJRCA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5pZDtcclxuICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0ubGFzdFN0YXRlID0gbmV3U3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXN0UGxheWVyc1N0YXRlLmxlbmd0aDsgaSArPSAxKXtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAvLyBnZXQgdGhlIHBsYXllcnMgbGFzdCBhbmQgbmV3IHN0YXRlXHJcbiAgICAgICAgLy8gICAgIHZhciBpZCA9IHRoaXMubGFzdFBsYXllcnNTdGF0ZVtpXS5pZDtcclxuICAgICAgICAvLyAgICAgdmFyIGxhc3RTdGF0ZSA9IHRoaXMubGFzdFBsYXllcnNTdGF0ZVtpXTtcclxuICAgICAgICAvLyAgICAgdmFyIG5ld1N0YXRlID0gd2luZG93LmdhbWUucGxheWVyc1tpZF0uZ2V0U3RhdGUoKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgLy8gY29tcGFyZSB0aGlzIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXHJcbiAgICAgICAgLy8gICAgIHZhciBjaGFuZ2UgPSBfLm9taXQobmV3U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdFN0YXRlW2tdID09PSB2OyB9KTtcclxuICAgICAgICAvLyAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xyXG4gICAgICAgIC8vICAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcclxuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKFwiY2hhbmdlcyEhISEhISEhISEhISEhISEhIVwiKTtcclxuICAgICAgICAvLyAgICAgICAgIGNoYW5nZS5wbGF5ZXJJRCA9IGlkO1xyXG4gICAgICAgIC8vICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICBjdXJyZW50UGxheWVyc1N0YXRlLnB1c2gobmV3U3RhdGUpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IGN1cnJlbnRQbGF5ZXJzU3RhdGU7XHJcbiAgICAgICAgLy8gaWYgKHRoaXMubGFzdFBsYXllcnNTdGF0ZS5sZW5ndGggPT09IDApIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IHdpbmRvdy5nYW1lLmdldFBsYXllcnNTdGF0ZSgpOyAvLyBpZiBuZXdseSBzdGFydGVkIGdhbWUuLlxyXG5cclxuXHJcbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNoYW5nZXMhXCIsIGNoYW5nZXMpO1xyXG4gICAgICAgICAgICAvLyB0aGVyZSBhcmUgY2hhbmdlc1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdCh7XHJcbiAgICAgICAgICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjdXJyZW50UGxheWVyc1N0YXRlKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIGNvbXBhcmUgY3VycmVudCBzdGF0ZSB0byBlYXJsaWVyIGdldEdhbWVTdGF0ZVxyXG4gICAgICAgIC8vIHNlbmQgZGlmZmVyZW5jZSB0byBwbGF5ZXJzXHJcblxyXG4gICAgICAgIC8vIHdpbmRvdy5nYW1lLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICAvLyBzZW5kIGFjdGlvbnMgdG8gYWxsIGNsaWVudHNcclxuICAgICAgICAvLyB0aGlzLmJyb2FkY2FzdCh7XHJcbiAgICAgICAgLy8gICAgIGV2ZW50OiBcImFjdGlvbnNcIixcclxuICAgICAgICAvLyAgICAgYWN0aW9uczpcclxuICAgICAgICAvLyB9KVxyXG5cclxuICAgIH07XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbi8vIC8vIHN0cmVzcyB0ZXN0XHJcbi8vIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbi8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcclxuLy8gICAgICAgICB0eXBlOiBcInRlc3RcIixcclxuLy8gICAgICAgICBkYXRhOiBcImFzZGFzZGFzIGRhc2RzYWRhcyBkYXNhc2Rhc2QgYXNkYXNkIGFzZGFkc2RxdzIzcXdrbHAgZ2tscFwiXHJcbi8vICAgICB9KTtcclxuLy8gfSwxNik7XHJcbiAgICAvL1xyXG4gICAgLy8gbmV0d29yay5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWUuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gLyoqXHJcbiAgICAvLyAgKiBBIHVzZXIgaGFzIGpvaW5lZC4gZXN0YWJsaXNoIGEgbmV3IHBlZXIgY29ubmVjdGlvbiB3aXRoIGl0XHJcbiAgICAvLyAqL1xyXG4gICAgLy8gbmV0d29yay5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdmFyIGNvbm4gPSAgcGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSBwZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IGNvbm47XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhcIlNBRExBU0RBU0RBU1wiLCBpZCwgcGVlciwgY29ubik7XHJcbiAgICAvLyAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vICAgICAgICAgdGhpcy5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogSlNPTi5zdHJpbmdpZnkobmV3UGxheWVyKSB9KTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIC8vcmVjZWl2aW5nIGRhdGEgZnJvbSBhIGNsaWVudFxyXG4gICAgLy8gICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09XFxuSE9TVCAtIGRhdGEgZnJvbSBjbGllbnRcXG5cIiwgZGF0YSxcIlxcbj09PT09XCIpO1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gYW5zd2VyIHRoZSBwaW5nXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcclxuICAgIC8vICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgLy90aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vICAgICAgICAgLy8gY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAvLyAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCBjb25uLCBcIlBFRVJcIiwgcGVlcik7XHJcbiAgICAvLyAgICAgICAgIC8vICAgICBkZWxldGUgdGhpcy5wZWVyc1tjb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAvLyAgICAgZGVsZXRlIHRoaXMuY29ubnNbY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgLy8gICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy8gICAgICAgICAvLyB9LmJpbmQodGhpcykpO1xyXG4gICAgLy8gICAgICAgICAvL1xyXG4gICAgLy8gICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAvL1xyXG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIlNlbmRcIiwgZGF0YSk7XHJcbiAgICAvLyAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vIH07XHJcbiAgICAvL1xyXG4gICAgLy8gLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcclxuICAgIC8vIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XHJcbiAgICAvLyB9O1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZW5kVGVzdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgdGhpcy5zZW5kKFwiYXNkYXNkYXNkYXNkYXNcIik7XHJcbiAgICAvLyB9LmJpbmQodGhpcykpO1xyXG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5waW5nID0gMDtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8oKTtcclxuICAgIHRoaXMuY2xpZW50ID0gbmV3IENsaWVudCgpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwieW91QXJlSG9zdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJpbSB0aGUgaG9zdFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QgPSBuZXcgSG9zdCgpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KGRhdGEucGVlcnMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJKb2luZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KFtkYXRhLnBlZXJJRF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIC8vIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIC8vIHRoaXMuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxufTtcclxuIl19
