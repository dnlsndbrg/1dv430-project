(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Animation(data) {
    this.name = data.name;
    this.originalSx = data.sx;
    this.originalSy = data.sy;
    this.sx = data.sx;
    this.sy = data.sy;
    this.w = data.w;
    this.h = data.h;
    this.frames = data.frames;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.animationSpeed = 0.2; // frames per second

    this.playOnce = data.playOnce;
}

Animation.prototype.update = function(dt) {
    this.frameTimer += dt;

    if (this.frameTimer > this.animationSpeed) {
        this.currentFrame += 1;
        this.frameTimer = 0;
    }

    if (this.currentFrame >= this.frames) {
        this.currentFrame = 0;
    }

    this.sx = this.currentAnimation.sx + this.currentAnimation.w * this.currentAnimation.currentFrame;
};

module.exports = Animation;

},{}],2:[function(require,module,exports){
var helpers = require("./helpers");

function Bullet(data) {
    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    this.x = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    this.y = data.y + Math.sin(data.direction + 1.5707963268) * 5;

    this.x = this.x + Math.cos(data.direction) * 30;
    this.y = this.y + Math.sin(data.direction) * 30;
    //this.x = data.x;
    //this.y = data.y;
    this.length = 10; // trail length
    this.direction = data.direction;
    this.speed = data.bulletSpeed;
    this.damage = data.damage;
}

Bullet.prototype.update = function(dt, index) {

    var distance = this.speed * dt;
    //
    this.x = this.x + Math.cos(this.direction) * distance;
    this.y = this.y + Math.sin(this.direction) * distance;

    // if off screen, remove it
    if (this.x < 0 || this.x > window.game.level.width || this.y < 0 || this.y > window.game.level.height) {
        this.destroy(index);
        return;
    }

    this.hitDetection(index);
};

Bullet.prototype.hitDetection = function(index) {
    for (var key in window.game.players) {
        var player = window.game.players[key];
        var a = this.x - player.x;
        var b = this.y - player.y;
        var distance = Math.sqrt( a*a + b*b );

        if (distance < player.radius) {
            this.destroy(index);
            console.log("player", player.id, "takes damage:", this.damage);
        }
    }

};

Bullet.prototype.destroy = function(index) {
    window.game.entities.splice(index, 1);
};

Bullet.prototype.render = function(canvas, ctx){

    ctx.save(); // save current state
    ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    ctx.rotate(this.direction - 0.7853981634); // rotate

    // // linear gradient from start to end of line
    var grad= ctx.createLinearGradient(0, 0, 0, this.length);
    grad.addColorStop(0, "rgba(255,165,0,0)");
    grad.addColorStop(1, "yellow");
    ctx.strokeStyle = grad;

    ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.length, this.length);
      ctx.stroke();


    // ctx.lineWidth = 1;

    //
    // ctx.beginPath();
    // ctx.moveTo(0,0);
    // ctx.lineTo(0,this.length);

    ctx.stroke();


    ctx.restore(); // restore original states (no rotation etc)

    //
    //
    // ctx.lineWidth = 1;
    // // linear gradient from start to end of line
    // var grad= ctx.createLinearGradient(0, 0, 0, this.length);
    // grad.addColorStop(0, "red");
    // grad.addColorStop(1, "green");
    // ctx.strokeStyle = grad;
    // ctx.beginPath();
    // ctx.moveTo(0,0);
    // ctx.lineTo(0,length);
    // ctx.stroke();



};

module.exports = Bullet;

},{"./helpers":13}],3:[function(require,module,exports){
function Camera() {
    this.x = 0;
    this.y = 0;
    // this.width = ;
    // this.height = window.game.height;
    this.following = null;

    this.follow = function(player){
        this.following = player;
    };

    this.update = function() {
        if (!this.following) return;

        this.x = this.following.x - window.game.width / 2;
        this.y = this.following.y - window.game.height / 2;
    };
}

module.exports = Camera;

},{}],4:[function(require,module,exports){
var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player");
var Camera = require("./Camera");
var Level = require("./Level");

function Game() {

    this.started = false;

    this.width = 640;
    this.height = 480;

    this.level = new Level();

    this.spritesheet = new Image();
    this.spritesheet.src = "../img/spritesheet.png";

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    //document.body.appendChild(this.canvas);
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px serif";

    this.gameID = window.location.pathname.split("/")[2];

    this.ui = new Ui(this);
    this.network = new Network();

    this.entities = []; // game entities
    this.players = {};

    this.camera = new Camera();


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
        this.entities.forEach(function(entity, index) {
            entity.update(dt / 1000, index); //deltatime in seconds
        });
        this.camera.update();
        // Update camera
        //this.camera.update();
    };

    /**
     * Rendering
     */
    this.render = function(){
        // clear screen
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw test grid
        // var spacing = 10;
        // for (var y = 0; y <= this.height; y += spacing) {
        //     for(var x = 0; x <= this.width; x += spacing) {
        //         this.ctx.beginPath();
        //         this.ctx.moveTo(x - this.camera.x, y - this.camera.y);
        //         this.ctx.lineTo(this.width, y - this.camera.y);
        //         this.ctx.stroke();
        //     }
        // }
        //
        this.ctx.beginPath();
        this.ctx.rect(0 - this.camera.x, 0 - this.camera.y, this.level.width, this.level.height);

        this.ctx.fillStyle = "gray";
        this.ctx.fill();

        // render all entities
        this.entities.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));

        this.ui.renderDebug();
        // render fps and ping

                // console.log("------------------------");
                // console.log("CAMERA: X:" + this.camera.x, "\nY:" + this.camera.y);
                // console.log(this.players[this.network.client.peer.id]);
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

},{"./Camera":3,"./Level":6,"./Player":9,"./Ui":10,"./webRTC/WebRTC":17}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
function Level(){
    this.width = 640;
    this.height = 480;
}

module.exports = Level;

},{}],7:[function(require,module,exports){
function Mouse(player){
    this.player = player;

    this.click = function(e){
        this.player.actions.push({ // add to the actions queue
            action: "shoot",
            data: {
                x: window.game.camera.x + e.offsetX,
                y: window.game.camera.y + e.offsetY
            }
        });
        //window.game.network.client.actions.push(action); // tell the host of the action
    };

    this.mousemove = function(e) {
        this.player.mouseX = window.game.camera.x + e.offsetX;
        this.player.mouseY = window.game.camera.y + e.offsetY;
    };

    this.mousedown = function(e) {
        switch(e.button) {
            case 0: // left mouse button
                if (player.mouseLeft !== true)  player.mouseLeft = true;
            break;
        }
    };

    this.mouseup = function(e) {
        switch(e.button) {
            case 0: // left mouse button
                if (player.mouseLeft === true) player.mouseLeft  = false;
            break;
        }
    };

    window.game.canvas.addEventListener("mousemove", this.mousemove.bind(this));
    window.game.canvas.addEventListener("mousedown", this.mousedown.bind(this));
    window.game.canvas.addEventListener("mouseup", this.mouseup.bind(this));
    //window.game.canvas.addEventListener("click",this.click.bind(this));
}



module.exports = Mouse;

},{}],8:[function(require,module,exports){
function Controls() {

}

module.exports = Controls;

},{}],9:[function(require,module,exports){
// var helpers = require("./helpers");
var Mouse = require("./Mouse");
var Keyboard = require("./Keyboard");
var NetworkControls = require("./NetworkControls");
var Bullet = require("./Bullet");
var weapons = require("./data/weapons");
var Weapon = require("./Weapon");
var Animation = require("./Animation");

function Player(playerData) {
    this.id = playerData.id;
    this.radius = playerData.radius || 20; // circle radius
    this.x = playerData.x || (Math.floor(Math.random() * (window.game.level.width - this.radius)) + this.radius / 2);
    this.y = playerData.y || (Math.floor(Math.random() * (window.game.level.height - this.radius)) + this.radius / 2);
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 100; //pixels per second
    this.hp = playerData.hp || 100;

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

    // mouse
    this.mouseX = this.x;
    this.mouseY = this.y;
    this.mouseLeft = false;

    this.weapon = new Weapon(this, weapons.AK);

    this.lastClientState = this.getClientState();
    this.lastFullState = this.getFullState();

    this.ping = "-";
    this.actions = []; // actions to be performed
    this.performedActions = []; // succesfully performed actions

    // this.animations = {
    //     "idle": new Animation({name: "idle", sx: 0, sy: 0, w: 60, h: 60, frames: 1, playOnce: false}),
    //     "fire": new Animation({name: "fire", sx: 0, sy: 60, w: 60, h: 60, frames: 1, playOnce: true})
    // };
    //
    // this.currentAnimation = this.animations.idle;

    //is this me or another player
    if (playerData.id === window.game.network.client.peer.id) {
        this.controls = {mouse: new Mouse(this), keyboard: new Keyboard(this)};
        window.game.camera.follow(this);
    } else {
        this.controls = new NetworkControls();
    }
    //this.controls = (playerData.id === window.game.network.client.peer.id) ? : new NetworkControls();
}

Player.prototype.update = function(dt){

    // go through all the queued up actions and perform them
    for (var i = 0; i < this.actions.length; i += 1){
        var success = this.performAction(this.actions[i]);
        if (success) {
            this.performedActions.push(this.actions[i]);
        }
    //     }
    }
    this.actions = [];

    // Update movement
    var distance = this.speed * dt;
    if (this.kUp && this.kLeft) {
        distance = distance * 0.71;
        this.y -= distance;
        this.mouseY -= distance;
        this.x -= distance;
        this.mouseX -= distance;
    } else if (this.kUp && this.kRight) {
        distance = distance * 0.71;
        this.y -= distance;
        this.mouseY -= distance;
        this.x += distance;
        this.mouseX += distance;
    } else if (this.kDown && this.kLeft) {
        distance = distance * 0.71;
        this.y += distance;
        this.mouseY += distance;
        this.x -= distance;
        this.mouseX -= distance;
    } else if (this.kDown && this.kRight) {
        distance = distance * 0.71;
        this.y += distance;
        this.mouseY += distance;
        this.x += distance;
        this.mouseX += distance;
    } else if (this.kUp) {
        this.y -= distance;
        this.mouseY -= distance;
    } else if (this.kDown) {
        this.y += distance;
        this.mouseY += distance;
    } else if (this.kLeft) {
        this.x -= distance;
        this.mouseX -= distance;
    } else if (this.kRight) {
        this.x += distance;
        this.mouseX += distance;
    }

    //check if off screen
    if (this.x > window.game.level.width) this.x = window.game.level.width;
    if (this.x < 0) this.x = 0;
    if (this.y > window.game.level.height) this.y = window.game.level.height;
    if (this.y < 0) this.y = 0;

    this.weapon.update(dt);
    //this.currentAnimation.update(dt);

    if (this.mouseLeft) { // if firing
        this.actions.push({ // add to the actions queue
            action: "fire",
            data: {
                x: this.mouseX,
                y: this.mouseY
            }
        });
    }

    this.turnTowards(this.mouseX, this.mouseY);
};

Player.prototype.networkUpdate = function(update){
    delete update.id;
    // networkUpdate
    for (var key in update) {
        if (key === "actions") this[key] = this[key].concat(update[key]);
        else this[key] = update[key];
    }
};

Player.prototype.performAction = function(action){
    switch(action.action){
        case "turnTowards":
            this.turnTowards(action.data.x, action.data.y);
            break;
        case "fire":
            return this.weapon.fire(action);
    }
};

Player.prototype.render = function(canvas, ctx){
    ctx.save(); // save current state
    ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    ctx.rotate(this.direction); // rotate

    ctx.drawImage(window.game.spritesheet, this.sx, this.sy, this.sw, this.sh, -(this.sw / 2), -(this.sh / 2), this.dw, this.dh);
    // ctx.drawImage(
    //     window.game.spritesheet, // image
    //     this.sx, // x on image
    //     this.currentAnimation.sy, // y on image
    //     this.currentAnimation.w, // width
    //     this.currentAnimation.h, // height
    //     -(this.currentAnimation.w / 2), // center x
    //     -(this.currentAnimation.h / 2), // center y
    //     this.dw,
    //     this.dh
    // );
    ctx.restore(); // restore original states (no rotation etc)
    // ctx.save(); // save current state
    // ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    // ctx.beginPath();
    // ctx.rect(-2, -2, 4, 4);
    // ctx.fillStyle = "red";
    // ctx.fill();
    //  ctx.restore(); // restore original states (no rotation etc)
};

Player.prototype.turnTowards = function(x,y) {
    var xDiff = x - this.x;
    var yDiff = y - this.y;
    this.direction = Math.atan2(yDiff, xDiff);// * (180 / Math.PI);
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

// Player.prototype.fire = function(action) {
//     console.log(this.id, "fire!", action.data.x, action.data.y);
//
//     window.game.entities.push(new Bullet({
//         x: this.x,
//         y: this.y,
//         direction: this.direction
//     }));
//     return action; // every shoot is valid right now
// };

module.exports = Player;

},{"./Animation":1,"./Bullet":2,"./Keyboard":5,"./Mouse":7,"./NetworkControls":8,"./Weapon":11,"./data/weapons":12}],10:[function(require,module,exports){
module.exports = function Ui(game){
    this.clientList = document.querySelector("#players");
    this.game = game;

    this.updateClientList = function(players) {
        var myID = window.game.network.client.peer.id;
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

    this.renderDebug = function() {
        var player = window.game.players[window.game.network.client.peer.id];
        window.game.ctx.fillStyle = "black";
        window.game.ctx.fillText("FPS:  " + window.game.fps, 5, 20);
        window.game.ctx.fillText("PING: " + window.game.network.ping, 5, 42);
        window.game.ctx.fillText("CAMERA: " + Math.floor(window.game.camera.x) + ", " + Math.floor(window.game.camera.y), 5, 64);
        if (player) {
            window.game.ctx.fillText("PLAYER:  " + Math.floor(player.x) + ", " + Math.floor(player.y), 5, 86);
            window.game.ctx.fillText("MOUSE: " + Math.floor(player.mouseX) + ", " + Math.floor(player.mouseY), 5, 108);
            if(player) window.game.ctx.fillText("DIR: " + player.direction.toFixed(2), 5, 130);
        }
    };
};

},{}],11:[function(require,module,exports){
var Bullet = require("./Bullet");

function Weapon(owner, data) {
    this.owner = owner;
    this.name = data.name;
    this.magazine = data.magazine;
    this.fireRate = data.fireRate;
    this.damage = data.damage;
    this.reloadTime = data.reloadTime;
    this.bulletSpeed = data.bulletSpeed;
    this.sx = data.sx;
    this.sy = data.sy;

    this.fireTimer = this.fireRate;

    this.reloading = false;
    this.reloadTimer = 0;

}

Weapon.prototype.update = function(dt) {
    if (this.fireTimer < this.fireRate) this.fireTimer += dt;
};

Weapon.prototype.fire = function(action) {
    //console.log(this.owner.id, "FIRE!", action.data.x, action.data.y);

    if (this.fireTimer < this.fireRate || this.reloading) return false;

    this.fireTimer = 0;
    window.game.entities.push(new Bullet({
        x: this.owner.x,
        y: this.owner.y,
        direction: this.owner.direction,
        bulletSpeed: this.bulletSpeed,
        damage: this.damage
    }));
    return action;
};

module.exports = Weapon;

},{"./Bullet":2}],12:[function(require,module,exports){
var AK = {
    "name": "AK",
    "magazine": 30, // bullets
    "fireRate": 0.1, // shots per second
    "damage": 10, // hp
    "reloadTime": 2, // s
    "bulletSpeed": 1700, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 0 // spritesheet y position
};

module.exports = {
    AK: AK
};

},{}],13:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

function toDegrees(rad) {
    return rad * (180 / Math.PI);
}


module.exports = {
    toRadians: toRadians,
    toDegrees: toDegrees
};

},{}],14:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":4}],15:[function(require,module,exports){
"use strict";
// var Player = require("./../Player");

function Client(){
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

    // Stress test
    this.testsReceived = 0;

    this.actions = [];// here we will store received actions from the host
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
                    // delete old hosts player object
                    //console.log("delete old player", connPeer);
                    //delete window.game.players[connPeer];
                }
            }
        }
        // store it
        window.game.network.client.conn = conn;

        conn.on("data", function(data) {
            switch(data.event){
                case "playerJoined":
                    window.game.addPlayer(data.playerData);
                    break;

                    // case "playerLeft":
                    //     //window.game.addPlayer(data.playerData);
                    //     window.game.removePlayer({id: data.id});
                    //     break;

                case "gameState":
                    data.gameState.players.forEach(function(player){
                        window.game.addPlayer(player);
                    });
                    break;

                case "changes": // changes and actions received from host
                    window.game.network.client.changes = window.game.network.client.changes.concat(data.changes);
                    //window.game.network.client.actions = window.game.network.client.actions.concat(data.actions);
                    break;

                case "ping": // host sent a ping, answer it
                   conn.send({ event: "pong", timestamp: data.timestamp });
                   data.pings.forEach(function(ping) {
                       try {
                           window.game.players[ping.id].ping = ping.ping;
                       }
                       catch(err) {
                           console.log(err);
                       }

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
    if (player.performedActions.length > 0) {
         change.actions = player.performedActions;
    }

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
            try {
                window.game.players[change.id].networkUpdate(change);
            }catch (err) {

            }

        }
    }

    this.changes = [];
    player.performedActions = [];



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

},{}],16:[function(require,module,exports){
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
                    //window.game.network.host.broadcast({ event: "playerLeft", id: conn.peer});
                    //window.game.removePlayer({id: conn.peer});
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
                            //window.game.players[conn.peer].actions.push(data.actions); // TODO verify
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
            if (!_.isEmpty(change) || player.performedActions.length > 0) { //there's been changes or actions
                change.id = player.id;
                change.actions = player.performedActions;
                changes.push(change);
                player.lastFullState = currentFullState;
                player.performedActions = [];
            }
        }

        if (changes.length > 0){
            this.broadcast({
                event: "changes",
                changes: changes
            });
        }
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

},{}],17:[function(require,module,exports){
var Client = require("./Client");
var Host = require("./Host");

module.exports = function WebRTC(){
    this.ping = "-";
    this.socket = io();
    this.client = new Client();

    this.socket.on("youAreHost", function(data) {
        console.log("im the host", data);
        window.game.network.host = new Host();
        window.game.network.host.connect(data.peers, data.previousHost);
    });

    this.socket.on("playerJoined", function(data) {
        window.game.network.host.connect([data.peerID], data.previousHost);
    });

    this.socket.on("playerLeft", function(data) {
        console.log("PLAYER LEFT", data);
        window.game.removePlayer({id: data.playerID});
    });
    // this.socket.on("playerLeft", function(data) {
    //     //window.game.network.host.broadcast({ event: "playerLeft", id: conn.peer});
    //     //window.game.removePlayer({id: conn.peer});
    // });

    // this.socket.on("playerLeft", function(data) {
    //     delete window.game.players[data.id];
    // });

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

},{"./Client":15,"./Host":16}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQW5pbWF0aW9uLmpzIiwic3JjL2pzL0J1bGxldC5qcyIsInNyYy9qcy9DYW1lcmEuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL1dlYXBvbi5qcyIsInNyYy9qcy9kYXRhL3dlYXBvbnMuanMiLCJzcmMvanMvaGVscGVycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBBbmltYXRpb24oZGF0YSkge1xyXG4gICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgdGhpcy5vcmlnaW5hbFN4ID0gZGF0YS5zeDtcclxuICAgIHRoaXMub3JpZ2luYWxTeSA9IGRhdGEuc3k7XHJcbiAgICB0aGlzLnN4ID0gZGF0YS5zeDtcclxuICAgIHRoaXMuc3kgPSBkYXRhLnN5O1xyXG4gICAgdGhpcy53ID0gZGF0YS53O1xyXG4gICAgdGhpcy5oID0gZGF0YS5oO1xyXG4gICAgdGhpcy5mcmFtZXMgPSBkYXRhLmZyYW1lcztcclxuICAgIHRoaXMuY3VycmVudEZyYW1lID0gMDtcclxuICAgIHRoaXMuZnJhbWVUaW1lciA9IDA7XHJcbiAgICB0aGlzLmFuaW1hdGlvblNwZWVkID0gMC4yOyAvLyBmcmFtZXMgcGVyIHNlY29uZFxyXG5cclxuICAgIHRoaXMucGxheU9uY2UgPSBkYXRhLnBsYXlPbmNlO1xyXG59XHJcblxyXG5BbmltYXRpb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLmZyYW1lVGltZXIgKz0gZHQ7XHJcblxyXG4gICAgaWYgKHRoaXMuZnJhbWVUaW1lciA+IHRoaXMuYW5pbWF0aW9uU3BlZWQpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZSArPSAxO1xyXG4gICAgICAgIHRoaXMuZnJhbWVUaW1lciA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY3VycmVudEZyYW1lID49IHRoaXMuZnJhbWVzKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3ggPSB0aGlzLmN1cnJlbnRBbmltYXRpb24uc3ggKyB0aGlzLmN1cnJlbnRBbmltYXRpb24udyAqIHRoaXMuY3VycmVudEFuaW1hdGlvbi5jdXJyZW50RnJhbWU7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW1hdGlvbjtcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xyXG5cclxuZnVuY3Rpb24gQnVsbGV0KGRhdGEpIHtcclxuICAgIC8vIGNyZWF0ZSB0aGUgYnVsbGV0IDUgcGl4ZWxzIHRvIHRoZSByaWdodCBhbmQgMzAgcGl4ZWxzIGZvcndhcmQuIHNvIGl0IGFsaWducyB3aXRoIHRoZSBndW4gYmFycmVsXHJcbiAgICB0aGlzLnggPSBkYXRhLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xyXG4gICAgdGhpcy55ID0gZGF0YS55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcclxuXHJcbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqIDMwO1xyXG4gICAgLy90aGlzLnggPSBkYXRhLng7XHJcbiAgICAvL3RoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMubGVuZ3RoID0gMTA7IC8vIHRyYWlsIGxlbmd0aFxyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkYXRhLmRpcmVjdGlvbjtcclxuICAgIHRoaXMuc3BlZWQgPSBkYXRhLmJ1bGxldFNwZWVkO1xyXG4gICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcclxufVxyXG5cclxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcbiAgICAvL1xyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuXHJcbiAgICAvLyBpZiBvZmYgc2NyZWVuLCByZW1vdmUgaXRcclxuICAgIGlmICh0aGlzLnggPCAwIHx8IHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIHx8IHRoaXMueSA8IDAgfHwgdGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5oaXREZXRlY3Rpb24oaW5kZXgpO1xyXG59O1xyXG5cclxuQnVsbGV0LnByb3RvdHlwZS5oaXREZXRlY3Rpb24gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xyXG4gICAgICAgIHZhciBhID0gdGhpcy54IC0gcGxheWVyLng7XHJcbiAgICAgICAgdmFyIGIgPSB0aGlzLnkgLSBwbGF5ZXIueTtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xyXG5cclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBwbGF5ZXIucmFkaXVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyXCIsIHBsYXllci5pZCwgXCJ0YWtlcyBkYW1hZ2U6XCIsIHRoaXMuZGFtYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuQnVsbGV0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGNhbnZhcywgY3R4KXtcclxuXHJcbiAgICBjdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIGN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbiAtIDAuNzg1Mzk4MTYzNCk7IC8vIHJvdGF0ZVxyXG5cclxuICAgIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXHJcbiAgICB2YXIgZ3JhZD0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAsIFwicmdiYSgyNTUsMTY1LDAsMClcIik7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLCBcInllbGxvd1wiKTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICBjdHgubW92ZVRvKDAsIDApO1xyXG4gICAgICBjdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcblxyXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIC8vIGN0eC5tb3ZlVG8oMCwwKTtcclxuICAgIC8vIGN0eC5saW5lVG8oMCx0aGlzLmxlbmd0aCk7XHJcblxyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuXHJcbiAgICBjdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxyXG4gICAgLy8gdmFyIGdyYWQ9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcclxuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwiZ3JlZW5cIik7XHJcbiAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gY3R4LmxpbmVUbygwLGxlbmd0aCk7XHJcbiAgICAvLyBjdHguc3Ryb2tlKCk7XHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcblxyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG5cclxuICAgIHRoaXMubGV2ZWwgPSBuZXcgTGV2ZWwoKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHRoaXMuY2FudmFzLCBkb2N1bWVudC5ib2R5LmNoaWxkTm9kZXNbMF0pO1xyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCIxNnB4IHNlcmlmXCI7XHJcblxyXG4gICAgdGhpcy5nYW1lSUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpWzJdO1xyXG5cclxuICAgIHRoaXMudWkgPSBuZXcgVWkodGhpcyk7XHJcbiAgICB0aGlzLm5ldHdvcmsgPSBuZXcgTmV0d29yaygpO1xyXG5cclxuICAgIHRoaXMuZW50aXRpZXMgPSBbXTsgLy8gZ2FtZSBlbnRpdGllc1xyXG4gICAgdGhpcy5wbGF5ZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcblxyXG5cclxuICAgIHZhciBsYXN0ID0gMDsgLy8gdGltZSB2YXJpYWJsZVxyXG4gICAgdmFyIGR0OyAvL2RlbHRhIHRpbWVcclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmxvb3AoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHYW1lIGxvb3BcclxuICAgICAqL1xyXG4gICAgdGhpcy5sb29wID0gZnVuY3Rpb24odGltZXN0YW1wKXtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wLmJpbmQodGhpcykpOyAvLyBxdWV1ZSB1cCBuZXh0IGxvb3BcclxuXHJcbiAgICAgICAgZHQgPSB0aW1lc3RhbXAgLSBsYXN0OyAvLyB0aW1lIGVsYXBzZWQgaW4gbXMgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgICAgbGFzdCA9IHRpbWVzdGFtcDtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGFuZCByZW5kZXIgZ2FtZVxyXG4gICAgICAgIHRoaXMudXBkYXRlKGR0KTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG5cclxuICAgICAgICAvLyBuZXR3b3JraW5nIHVwZGF0ZVxyXG4gICAgICAgIGlmICh0aGlzLm5ldHdvcmsuaG9zdCkge1xyXG4gICAgICAgICAgICB0aGlzLm5ldHdvcmsuaG9zdC51cGRhdGUoZHQpOyAvLyBpZiBpbSB0aGUgaG9zdCBkbyBob3N0IHN0dWZmXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmNsaWVudC51cGRhdGUoZHQpOyAvLyBlbHNlIHVwZGF0ZSBjbGllbnQgc3R1ZmZcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGZwc1xyXG4gICAgICAgIHRoaXMuZnBzID0gTWF0aC5yb3VuZCgxMDAwIC8gZHQpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5LCBpbmRleCkge1xyXG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKGR0IC8gMTAwMCwgaW5kZXgpOyAvL2RlbHRhdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XHJcbiAgICAgICAgLy8gVXBkYXRlIGNhbWVyYVxyXG4gICAgICAgIC8vdGhpcy5jYW1lcmEudXBkYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyBkcmF3IHRlc3QgZ3JpZFxyXG4gICAgICAgIC8vIHZhciBzcGFjaW5nID0gMTA7XHJcbiAgICAgICAgLy8gZm9yICh2YXIgeSA9IDA7IHkgPD0gdGhpcy5oZWlnaHQ7IHkgKz0gc3BhY2luZykge1xyXG4gICAgICAgIC8vICAgICBmb3IodmFyIHggPSAwOyB4IDw9IHRoaXMud2lkdGg7IHggKz0gc3BhY2luZykge1xyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oeCAtIHRoaXMuY2FtZXJhLngsIHkgLSB0aGlzLmNhbWVyYS55KTtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLndpZHRoLCB5IC0gdGhpcy5jYW1lcmEueSk7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH1cclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnJlY3QoMCAtIHRoaXMuY2FtZXJhLngsIDAgLSB0aGlzLmNhbWVyYS55LCB0aGlzLmxldmVsLndpZHRoLCB0aGlzLmxldmVsLmhlaWdodCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiZ3JheVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGFsbCBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlbmRlcih0aGlzLmNhbnZhcywgdGhpcy5jdHgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMudWkucmVuZGVyRGVidWcoKTtcclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNBTUVSQTogWDpcIiArIHRoaXMuY2FtZXJhLngsIFwiXFxuWTpcIiArIHRoaXMuY2FtZXJhLnkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5wbGF5ZXJzW3RoaXMubmV0d29yay5jbGllbnQucGVlci5pZF0pO1xyXG4gICAgfTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkUGxheWVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAgaWYoZGF0YS5pZCBpbiB0aGlzLnBsYXllcnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG5cclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVtb3ZpbmcgcGxheWVyXCIsIGRhdGEpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XHJcbiAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudGl0eSk7XHJcbiAgICAgICAgLy8gfSksXHJcbiAgICAgICAgZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkgeyByZXR1cm4gZW50aXR5LmdldEZ1bGxTdGF0ZSgpOyAgICAgICAgfSksXHJcbiAgICAgICAgLy9wbGF5ZXJzOiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkod2luZG93LmdhbWUucGxheWVyc1trZXldKTsgfSlcclxuICAgICAgICBwbGF5ZXJzOiB0aGlzLmdldFBsYXllcnNTdGF0ZSgpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0UGxheWVyc1N0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRGdWxsU3RhdGUoKTsgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsImZ1bmN0aW9uIEtleWJvYXJkKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgLy90aGlzLmxhc3RTdGF0ZSA9IF8uY2xvbmUocGxheWVyLmtleXMpO1xuICAgIHRoaXMua2V5RG93bkhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwICE9PSB0cnVlKSAgcGxheWVyLmtVcD0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gIT09IHRydWUpICBwbGF5ZXIua0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgIT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCA9PT0gdHJ1ZSkgcGxheWVyLmtVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biA9PT0gdHJ1ZSkgcGxheWVyLmtEb3duID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgPT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgPT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJmdW5jdGlvbiBMZXZlbCgpe1xyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xyXG4iLCJmdW5jdGlvbiBNb3VzZShwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuXG4gICAgdGhpcy5jbGljayA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICB0aGlzLnBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJzaG9vdFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYLFxuICAgICAgICAgICAgICAgIHk6IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMucHVzaChhY3Rpb24pOyAvLyB0ZWxsIHRoZSBob3N0IG9mIHRoZSBhY3Rpb25cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWCA9IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYO1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVkgPSB3aW5kb3cuZ2FtZS5jYW1lcmEueSArIGUub2Zmc2V0WTtcbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLm1vdXNlTGVmdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ID09PSB0cnVlKSBwbGF5ZXIubW91c2VMZWZ0ICA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwiLy8gdmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9LZXlib2FyZFwiKTtcbnZhciBOZXR3b3JrQ29udHJvbHMgPSByZXF1aXJlKFwiLi9OZXR3b3JrQ29udHJvbHNcIik7XG52YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4vQnVsbGV0XCIpO1xudmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG52YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xudmFyIEFuaW1hdGlvbiA9IHJlcXVpcmUoXCIuL0FuaW1hdGlvblwiKTtcblxuZnVuY3Rpb24gUGxheWVyKHBsYXllckRhdGEpIHtcbiAgICB0aGlzLmlkID0gcGxheWVyRGF0YS5pZDtcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwOyAvLyBjaXJjbGUgcmFkaXVzXG4gICAgdGhpcy54ID0gcGxheWVyRGF0YS54IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gcGxheWVyRGF0YS52aWV3aW5nQW5nbGUgfHwgNDU7XG4gICAgdGhpcy5zcGVlZCA9IHBsYXllckRhdGEuc3BlZWQgfHwgMTAwOyAvL3BpeGVscyBwZXIgc2Vjb25kXG4gICAgdGhpcy5ocCA9IHBsYXllckRhdGEuaHAgfHwgMTAwO1xuXG4gICAgdGhpcy5zeCA9IDA7XG4gICAgdGhpcy5zeSA9IDA7XG4gICAgdGhpcy5zdyA9IDYwO1xuICAgIHRoaXMuc2ggPSA2MDtcbiAgICB0aGlzLmR3ID0gNjA7XG4gICAgdGhpcy5kaCA9IDYwO1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgdGhpcy53ZWFwb24gPSBuZXcgV2VhcG9uKHRoaXMsIHdlYXBvbnMuQUspO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbiAgICAvL3RoaXMuY29udHJvbHMgPSAocGxheWVyRGF0YS5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgPyA6IG5ldyBOZXR3b3JrQ29udHJvbHMoKTtcbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnBlcmZvcm1BY3Rpb24odGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucy5wdXNoKHRoaXMuYWN0aW9uc1tpXSk7XG4gICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTtcblxuICAgIC8vIFVwZGF0ZSBtb3ZlbWVudFxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICBpZiAodGhpcy5rVXAgJiYgdGhpcy5rTGVmdCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy54IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwICYmIHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZIC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYICs9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYIC09IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgdGhpcy55ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy54ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCArPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwKSB7XG4gICAgICAgIHRoaXMueSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duKSB7XG4gICAgICAgIHRoaXMueSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgKz0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtMZWZ0KSB7XG4gICAgICAgIHRoaXMueCAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtSaWdodCkge1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYICs9IGRpc3RhbmNlO1xuICAgIH1cblxuICAgIC8vY2hlY2sgaWYgb2ZmIHNjcmVlblxuICAgIGlmICh0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCkgdGhpcy54ID0gd2luZG93LmdhbWUubGV2ZWwud2lkdGg7XG4gICAgaWYgKHRoaXMueCA8IDApIHRoaXMueCA9IDA7XG4gICAgaWYgKHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkgdGhpcy55ID0gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0O1xuICAgIGlmICh0aGlzLnkgPCAwKSB0aGlzLnkgPSAwO1xuXG4gICAgdGhpcy53ZWFwb24udXBkYXRlKGR0KTtcbiAgICAvL3RoaXMuY3VycmVudEFuaW1hdGlvbi51cGRhdGUoZHQpO1xuXG4gICAgaWYgKHRoaXMubW91c2VMZWZ0KSB7IC8vIGlmIGZpcmluZ1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcImZpcmVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdXNlWCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLm1vdXNlWVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnR1cm5Ub3dhcmRzKHRoaXMubW91c2VYLCB0aGlzLm1vdXNlWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm5ldHdvcmtVcGRhdGUgPSBmdW5jdGlvbih1cGRhdGUpe1xuICAgIGRlbGV0ZSB1cGRhdGUuaWQ7XG4gICAgLy8gbmV0d29ya1VwZGF0ZVxuICAgIGZvciAodmFyIGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJhY3Rpb25zXCIpIHRoaXNba2V5XSA9IHRoaXNba2V5XS5jb25jYXQodXBkYXRlW2tleV0pO1xuICAgICAgICBlbHNlIHRoaXNba2V5XSA9IHVwZGF0ZVtrZXldO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGVyZm9ybUFjdGlvbiA9IGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgc3dpdGNoKGFjdGlvbi5hY3Rpb24pe1xuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcbiAgICAgICAgICAgIHRoaXMudHVyblRvd2FyZHMoYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImZpcmVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndlYXBvbi5maXJlKGFjdGlvbik7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihjYW52YXMsIGN0eCl7XG4gICAgY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxuXG4gICAgY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgLSh0aGlzLnN3IC8gMiksIC0odGhpcy5zaCAvIDIpLCB0aGlzLmR3LCB0aGlzLmRoKTtcbiAgICAvLyBjdHguZHJhd0ltYWdlKFxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgLy8gaW1hZ2VcbiAgICAvLyAgICAgdGhpcy5zeCwgLy8geCBvbiBpbWFnZVxuICAgIC8vICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24uc3ksIC8vIHkgb24gaW1hZ2VcbiAgICAvLyAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLncsIC8vIHdpZHRoXG4gICAgLy8gICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbi5oLCAvLyBoZWlnaHRcbiAgICAvLyAgICAgLSh0aGlzLmN1cnJlbnRBbmltYXRpb24udyAvIDIpLCAvLyBjZW50ZXIgeFxuICAgIC8vICAgICAtKHRoaXMuY3VycmVudEFuaW1hdGlvbi5oIC8gMiksIC8vIGNlbnRlciB5XG4gICAgLy8gICAgIHRoaXMuZHcsXG4gICAgLy8gICAgIHRoaXMuZGhcbiAgICAvLyApO1xuICAgIGN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG4gICAgLy8gY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgLy8gY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5yZWN0KC0yLCAtMiwgNCwgNCk7XG4gICAgLy8gY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgLy8gY3R4LmZpbGwoKTtcbiAgICAvLyAgY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0Yylcbn07XG5cblBsYXllci5wcm90b3R5cGUudHVyblRvd2FyZHMgPSBmdW5jdGlvbih4LHkpIHtcbiAgICB2YXIgeERpZmYgPSB4IC0gdGhpcy54O1xuICAgIHZhciB5RGlmZiA9IHkgLSB0aGlzLnk7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmF0YW4yKHlEaWZmLCB4RGlmZik7Ly8gKiAoMTgwIC8gTWF0aC5QSSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55LFxuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgcmFkaXVzOiB0aGlzLnJhZGl1cyxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAgdmlld2luZ0FuZ2xlOiB0aGlzLnZpZXdpbmdBbmdsZSxcbiAgICAgICAgc3BlZWQ6IHRoaXMuc3BlZWQsXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWVxuICAgIH07XG59O1xuXG4vLyBUaGUgc3RhdGUgdGhlIGNsaWVudCBzZW5kcyB0byB0aGUgaG9zdFxuUGxheWVyLnByb3RvdHlwZS5nZXRDbGllbnRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVlcbiAgICB9O1xufTtcblxuLy8gUGxheWVyLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4vLyAgICAgY29uc29sZS5sb2codGhpcy5pZCwgXCJmaXJlIVwiLCBhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcbi8vXG4vLyAgICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgQnVsbGV0KHtcbi8vICAgICAgICAgeDogdGhpcy54LFxuLy8gICAgICAgICB5OiB0aGlzLnksXG4vLyAgICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb25cbi8vICAgICB9KSk7XG4vLyAgICAgcmV0dXJuIGFjdGlvbjsgLy8gZXZlcnkgc2hvb3QgaXMgdmFsaWQgcmlnaHQgbm93XG4vLyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVWkoZ2FtZSl7XHJcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcclxuICAgICAgICB2YXIgbXlJRCA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQ7XHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGxheWVycyl7XHJcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpZCArIFwiIFwiICsgcGxheWVyc1tpZF0ucGluZyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaWQgPT09IG15SUQpIHtcclxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJtZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyRGVidWcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgd2luZG93LmdhbWUuZnBzLCA1LCAyMCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcsIDUsIDQyKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJDQU1FUkE6IFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS55KSwgNSwgNjQpO1xyXG4gICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUExBWUVSOiAgXCIgKyBNYXRoLmZsb29yKHBsYXllci54KSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLnkpLCA1LCA4Nik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIk1PVVNFOiBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVkpLCA1LCAxMDgpO1xyXG4gICAgICAgICAgICBpZihwbGF5ZXIpIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkRJUjogXCIgKyBwbGF5ZXIuZGlyZWN0aW9uLnRvRml4ZWQoMiksIDUsIDEzMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuIiwidmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuL0J1bGxldFwiKTtcclxuXHJcbmZ1bmN0aW9uIFdlYXBvbihvd25lciwgZGF0YSkge1xyXG4gICAgdGhpcy5vd25lciA9IG93bmVyO1xyXG4gICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgdGhpcy5tYWdhemluZSA9IGRhdGEubWFnYXppbmU7XHJcbiAgICB0aGlzLmZpcmVSYXRlID0gZGF0YS5maXJlUmF0ZTtcclxuICAgIHRoaXMuZGFtYWdlID0gZGF0YS5kYW1hZ2U7XHJcbiAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XHJcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcclxuICAgIHRoaXMuc3ggPSBkYXRhLnN4O1xyXG4gICAgdGhpcy5zeSA9IGRhdGEuc3k7XHJcblxyXG4gICAgdGhpcy5maXJlVGltZXIgPSB0aGlzLmZpcmVSYXRlO1xyXG5cclxuICAgIHRoaXMucmVsb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcclxuXHJcbn1cclxuXHJcbldlYXBvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUpIHRoaXMuZmlyZVRpbWVyICs9IGR0O1xyXG59O1xyXG5cclxuV2VhcG9uLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMub3duZXIuaWQsIFwiRklSRSFcIiwgYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XHJcblxyXG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSB8fCB0aGlzLnJlbG9hZGluZykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZmlyZVRpbWVyID0gMDtcclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XHJcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxyXG4gICAgICAgIHk6IHRoaXMub3duZXIueSxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uLFxyXG4gICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxyXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcclxuICAgIH0pKTtcclxuICAgIHJldHVybiBhY3Rpb247XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYXBvbjtcclxuIiwidmFyIEFLID0ge1xyXG4gICAgXCJuYW1lXCI6IFwiQUtcIixcclxuICAgIFwibWFnYXppbmVcIjogMzAsIC8vIGJ1bGxldHNcclxuICAgIFwiZmlyZVJhdGVcIjogMC4xLCAvLyBzaG90cyBwZXIgc2Vjb25kXHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDE3MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogMCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFLOiBBS1xyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcbmZ1bmN0aW9uIHRvUmFkaWFucyhkZWcpIHtcbiAgICByZXR1cm4gZGVnICogKE1hdGguUEkgLyAxODApO1xufVxuXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlc1xufTtcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUuc3RhcnQoKTtcclxufSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gdmFyIFBsYXllciA9IHJlcXVpcmUoXCIuLy4uL1BsYXllclwiKTtcblxuZnVuY3Rpb24gQ2xpZW50KCl7XG4gICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcblxuICAgIC8vIFN0cmVzcyB0ZXN0XG4gICAgdGhpcy50ZXN0c1JlY2VpdmVkID0gMDtcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdOy8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBhY3Rpb25zIGZyb20gdGhlIGhvc3RcbiAgICB0aGlzLmNoYW5nZXMgPSBbXTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGNoYW5nZXMgZnJvbSB0aGUgaG9zdFxuXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAvLyBpdmUgZ290IG15IHBlZXJJRCBhbmQgZ2FtZUlELCBsZXRzIHNlbmQgaXQgdG8gdGhlIHNlcnZlciB0byBqb2luIHRoZSBob3N0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuc29ja2V0LmVtaXQoXCJqb2luXCIsIHtwZWVySUQ6IGlkLCBnYW1lSUQ6IHdpbmRvdy5nYW1lLmdhbWVJRH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuXG4gICAgICAgIC8vIGNsb3NlIG91dCBhbnkgb2xkIGNvbm5lY3Rpb25zXG4gICAgICAgIGlmKE9iamVjdC5rZXlzKHRoaXMuY29ubmVjdGlvbnMpLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgY29ublBlZXIgaW4gdGhpcy5jb25uZWN0aW9ucyl7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5QZWVyICE9PSBjb25uLnBlZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl1bMF0uY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgb2xkIGhvc3RzIHBsYXllciBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImRlbGV0ZSBvbGQgcGxheWVyXCIsIGNvbm5QZWVyKTtcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgd2luZG93LmdhbWUucGxheWVyc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHN0b3JlIGl0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xuXG4gICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcbiAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVySm9pbmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBjYXNlIFwicGxheWVyTGVmdFwiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHdpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGRhdGEuaWR9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImdhbWVTdGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICBkYXRhLmdhbWVTdGF0ZS5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24ocGxheWVyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiY2hhbmdlc1wiOiAvLyBjaGFuZ2VzIGFuZCBhY3Rpb25zIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5jb25jYXQoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5jb25jYXQoZGF0YS5hY3Rpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOiAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgICAgICAgICAgICAgICAgZGF0YS5waW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbcGluZy5pZF0ucGluZyA9IHBpbmcucGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF0ucGluZztcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHdpbmRvdy5nYW1lLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG59XG5cbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHZhciBsYXN0Q2xpZW50U3RhdGUgPSBwbGF5ZXIubGFzdENsaWVudFN0YXRlO1xuICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RDbGllbnRTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuXG4gICAgLy8gYWRkIGFueSBwZXJmb3JtZWQgYWN0aW9ucyB0byBjaGFuZ2UgcGFja2FnZVxuICAgIGlmIChwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgIH1cblxuICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXMsIHNlbmQgZW0gdG8gaG9zdFxuICAgICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgICAgICAgICBldmVudDogXCJuZXR3b3JrVXBkYXRlXCIsXG4gICAgICAgICAgICB1cGRhdGVzOiBjaGFuZ2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBsYXllci5sYXN0Q2xpZW50U3RhdGUgPSBjdXJyZW50U3RhdGU7XG5cblxuXG5cbiAgICAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXTtcblxuICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZS5pZCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5pZF0ubmV0d29ya1VwZGF0ZShjaGFuZ2UpO1xuICAgICAgICAgICAgfWNhdGNoIChlcnIpIHtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZXMgPSBbXTtcbiAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuXG5cblxuICAgIC8vIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgLy8gdmFyIG15UGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIC8vIGlmICghbXlQbGF5ZXIpIHJldHVybjtcbiAgICAvL1xuICAgIC8vICBpZiAoIV8uaXNFcXVhbChteVBsYXllci5rZXlzLCBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUpKSB7XG4gICAgLy8gICAgIC8vIHNlbmQga2V5c3RhdGUgdG8gaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJrZXlzXCIsXG4gICAgLy8gICAgICAgICBrZXlzOiBteVBsYXllci5rZXlzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICB9XG4gICAgLy8gbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlID0gXy5jbG9uZShteVBsYXllci5rZXlzKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuICAgIC8vXG4gICAgLy8gdmFyIGN1cnJlbnRQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICAvLyB2YXIgY2hhbmdlcyA9IFtdO1xuICAgIC8vIHZhciBsYXN0U3RhdGUgPSBteVBsYXllci5sYXN0U3RhdGU7XG4gICAgLy8gdmFyIG5ld1N0YXRlID0gbXlQbGF5ZXIuZ2V0U3RhdGUoKTtcbiAgICAvL1xuICAgIC8vIC8vIGNvbXBhcmUgcGxheWVycyBuZXcgc3RhdGUgd2l0aCBpdCdzIGxhc3Qgc3RhdGVcbiAgICAvLyB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XG4gICAgLy8gaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgIC8vICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlc1xuICAgIC8vICAgICBjaGFuZ2UucGxheWVySUQgPSBteVBsYXllci5pZDtcbiAgICAvLyAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gbXlQbGF5ZXIubGFzdFN0YXRlID0gbmV3U3RhdGU7XG4gICAgLy8gLy8gaWYgdGhlcmUgYXJlIGNoYW5nZXNcbiAgICAvLyBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgIC8vICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZiAodGhpcy5hY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAvLyAgICAgLy8gc2VuZCBhbGwgcGVyZm9ybWVkIGFjdGlvbnMgdG8gdGhlIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiYWN0aW9uc1wiLFxuICAgIC8vICAgICAgICAgZGF0YTogdGhpcy5hY3Rpb25zXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gY2xlYXIgYWN0aW9ucyBxdWV1ZVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmNoYW5nZXNbaV0ubGVuZ3RoOyBqICs9IDEpICB7XG4gICAgLy8gICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV1bal07XG4gICAgLy9cbiAgICAvLyAgICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgIC8vICAgICAgICAgaWYgKGNoYW5nZS5wbGF5ZXJJRCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UucGxheWVySURdLmNoYW5nZShjaGFuZ2UpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdGhpcy5jaGFuZ2VzID0gW107XG5cbn07XG5cbiAgICAvL1xuICAgIC8vIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgIC8vICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIHRoaXMucGVlciwgY29ubik7XG4gICAgLy9cbiAgICAvLyAgICAgLy9jcmVhdGUgdGhlIHBsYXllclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnBsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcihjb25uLnBlZXIpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy9MaXN0ZW4gZm9yIGRhdGEgZXZlbnRzIGZyb20gdGhlIGhvc3RcbiAgICAvLyAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgLy8gICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikgeyAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAvLyAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAvLyAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vIHBpbmcgdGVzdFxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5waW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgLy8gICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfSwgMjAwMCk7XG4gICAgLy9cbiAgICAvLyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhvc3QoKXtcbiAgICB0aGlzLmNvbm5zID0ge307XG4gICAgdGhpcy5hY3Rpb25zID0ge307IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSBhbGwgdGhlIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBjbGllbnRzXG4gICAgdGhpcy5sYXN0UGxheWVyc1N0YXRlID0gW107XG4gICAgdGhpcy5kaWZmID0gbnVsbDtcblxuICAgIHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKHBlZXJzKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0XCIsIHBlZXJzKTtcblxuICAgICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuXG4gICAgICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgaG9zdHMgcGxheWVyIG9iamVjdCBpZiBpdCBkb2VzbnQgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGlmICghKHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQgaW4gd2luZG93LmdhbWUucGxheWVycykpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNlbmQgYSBwaW5nIGV2ZXJ5IDIgc2Vjb25kcywgdG8gdHJhY2sgcGluZyB0aW1lXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgcGluZ3M6IHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5nZXRQaW5ncygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LDIwMDApO1xuXG4gICAgICAgICAgICBwZWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBlZXJJRCkge1xuICAgICAgICAgICAgICAgIC8vY29ubmVjdCB3aXRoIGVhY2ggcmVtb3RlIHBlZXJcbiAgICAgICAgICAgICAgICB2YXIgY29ubiA9ICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5jb25uZWN0KHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJob3N0SUQ6XCIsIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmlkLCBcIiBjb25uZWN0IHdpdGhcIiwgcGVlcklEKTtcbiAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1twZWVySURdID0gcGVlcjtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbcGVlcklEXSA9IGNvbm47XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHBsYXllclxuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIG5ldyBwbGF5ZXIgZGF0YSB0byBldmVyeW9uZVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IG5ld1BsYXllci5nZXRGdWxsU3RhdGUoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgdGhlIG5ldyBwbGF5ZXIgdGhlIGZ1bGwgZ2FtZSBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmVtaXQoIHtjbGllbnRJRDogY29ubi5wZWVyLCBldmVudDogXCJnYW1lU3RhdGVcIiwgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKX0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW2Nvbm4ucGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImVycm9yXCIsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIEVWRU5UXCIsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7IC8vIGFuc3dlciB0aGUgcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGNsaWVudCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJuZXR3b3JrVXBkYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGZyb20gYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ubmV0d29ya1VwZGF0ZShkYXRhLnVwZGF0ZXMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhLmFjdGlvbnMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiYWN0aW9uc1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImFjdGlvbnMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJjaGFuZ2VzXCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcIkhleSB0aGVyZSBoYXMgYmVlbiBjaGFuZ2VzIVwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5jaGFuZ2UoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwia2V5c1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImtleXMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEua2V5cywgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyA9IF8uY2xvbmUoZGF0YS5rZXlzKTsgLy9UT0RPOiB2ZXJpZnkgaW5wdXQgKGNoZWNrIHRoYXQgaXQgaXMgdGhlIGtleSBvYmplY3Qgd2l0aCB0cnVlL2ZhbHNlIHZhbHVlcylcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xuICAgICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGp1c3Qgc2VuZCBkYXRhIHRvIGEgc3BlY2lmaWMgY2xpZW50XG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVNSVQhXCIsIGRhdGEpO1xuICAgICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuXG4gICAgICAgIHZhciBjaGFuZ2VzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICB2YXIgY3VycmVudEZ1bGxTdGF0ZSA9IHBsYXllci5nZXRGdWxsU3RhdGUoKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudEZ1bGxTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBwbGF5ZXIubGFzdEZ1bGxTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSB8fCBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7IC8vdGhlcmUncyBiZWVuIGNoYW5nZXMgb3IgYWN0aW9uc1xuICAgICAgICAgICAgICAgIGNoYW5nZS5pZCA9IHBsYXllci5pZDtcbiAgICAgICAgICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIHBsYXllci5sYXN0RnVsbFN0YXRlID0gY3VycmVudEZ1bGxTdGF0ZTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmdldFBpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwaW5ncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHBpbmdzLnB1c2goe2lkOiBwbGF5ZXIuaWQsIHBpbmc6IHBsYXllci5waW5nIHx8IFwiaG9zdFwifSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGluZ3M7XG4gICAgfTtcbn07XG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5waW5nID0gXCItXCI7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvKCk7XHJcbiAgICB0aGlzLmNsaWVudCA9IG5ldyBDbGllbnQoKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInlvdUFyZUhvc3RcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW0gdGhlIGhvc3RcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0ID0gbmV3IEhvc3QoKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdChkYXRhLnBlZXJzLCBkYXRhLnByZXZpb3VzSG9zdCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoW2RhdGEucGVlcklEXSwgZGF0YS5wcmV2aW91c0hvc3QpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBMQVlFUiBMRUZUXCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGRhdGEucGxheWVySUR9KTtcclxuICAgIH0pO1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICBkZWxldGUgd2luZG93LmdhbWUucGxheWVyc1tkYXRhLmlkXTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXJzID0ge307XHJcbiAgICAvLyB0aGlzLmNvbm5zID0ge307XHJcbiAgICAvLyB0aGlzLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcbiAgICAvLyAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4gPSB0aGlzLnBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGlkLCBkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gdGhpcy5wZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IHRoaXMuY29ubjtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGEgcGVlciBoYXMgZGlzY29ubmVjdGVkXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgdGhpcy5jb25uLCBcIlBFRVJcIiwgdGhpcy5wZWVyKTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlZXJzW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5zW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KCk7XHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gfSk7XHJcbn07XHJcbiJdfQ==
