(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player");

function Game() {
    this.started = false;

    this.width = 320;
    this.height = 240;

    this.spritesheet = new Image();
    this.spritesheet.src = "../img/spritesheet.png";

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
            entity.update(dt / 1000); //deltatime in seconds
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

    this.lastState = _.clone(player.keys);

    this.keyDownHandler = function(e){
        console.log(e.keyCode);
        switch(e.keyCode) {
            case 87: // W
                if (player.keys.w !== true)  player.keys.w = true;
                break;
            case 83: // S
            if (player.keys.s !== true)  player.keys.s = true;
            break;
            case 65: // A
            if (player.keys.a !== true)  player.keys.a = true;
            break;
            case 68: // A
            if (player.keys.d !== true)  player.keys.d = true;
            break;
        }
    };

    this.keyUpHandler = function(e){

        switch(e.keyCode) {
            case 87: // W
                if (player.keys.w === true) player.keys.w = false;
                break;
            case 83: // S
            if (player.keys.s === true) player.keys.s = false;
            break;
            case 65: // A
            if (player.keys.a === true)  player.keys.a = false;
            break;
            case 68: // A
            if (player.keys.d === true)  player.keys.d = false;
            break;
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
    this.speed = playerData.speed || 100; //pixels per second

    this.sx = 0;
    this.sy = 0;
    this.sw = 60;
    this.sh = 60;
    this.dw = 60;
    this.dh = 60;

    this.keys = {
        w: false,
        s: false,
        a: false,
        d: false
    };

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

    var distance = this.speed * dt;

    if (this.keys.w) {
        this.y -= distance;
    }
    if (this.keys.s) {
        this.y += distance;
    }

    if (this.keys.a) {
        this.x -= distance;
    }
    if (this.keys.d) {
        this.x += distance;
    }

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
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, helpers.toRadians(360), false);
    // ctx.closePath();
    // ctx.fillStyle = "black";
    // ctx.fill();
    //
    // // draw viewing direction
    // ctx.beginPath();
    // ctx.moveTo(this.x, this.y);
    // ctx.arc(this.x, this.y,this.radius, helpers.toRadians(this.direction - this.viewingAngle), helpers.toRadians(this.direction + this.viewingAngle));
    // ctx.lineTo(this.x, this.y);
    // ctx.closePath();
    // ctx.fillStyle = "red";
    // ctx.fill();
    //console.log(window.game.spritesheet, this.sx, this.sy, this.sw, this.sh, this.x, this.y, this.dw, this.dh)




    ctx.save(); // save current state
    ctx.translate(this.x, this.y); // change origin
    ctx.rotate(helpers.toRadians(this.direction)); // rotate
    ctx.drawImage(window.game.spritesheet, this.sx, this.sy, this.sw, this.sh, -(this.sw / 2), -(this.sh / 2), this.dw, this.dh);
    ctx.restore(); // restore original states (no rotation etc)






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

                    case "playerLeft":
                        console.log("player LEFT", data);
                        //window.game.addPlayer(data.playerData);
                        window.game.removePlayer({id: data.id});
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

     if (!_.isEqual(myPlayer.keys, myPlayer.controls.keyboard.lastState)) {
        // send keystate to host
        this.conn.send({
            event: "keys",
            keys: myPlayer.keys
        });
     }
    myPlayer.controls.keyboard.lastState = _.clone(myPlayer.keys);


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

            // for now, ignore my own changes
            if (change.playerID !== window.game.network.client.peer.id) window.game.players[change.playerID].change(change);
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

                       case "keys": // receiving actions from a player
                               console.log("keys received from", conn.peer, data);
                               window.game.players[conn.peer].keys = data.keys; //TODO: verify input (check that it is the key object with true/false values)
                               break;
                    }
                });
            });
        });
    };

    this.broadcast = function(data) {
        for (var conn in this.conns){
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


        // if there are changes
        if (changes.length > 0){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2hlbHBlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy93ZWJSVEMvQ2xpZW50LmpzIiwic3JjL2pzL3dlYlJUQy9Ib3N0LmpzIiwic3JjL2pzL3dlYlJUQy9XZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSAzMjA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDI0MDtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNcIik7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjE2cHggc2VyaWZcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBsYXllcnMgPSB7fTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcblxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXHJcbiAgICAgICAgdGhpcy5mcHMgPSBNYXRoLnJvdW5kKDEwMDAgLyBkdCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCAvIDEwMDApOyAvL2RlbHRhdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYWxsIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKHRoaXMuY2FudmFzLCB0aGlzLmN0eCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGZwcyBhbmQgcGluZ1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgdGhpcy5mcHMsIDEwLCAyMCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoXCJQSU5HOiBcIiArIHRoaXMubmV0d29yay5waW5nLCAxMCwgNDIpO1xyXG4gICAgfTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkUGxheWVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAgaWYoZGF0YS5pZCBpbiB0aGlzLnBsYXllcnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG5cclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVtb3ZpbmcgcGxheWVyXCIsIGRhdGEpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XHJcbiAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudGl0eSk7XHJcbiAgICAgICAgLy8gfSksXHJcbiAgICAgICAgZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkgeyByZXR1cm4gZW50aXR5LmdldFN0YXRlKCk7ICAgICAgICB9KSxcclxuICAgICAgICAvL3BsYXllcnM6IE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBKU09OLnN0cmluZ2lmeSh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0pOyB9KVxyXG4gICAgICAgIHBsYXllcnM6IHRoaXMuZ2V0UGxheWVyc1N0YXRlKClcclxuICAgIH07XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRQbGF5ZXJzU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gd2luZG93LmdhbWUucGxheWVyc1trZXldLmdldFN0YXRlKCk7IH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xyXG4iLCJmdW5jdGlvbiBLZXlib2FyZChwbGF5ZXIpe1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcblxyXG4gICAgdGhpcy5sYXN0U3RhdGUgPSBfLmNsb25lKHBsYXllci5rZXlzKTtcclxuXHJcbiAgICB0aGlzLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlKTtcclxuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua2V5cy53ICE9PSB0cnVlKSAgcGxheWVyLmtleXMudyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmtleXMucyAhPT0gdHJ1ZSkgIHBsYXllci5rZXlzLnMgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmtleXMuYSAhPT0gdHJ1ZSkgIHBsYXllci5rZXlzLmEgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmtleXMuZCAhPT0gdHJ1ZSkgIHBsYXllci5rZXlzLmQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XHJcblxyXG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcclxuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rZXlzLncgPT09IHRydWUpIHBsYXllci5rZXlzLncgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua2V5cy5zID09PSB0cnVlKSBwbGF5ZXIua2V5cy5zID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua2V5cy5hID09PSB0cnVlKSAgcGxheWVyLmtleXMuYSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmtleXMuZCA9PT0gdHJ1ZSkgIHBsYXllci5rZXlzLmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG59XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKHBsYXllcil7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgIHRoaXMuY2xpY2sgPSBmdW5jdGlvbihlKXtcclxuICAgICAgICB0aGlzLnBsYXllci50dXJuVG93YXJkcyhlLm9mZnNldFgsIGUub2Zmc2V0WSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgIGFjdGlvbjogXCJ0dXJuVG93YXJkc1wiLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICB4OiBlLm9mZnNldFgsXHJcbiAgICAgICAgICAgICAgICB5OiBlLm9mZnNldFlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmtleVVwSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgLy8gICAgIHN3aXRjaChlLmtleUNvZGUpIHtcclxuICAgIC8vICAgICAgICAgY2FzZSA4NzogLy8gV1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKHRoaXMua2V5cy53ID09PSB0cnVlKXtcclxuICAgIC8vICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoIHtldmVudDogXCJrZXlVcFwiLCBrZXk6IDg3fSApO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMua2V5cy53ID0gZmFsc2U7XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICBicmVhaztcclxuICAgIC8vICAgICAgICAgY2FzZSA4MzogLy8gU1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJTXCIpO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vIH07XHJcblxyXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbn1cclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcclxuIiwiZnVuY3Rpb24gQ29udHJvbHMoKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xyXG4iLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XHJcbnZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xyXG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9LZXlib2FyZFwiKTtcclxudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcclxuXHJcbmZ1bmN0aW9uIFBsYXllcihwbGF5ZXJEYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gcGxheWVyRGF0YS5pZDtcclxuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7IC8vIGNpcmNsZSByYWRpdXNcclxuICAgIHRoaXMueCA9IHBsYXllckRhdGEueCB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLndpZHRoIC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XHJcbiAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5oZWlnaHQgLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gcGxheWVyRGF0YS5kaXJlY3Rpb24gfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDE7XHJcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IHBsYXllckRhdGEudmlld2luZ0FuZ2xlIHx8IDQ1O1xyXG4gICAgdGhpcy5zcGVlZCA9IHBsYXllckRhdGEuc3BlZWQgfHwgMTAwOyAvL3BpeGVscyBwZXIgc2Vjb25kXHJcblxyXG4gICAgdGhpcy5zeCA9IDA7XHJcbiAgICB0aGlzLnN5ID0gMDtcclxuICAgIHRoaXMuc3cgPSA2MDtcclxuICAgIHRoaXMuc2ggPSA2MDtcclxuICAgIHRoaXMuZHcgPSA2MDtcclxuICAgIHRoaXMuZGggPSA2MDtcclxuXHJcbiAgICB0aGlzLmtleXMgPSB7XHJcbiAgICAgICAgdzogZmFsc2UsXHJcbiAgICAgICAgczogZmFsc2UsXHJcbiAgICAgICAgYTogZmFsc2UsXHJcbiAgICAgICAgZDogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5hY3Rpb25zID0gW107XHJcbiAgICB0aGlzLmxhc3RTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKTtcclxuXHJcbiAgICAvL2lzIHRoaXMgbWUgb3IgYW5vdGhlciBwbGF5ZXJcclxuICAgIHRoaXMuY29udHJvbHMgPSAocGxheWVyRGF0YS5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgPyB7bW91c2U6IG5ldyBNb3VzZSh0aGlzKSwga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZCh0aGlzKX0gOiBuZXcgTmV0d29ya0NvbnRyb2xzKCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJTcGF3bmluZyBwbGF5ZXIgYXRcIiwgdGhpcy54LCB0aGlzLnkpO1xyXG59XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuXHJcbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGlvbnMubGVuZ3RoOyBpICs9IDEpe1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5hY3Rpb25zW2ldLmRhdGEubGVuZ3RoOyBqICs9IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb24gPSB0aGlzLmFjdGlvbnNbaV0uZGF0YVtqXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1BY3Rpb24oYWN0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGlvbnMgPSBbXTtcclxuXHJcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcblxyXG4gICAgaWYgKHRoaXMua2V5cy53KSB7XHJcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMua2V5cy5zKSB7XHJcbiAgICAgICAgdGhpcy55ICs9IGRpc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmtleXMuYSkge1xyXG4gICAgICAgIHRoaXMueCAtPSBkaXN0YW5jZTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmtleXMuZCkge1xyXG4gICAgICAgIHRoaXMueCArPSBkaXN0YW5jZTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmNoYW5nZSA9IGZ1bmN0aW9uKGNoYW5nZSl7XHJcbiAgICAvLyBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcclxuICAgIGNvbnNvbGUubG9nKFwidXBkYXRlXCIsIHRoaXMsIFwid2l0aCBcIiwgY2hhbmdlKTtcclxuXHJcbiAgICBkZWxldGUgY2hhbmdlLnBsYXllcklEO1xyXG4gICAgZm9yICh2YXIga2V5IGluIGNoYW5nZSkge1xyXG4gICAgICAgIHRoaXNba2V5XSA9IGNoYW5nZVtrZXldO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5wZXJmb3JtQWN0aW9uID0gZnVuY3Rpb24oYWN0aW9uKXtcclxuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcclxuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcclxuICAgICAgICAgICAgdGhpcy50dXJuVG93YXJkcyhhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGNhbnZhcywgY3R4KXtcclxuICAgIC8vZHJhdyBjaXJjbGVcclxuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIC8vIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBoZWxwZXJzLnRvUmFkaWFucygzNjApLCBmYWxzZSk7XHJcbiAgICAvLyBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAvLyBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgLy8gY3R4LmZpbGwoKTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBkcmF3IHZpZXdpbmcgZGlyZWN0aW9uXHJcbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyBjdHgubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcclxuICAgIC8vIGN0eC5hcmModGhpcy54LCB0aGlzLnksdGhpcy5yYWRpdXMsIGhlbHBlcnMudG9SYWRpYW5zKHRoaXMuZGlyZWN0aW9uIC0gdGhpcy52aWV3aW5nQW5nbGUpLCBoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbiArIHRoaXMudmlld2luZ0FuZ2xlKSk7XHJcbiAgICAvLyBjdHgubGluZVRvKHRoaXMueCwgdGhpcy55KTtcclxuICAgIC8vIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIC8vIGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xyXG4gICAgLy8gY3R4LmZpbGwoKTtcclxuICAgIC8vY29uc29sZS5sb2cod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIHRoaXMueCwgdGhpcy55LCB0aGlzLmR3LCB0aGlzLmRoKVxyXG5cclxuXHJcblxyXG5cclxuICAgIGN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgY3R4LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIGN0eC5yb3RhdGUoaGVscGVycy50b1JhZGlhbnModGhpcy5kaXJlY3Rpb24pKTsgLy8gcm90YXRlXHJcbiAgICBjdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLnN4LCB0aGlzLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxufTtcclxuXHJcblBsYXllci5wcm90b3R5cGUudHVyblRvd2FyZHMgPSBmdW5jdGlvbih4LHkpIHtcclxuICAgIGNvbnNvbGUubG9nKFwidHVybiB0b3dhcmRzXCIseCx5KTtcclxuICAgIGNvbnNvbGUubG9nKFwiaW0gYXRcIiwgdGhpcy54LCB0aGlzLnksIFwiYW5kIGxvb2tpbmcgaW4gZGlyZWN0aW9uXCIsIHRoaXMuZGlyZWN0aW9uKTtcclxuXHJcbiAgICB2YXIgeERpZmYgPSB4IC0gdGhpcy54O1xyXG4gICAgdmFyIHlEaWZmID0geSAtIHRoaXMueTtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpICogKDE4MCAvIE1hdGguUEkpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHhEaWZmLCB5RGlmZiwgdGhpcy5kaXJlY3Rpb24pO1xyXG59O1xyXG5cclxuUGxheWVyLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgIGlkOiB0aGlzLmlkLFxyXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXHJcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcclxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxyXG4gICAgICAgIHNwZWVkOiB0aGlzLnNwZWVkXHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVWkoZ2FtZSl7XHJcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcclxuXHJcbiAgICAgICAgdmFyIG15SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkO1xyXG5cclxuICAgICAgICAvL3ZhciBob3N0SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnBlZXI7XHJcblxyXG4gICAgICAgIC8vVE9ETzogdXNlIGhhbmRsZWJhcnNcclxuICAgICAgICB0aGlzLmNsaWVudExpc3QuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBmb3IgKHZhciBpZCBpbiBwbGF5ZXJzKXtcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpZCA9PT0gbXlJRCkge1xyXG4gICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcIm1lXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudExpc3QuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcbiIsIi8vIGRlZ3JlZXMgdG8gcmFkaWFuc1xyXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XHJcbiAgICByZXR1cm4gZGVnICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgdG9SYWRpYW5zOiB0b1JhZGlhbnNcclxufTtcclxuIiwidmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lLmpzXCIpO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5zdGFydCgpO1xyXG59KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XHJcblxyXG5mdW5jdGlvbiBDbGllbnQoKXtcclxuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcblxyXG4gICAgLy8gU3RyZXNzIHRlc3RcclxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XHJcblxyXG4gICAgdGhpcy5hY3Rpb25zID0gW107IC8vaGVyZSB3ZSB3aWxsIHN0b3JlIGNsaWVudCBhY3Rpb25zIGJlZm9yZSB3ZSBzZW5kIHRoZW0gdG8gdGhlIGhvc3RcclxuICAgIHRoaXMuY2hhbmdlcyA9IFtdOyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgY2hhbmdlcyBmcm9tIHRoZSBob3N0XHJcblxyXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBnYW1lSUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW4gdGhlIGhvc3RcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xyXG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXHJcblxyXG4gICAgICAgIC8vIGNsb3NlIG91dCBhbnkgb2xkIGNvbm5lY3Rpb25zXHJcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcclxuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl1bMF0uY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3RvcmUgaXRcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcclxuXHJcbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVySm9pbmVkXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgam9pbmVkXCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVyTGVmdFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInBsYXllciBMRUZUXCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLmlkfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0ZXN0XCI6IC8vIHN0cmVzcyB0ZXN0aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0IVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnRlc3RzUmVjZWl2ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWNlaXZpbmcgZ2FtZSBzdGF0ZVwiLCBkYXRhLmdhbWVTdGF0ZS5lbnRpdGllcywgZGF0YS5nYW1lU3RhdGUucGxheWVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5nYW1lU3RhdGUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihwbGF5ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5wdXNoKGRhdGEuY2hhbmdlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjogLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XHJcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxyXG4gICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgfSk7XHJcbn1cclxuXHJcbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxyXG57XHJcbiAgICAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxyXG4gICAgdmFyIG15UGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xyXG5cclxuICAgICBpZiAoIV8uaXNFcXVhbChteVBsYXllci5rZXlzLCBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUpKSB7XHJcbiAgICAgICAgLy8gc2VuZCBrZXlzdGF0ZSB0byBob3N0XHJcbiAgICAgICAgdGhpcy5jb25uLnNlbmQoe1xyXG4gICAgICAgICAgICBldmVudDogXCJrZXlzXCIsXHJcbiAgICAgICAgICAgIGtleXM6IG15UGxheWVyLmtleXNcclxuICAgICAgICB9KTtcclxuICAgICB9XHJcbiAgICBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUgPSBfLmNsb25lKG15UGxheWVyLmtleXMpO1xyXG5cclxuXHJcbiAgICBpZiAodGhpcy5hY3Rpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvLyBzZW5kIGFsbCBwZXJmb3JtZWQgYWN0aW9ucyB0byB0aGUgaG9zdFxyXG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcclxuICAgICAgICAgICAgZXZlbnQ6IFwiYWN0aW9uc1wiLFxyXG4gICAgICAgICAgICBkYXRhOiB0aGlzLmFjdGlvbnNcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gY2xlYXIgYWN0aW9ucyBxdWV1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jaGFuZ2VzW2ldLmxlbmd0aDsgaiArPSAxKSAge1xyXG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldW2pdO1xyXG5cclxuICAgICAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2UucGxheWVySUQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XHJcblxyXG59O1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcclxuICAgIC8vICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxyXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAvL2NyZWF0ZSB0aGUgcGxheWVyXHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XHJcbiAgICAvLyAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcclxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXHJcbiAgICAvLyAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcclxuICAgIC8vICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIC8vIHBpbmcgdGVzdFxyXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XHJcbiAgICAvLyAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXHJcbiAgICAvLyAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSwgMjAwMCk7XHJcbiAgICAvL1xyXG4gICAgLy8gfSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XHJcbiAgICB0aGlzLmNvbm5zID0ge307XHJcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIGFsbCB0aGUgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGNsaWVudHNcclxuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xyXG4gICAgdGhpcy5kaWZmID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihwZWVycyl7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0XCIsIHBlZXJzKTtcclxuICAgICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG5cclxuICAgICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICAgICAgICBpZiAoISh3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkIGluIHdpbmRvdy5nYW1lLnBsYXllcnMpKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHNlbmQgYSBwaW5nIGV2ZXJ5IDIgc2Vjb25kcywgdG8gdHJhY2sgcGluZyB0aW1lXHJcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtldmVudDogXCJwaW5nXCIsIHRpbWVzdGFtcDogRGF0ZS5ub3coKX0pO1xyXG4gICAgICAgICAgICB9LDIwMDApO1xyXG5cclxuICAgICAgICAgICAgcGVlcnMuZm9yRWFjaChmdW5jdGlvbihwZWVySUQpIHtcclxuICAgICAgICAgICAgICAgIC8vY29ubmVjdCB3aXRoIGVhY2ggcmVtb3RlIHBlZXJcclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaG9zdElEOlwiLCB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5pZCwgXCIgY29ubmVjdCB3aXRoXCIsIHBlZXJJRCk7XHJcbiAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1twZWVySURdID0gcGVlcjtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BsYXllcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IG5ld1BsYXllci5nZXRTdGF0ZSgpIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBuZXcgcGxheWVyIHRoZSBmdWxsIGdhbWUgc3RhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmVtaXQoIHtjbGllbnRJRDogY29ubi5wZWVyLCBldmVudDogXCJnYW1lU3RhdGVcIiwgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKX0gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1tjb25uLnBlZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIEVWRU5UXCIsIGVycik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7IC8vIGFuc3dlciB0aGUgcGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGNsaWVudCwgY2FsdWNhdGUgcGluZ3RpbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJhY3Rpb25zXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJhY3Rpb25zIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJrZXlzXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2V5cyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyA9IGRhdGEua2V5czsgLy9UT0RPOiB2ZXJpZnkgaW5wdXQgKGNoZWNrIHRoYXQgaXQgaXMgdGhlIGtleSBvYmplY3Qgd2l0aCB0cnVlL2ZhbHNlIHZhbHVlcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcclxuICAgICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcclxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVNSVQhXCIsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnRuVGVzdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtldmVudDogXCJ0ZXN0XCIsIG1lc3NhZ2U6IFwiYXNkYXNkYXNcIn0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgICAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxyXG5cclxuICAgICAgICB2YXIgY3VycmVudFBsYXllcnNTdGF0ZSA9IFtdO1xyXG4gICAgICAgIHZhciBjaGFuZ2VzID0gW107XHJcblxyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0U3RhdGUgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0ubGFzdFN0YXRlO1xyXG4gICAgICAgICAgICB2YXIgbmV3U3RhdGUgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uZ2V0U3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvbXBhcmUgdGhpcyBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxyXG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XHJcbiAgICAgICAgICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UucGxheWVySUQgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uaWQ7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1trZXldLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGFzdFBsYXllcnNTdGF0ZS5sZW5ndGg7IGkgKz0gMSl7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgLy8gZ2V0IHRoZSBwbGF5ZXJzIGxhc3QgYW5kIG5ldyBzdGF0ZVxyXG4gICAgICAgIC8vICAgICB2YXIgaWQgPSB0aGlzLmxhc3RQbGF5ZXJzU3RhdGVbaV0uaWQ7XHJcbiAgICAgICAgLy8gICAgIHZhciBsYXN0U3RhdGUgPSB0aGlzLmxhc3RQbGF5ZXJzU3RhdGVbaV07XHJcbiAgICAgICAgLy8gICAgIHZhciBuZXdTdGF0ZSA9IHdpbmRvdy5nYW1lLnBsYXllcnNbaWRdLmdldFN0YXRlKCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgIC8vIGNvbXBhcmUgdGhpcyBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxyXG4gICAgICAgIC8vICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XHJcbiAgICAgICAgLy8gICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcclxuICAgICAgICAvLyAgICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXHJcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhcImNoYW5nZXMhISEhISEhISEhISEhISEhISFcIik7XHJcbiAgICAgICAgLy8gICAgICAgICBjaGFuZ2UucGxheWVySUQgPSBpZDtcclxuICAgICAgICAvLyAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgY3VycmVudFBsYXllcnNTdGF0ZS5wdXNoKG5ld1N0YXRlKTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSBjdXJyZW50UGxheWVyc1N0YXRlO1xyXG4gICAgICAgIC8vIGlmICh0aGlzLmxhc3RQbGF5ZXJzU3RhdGUubGVuZ3RoID09PSAwKSB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSB3aW5kb3cuZ2FtZS5nZXRQbGF5ZXJzU3RhdGUoKTsgLy8gaWYgbmV3bHkgc3RhcnRlZCBnYW1lLi5cclxuXHJcblxyXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXHJcbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHtcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcclxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnRQbGF5ZXJzU3RhdGUpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gY29tcGFyZSBjdXJyZW50IHN0YXRlIHRvIGVhcmxpZXIgZ2V0R2FtZVN0YXRlXHJcbiAgICAgICAgLy8gc2VuZCBkaWZmZXJlbmNlIHRvIHBsYXllcnNcclxuXHJcbiAgICAgICAgLy8gd2luZG93LmdhbWUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcikge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgIC8vIHNlbmQgYWN0aW9ucyB0byBhbGwgY2xpZW50c1xyXG4gICAgICAgIC8vIHRoaXMuYnJvYWRjYXN0KHtcclxuICAgICAgICAvLyAgICAgZXZlbnQ6IFwiYWN0aW9uc1wiLFxyXG4gICAgICAgIC8vICAgICBhY3Rpb25zOlxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgfTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuLy8gLy8gc3RyZXNzIHRlc3RcclxuLy8gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xyXG4vLyAgICAgICAgIHR5cGU6IFwidGVzdFwiLFxyXG4vLyAgICAgICAgIGRhdGE6IFwiYXNkYXNkYXMgZGFzZHNhZGFzIGRhc2FzZGFzZCBhc2Rhc2QgYXNkYWRzZHF3MjNxd2tscCBna2xwXCJcclxuLy8gICAgIH0pO1xyXG4vLyB9LDE2KTtcclxuICAgIC8vXHJcbiAgICAvLyBuZXR3b3JrLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZS5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyAvKipcclxuICAgIC8vICAqIEEgdXNlciBoYXMgam9pbmVkLiBlc3RhYmxpc2ggYSBuZXcgcGVlciBjb25uZWN0aW9uIHdpdGggaXRcclxuICAgIC8vICovXHJcbiAgICAvLyBuZXR3b3JrLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdmFyIHBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICBwZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgLy8gICAgICAgICB2YXIgY29ubiA9ICBwZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gY29ubjtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKFwiU0FETEFTREFTREFTXCIsIGlkLCBwZWVyLCBjb25uKTtcclxuICAgIC8vICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckpvaW5lZFwiLCBwbGF5ZXJEYXRhOiBKU09OLnN0cmluZ2lmeShuZXdQbGF5ZXIpIH0pO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgLy9yZWNlaXZpbmcgZGF0YSBmcm9tIGEgY2xpZW50XHJcbiAgICAvLyAgICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT1cXG5IT1NUIC0gZGF0YSBmcm9tIGNsaWVudFxcblwiLCBkYXRhLFwiXFxuPT09PT1cIik7XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBhbnN3ZXIgdGhlIHBpbmdcclxuICAgIC8vICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1tjb25uLnBlZXJdLnBpbmcgPSBwaW5nO1xyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAvL3RoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy8gICAgICAgICAvLyBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIC8vICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIGNvbm4sIFwiUEVFUlwiLCBwZWVyKTtcclxuICAgIC8vICAgICAgICAgLy8gICAgIGRlbGV0ZSB0aGlzLnBlZXJzW2Nvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgIC8vICAgICBkZWxldGUgdGhpcy5jb25uc1tjb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAvLyAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAvLyAgICAgICAgIC8vIH0uYmluZCh0aGlzKSk7XHJcbiAgICAvLyAgICAgICAgIC8vXHJcbiAgICAvLyAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIC8vXHJcbiAgICAvLyB9LmJpbmQodGhpcykpO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiU2VuZFwiLCBkYXRhKTtcclxuICAgIC8vICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxyXG4gICAgLy8gdGhpcy5lbWl0ID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcclxuICAgIC8vIH07XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlbmRUZXN0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICB0aGlzLnNlbmQoXCJhc2Rhc2Rhc2Rhc2Rhc1wiKTtcclxuICAgIC8vIH0uYmluZCh0aGlzKSk7XHJcbiIsInZhciBDbGllbnQgPSByZXF1aXJlKFwiLi9DbGllbnRcIik7XHJcbnZhciBIb3N0ID0gcmVxdWlyZShcIi4vSG9zdFwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gV2ViUlRDKCl7XHJcbiAgICB0aGlzLnBpbmcgPSAwO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoZGF0YS5wZWVycyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoW2RhdGEucGVlcklEXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
