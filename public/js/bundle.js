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

        var ping = (this.network.client.peer.open) ? this.players[this.network.client.peer.id].ping : "-";
        this.ctx.fillText("PING: " + ping, 10, 42);
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
        entities: this.entities.map(function(entity) { return entity.getFullState();        }),
        //players: Object.keys(this.players).map(function(key){ return JSON.stringify(window.game.players[key]); })
        players: this.getPlayersState()
    };
};

Game.prototype.getPlayersState = function() {
    return Object.keys(this.players).map(function(key){ return window.game.players[key].getFullState(); });
};

module.exports = Game;

},{"./Player":5,"./Ui":6,"./webRTC/WebRTC":11}],2:[function(require,module,exports){
function Keyboard(player){
    this.player = player;
    //this.lastState = _.clone(player.keys);
    this.keyDownHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (player.kUp !== true)  player.kUp= true;
                break;
            case 83: // S
            if (player.kDown !== true)  player.kDown = true;
            break;
            case 65: // A
            if (player.kLeft !== true)  player.kLeft = true;
            break;
            case 68: // A
            if (player.kRight !== true)  player.kRight = true;
            break;
        }
    };

    this.keyUpHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (player.kUp === true) player.kUp = false;
                break;
            case 83: // S
            if (player.kDown === true) player.kDown = false;
            break;
            case 65: // A
            if (player.kLeft === true)  player.kLeft = false;
            break;
            case 68: // A
            if (player.kRight === true)  player.kRight = false;
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

    this.click = function(){
        //this.player.turnTowards(e.offsetX, e.offsetY);
        this.player.shoot();
        // window.game.network.client.actions.push({
        //     action: "turnTowards",
        //     data: {
        //         x: e.offsetX,
        //         y: e.offsetY
        //     }
        // });
    };

    this.mousemove = function(e) {
        this.player.mouseX = e.offsetX;
        this.player.mouseY = e.offsetY;
        //this.player.turnTowards(e.offsetX, e.offsetY);
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

    window.game.canvas.addEventListener("mousemove", this.mousemove.bind(this));
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

    // keys
    this.kUp = false;
    this.kDown = false;
    this.kLeft = false;
    this.kRight = false;

    this.mouseX = this.x;
    this.mouseY = this.y;

    this.lastClientState = this.getClientState();
    this.lastFullState = this.getFullState();

    this.ping = "-";

    //is this me or another player
    this.controls = (playerData.id === window.game.network.client.peer.id) ? {mouse: new Mouse(this), keyboard: new Keyboard(this)} : new NetworkControls();
}

Player.prototype.update = function(dt){

    // go through all the queued up actions and perform them
    // for (var i = 0; i < this.actions.length; i += 1){
    //     for (var j = 0; j < this.actions[i].data.length; j += 1){
    //                 var action = this.actions[i].data[j];
    //                 this.performAction(action);
    //     }
    // }
    // this.actions = [];

    var distance = this.speed * dt;
    if (this.kUp) {
        this.y -= distance;
    }
    if (this.kDown) {
        this.y += distance;
    }

    if (this.kLeft) {
        this.x -= distance;
    }
    if (this.kRight) {
        this.x += distance;
    }

    this.turnTowards(this.mouseX, this.mouseY);
};

Player.prototype.networkUpdate = function(update){
    // networkUpdate
    for (var key in update) {
        this[key] = update[key];
    }
    // delete change.playerID;
    // for (var key in change) {
    //     this[key] = change[key];
    // }
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
    var xDiff = x - this.x;
    var yDiff = y - this.y;
    this.direction = Math.atan2(yDiff, xDiff) * (180 / Math.PI);
};

Player.prototype.getFullState = function() {
    return {
        x: this.x,
        y: this.y,
        id: this.id,
        radius: this.radius,
        direction: this.direction,
        viewingAngle: this.viewingAngle,
        speed: this.speed,
        kUp: this.kUp,
        kDown: this.kDown,
        kLeft: this.kLeft,
        kRight: this.kRight,
        mouseX: this.mouseX,
        mouseY: this.mouseY
    };
};

// The state the client sends to the host
Player.prototype.getClientState = function() {
    return {
        id: this.id,
        direction: this.direction,
        kUp: this.kUp,
        kDown: this.kDown,
        kLeft: this.kLeft,
        kRight: this.kRight,
        mouseX: this.mouseX,
        mouseY: this.mouseY
    };
};

Player.prototype.shoot = function() {
    console.log(this.id, "Shoot!");

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
            var content = document.createTextNode(id + " " + players[id].ping);

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
                    window.game.network.client.changes = window.game.network.client.changes.concat(data.changes);
                    break;

                case "ping": // host sent a ping, answer it
                   conn.send({ event: "pong", timestamp: data.timestamp });
                   console.log("player pings:", data.pings);
                   data.pings.forEach(function(ping) {
                       window.game.players[ping.id].ping = ping.ping;
                   });
                   window.game.ui.updateClientList(window.game.players);
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
    var player = window.game.players[this.peer.id];
    if (!player) return;

    var currentState = player.getClientState();
    var lastClientState = player.lastClientState;
    var change = _.omit(currentState, function(v,k) { return lastClientState[k] === v; }); // compare new and old state and get the difference

    // add any performed actions to change package
    // if (this.actions.length > 0) {
    //     change.actions = this.actions;
    //     this.actions = [];
    // }

    if (!_.isEmpty(change)) {
        // there's been changes, send em to host
        this.conn.send({
            event: "networkUpdate",
            updates: change
        });
    }
    player.lastClientState = currentState;




    // update with changes received from host
    for (var i = 0; i < this.changes.length; i += 1) {
        change = this.changes[i];
        // for now, ignore my own changes
        if (change.id !== window.game.network.client.peer.id) {
            console.log("update player", change);
            window.game.players[change.id].networkUpdate(change);
        }
    }

    this.changes = [];




    // // check if my keystate has changed
    // var myPlayer = window.game.players[this.peer.id];
    // if (!myPlayer) return;
    //
    //  if (!_.isEqual(myPlayer.keys, myPlayer.controls.keyboard.lastState)) {
    //     // send keystate to host
    //     this.conn.send({
    //         event: "keys",
    //         keys: myPlayer.keys
    //     });
    //  }
    // myPlayer.controls.keyboard.lastState = _.clone(myPlayer.keys);
    //
    //
    // // get the difference since last time
    //
    // var currentPlayersState = [];
    // var changes = [];
    // var lastState = myPlayer.lastState;
    // var newState = myPlayer.getState();
    //
    // // compare players new state with it's last state
    // var change = _.omit(newState, function(v,k) { return lastState[k] === v; });
    // if (!_.isEmpty(change)) {
    //     // there's been changes
    //     change.playerID = myPlayer.id;
    //     changes.push(change);
    // }
    //
    // myPlayer.lastState = newState;
    // // if there are changes
    // if (changes.length > 0){
    //     this.conn.send({
    //         event: "changes",
    //         changes: changes
    //     });
    // }
    //
    // if (this.actions.length > 0) {
    //     // send all performed actions to the host
    //     this.conn.send({
    //         event: "actions",
    //         data: this.actions
    //     });
    //     this.actions = []; // clear actions queue
    // }
    //
    // // update with changes received from host
    // for (var i = 0; i < this.changes.length; i += 1) {
    //     for (var j = 0; j < this.changes[i].length; j += 1)  {
    //         change = this.changes[i][j];
    //
    //         // for now, ignore my own changes
    //         if (change.playerID !== window.game.network.client.peer.id) window.game.players[change.playerID].change(change);
    //     }
    // }
    //
    // this.changes = [];

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
                window.game.network.host.broadcast({
                    event: "ping",
                    timestamp: Date.now(),
                    pings: window.game.network.host.getPings()
                });
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
                        window.game.network.host.broadcast({ event: "playerJoined", playerData: newPlayer.getFullState() });
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

                        case "networkUpdate":
                            // update from a client
                            window.game.players[conn.peer].networkUpdate(data.updates); // TODO verify
                            break;
                       //
                    //    case "actions": // receiving actions from a player
                    //        console.log("actions received from", conn.peer, data);
                    //        window.game.players[conn.peer].actions.push(data);
                    //        break;

                    //    case "changes":
                    //        console.log("Hey there has been changes!", data);
                    //        window.game.players[conn.peer].change(data.changes);
                    //        break;
                       //
                    //    case "keys": // receiving actions from a player
                    //        console.log("keys received from", conn.peer, data.keys,  window.game.players[conn.peer]);
                    //        window.game.players[conn.peer].keys = _.clone(data.keys); //TODO: verify input (check that it is the key object with true/false values)
                    //        console.log(window.game.players[conn.peer].keys);
                    //        break;
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

        var changes = [];

        for (var key in window.game.players) {
            var player = window.game.players[key];
            var currentFullState = player.getFullState();
            var change = _.omit(currentFullState, function(v,k) { return player.lastFullState[k] === v; }); // compare new and old state and get the difference
            if (!_.isEmpty(change)) { //there's been changes
                change.id = player.id;
                changes.push(change);
                player.lastFullState = currentFullState;
            }
        }

        if (changes.length > 0){
            this.broadcast({
                event: "changes",
                changes: changes
            });
        }

        // var currentPlayersState = [];
        // var changes = [];
        //
        // for (var key in window.game.players) {
        //     var lastState = window.game.players[key].lastState;
        //     var newState = window.game.players[key].getState();
        //
        //     // compare this players new state with it's last state
        //     var change = _.omit(newState, function(v,k) { return lastState[k] === v; });
        //     if (!_.isEmpty(change)) {
        //         // there's been changes
        //         change.playerID = window.game.players[key].id;
        //         changes.push(change);
        //     }
        //
        //     window.game.players[key].lastState = newState;
        // }
        //

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
        // if (changes.length > 0){
        //     this.broadcast({
        //         event: "changes",
        //         changes: changes
        //     });
        // }

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



    this.getPings = function() {
        var pings = [];
        for (var key in window.game.players) {
            var player = window.game.players[key];
            pings.push({id: player.id, ping: player.ping || "host"});
        }

        return pings;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2hlbHBlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy93ZWJSVEMvQ2xpZW50LmpzIiwic3JjL2pzL3dlYlJUQy9Ib3N0LmpzIiwic3JjL2pzL3dlYlJUQy9XZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSAzMjA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDI0MDtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNcIik7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjE2cHggc2VyaWZcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBsYXllcnMgPSB7fTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcblxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXHJcbiAgICAgICAgdGhpcy5mcHMgPSBNYXRoLnJvdW5kKDEwMDAgLyBkdCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCAvIDEwMDApOyAvL2RlbHRhdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYWxsIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKHRoaXMuY2FudmFzLCB0aGlzLmN0eCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGZwcyBhbmQgcGluZ1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgdGhpcy5mcHMsIDEwLCAyMCk7XHJcblxyXG4gICAgICAgIHZhciBwaW5nID0gKHRoaXMubmV0d29yay5jbGllbnQucGVlci5vcGVuKSA/IHRoaXMucGxheWVyc1t0aGlzLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdLnBpbmcgOiBcIi1cIjtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIlBJTkc6IFwiICsgcGluZywgMTAsIDQyKTtcclxuICAgIH07XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLmFkZFBsYXllciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIHBsYXllciBhbHJlYWR5IGV4aXN0cy5cclxuICAgIGlmKGRhdGEuaWQgaW4gdGhpcy5wbGF5ZXJzKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIoZGF0YSk7XHJcbiAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3UGxheWVyKTtcclxuICAgIHRoaXMucGxheWVyc1tkYXRhLmlkXSA9IG5ld1BsYXllcjtcclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3UGxheWVyO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUucmVtb3ZlUGxheWVyID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coXCJnYW1lIHJlbW92aW5nIHBsYXllclwiLCBkYXRhKTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBwbGF5ZXJzIG9iamVjdFxyXG4gICAgZGVsZXRlIHRoaXMucGxheWVyc1tkYXRhLmlkXTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBlbnRpdGl0ZXMgYXJyYXlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5pZCA9PT0gZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGhpbSAsIHJlbW92aW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0R2FtZVN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC8vIGVudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJlbnRpdHk6XCIsIGVudGl0eSk7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShlbnRpdHkpO1xyXG4gICAgICAgIC8vIH0pLFxyXG4gICAgICAgIGVudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHsgcmV0dXJuIGVudGl0eS5nZXRGdWxsU3RhdGUoKTsgICAgICAgIH0pLFxyXG4gICAgICAgIC8vcGxheWVyczogT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XSk7IH0pXHJcbiAgICAgICAgcGxheWVyczogdGhpcy5nZXRQbGF5ZXJzU3RhdGUoKVxyXG4gICAgfTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdldFBsYXllcnNTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uZ2V0RnVsbFN0YXRlKCk7IH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xyXG4iLCJmdW5jdGlvbiBLZXlib2FyZChwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIC8vdGhpcy5sYXN0U3RhdGUgPSBfLmNsb25lKHBsYXllci5rZXlzKTtcbiAgICB0aGlzLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCAhPT0gdHJ1ZSkgIHBsYXllci5rVXA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICBpZiAocGxheWVyLmtEb3duICE9PSB0cnVlKSAgcGxheWVyLmtEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ICE9PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmtleVVwSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgPT09IHRydWUpIHBsYXllci5rVXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gPT09IHRydWUpIHBsYXllci5rRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ID09PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ID09PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwiZnVuY3Rpb24gTW91c2UocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcblxuICAgIHRoaXMuY2xpY2sgPSBmdW5jdGlvbigpe1xuICAgICAgICAvL3RoaXMucGxheWVyLnR1cm5Ub3dhcmRzKGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuc2hvb3QoKTtcbiAgICAgICAgLy8gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgLy8gICAgIGFjdGlvbjogXCJ0dXJuVG93YXJkc1wiLFxuICAgICAgICAvLyAgICAgZGF0YToge1xuICAgICAgICAvLyAgICAgICAgIHg6IGUub2Zmc2V0WCxcbiAgICAgICAgLy8gICAgICAgICB5OiBlLm9mZnNldFlcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSk7XG4gICAgfTtcblxuICAgIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVggPSBlLm9mZnNldFg7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWSA9IGUub2Zmc2V0WTtcbiAgICAgICAgLy90aGlzLnBsYXllci50dXJuVG93YXJkcyhlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gICAgfTtcbiAgICAvL1xuICAgIC8vIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy8gICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAvLyAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAvLyAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLncgPT09IHRydWUpe1xuICAgIC8vICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoIHtldmVudDogXCJrZXlVcFwiLCBrZXk6IDg3fSApO1xuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLmtleXMudyA9IGZhbHNlO1xuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNcIik7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9O1xuXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XG4gICAgLy93aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9LZXlib2FyZFwiKTtcbnZhciBOZXR3b3JrQ29udHJvbHMgPSByZXF1aXJlKFwiLi9OZXR3b3JrQ29udHJvbHNcIik7XG5cbmZ1bmN0aW9uIFBsYXllcihwbGF5ZXJEYXRhKSB7XG4gICAgdGhpcy5pZCA9IHBsYXllckRhdGEuaWQ7XG4gICAgdGhpcy5yYWRpdXMgPSBwbGF5ZXJEYXRhLnJhZGl1cyB8fCAyMDsgLy8gY2lyY2xlIHJhZGl1c1xuICAgIHRoaXMueCA9IHBsYXllckRhdGEueCB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLndpZHRoIC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XG4gICAgdGhpcy55ID0gcGxheWVyRGF0YS55IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUuaGVpZ2h0IC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBwbGF5ZXJEYXRhLmRpcmVjdGlvbiB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMTtcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IHBsYXllckRhdGEudmlld2luZ0FuZ2xlIHx8IDQ1O1xuICAgIHRoaXMuc3BlZWQgPSBwbGF5ZXJEYXRhLnNwZWVkIHx8IDEwMDsgLy9waXhlbHMgcGVyIHNlY29uZFxuXG4gICAgdGhpcy5zeCA9IDA7XG4gICAgdGhpcy5zeSA9IDA7XG4gICAgdGhpcy5zdyA9IDYwO1xuICAgIHRoaXMuc2ggPSA2MDtcbiAgICB0aGlzLmR3ID0gNjA7XG4gICAgdGhpcy5kaCA9IDYwO1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgdGhpcy5tb3VzZVggPSB0aGlzLng7XG4gICAgdGhpcy5tb3VzZVkgPSB0aGlzLnk7XG5cbiAgICB0aGlzLmxhc3RDbGllbnRTdGF0ZSA9IHRoaXMuZ2V0Q2xpZW50U3RhdGUoKTtcbiAgICB0aGlzLmxhc3RGdWxsU3RhdGUgPSB0aGlzLmdldEZ1bGxTdGF0ZSgpO1xuXG4gICAgdGhpcy5waW5nID0gXCItXCI7XG5cbiAgICAvL2lzIHRoaXMgbWUgb3IgYW5vdGhlciBwbGF5ZXJcbiAgICB0aGlzLmNvbnRyb2xzID0gKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpID8ge21vdXNlOiBuZXcgTW91c2UodGhpcyksIGtleWJvYXJkOiBuZXcgS2V5Ym9hcmQodGhpcyl9IDogbmV3IE5ldHdvcmtDb250cm9scygpO1xufVxuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcblxuICAgIC8vIGdvIHRocm91Z2ggYWxsIHRoZSBxdWV1ZWQgdXAgYWN0aW9ucyBhbmQgcGVyZm9ybSB0aGVtXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGlvbnMubGVuZ3RoOyBpICs9IDEpe1xuICAgIC8vICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuYWN0aW9uc1tpXS5kYXRhLmxlbmd0aDsgaiArPSAxKXtcbiAgICAvLyAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbiA9IHRoaXMuYWN0aW9uc1tpXS5kYXRhW2pdO1xuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1BY3Rpb24oYWN0aW9uKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvLyB0aGlzLmFjdGlvbnMgPSBbXTtcblxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICBpZiAodGhpcy5rVXApIHtcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5rRG93bikge1xuICAgICAgICB0aGlzLnkgKz0gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMua0xlZnQpIHtcbiAgICAgICAgdGhpcy54IC09IGRpc3RhbmNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5rUmlnaHQpIHtcbiAgICAgICAgdGhpcy54ICs9IGRpc3RhbmNlO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV0d29ya1VwZGF0ZSA9IGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgLy8gbmV0d29ya1VwZGF0ZVxuICAgIGZvciAodmFyIGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgdGhpc1trZXldID0gdXBkYXRlW2tleV07XG4gICAgfVxuICAgIC8vIGRlbGV0ZSBjaGFuZ2UucGxheWVySUQ7XG4gICAgLy8gZm9yICh2YXIga2V5IGluIGNoYW5nZSkge1xuICAgIC8vICAgICB0aGlzW2tleV0gPSBjaGFuZ2Vba2V5XTtcbiAgICAvLyB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBlcmZvcm1BY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24pe1xuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcbiAgICAgICAgY2FzZSBcInR1cm5Ub3dhcmRzXCI6XG4gICAgICAgICAgICB0aGlzLnR1cm5Ub3dhcmRzKGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihjYW52YXMsIGN0eCl7XG4gICAgLy9kcmF3IGNpcmNsZVxuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcbiAgICAvLyBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgaGVscGVycy50b1JhZGlhbnMoMzYwKSwgZmFsc2UpO1xuICAgIC8vIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAvLyBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgIC8vIGN0eC5maWxsKCk7XG4gICAgLy9cbiAgICAvLyAvLyBkcmF3IHZpZXdpbmcgZGlyZWN0aW9uXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIC8vIGN0eC5hcmModGhpcy54LCB0aGlzLnksdGhpcy5yYWRpdXMsIGhlbHBlcnMudG9SYWRpYW5zKHRoaXMuZGlyZWN0aW9uIC0gdGhpcy52aWV3aW5nQW5nbGUpLCBoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbiArIHRoaXMudmlld2luZ0FuZ2xlKSk7XG4gICAgLy8gY3R4LmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgLy8gY3R4LmNsb3NlUGF0aCgpO1xuICAgIC8vIGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xuICAgIC8vIGN0eC5maWxsKCk7XG4gICAgLy9jb25zb2xlLmxvZyh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgdGhpcy54LCB0aGlzLnksIHRoaXMuZHcsIHRoaXMuZGgpXG5cbiAgICBjdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbiAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIGN0eC5yb3RhdGUoaGVscGVycy50b1JhZGlhbnModGhpcy5kaXJlY3Rpb24pKTsgLy8gcm90YXRlXG4gICAgY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgLSh0aGlzLnN3IC8gMiksIC0odGhpcy5zaCAvIDIpLCB0aGlzLmR3LCB0aGlzLmRoKTtcbiAgICBjdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxufTtcblxuUGxheWVyLnByb3RvdHlwZS50dXJuVG93YXJkcyA9IGZ1bmN0aW9uKHgseSkge1xuICAgIHZhciB4RGlmZiA9IHggLSB0aGlzLng7XG4gICAgdmFyIHlEaWZmID0geSAtIHRoaXMueTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKSAqICgxODAgLyBNYXRoLlBJKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnksXG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICByYWRpdXM6IHRoaXMucmFkaXVzLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxuICAgICAgICBzcGVlZDogdGhpcy5zcGVlZCxcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZXG4gICAgfTtcbn07XG5cbi8vIFRoZSBzdGF0ZSB0aGUgY2xpZW50IHNlbmRzIHRvIHRoZSBob3N0XG5QbGF5ZXIucHJvdG90eXBlLmdldENsaWVudFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWVxuICAgIH07XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnNob290ID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5pZCwgXCJTaG9vdCFcIik7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcclxuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyc1wiKTtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGxheWVycykge1xyXG5cclxuICAgICAgICB2YXIgbXlJRCA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQ7XHJcblxyXG4gICAgICAgIC8vdmFyIGhvc3RJRCA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4ucGVlcjtcclxuXHJcbiAgICAgICAgLy9UT0RPOiB1c2UgaGFuZGxlYmFyc1xyXG4gICAgICAgIHRoaXMuY2xpZW50TGlzdC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpZCBpbiBwbGF5ZXJzKXtcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkICsgXCIgXCIgKyBwbGF5ZXJzW2lkXS5waW5nKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpZCA9PT0gbXlJRCkge1xyXG4gICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcIm1lXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudExpc3QuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcbiIsIi8vIGRlZ3JlZXMgdG8gcmFkaWFuc1xuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xuICAgIHJldHVybiBkZWcgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRvUmFkaWFuczogdG9SYWRpYW5zXG59O1xuIiwidmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lLmpzXCIpO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5zdGFydCgpO1xyXG59KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyB2YXIgUGxheWVyID0gcmVxdWlyZShcIi4vLi4vUGxheWVyXCIpO1xuXG5mdW5jdGlvbiBDbGllbnQoKXtcbiAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuXG4gICAgLy8gU3RyZXNzIHRlc3RcbiAgICB0aGlzLnRlc3RzUmVjZWl2ZWQgPSAwO1xuXG4gICAgdGhpcy5hY3Rpb25zID0gW107IC8vaGVyZSB3ZSB3aWxsIHN0b3JlIGNsaWVudCBhY3Rpb25zIGJlZm9yZSB3ZSBzZW5kIHRoZW0gdG8gdGhlIGhvc3RcbiAgICB0aGlzLmNoYW5nZXMgPSBbXTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGNoYW5nZXMgZnJvbSB0aGUgaG9zdFxuXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAvLyBpdmUgZ290IG15IHBlZXJJRCBhbmQgZ2FtZUlELCBsZXRzIHNlbmQgaXQgdG8gdGhlIHNlcnZlciB0byBqb2luIHRoZSBob3N0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuc29ja2V0LmVtaXQoXCJqb2luXCIsIHtwZWVySUQ6IGlkLCBnYW1lSUQ6IHdpbmRvdy5nYW1lLmdhbWVJRH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuXG4gICAgICAgIC8vIGNsb3NlIG91dCBhbnkgb2xkIGNvbm5lY3Rpb25zXG4gICAgICAgIGlmKE9iamVjdC5rZXlzKHRoaXMuY29ubmVjdGlvbnMpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNvbm5QZWVyIGluIHRoaXMuY29ubmVjdGlvbnMpe1xuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdWzBdLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgaXRcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG5cbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJKb2luZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgam9pbmVkXCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckxlZnRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIExFRlRcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwidGVzdFwiOiAvLyBzdHJlc3MgdGVzdGluZ1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlc3QhXCIpO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnRlc3RzUmVjZWl2ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVjZWl2aW5nIGdhbWUgc3RhdGVcIiwgZGF0YS5nYW1lU3RhdGUuZW50aXRpZXMsIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmdhbWVTdGF0ZS5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24ocGxheWVyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiY2hhbmdlc1wiOlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5jb25jYXQoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOiAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgcGluZ3M6XCIsIGRhdGEucGluZ3MpO1xuICAgICAgICAgICAgICAgICAgIGRhdGEucGluZ3MuZm9yRWFjaChmdW5jdGlvbihwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbcGluZy5pZF0ucGluZyA9IHBpbmcucGluZztcbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHdpbmRvdy5nYW1lLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG59XG5cbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHZhciBsYXN0Q2xpZW50U3RhdGUgPSBwbGF5ZXIubGFzdENsaWVudFN0YXRlO1xuICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RDbGllbnRTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuXG4gICAgLy8gYWRkIGFueSBwZXJmb3JtZWQgYWN0aW9ucyB0byBjaGFuZ2UgcGFja2FnZVxuICAgIC8vIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICBjaGFuZ2UuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucztcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107XG4gICAgLy8gfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlcywgc2VuZCBlbSB0byBob3N0XG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAgICAgICAgIGV2ZW50OiBcIm5ldHdvcmtVcGRhdGVcIixcbiAgICAgICAgICAgIHVwZGF0ZXM6IGNoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGxheWVyLmxhc3RDbGllbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZTtcblxuXG5cblxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldO1xuICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZS5pZCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGUgcGxheWVyXCIsIGNoYW5nZSk7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5pZF0ubmV0d29ya1VwZGF0ZShjaGFuZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XG5cblxuXG5cbiAgICAvLyAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIC8vIHZhciBteVBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICAvLyBpZiAoIW15UGxheWVyKSByZXR1cm47XG4gICAgLy9cbiAgICAvLyAgaWYgKCFfLmlzRXF1YWwobXlQbGF5ZXIua2V5cywgbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlKSkge1xuICAgIC8vICAgICAvLyBzZW5kIGtleXN0YXRlIHRvIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwia2V5c1wiLFxuICAgIC8vICAgICAgICAga2V5czogbXlQbGF5ZXIua2V5c1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgfVxuICAgIC8vIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSA9IF8uY2xvbmUobXlQbGF5ZXIua2V5cyk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcbiAgICAvL1xuICAgIC8vIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XG4gICAgLy8gdmFyIGNoYW5nZXMgPSBbXTtcbiAgICAvLyB2YXIgbGFzdFN0YXRlID0gbXlQbGF5ZXIubGFzdFN0YXRlO1xuICAgIC8vIHZhciBuZXdTdGF0ZSA9IG15UGxheWVyLmdldFN0YXRlKCk7XG4gICAgLy9cbiAgICAvLyAvLyBjb21wYXJlIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgLy8gdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgIC8vIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAvLyAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAvLyAgICAgY2hhbmdlLnBsYXllcklEID0gbXlQbGF5ZXIuaWQ7XG4gICAgLy8gICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIG15UGxheWVyLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xuICAgIC8vIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXG4gICAgLy8gaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAvLyAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYgKHRoaXMuYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgIC8vIHNlbmQgYWxsIHBlcmZvcm1lZCBhY3Rpb25zIHRvIHRoZSBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImFjdGlvbnNcIixcbiAgICAvLyAgICAgICAgIGRhdGE6IHRoaXMuYWN0aW9uc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107IC8vIGNsZWFyIGFjdGlvbnMgcXVldWVcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jaGFuZ2VzW2ldLmxlbmd0aDsgaiArPSAxKSAge1xuICAgIC8vICAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldW2pdO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAvLyAgICAgICAgIGlmIChjaGFuZ2UucGxheWVySUQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHRoaXMuY2hhbmdlcyA9IFtdO1xuXG59O1xuXG4gICAgLy9cbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAvLyAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XG4gICAgLy8gICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgLy8gICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgLy8gICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvLyBwaW5nIHRlc3RcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgIC8vICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH0sIDIwMDApO1xuICAgIC8vXG4gICAgLy8gfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XG4gICAgdGhpcy5jb25ucyA9IHt9O1xuICAgIHRoaXMuYWN0aW9ucyA9IHt9OyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgYWxsIHRoZSBhY3Rpb25zIHJlY2VpdmVkIGZyb20gY2xpZW50c1xuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIHRoaXMuZGlmZiA9IG51bGw7XG5cbiAgICB0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihwZWVycyl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdFwiLCBwZWVycyk7XG4gICAgICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2VuZCBhIHBpbmcgZXZlcnkgMiBzZWNvbmRzLCB0byB0cmFjayBwaW5nIHRpbWVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBwaW5nczogd2luZG93LmdhbWUubmV0d29yay5ob3N0LmdldFBpbmdzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG5cbiAgICAgICAgICAgIHBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XG4gICAgICAgICAgICAgICAgLy9jb25uZWN0IHdpdGggZWFjaCByZW1vdGUgcGVlclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xuICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogbmV3UGxheWVyLmdldEZ1bGxTdGF0ZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZW1pdCgge2NsaWVudElEOiBjb25uLnBlZXIsIGV2ZW50OiBcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBFVkVOVFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pOyAvLyBhbnN3ZXIgdGhlIHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBjbGllbnQsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmV0d29ya1VwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBmcm9tIGEgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLm5ldHdvcmtVcGRhdGUoZGF0YS51cGRhdGVzKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImFjdGlvbnNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJhY3Rpb25zIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiY2hhbmdlc1wiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uY2hhbmdlKGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImtleXNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJrZXlzIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhLmtleXMsICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMgPSBfLmNsb25lKGRhdGEua2V5cyk7IC8vVE9ETzogdmVyaWZ5IGlucHV0IChjaGVjayB0aGF0IGl0IGlzIHRoZSBrZXkgb2JqZWN0IHdpdGggdHJ1ZS9mYWxzZSB2YWx1ZXMpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcbiAgICAgICAgICAgIHRoaXMuY29ubnNbY29ubl0uc2VuZChkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFTUlUIVwiLCBkYXRhKTtcbiAgICAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xuICAgIH07XG5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnRuVGVzdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7ZXZlbnQ6IFwidGVzdFwiLCBtZXNzYWdlOiBcImFzZGFzZGFzXCJ9KTtcbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuXG4gICAgICAgIHZhciBjaGFuZ2VzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICB2YXIgY3VycmVudEZ1bGxTdGF0ZSA9IHBsYXllci5nZXRGdWxsU3RhdGUoKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudEZ1bGxTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBwbGF5ZXIubGFzdEZ1bGxTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkgeyAvL3RoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgY2hhbmdlLmlkID0gcGxheWVyLmlkO1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIHBsYXllci5sYXN0RnVsbFN0YXRlID0gY3VycmVudEZ1bGxTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XG4gICAgICAgIC8vIHZhciBjaGFuZ2VzID0gW107XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgIC8vICAgICB2YXIgbGFzdFN0YXRlID0gd2luZG93LmdhbWUucGxheWVyc1trZXldLmxhc3RTdGF0ZTtcbiAgICAgICAgLy8gICAgIHZhciBuZXdTdGF0ZSA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRTdGF0ZSgpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgLy8gY29tcGFyZSB0aGlzIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgICAgIC8vICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XG4gICAgICAgIC8vICAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAgICAgLy8gICAgICAgICBjaGFuZ2UucGxheWVySUQgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uaWQ7XG4gICAgICAgIC8vICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0ubGFzdFN0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy9cblxuICAgICAgICAvL1xuICAgICAgICAvLyBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXN0UGxheWVyc1N0YXRlLmxlbmd0aDsgaSArPSAxKXtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIC8vIGdldCB0aGUgcGxheWVycyBsYXN0IGFuZCBuZXcgc3RhdGVcbiAgICAgICAgLy8gICAgIHZhciBpZCA9IHRoaXMubGFzdFBsYXllcnNTdGF0ZVtpXS5pZDtcbiAgICAgICAgLy8gICAgIHZhciBsYXN0U3RhdGUgPSB0aGlzLmxhc3RQbGF5ZXJzU3RhdGVbaV07XG4gICAgICAgIC8vICAgICB2YXIgbmV3U3RhdGUgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2lkXS5nZXRTdGF0ZSgpO1xuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgLy8gY29tcGFyZSB0aGlzIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgICAgIC8vICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XG4gICAgICAgIC8vICAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhcImNoYW5nZXMhISEhISEhISEhISEhISEhISFcIik7XG4gICAgICAgIC8vICAgICAgICAgY2hhbmdlLnBsYXllcklEID0gaWQ7XG4gICAgICAgIC8vICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICBjdXJyZW50UGxheWVyc1N0YXRlLnB1c2gobmV3U3RhdGUpO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IGN1cnJlbnRQbGF5ZXJzU3RhdGU7XG4gICAgICAgIC8vIGlmICh0aGlzLmxhc3RQbGF5ZXJzU3RhdGUubGVuZ3RoID09PSAwKSB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSB3aW5kb3cuZ2FtZS5nZXRQbGF5ZXJzU3RhdGUoKTsgLy8gaWYgbmV3bHkgc3RhcnRlZCBnYW1lLi5cblxuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXG4gICAgICAgIC8vIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAvLyAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAvLyAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAgICAgLy8gICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vY29uc29sZS5sb2coY3VycmVudFBsYXllcnNTdGF0ZSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGNvbXBhcmUgY3VycmVudCBzdGF0ZSB0byBlYXJsaWVyIGdldEdhbWVTdGF0ZVxuICAgICAgICAvLyBzZW5kIGRpZmZlcmVuY2UgdG8gcGxheWVyc1xuXG4gICAgICAgIC8vIHdpbmRvdy5nYW1lLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gc2VuZCBhY3Rpb25zIHRvIGFsbCBjbGllbnRzXG4gICAgICAgIC8vIHRoaXMuYnJvYWRjYXN0KHtcbiAgICAgICAgLy8gICAgIGV2ZW50OiBcImFjdGlvbnNcIixcbiAgICAgICAgLy8gICAgIGFjdGlvbnM6XG4gICAgICAgIC8vIH0pXG5cbiAgICB9O1xuXG5cblxuICAgIHRoaXMuZ2V0UGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBpbmdzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgcGluZ3MucHVzaCh7aWQ6IHBsYXllci5pZCwgcGluZzogcGxheWVyLnBpbmcgfHwgXCJob3N0XCJ9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwaW5ncztcbiAgICB9O1xufTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbi8vIC8vIHN0cmVzcyB0ZXN0XG4vLyBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuLy8gICAgICAgICB0eXBlOiBcInRlc3RcIixcbi8vICAgICAgICAgZGF0YTogXCJhc2Rhc2RhcyBkYXNkc2FkYXMgZGFzYXNkYXNkIGFzZGFzZCBhc2RhZHNkcXcyM3F3a2xwIGdrbHBcIlxuLy8gICAgIH0pO1xuLy8gfSwxNik7XG4gICAgLy9cbiAgICAvLyBuZXR3b3JrLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZS5nYW1lSUR9KTtcbiAgICAvL1xuICAgIC8vIC8qKlxuICAgIC8vICAqIEEgdXNlciBoYXMgam9pbmVkLiBlc3RhYmxpc2ggYSBuZXcgcGVlciBjb25uZWN0aW9uIHdpdGggaXRcbiAgICAvLyAqL1xuICAgIC8vIG5ldHdvcmsuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXG4gICAgLy8gICAgIHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcbiAgICAvL1xuICAgIC8vICAgICBwZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xuICAgIC8vICAgICAgICAgdmFyIGNvbm4gPSAgcGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcbiAgICAvLyAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gcGVlcjtcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gY29ubjtcbiAgICAvL1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJTQURMQVNEQVNEQVNcIiwgaWQsIHBlZXIsIGNvbm4pO1xuICAgIC8vICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuICAgIC8vICAgICAgICAgdGhpcy5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogSlNPTi5zdHJpbmdpZnkobmV3UGxheWVyKSB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAgICAgLy9yZWNlaXZpbmcgZGF0YSBmcm9tIGEgY2xpZW50XG4gICAgLy8gICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCI9PT09PVxcbkhPU1QgLSBkYXRhIGZyb20gY2xpZW50XFxuXCIsIGRhdGEsXCJcXG49PT09PVwiKTtcbiAgICAvLyAgICAgICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBhbnN3ZXIgdGhlIHBpbmdcbiAgICAvLyAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikge1xuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAvLyAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgLy90aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcbiAgICAvLyAgICAgICAgIC8vIGNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIC8vICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxuICAgIC8vICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCBjb25uLCBcIlBFRVJcIiwgcGVlcik7XG4gICAgLy8gICAgICAgICAvLyAgICAgZGVsZXRlIHRoaXMucGVlcnNbY29ubi5wZWVyXTtcbiAgICAvLyAgICAgICAgIC8vICAgICBkZWxldGUgdGhpcy5jb25uc1tjb25uLnBlZXJdO1xuICAgIC8vICAgICAgICAgLy8gICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xuICAgIC8vICAgICAgICAgLy8gfS5iaW5kKHRoaXMpKTtcbiAgICAvLyAgICAgICAgIC8vXG4gICAgLy8gICAgIH0uYmluZCh0aGlzKSk7XG4gICAgLy9cbiAgICAvLyB9LmJpbmQodGhpcykpO1xuICAgIC8vXG4gICAgLy8gdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiU2VuZFwiLCBkYXRhKTtcbiAgICAvLyAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbY29ubl0uc2VuZChkYXRhKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH07XG4gICAgLy9cbiAgICAvLyAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxuICAgIC8vIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xuICAgIC8vIH07XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZW5kVGVzdFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgIHRoaXMuc2VuZChcImFzZGFzZGFzZGFzZGFzXCIpO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5waW5nID0gMDtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8oKTtcclxuICAgIHRoaXMuY2xpZW50ID0gbmV3IENsaWVudCgpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwieW91QXJlSG9zdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJpbSB0aGUgaG9zdFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QgPSBuZXcgSG9zdCgpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KGRhdGEucGVlcnMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJKb2luZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KFtkYXRhLnBlZXJJRF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIC8vIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIC8vIHRoaXMuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxufTtcclxuIl19
