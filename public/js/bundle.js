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
                   window.game.network.ping = window.game.players[window.game.network.client.peer.id].ping;
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
    this.ping = "-";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2hlbHBlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy93ZWJSVEMvQ2xpZW50LmpzIiwic3JjL2pzL3dlYlJUQy9Ib3N0LmpzIiwic3JjL2pzL3dlYlJUQy9XZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSAzMjA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDI0MDtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNcIik7XHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjE2cHggc2VyaWZcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBsYXllcnMgPSB7fTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcblxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXHJcbiAgICAgICAgdGhpcy5mcHMgPSBNYXRoLnJvdW5kKDEwMDAgLyBkdCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCAvIDEwMDApOyAvL2RlbHRhdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYWxsIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKHRoaXMuY2FudmFzLCB0aGlzLmN0eCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGZwcyBhbmQgcGluZ1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgdGhpcy5mcHMsIDEwLCAyMCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoXCJQSU5HOiBcIiArIHRoaXMubmV0d29yay5waW5nLCAxMCwgNDIpO1xyXG4gICAgfTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkUGxheWVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAgaWYoZGF0YS5pZCBpbiB0aGlzLnBsYXllcnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG5cclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVtb3ZpbmcgcGxheWVyXCIsIGRhdGEpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XHJcbiAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudGl0eSk7XHJcbiAgICAgICAgLy8gfSksXHJcbiAgICAgICAgZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkgeyByZXR1cm4gZW50aXR5LmdldEZ1bGxTdGF0ZSgpOyAgICAgICAgfSksXHJcbiAgICAgICAgLy9wbGF5ZXJzOiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkod2luZG93LmdhbWUucGxheWVyc1trZXldKTsgfSlcclxuICAgICAgICBwbGF5ZXJzOiB0aGlzLmdldFBsYXllcnNTdGF0ZSgpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0UGxheWVyc1N0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRGdWxsU3RhdGUoKTsgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsImZ1bmN0aW9uIEtleWJvYXJkKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgLy90aGlzLmxhc3RTdGF0ZSA9IF8uY2xvbmUocGxheWVyLmtleXMpO1xuICAgIHRoaXMua2V5RG93bkhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwICE9PSB0cnVlKSAgcGxheWVyLmtVcD0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gIT09IHRydWUpICBwbGF5ZXIua0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgIT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCA9PT0gdHJ1ZSkgcGxheWVyLmtVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biA9PT0gdHJ1ZSkgcGxheWVyLmtEb3duID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgPT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgPT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJmdW5jdGlvbiBNb3VzZShwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuXG4gICAgdGhpcy5jbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vdGhpcy5wbGF5ZXIudHVyblRvd2FyZHMoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgICB0aGlzLnBsYXllci5zaG9vdCgpO1xuICAgICAgICAvLyB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLnB1c2goe1xuICAgICAgICAvLyAgICAgYWN0aW9uOiBcInR1cm5Ub3dhcmRzXCIsXG4gICAgICAgIC8vICAgICBkYXRhOiB7XG4gICAgICAgIC8vICAgICAgICAgeDogZS5vZmZzZXRYLFxuICAgICAgICAvLyAgICAgICAgIHk6IGUub2Zmc2V0WVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWCA9IGUub2Zmc2V0WDtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VZID0gZS5vZmZzZXRZO1xuICAgICAgICAvL3RoaXMucGxheWVyLnR1cm5Ub3dhcmRzKGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICB9O1xuICAgIC8vXG4gICAgLy8gdGhpcy5rZXlVcEhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvLyAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgIC8vICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgIC8vICAgICAgICAgICAgIGlmICh0aGlzLmtleXMudyA9PT0gdHJ1ZSl7XG4gICAgLy8gICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCgge2V2ZW50OiBcImtleVVwXCIsIGtleTogODd9ICk7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMua2V5cy53ID0gZmFsc2U7XG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU1wiKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH07XG5cbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xuIiwiZnVuY3Rpb24gQ29udHJvbHMoKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xyXG4iLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoXCIuL0tleWJvYXJkXCIpO1xudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcblxuZnVuY3Rpb24gUGxheWVyKHBsYXllckRhdGEpIHtcbiAgICB0aGlzLmlkID0gcGxheWVyRGF0YS5pZDtcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwOyAvLyBjaXJjbGUgcmFkaXVzXG4gICAgdGhpcy54ID0gcGxheWVyRGF0YS54IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUud2lkdGggLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5oZWlnaHQgLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gcGxheWVyRGF0YS52aWV3aW5nQW5nbGUgfHwgNDU7XG4gICAgdGhpcy5zcGVlZCA9IHBsYXllckRhdGEuc3BlZWQgfHwgMTAwOyAvL3BpeGVscyBwZXIgc2Vjb25kXG5cbiAgICB0aGlzLnN4ID0gMDtcbiAgICB0aGlzLnN5ID0gMDtcbiAgICB0aGlzLnN3ID0gNjA7XG4gICAgdGhpcy5zaCA9IDYwO1xuICAgIHRoaXMuZHcgPSA2MDtcbiAgICB0aGlzLmRoID0gNjA7XG5cbiAgICAvLyBrZXlzXG4gICAgdGhpcy5rVXAgPSBmYWxzZTtcbiAgICB0aGlzLmtEb3duID0gZmFsc2U7XG4gICAgdGhpcy5rTGVmdCA9IGZhbHNlO1xuICAgIHRoaXMua1JpZ2h0ID0gZmFsc2U7XG5cbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcblxuICAgIHRoaXMubGFzdENsaWVudFN0YXRlID0gdGhpcy5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHRoaXMubGFzdEZ1bGxTdGF0ZSA9IHRoaXMuZ2V0RnVsbFN0YXRlKCk7XG5cbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcblxuICAgIC8vaXMgdGhpcyBtZSBvciBhbm90aGVyIHBsYXllclxuICAgIHRoaXMuY29udHJvbHMgPSAocGxheWVyRGF0YS5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgPyB7bW91c2U6IG5ldyBNb3VzZSh0aGlzKSwga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZCh0aGlzKX0gOiBuZXcgTmV0d29ya0NvbnRyb2xzKCk7XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xuXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIHF1ZXVlZCB1cCBhY3Rpb25zIGFuZCBwZXJmb3JtIHRoZW1cbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aW9ucy5sZW5ndGg7IGkgKz0gMSl7XG4gICAgLy8gICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5hY3Rpb25zW2ldLmRhdGEubGVuZ3RoOyBqICs9IDEpe1xuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uID0gdGhpcy5hY3Rpb25zW2ldLmRhdGFbal07XG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybUFjdGlvbihhY3Rpb24pO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIGlmICh0aGlzLmtVcCkge1xuICAgICAgICB0aGlzLnkgLT0gZGlzdGFuY2U7XG4gICAgfVxuICAgIGlmICh0aGlzLmtEb3duKSB7XG4gICAgICAgIHRoaXMueSArPSBkaXN0YW5jZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5rTGVmdCkge1xuICAgICAgICB0aGlzLnggLT0gZGlzdGFuY2U7XG4gICAgfVxuICAgIGlmICh0aGlzLmtSaWdodCkge1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgdGhpcy50dXJuVG93YXJkcyh0aGlzLm1vdXNlWCwgdGhpcy5tb3VzZVkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXR3b3JrVXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICAvLyBuZXR3b3JrVXBkYXRlXG4gICAgZm9yICh2YXIga2V5IGluIHVwZGF0ZSkge1xuICAgICAgICB0aGlzW2tleV0gPSB1cGRhdGVba2V5XTtcbiAgICB9XG4gICAgLy8gZGVsZXRlIGNoYW5nZS5wbGF5ZXJJRDtcbiAgICAvLyBmb3IgKHZhciBrZXkgaW4gY2hhbmdlKSB7XG4gICAgLy8gICAgIHRoaXNba2V5XSA9IGNoYW5nZVtrZXldO1xuICAgIC8vIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGVyZm9ybUFjdGlvbiA9IGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgc3dpdGNoKGFjdGlvbi5hY3Rpb24pe1xuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcbiAgICAgICAgICAgIHRoaXMudHVyblRvd2FyZHMoYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGNhbnZhcywgY3R4KXtcbiAgICAvL2RyYXcgY2lyY2xlXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCBoZWxwZXJzLnRvUmFkaWFucygzNjApLCBmYWxzZSk7XG4gICAgLy8gY3R4LmNsb3NlUGF0aCgpO1xuICAgIC8vIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgLy8gY3R4LmZpbGwoKTtcbiAgICAvL1xuICAgIC8vIC8vIGRyYXcgdmlld2luZyBkaXJlY3Rpb25cbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XG4gICAgLy8gY3R4Lm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgLy8gY3R4LmFyYyh0aGlzLngsIHRoaXMueSx0aGlzLnJhZGl1cywgaGVscGVycy50b1JhZGlhbnModGhpcy5kaXJlY3Rpb24gLSB0aGlzLnZpZXdpbmdBbmdsZSksIGhlbHBlcnMudG9SYWRpYW5zKHRoaXMuZGlyZWN0aW9uICsgdGhpcy52aWV3aW5nQW5nbGUpKTtcbiAgICAvLyBjdHgubGluZVRvKHRoaXMueCwgdGhpcy55KTtcbiAgICAvLyBjdHguY2xvc2VQYXRoKCk7XG4gICAgLy8gY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgLy8gY3R4LmZpbGwoKTtcbiAgICAvL2NvbnNvbGUubG9nKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLnN4LCB0aGlzLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCB0aGlzLngsIHRoaXMueSwgdGhpcy5kdywgdGhpcy5kaClcblxuICAgIGN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIGN0eC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgY3R4LnJvdGF0ZShoZWxwZXJzLnRvUmFkaWFucyh0aGlzLmRpcmVjdGlvbikpOyAvLyByb3RhdGVcbiAgICBjdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLnN4LCB0aGlzLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xuICAgIGN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnR1cm5Ub3dhcmRzID0gZnVuY3Rpb24oeCx5KSB7XG4gICAgdmFyIHhEaWZmID0geCAtIHRoaXMueDtcbiAgICB2YXIgeURpZmYgPSB5IC0gdGhpcy55O1xuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpICogKDE4MCAvIE1hdGguUEkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueSxcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIHZpZXdpbmdBbmdsZTogdGhpcy52aWV3aW5nQW5nbGUsXG4gICAgICAgIHNwZWVkOiB0aGlzLnNwZWVkLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVlcbiAgICB9O1xufTtcblxuLy8gVGhlIHN0YXRlIHRoZSBjbGllbnQgc2VuZHMgdG8gdGhlIGhvc3RcblBsYXllci5wcm90b3R5cGUuZ2V0Q2xpZW50U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZXG4gICAgfTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuc2hvb3QgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkLCBcIlNob290IVwiKTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFVpKGdhbWUpe1xyXG4gICAgdGhpcy5jbGllbnRMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJzXCIpO1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUNsaWVudExpc3QgPSBmdW5jdGlvbihwbGF5ZXJzKSB7XHJcblxyXG4gICAgICAgIHZhciBteUlEID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZDtcclxuXHJcbiAgICAgICAgLy92YXIgaG9zdElEID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5wZWVyO1xyXG5cclxuICAgICAgICAvL1RPRE86IHVzZSBoYW5kbGViYXJzXHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGlkIGluIHBsYXllcnMpe1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQgKyBcIiBcIiArIHBsYXllcnNbaWRdLnBpbmcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlkID09PSBteUlEKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwibWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50TGlzdC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIiwiLy8gZGVncmVlcyB0byByYWRpYW5zXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XG4gICAgcmV0dXJuIGRlZyAqIE1hdGguUEkgLyAxODA7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdG9SYWRpYW5zOiB0b1JhZGlhbnNcbn07XG4iLCJ2YXIgR2FtZSA9IHJlcXVpcmUoXCIuL0dhbWUuanNcIik7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XG5cbmZ1bmN0aW9uIENsaWVudCgpe1xuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAvLyBTdHJlc3MgdGVzdFxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XG5cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy9oZXJlIHdlIHdpbGwgc3RvcmUgY2xpZW50IGFjdGlvbnMgYmVmb3JlIHdlIHNlbmQgdGhlbSB0byB0aGUgaG9zdFxuICAgIHRoaXMuY2hhbmdlcyA9IFtdOyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgY2hhbmdlcyBmcm9tIHRoZSBob3N0XG5cbiAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBnYW1lSUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW4gdGhlIGhvc3RcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5zb2NrZXQuZW1pdChcImpvaW5cIiwge3BlZXJJRDogaWQsIGdhbWVJRDogd2luZG93LmdhbWUuZ2FtZUlEfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibXkgY2xpZW50IHBlZXJJRCBpcyBcIiwgaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG5cbiAgICAgICAgLy8gY2xvc2Ugb3V0IGFueSBvbGQgY29ubmVjdGlvbnNcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZm9yICh2YXIgY29ublBlZXIgaW4gdGhpcy5jb25uZWN0aW9ucyl7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5QZWVyICE9PSBjb25uLnBlZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl1bMF0uY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBpdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcblxuICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckpvaW5lZFwiOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInBsYXllciBqb2luZWRcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVyTGVmdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgTEVGVFwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLmlkfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0ZXN0XCI6IC8vIHN0cmVzcyB0ZXN0aW5nXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVzdCFcIik7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQudGVzdHNSZWNlaXZlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWNlaXZpbmcgZ2FtZSBzdGF0ZVwiLCBkYXRhLmdhbWVTdGF0ZS5lbnRpdGllcywgZGF0YS5nYW1lU3RhdGUucGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzLmNvbmNhdChkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInBsYXllciBwaW5nczpcIiwgZGF0YS5waW5ncyk7XG4gICAgICAgICAgICAgICAgICAgZGF0YS5waW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twaW5nLmlkXS5waW5nID0gcGluZy5waW5nO1xuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF0ucGluZztcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHdpbmRvdy5nYW1lLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG59XG5cbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHZhciBsYXN0Q2xpZW50U3RhdGUgPSBwbGF5ZXIubGFzdENsaWVudFN0YXRlO1xuICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RDbGllbnRTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuXG4gICAgLy8gYWRkIGFueSBwZXJmb3JtZWQgYWN0aW9ucyB0byBjaGFuZ2UgcGFja2FnZVxuICAgIC8vIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICBjaGFuZ2UuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucztcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107XG4gICAgLy8gfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlcywgc2VuZCBlbSB0byBob3N0XG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAgICAgICAgIGV2ZW50OiBcIm5ldHdvcmtVcGRhdGVcIixcbiAgICAgICAgICAgIHVwZGF0ZXM6IGNoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGxheWVyLmxhc3RDbGllbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZTtcblxuXG5cblxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldO1xuICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZS5pZCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1cGRhdGUgcGxheWVyXCIsIGNoYW5nZSk7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5pZF0ubmV0d29ya1VwZGF0ZShjaGFuZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XG5cblxuXG5cbiAgICAvLyAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIC8vIHZhciBteVBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICAvLyBpZiAoIW15UGxheWVyKSByZXR1cm47XG4gICAgLy9cbiAgICAvLyAgaWYgKCFfLmlzRXF1YWwobXlQbGF5ZXIua2V5cywgbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlKSkge1xuICAgIC8vICAgICAvLyBzZW5kIGtleXN0YXRlIHRvIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwia2V5c1wiLFxuICAgIC8vICAgICAgICAga2V5czogbXlQbGF5ZXIua2V5c1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgfVxuICAgIC8vIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSA9IF8uY2xvbmUobXlQbGF5ZXIua2V5cyk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcbiAgICAvL1xuICAgIC8vIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XG4gICAgLy8gdmFyIGNoYW5nZXMgPSBbXTtcbiAgICAvLyB2YXIgbGFzdFN0YXRlID0gbXlQbGF5ZXIubGFzdFN0YXRlO1xuICAgIC8vIHZhciBuZXdTdGF0ZSA9IG15UGxheWVyLmdldFN0YXRlKCk7XG4gICAgLy9cbiAgICAvLyAvLyBjb21wYXJlIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgLy8gdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgIC8vIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAvLyAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAvLyAgICAgY2hhbmdlLnBsYXllcklEID0gbXlQbGF5ZXIuaWQ7XG4gICAgLy8gICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIG15UGxheWVyLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xuICAgIC8vIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXG4gICAgLy8gaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAvLyAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYgKHRoaXMuYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgIC8vIHNlbmQgYWxsIHBlcmZvcm1lZCBhY3Rpb25zIHRvIHRoZSBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImFjdGlvbnNcIixcbiAgICAvLyAgICAgICAgIGRhdGE6IHRoaXMuYWN0aW9uc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107IC8vIGNsZWFyIGFjdGlvbnMgcXVldWVcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jaGFuZ2VzW2ldLmxlbmd0aDsgaiArPSAxKSAge1xuICAgIC8vICAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldW2pdO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAvLyAgICAgICAgIGlmIChjaGFuZ2UucGxheWVySUQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHRoaXMuY2hhbmdlcyA9IFtdO1xuXG59O1xuXG4gICAgLy9cbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAvLyAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XG4gICAgLy8gICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgLy8gICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgLy8gICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvLyBwaW5nIHRlc3RcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgIC8vICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH0sIDIwMDApO1xuICAgIC8vXG4gICAgLy8gfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XG4gICAgdGhpcy5jb25ucyA9IHt9O1xuICAgIHRoaXMuYWN0aW9ucyA9IHt9OyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgYWxsIHRoZSBhY3Rpb25zIHJlY2VpdmVkIGZyb20gY2xpZW50c1xuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIHRoaXMuZGlmZiA9IG51bGw7XG5cbiAgICB0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihwZWVycyl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdFwiLCBwZWVycyk7XG4gICAgICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2VuZCBhIHBpbmcgZXZlcnkgMiBzZWNvbmRzLCB0byB0cmFjayBwaW5nIHRpbWVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBwaW5nczogd2luZG93LmdhbWUubmV0d29yay5ob3N0LmdldFBpbmdzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG5cbiAgICAgICAgICAgIHBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XG4gICAgICAgICAgICAgICAgLy9jb25uZWN0IHdpdGggZWFjaCByZW1vdGUgcGVlclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xuICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogbmV3UGxheWVyLmdldEZ1bGxTdGF0ZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZW1pdCgge2NsaWVudElEOiBjb25uLnBlZXIsIGV2ZW50OiBcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBFVkVOVFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pOyAvLyBhbnN3ZXIgdGhlIHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBjbGllbnQsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmV0d29ya1VwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBmcm9tIGEgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLm5ldHdvcmtVcGRhdGUoZGF0YS51cGRhdGVzKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImFjdGlvbnNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJhY3Rpb25zIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiY2hhbmdlc1wiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uY2hhbmdlKGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImtleXNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJrZXlzIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhLmtleXMsICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMgPSBfLmNsb25lKGRhdGEua2V5cyk7IC8vVE9ETzogdmVyaWZ5IGlucHV0IChjaGVjayB0aGF0IGl0IGlzIHRoZSBrZXkgb2JqZWN0IHdpdGggdHJ1ZS9mYWxzZSB2YWx1ZXMpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcbiAgICAgICAgICAgIHRoaXMuY29ubnNbY29ubl0uc2VuZChkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFTUlUIVwiLCBkYXRhKTtcbiAgICAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcblxuICAgICAgICB2YXIgY2hhbmdlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRGdWxsU3RhdGUgPSBwbGF5ZXIuZ2V0RnVsbFN0YXRlKCk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRGdWxsU3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gcGxheWVyLmxhc3RGdWxsU3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcbiAgICAgICAgICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHsgLy90aGVyZSdzIGJlZW4gY2hhbmdlc1xuICAgICAgICAgICAgICAgIGNoYW5nZS5pZCA9IHBsYXllci5pZDtcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIubGFzdEZ1bGxTdGF0ZSA9IGN1cnJlbnRGdWxsU3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YXIgY3VycmVudFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgICAgICAvLyB2YXIgY2hhbmdlcyA9IFtdO1xuICAgICAgICAvL1xuICAgICAgICAvLyBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAvLyAgICAgdmFyIGxhc3RTdGF0ZSA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5sYXN0U3RhdGU7XG4gICAgICAgIC8vICAgICB2YXIgbmV3U3RhdGUgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uZ2V0U3RhdGUoKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIC8vIGNvbXBhcmUgdGhpcyBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxuICAgICAgICAvLyAgICAgdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgICAgICAvLyAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyAgICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgICAgIC8vICAgICAgICAgY2hhbmdlLnBsYXllcklEID0gd2luZG93LmdhbWUucGxheWVyc1trZXldLmlkO1xuICAgICAgICAvLyAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgd2luZG93LmdhbWUucGxheWVyc1trZXldLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vXG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGFzdFBsYXllcnNTdGF0ZS5sZW5ndGg7IGkgKz0gMSl7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAvLyBnZXQgdGhlIHBsYXllcnMgbGFzdCBhbmQgbmV3IHN0YXRlXG4gICAgICAgIC8vICAgICB2YXIgaWQgPSB0aGlzLmxhc3RQbGF5ZXJzU3RhdGVbaV0uaWQ7XG4gICAgICAgIC8vICAgICB2YXIgbGFzdFN0YXRlID0gdGhpcy5sYXN0UGxheWVyc1N0YXRlW2ldO1xuICAgICAgICAvLyAgICAgdmFyIG5ld1N0YXRlID0gd2luZG93LmdhbWUucGxheWVyc1tpZF0uZ2V0U3RhdGUoKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy9cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIC8vIGNvbXBhcmUgdGhpcyBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxuICAgICAgICAvLyAgICAgdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgICAgICAvLyAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyAgICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJjaGFuZ2VzISEhISEhISEhISEhISEhISEhXCIpO1xuICAgICAgICAvLyAgICAgICAgIGNoYW5nZS5wbGF5ZXJJRCA9IGlkO1xuICAgICAgICAvLyAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgY3VycmVudFBsYXllcnNTdGF0ZS5wdXNoKG5ld1N0YXRlKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvL1xuICAgICAgICAvLyB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSBjdXJyZW50UGxheWVyc1N0YXRlO1xuICAgICAgICAvLyBpZiAodGhpcy5sYXN0UGxheWVyc1N0YXRlLmxlbmd0aCA9PT0gMCkgdGhpcy5sYXN0UGxheWVyc1N0YXRlID0gd2luZG93LmdhbWUuZ2V0UGxheWVyc1N0YXRlKCk7IC8vIGlmIG5ld2x5IHN0YXJ0ZWQgZ2FtZS4uXG5cblxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgY2hhbmdlc1xuICAgICAgICAvLyBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgLy8gICAgIHRoaXMuYnJvYWRjYXN0KHtcbiAgICAgICAgLy8gICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgICAgIC8vICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnRQbGF5ZXJzU3RhdGUpO1xuICAgICAgICAvL1xuICAgICAgICAvLyBjb21wYXJlIGN1cnJlbnQgc3RhdGUgdG8gZWFybGllciBnZXRHYW1lU3RhdGVcbiAgICAgICAgLy8gc2VuZCBkaWZmZXJlbmNlIHRvIHBsYXllcnNcblxuICAgICAgICAvLyB3aW5kb3cuZ2FtZS5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24ocGxheWVyKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHNlbmQgYWN0aW9ucyB0byBhbGwgY2xpZW50c1xuICAgICAgICAvLyB0aGlzLmJyb2FkY2FzdCh7XG4gICAgICAgIC8vICAgICBldmVudDogXCJhY3Rpb25zXCIsXG4gICAgICAgIC8vICAgICBhY3Rpb25zOlxuICAgICAgICAvLyB9KVxuXG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmdldFBpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwaW5ncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHBpbmdzLnB1c2goe2lkOiBwbGF5ZXIuaWQsIHBpbmc6IHBsYXllci5waW5nIHx8IFwiaG9zdFwifSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGluZ3M7XG4gICAgfTtcbn07XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4vLyAvLyBzdHJlc3MgdGVzdFxuLy8gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbi8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbi8vICAgICAgICAgdHlwZTogXCJ0ZXN0XCIsXG4vLyAgICAgICAgIGRhdGE6IFwiYXNkYXNkYXMgZGFzZHNhZGFzIGRhc2FzZGFzZCBhc2Rhc2QgYXNkYWRzZHF3MjNxd2tscCBna2xwXCJcbi8vICAgICB9KTtcbi8vIH0sMTYpO1xuICAgIC8vXG4gICAgLy8gbmV0d29yay5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWUuZ2FtZUlEfSk7XG4gICAgLy9cbiAgICAvLyAvKipcbiAgICAvLyAgKiBBIHVzZXIgaGFzIGpvaW5lZC4gZXN0YWJsaXNoIGEgbmV3IHBlZXIgY29ubmVjdGlvbiB3aXRoIGl0XG4gICAgLy8gKi9cbiAgICAvLyBuZXR3b3JrLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxuICAgIC8vICAgICB2YXIgcGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG4gICAgLy9cbiAgICAvLyAgICAgcGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcbiAgICAvLyAgICAgICAgIHZhciBjb25uID0gIHBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHBlZXI7XG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IGNvbm47XG4gICAgLy9cbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKFwiU0FETEFTREFTREFTXCIsIGlkLCBwZWVyLCBjb25uKTtcbiAgICAvLyAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcbiAgICAvLyAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IEpTT04uc3RyaW5naWZ5KG5ld1BsYXllcikgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgICAgIC8vcmVjZWl2aW5nIGRhdGEgZnJvbSBhIGNsaWVudFxuICAgIC8vICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT1cXG5IT1NUIC0gZGF0YSBmcm9tIGNsaWVudFxcblwiLCBkYXRhLFwiXFxuPT09PT1cIik7XG4gICAgLy8gICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gYW5zd2VyIHRoZSBwaW5nXG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgLy8gICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1tjb25uLnBlZXJdLnBpbmcgPSBwaW5nO1xuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy9cbiAgICAvLyAgICAgICAgIC8vdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XG4gICAgLy8gICAgICAgICAvLyBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAvLyAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcbiAgICAvLyAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgY29ubiwgXCJQRUVSXCIsIHBlZXIpO1xuICAgIC8vICAgICAgICAgLy8gICAgIGRlbGV0ZSB0aGlzLnBlZXJzW2Nvbm4ucGVlcl07XG4gICAgLy8gICAgICAgICAvLyAgICAgZGVsZXRlIHRoaXMuY29ubnNbY29ubi5wZWVyXTtcbiAgICAvLyAgICAgICAgIC8vICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcbiAgICAvLyAgICAgICAgIC8vIH0uYmluZCh0aGlzKSk7XG4gICAgLy8gICAgICAgICAvL1xuICAgIC8vICAgICB9LmJpbmQodGhpcykpO1xuICAgIC8vXG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcbiAgICAvL1xuICAgIC8vIHRoaXMuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhcIlNlbmRcIiwgZGF0YSk7XG4gICAgLy8gICAgIGZvciAodmFyIGNvbm4gaW4gdGhpcy5jb25ucyl7XG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9O1xuICAgIC8vXG4gICAgLy8gLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcbiAgICAvLyB0aGlzLmVtaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcbiAgICAvLyB9O1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2VuZFRlc3RcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICB0aGlzLnNlbmQoXCJhc2Rhc2Rhc2Rhc2Rhc1wiKTtcbiAgICAvLyB9LmJpbmQodGhpcykpO1xuIiwidmFyIENsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcclxudmFyIEhvc3QgPSByZXF1aXJlKFwiLi9Ib3N0XCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJSVEMoKXtcclxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoZGF0YS5wZWVycyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoW2RhdGEucGVlcklEXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
