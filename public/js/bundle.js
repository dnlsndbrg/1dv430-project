(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    this.ctx = window.game.ctx;
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
    // test bullet against all players
    for (var key in window.game.players) {

        var player = window.game.players[key];

        if (!player.alive) continue;

        var a = this.x - player.x;
        var b = this.y - player.y;
        var distance = Math.sqrt( a*a + b*b );

        if (distance < player.radius) {
            // hit
            player.takeDamage(this.damage, this.direction);
            this.destroy(index);
        }
    }

};

Bullet.prototype.destroy = function(index) {
    window.game.entities.splice(index, 1);
};

Bullet.prototype.render = function(){

    this.ctx.save(); // save current state
    this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    this.ctx.rotate(this.direction - 0.7853981634); // rotate

    // // linear gradient from start to end of line
    var grad= this.ctx.createLinearGradient(0, 0, 0, this.length);
    grad.addColorStop(0, "rgba(255,165,0,0)");
    grad.addColorStop(1, "yellow");
    this.ctx.strokeStyle = grad;

    this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(this.length, this.length);
      this.ctx.stroke();


    // ctx.lineWidth = 1;

    //
    // ctx.beginPath();
    // ctx.moveTo(0,0);
    // ctx.lineTo(0,this.length);

    this.ctx.stroke();


    this.ctx.restore(); // restore original states (no rotation etc)

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

},{"./helpers":12}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
function Entity(data) {
    this.x = data.x;
    this.y = data.y;
    this.sx = data.sx;
    this.sy = data.sy;
    this.sw = data.sw;
    this.sh = data.sh;
    this.dw = data.dw;
    this.dh = data.dh;
    this.direction = data.direction;
    this.ctx = data.ctx;
}

Entity.prototype.update = function(dt) {

};

Entity.prototype.render = function() {
    this.ctx.save(); // save current state
    this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    this.ctx.rotate(this.direction); // rotate

    this.ctx.drawImage(window.game.spritesheet, this.sx, this.sy, this.sw, this.sh, -(this.sw / 2), -(this.sh / 2), this.dw, this.dh);

    this.ctx.restore(); // restore original states (no rotation etc)
};

Entity.prototype.getFullState = function() {
    return {
        x: this.x,
        y: this.y,
        sx: this.sx,
        sy: this.sy,
        sw: this.sw,
        sh: this.sh,
        dh: this.dh,
        dw: this.dw,
        direction: this.direction,
    };
};

module.exports = Entity;

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

    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.width = this.width;
    this.bgCanvas.height = this.height;
    this.bgCanvas.id ="asdasd";

    document.querySelector("#canvases").appendChild(this.bgCanvas);
    document.querySelector("#canvases").appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.bgCtx = this.bgCanvas.getContext("2d");

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
        this.bgCtx.clearRect(0, 0, this.width, this.height);

        // draw test background
        this.bgCtx.beginPath();
        this.bgCtx.rect(0 - this.camera.x, 0 - this.camera.y, this.level.width, this.level.height);
        this.bgCtx.fillStyle = "gray";
        this.bgCtx.fill();

        // render all entities
        this.entities.forEach(function(entity) {
            entity.render();
        });

        this.ui.renderUI();
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

},{"./Camera":2,"./Level":6,"./Player":9,"./Ui":10,"./webRTC/WebRTC":19}],5:[function(require,module,exports){
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
//var Bullet = require("./Bullet");
//var weapons = require("./data/weapons");
//var Weapon = require("./weapons/Weapon");
var Shotgun = require("./weapons/Shotgun");
var Ak47 = require("./weapons/Ak47");
//var Animation = require("./Animation");
var Entity = require("./Entity");

function Player(playerData) {
    this.id = playerData.id;
    this.radius = playerData.radius || 20; // circle radius
    this.x = playerData.x || (Math.floor(Math.random() * (window.game.level.width - this.radius)) + this.radius / 2);
    this.y = playerData.y || (Math.floor(Math.random() * (window.game.level.height - this.radius)) + this.radius / 2);
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 100; //pixels per second
    this.hp = playerData.hp || 100;
    this.alive = playerData.alive || true;

    this.sx = 0;
    this.sy = 0;
    this.sw = 60;
    this.sh = 60;
    this.dw = 60;
    this.dh = 60;

    this.ctx = window.game.ctx;

    // keys
    this.kUp = false;
    this.kDown = false;
    this.kLeft = false;
    this.kRight = false;

    // mouse
    this.mouseX = this.x;
    this.mouseY = this.y;
    this.mouseLeft = false;

    //this.weapon = new Weapon(this, weapons.AK);
    //
    //this.weapon = new Shotgun(this);

    this.weapons = [new Ak47(this), new Shotgun(this)];
    this.selectedWeaponIndex = 0;

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

    if (!this.alive) return;

    this.move(dt);

    //check if off screen
    if (this.x > window.game.level.width) this.x = window.game.level.width;
    if (this.x < 0) this.x = 0;
    if (this.y > window.game.level.height) this.y = window.game.level.height;
    if (this.y < 0) this.y = 0;

    // update current weapon;
    this.weapons[this.selectedWeaponIndex].update(dt);

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

Player.prototype.move = function(dt) {
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
            return this.weapons[this.selectedWeaponIndex].fire(action);
        case "die":
            this.die(action);
            break;
        case "respawn":
            return this.respawn(action);
    }
};

Player.prototype.render = function(){
    if(!this.alive) return;
    this.ctx.save(); // save current state
    this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    this.ctx.rotate(this.direction); // rotate

    this.ctx.drawImage(window.game.spritesheet, this.weapons[this.selectedWeaponIndex].sx, this.weapons[this.selectedWeaponIndex].sy, this.sw, this.sh, -(this.sw / 2), -(this.sh / 2), this.dw, this.dh);
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
    this.ctx.restore(); // restore original states (no rotation etc)
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

Player.prototype.takeDamage = function(damage, direction) {
    this.hp -= damage;
    if (this.hp <= 0) {
        this.actions.push({
            action: "die",
            data: {
                direction: direction
            }
        });
    }
};

Player.prototype.die = function(action) {
    this.alive = false;

    // create a corpse
    var corpse = new Entity({
        x: this.x + Math.cos(action.data.direction) * 10,
        y: this.y + Math.sin(action.data.direction) * 10,
        sx: 0,
        sy: 120,
        sw: 60,
        sh: 60,
        dw: 60,
        dh: 60,
        direction: action.data.direction,
        ctx: window.game.bgCtx
    });

    window.game.entities.push(corpse);
};

Player.prototype.respawn = function(action) {
    this.x = action.data.x;
    this.y = action.data.y;
    this.hp = 100;
    this.alive = true;
    return action;
};

Player.prototype.getFullState = function() {
    return {
        x: this.x,
        y: this.y,
        id: this.id,
        hp: this.hp,
        alive: this.alive,
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

},{"./Entity":3,"./Keyboard":5,"./Mouse":7,"./NetworkControls":8,"./weapons/Ak47":14,"./weapons/Shotgun":15}],10:[function(require,module,exports){
var weapons = require("./data/weapons");
var Weapon = require("./weapons/Weapon");

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

    this.renderUI  = function() {
        var player = window.game.players[window.game.network.client.peer.id];
        if (!player) return;
        window.game.ctx.fillStyle = "black";
        window.game.ctx.fillText(player.hp, 5, window.game.canvas.height - 20);
    };


    document.querySelector("#respawnBtn").addEventListener("click", function() {
        var player = window.game.players[window.game.network.client.peer.id];

        if (!player.alive) {
            var x = (Math.floor(Math.random() * (window.game.level.width - player.radius)) + player.radius / 2);
            var y = (Math.floor(Math.random() * (window.game.level.height - player.radius)) + player.radius / 2);

            player.actions.push({ // add to the actions queue
                action: "respawn",
                data: {
                    x: x,
                    y: y
                }
            });
        }
    });


    document.querySelector("#akBtn").addEventListener("click", function() {
        var player = window.game.players[window.game.network.client.peer.id];
        player.selectedWeaponIndex = 0;
    });

    document.querySelector("#shotgunBtn").addEventListener("click", function() {
        var player = window.game.players[window.game.network.client.peer.id];
        player.selectedWeaponIndex = 1;
        //player.weapon = new Weapon(player, weapons.shotgun);
        //player.weapon = new Shotgun()
    });
};

},{"./data/weapons":11,"./weapons/Weapon":16}],11:[function(require,module,exports){
var Ak47 = {
    "name": "AK",
    "magazine": 30, // bullets
    "fireRate": 0.1, // shots per second
    "bulletsPerShot": 1, // shoot 1 bullet at a time
    "damage": 10, // hp
    "reloadTime": 2, // s
    "bulletSpeed": 1700, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 0 // spritesheet y position
};

var shotgun = {
    "name": "shotgun",
    "magazine": 4, // bullets
    "fireRate": 0.5, // shots per second
    "bulletsPerShot": 4, // 4 shotgun slugs per shot
    "damage": 10, // hp
    "reloadTime": 2, // s
    "bulletSpeed": 2500, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 60, // spritesheet y position
};

module.exports = {
    Ak47: Ak47,
    shotgun: shotgun
};

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":4}],14:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").Ak47;

class Ak47 extends Weapon{
    constructor(owner) {
        super(owner, weaponData);
    }
}

module.exports = Ak47;

},{"../data/weapons":11,"./Weapon":16}],15:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").shotgun;
var Bullet = require(".././Bullet");

class Shotgun extends Weapon{
    constructor(owner) {
        super(owner, weaponData);
    }
}

Shotgun.prototype.fire = function(action) {
    if (this.fireTimer < this.fireRate || this.reloading) return false;

    this.fireTimer = 0;

    console.log(this);
    // shoot 4 bullets
    for (var i = 0; i < this.bulletsPerShot; i += 1) {
        window.game.entities.push(new Bullet({
            x: this.owner.x,
            y: this.owner.y,
            direction: this.owner.direction + Math.random() * 0.25 - 0.125,
            bulletSpeed: this.bulletSpeed,
            damage: this.damage
        }));
    }

    return action;
};

module.exports = Shotgun;

},{".././Bullet":1,"../data/weapons":11,"./Weapon":16}],16:[function(require,module,exports){
var Bullet = require(".././Bullet");

class Weapon{
    constructor(owner, data) {
        console.log(owner, "DATA",data);
        this.owner = owner;
        this.name = data.name;
        this.magazine = data.magazine;
        this.fireRate = data.fireRate;
        this.damage = data.damage;
        this.reloadTime = data.reloadTime;
        this.bulletSpeed = data.bulletSpeed;
        this.bulletsPerShot = data.bulletsPerShot;
        this.sx = data.sx;
        this.sy = data.sy;

        this.fireTimer = this.fireRate;

        this.reloading = false;
        this.reloadTimer = 0;
    }
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

},{".././Bullet":1}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"./Client":17,"./Host":18}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0NhbWVyYS5qcyIsInNyYy9qcy9FbnRpdHkuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2RhdGEvd2VhcG9ucy5qcyIsInNyYy9qcy9oZWxwZXJzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWJSVEMvQ2xpZW50LmpzIiwic3JjL2pzL3dlYlJUQy9Ib3N0LmpzIiwic3JjL2pzL3dlYlJUQy9XZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEJ1bGxldChkYXRhKSB7XHJcbiAgICAvLyBjcmVhdGUgdGhlIGJ1bGxldCA1IHBpeGVscyB0byB0aGUgcmlnaHQgYW5kIDMwIHBpeGVscyBmb3J3YXJkLiBzbyBpdCBhbGlnbnMgd2l0aCB0aGUgZ3VuIGJhcnJlbFxyXG4gICAgdGhpcy54ID0gZGF0YS54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcclxuICAgIHRoaXMueSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIC8vdGhpcy54ID0gZGF0YS54O1xyXG4gICAgLy90aGlzLnkgPSBkYXRhLnk7XHJcbiAgICB0aGlzLmxlbmd0aCA9IDEwOyAvLyB0cmFpbCBsZW5ndGhcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XHJcbiAgICB0aGlzLnNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcclxuICAgIHRoaXMuZGFtYWdlID0gZGF0YS5kYW1hZ2U7XHJcblxyXG4gICAgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5jdHg7XHJcbn1cclxuXHJcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgLy9cclxuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcblxyXG4gICAgLy8gaWYgb2ZmIHNjcmVlbiwgcmVtb3ZlIGl0XHJcbiAgICBpZiAodGhpcy54IDwgMCB8fCB0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCB8fCB0aGlzLnkgPCAwIHx8IHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaGl0RGV0ZWN0aW9uKGluZGV4KTtcclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUuaGl0RGV0ZWN0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIC8vIHRlc3QgYnVsbGV0IGFnYWluc3QgYWxsIHBsYXllcnNcclxuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcblxyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XHJcblxyXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcclxuICAgICAgICB2YXIgYiA9IHRoaXMueSAtIHBsYXllci55O1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggYSphICsgYipiICk7XHJcblxyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IHBsYXllci5yYWRpdXMpIHtcclxuICAgICAgICAgICAgLy8gaGl0XHJcbiAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKHRoaXMuZGFtYWdlLCB0aGlzLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxuQnVsbGV0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uIC0gMC43ODUzOTgxNjM0KTsgLy8gcm90YXRlXHJcblxyXG4gICAgLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcclxuICAgIHZhciBncmFkPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJnYmEoMjU1LDE2NSwwLDApXCIpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJ5ZWxsb3dcIik7XHJcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcblxyXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCAwKTtcclxuICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuXHJcbiAgICAvLyBjdHgubGluZVdpZHRoID0gMTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcclxuXHJcbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxyXG4gICAgLy8gdmFyIGdyYWQ9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcclxuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwiZ3JlZW5cIik7XHJcbiAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gY3R4LmxpbmVUbygwLGxlbmd0aCk7XHJcbiAgICAvLyBjdHguc3Ryb2tlKCk7XHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJmdW5jdGlvbiBFbnRpdHkoZGF0YSkge1xyXG4gICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgdGhpcy5zeCA9IGRhdGEuc3g7XHJcbiAgICB0aGlzLnN5ID0gZGF0YS5zeTtcclxuICAgIHRoaXMuc3cgPSBkYXRhLnN3O1xyXG4gICAgdGhpcy5zaCA9IGRhdGEuc2g7XHJcbiAgICB0aGlzLmR3ID0gZGF0YS5kdztcclxuICAgIHRoaXMuZGggPSBkYXRhLmRoO1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkYXRhLmRpcmVjdGlvbjtcclxuICAgIHRoaXMuY3R4ID0gZGF0YS5jdHg7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuXHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuXHJcbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBzeDogdGhpcy5zeCxcclxuICAgICAgICBzeTogdGhpcy5zeSxcclxuICAgICAgICBzdzogdGhpcy5zdyxcclxuICAgICAgICBzaDogdGhpcy5zaCxcclxuICAgICAgICBkaDogdGhpcy5kaCxcclxuICAgICAgICBkdzogdGhpcy5kdyxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcblxyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG5cclxuICAgIHRoaXMubGV2ZWwgPSBuZXcgTGV2ZWwoKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuYmdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmJnQ2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgdGhpcy5iZ0NhbnZhcy5pZCA9XCJhc2Rhc2RcIjtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuYmdDYW52YXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmJnQ3R4ID0gdGhpcy5iZ0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMTZweCBzZXJpZlwiO1xyXG5cclxuICAgIHRoaXMuZ2FtZUlEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KFwiL1wiKVsyXTtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsoKTtcclxuXHJcbiAgICB0aGlzLmVudGl0aWVzID0gW107IC8vIGdhbWUgZW50aXRpZXNcclxuICAgIHRoaXMucGxheWVycyA9IHt9O1xyXG5cclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSgpO1xyXG5cclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcblxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCAvIDEwMDAsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmFcclxuICAgICAgICAvL3RoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcmluZ1xyXG4gICAgICovXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgdGVzdCBiYWNrZ3JvdW5kXHJcbiAgICAgICAgdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmJnQ3R4LnJlY3QoMCAtIHRoaXMuY2FtZXJhLngsIDAgLSB0aGlzLmNhbWVyYS55LCB0aGlzLmxldmVsLndpZHRoLCB0aGlzLmxldmVsLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5maWxsU3R5bGUgPSBcImdyYXlcIjtcclxuICAgICAgICB0aGlzLmJnQ3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGFsbCBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVpLnJlbmRlclVJKCk7XHJcbiAgICAgICAgdGhpcy51aS5yZW5kZXJEZWJ1ZygpO1xyXG4gICAgICAgIC8vIHJlbmRlciBmcHMgYW5kIHBpbmdcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQ0FNRVJBOiBYOlwiICsgdGhpcy5jYW1lcmEueCwgXCJcXG5ZOlwiICsgdGhpcy5jYW1lcmEueSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnBsYXllcnNbdGhpcy5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKXtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBwbGF5ZXIgYWxyZWFkeSBleGlzdHMuXHJcbiAgICBpZihkYXRhLmlkIGluIHRoaXMucGxheWVycykgcmV0dXJuO1xyXG5cclxuICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGRhdGEpO1xyXG4gICAgdGhpcy5lbnRpdGllcy5wdXNoKG5ld1BsYXllcik7XHJcbiAgICB0aGlzLnBsYXllcnNbZGF0YS5pZF0gPSBuZXdQbGF5ZXI7XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcblxyXG4gICAgcmV0dXJuIG5ld1BsYXllcjtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnJlbW92ZVBsYXllciA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2FtZSByZW1vdmluZyBwbGF5ZXJcIiwgZGF0YSk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gcGxheWVycyBvYmplY3RcclxuICAgIGRlbGV0ZSB0aGlzLnBsYXllcnNbZGF0YS5pZF07XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gZW50aXRpdGVzIGFycmF5XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW50aXRpZXNbaV0uaWQgPT09IGRhdGEuaWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmb3VuZCBoaW0gLCByZW1vdmluZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdldEdhbWVTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAvLyBlbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZW50aXR5OlwiLCBlbnRpdHkpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZW50aXR5KTtcclxuICAgICAgICAvLyB9KSxcclxuICAgICAgICBlbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7IHJldHVybiBlbnRpdHkuZ2V0RnVsbFN0YXRlKCk7ICAgICAgICB9KSxcclxuICAgICAgICAvL3BsYXllcnM6IE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBKU09OLnN0cmluZ2lmeSh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0pOyB9KVxyXG4gICAgICAgIHBsYXllcnM6IHRoaXMuZ2V0UGxheWVyc1N0YXRlKClcclxuICAgIH07XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRQbGF5ZXJzU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gd2luZG93LmdhbWUucGxheWVyc1trZXldLmdldEZ1bGxTdGF0ZSgpOyB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiZnVuY3Rpb24gS2V5Ym9hcmQocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICAvL3RoaXMubGFzdFN0YXRlID0gXy5jbG9uZShwbGF5ZXIua2V5cyk7XG4gICAgdGhpcy5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgIT09IHRydWUpICBwbGF5ZXIua1VwPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biAhPT0gdHJ1ZSkgIHBsYXllci5rRG93biA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgIT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtSaWdodCAhPT0gdHJ1ZSkgIHBsYXllci5rUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5rZXlVcEhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwID09PSB0cnVlKSBwbGF5ZXIua1VwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICBpZiAocGxheWVyLmtEb3duID09PSB0cnVlKSBwbGF5ZXIua0Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCA9PT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtSaWdodCA9PT0gdHJ1ZSkgIHBsYXllci5rUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcy5rZXlEb3duSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcbiIsImZ1bmN0aW9uIExldmVsKCl7XHJcbiAgICB0aGlzLndpZHRoID0gNjQwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSA0ODA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHRoaXMucGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcInNob290XCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LmdhbWUuY2FtZXJhLnkgKyBlLm9mZnNldFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5wdXNoKGFjdGlvbik7IC8vIHRlbGwgdGhlIGhvc3Qgb2YgdGhlIGFjdGlvblxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VYID0gd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFg7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWSA9IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZO1xuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5tb3VzZUxlZnQgIT09IHRydWUpICBwbGF5ZXIubW91c2VMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5tb3VzZUxlZnQgPT09IHRydWUpIHBsYXllci5tb3VzZUxlZnQgID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIC8vd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xuIiwiZnVuY3Rpb24gQ29udHJvbHMoKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xyXG4iLCIvLyB2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoXCIuL0tleWJvYXJkXCIpO1xudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcbi8vdmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuL0J1bGxldFwiKTtcbi8vdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vL3ZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbnZhciBTaG90Z3VuID0gcmVxdWlyZShcIi4vd2VhcG9ucy9TaG90Z3VuXCIpO1xudmFyIEFrNDcgPSByZXF1aXJlKFwiLi93ZWFwb25zL0FrNDdcIik7XG4vL3ZhciBBbmltYXRpb24gPSByZXF1aXJlKFwiLi9BbmltYXRpb25cIik7XG52YXIgRW50aXR5ID0gcmVxdWlyZShcIi4vRW50aXR5XCIpO1xuXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xuICAgIHRoaXMuaWQgPSBwbGF5ZXJEYXRhLmlkO1xuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7IC8vIGNpcmNsZSByYWRpdXNcbiAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHRoaXMueSA9IHBsYXllckRhdGEueSB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gcGxheWVyRGF0YS5kaXJlY3Rpb24gfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDE7XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcbiAgICB0aGlzLnNwZWVkID0gcGxheWVyRGF0YS5zcGVlZCB8fCAxMDA7IC8vcGl4ZWxzIHBlciBzZWNvbmRcbiAgICB0aGlzLmhwID0gcGxheWVyRGF0YS5ocCB8fCAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHBsYXllckRhdGEuYWxpdmUgfHwgdHJ1ZTtcblxuICAgIHRoaXMuc3ggPSAwO1xuICAgIHRoaXMuc3kgPSAwO1xuICAgIHRoaXMuc3cgPSA2MDtcbiAgICB0aGlzLnNoID0gNjA7XG4gICAgdGhpcy5kdyA9IDYwO1xuICAgIHRoaXMuZGggPSA2MDtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgLy90aGlzLndlYXBvbiA9IG5ldyBXZWFwb24odGhpcywgd2VhcG9ucy5BSyk7XG4gICAgLy9cbiAgICAvL3RoaXMud2VhcG9uID0gbmV3IFNob3RndW4odGhpcyk7XG5cbiAgICB0aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSAwO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcblxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGVyZm9ybUFjdGlvbih0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zLnB1c2godGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmFsaXZlKSByZXR1cm47XG5cbiAgICB0aGlzLm1vdmUoZHQpO1xuXG4gICAgLy9jaGVjayBpZiBvZmYgc2NyZWVuXG4gICAgaWYgKHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKSB0aGlzLnggPSB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aDtcbiAgICBpZiAodGhpcy54IDwgMCkgdGhpcy54ID0gMDtcbiAgICBpZiAodGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB0aGlzLnkgPSB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQ7XG4gICAgaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG5cbiAgICAvLyB1cGRhdGUgY3VycmVudCB3ZWFwb247XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0udXBkYXRlKGR0KTtcblxuICAgIC8vdGhpcy5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZShkdCk7XG5cbiAgICBpZiAodGhpcy5tb3VzZUxlZnQpIHsgLy8gaWYgZmlyaW5nXG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwiZmlyZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW91c2VYLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMubW91c2VZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gICAgLy8gVXBkYXRlIG1vdmVtZW50XG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZIC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYIC09IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXAgJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIHRoaXMueSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueCArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggKz0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIHRoaXMueSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueCAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYICs9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXApIHtcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24pIHtcbiAgICAgICAgdGhpcy55ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSArPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0xlZnQpIHtcbiAgICAgICAgdGhpcy54IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIHRoaXMueCArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggKz0gZGlzdGFuY2U7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXR3b3JrVXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICBkZWxldGUgdXBkYXRlLmlkO1xuICAgIC8vIG5ldHdvcmtVcGRhdGVcbiAgICBmb3IgKHZhciBrZXkgaW4gdXBkYXRlKSB7XG4gICAgICAgIGlmIChrZXkgPT09IFwiYWN0aW9uc1wiKSB0aGlzW2tleV0gPSB0aGlzW2tleV0uY29uY2F0KHVwZGF0ZVtrZXldKTtcbiAgICAgICAgZWxzZSB0aGlzW2tleV0gPSB1cGRhdGVba2V5XTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBlcmZvcm1BY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24pe1xuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcbiAgICAgICAgY2FzZSBcInR1cm5Ub3dhcmRzXCI6XG4gICAgICAgICAgICB0aGlzLnR1cm5Ub3dhcmRzKGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmaXJlXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uZmlyZShhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiZGllXCI6XG4gICAgICAgICAgICB0aGlzLmRpZShhY3Rpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZXNwYXduXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNwYXduKGFjdGlvbik7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIGlmKCF0aGlzLmFsaXZlKSByZXR1cm47XG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxuXG4gICAgdGhpcy5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zeCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XG4gICAgLy8gY3R4LmRyYXdJbWFnZShcbiAgICAvLyAgICAgd2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIC8vIGltYWdlXG4gICAgLy8gICAgIHRoaXMuc3gsIC8vIHggb24gaW1hZ2VcbiAgICAvLyAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLnN5LCAvLyB5IG9uIGltYWdlXG4gICAgLy8gICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbi53LCAvLyB3aWR0aFxuICAgIC8vICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24uaCwgLy8gaGVpZ2h0XG4gICAgLy8gICAgIC0odGhpcy5jdXJyZW50QW5pbWF0aW9uLncgLyAyKSwgLy8gY2VudGVyIHhcbiAgICAvLyAgICAgLSh0aGlzLmN1cnJlbnRBbmltYXRpb24uaCAvIDIpLCAvLyBjZW50ZXIgeVxuICAgIC8vICAgICB0aGlzLmR3LFxuICAgIC8vICAgICB0aGlzLmRoXG4gICAgLy8gKTtcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG4gICAgLy8gY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgLy8gY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5yZWN0KC0yLCAtMiwgNCwgNCk7XG4gICAgLy8gY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgLy8gY3R4LmZpbGwoKTtcbiAgICAvLyAgY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0Yylcbn07XG5cblBsYXllci5wcm90b3R5cGUudHVyblRvd2FyZHMgPSBmdW5jdGlvbih4LHkpIHtcbiAgICB2YXIgeERpZmYgPSB4IC0gdGhpcy54O1xuICAgIHZhciB5RGlmZiA9IHkgLSB0aGlzLnk7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmF0YW4yKHlEaWZmLCB4RGlmZik7Ly8gKiAoMTgwIC8gTWF0aC5QSSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnRha2VEYW1hZ2UgPSBmdW5jdGlvbihkYW1hZ2UsIGRpcmVjdGlvbikge1xuICAgIHRoaXMuaHAgLT0gZGFtYWdlO1xuICAgIGlmICh0aGlzLmhwIDw9IDApIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcImRpZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuXG4gICAgLy8gY3JlYXRlIGEgY29ycHNlXG4gICAgdmFyIGNvcnBzZSA9IG5ldyBFbnRpdHkoe1xuICAgICAgICB4OiB0aGlzLnggKyBNYXRoLmNvcyhhY3Rpb24uZGF0YS5kaXJlY3Rpb24pICogMTAsXG4gICAgICAgIHk6IHRoaXMueSArIE1hdGguc2luKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAgICAgc3g6IDAsXG4gICAgICAgIHN5OiAxMjAsXG4gICAgICAgIHN3OiA2MCxcbiAgICAgICAgc2g6IDYwLFxuICAgICAgICBkdzogNjAsXG4gICAgICAgIGRoOiA2MCxcbiAgICAgICAgZGlyZWN0aW9uOiBhY3Rpb24uZGF0YS5kaXJlY3Rpb24sXG4gICAgICAgIGN0eDogd2luZG93LmdhbWUuYmdDdHhcbiAgICB9KTtcblxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2goY29ycHNlKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUucmVzcGF3biA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMueCA9IGFjdGlvbi5kYXRhLng7XG4gICAgdGhpcy55ID0gYWN0aW9uLmRhdGEueTtcbiAgICB0aGlzLmhwID0gMTAwO1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55LFxuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgaHA6IHRoaXMuaHAsXG4gICAgICAgIGFsaXZlOiB0aGlzLmFsaXZlLFxuICAgICAgICByYWRpdXM6IHRoaXMucmFkaXVzLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxuICAgICAgICBzcGVlZDogdGhpcy5zcGVlZCxcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZXG4gICAgfTtcbn07XG5cbi8vIFRoZSBzdGF0ZSB0aGUgY2xpZW50IHNlbmRzIHRvIHRoZSBob3N0XG5QbGF5ZXIucHJvdG90eXBlLmdldENsaWVudFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWVxuICAgIH07XG59O1xuXG4vLyBQbGF5ZXIucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcbi8vICAgICBjb25zb2xlLmxvZyh0aGlzLmlkLCBcImZpcmUhXCIsIGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xuLy9cbi8vICAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBCdWxsZXQoe1xuLy8gICAgICAgICB4OiB0aGlzLngsXG4vLyAgICAgICAgIHk6IHRoaXMueSxcbi8vICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvblxuLy8gICAgIH0pKTtcbi8vICAgICByZXR1cm4gYWN0aW9uOyAvLyBldmVyeSBzaG9vdCBpcyB2YWxpZCByaWdodCBub3dcbi8vIH07XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xuIiwidmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XHJcbnZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVWkoZ2FtZSl7XHJcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcclxuICAgICAgICB2YXIgbXlJRCA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQ7XHJcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGxheWVycyl7XHJcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpZCArIFwiIFwiICsgcGxheWVyc1tpZF0ucGluZyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaWQgPT09IG15SUQpIHtcclxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJtZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyRGVidWcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgd2luZG93LmdhbWUuZnBzLCA1LCAyMCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcsIDUsIDQyKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJDQU1FUkE6IFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS55KSwgNSwgNjQpO1xyXG4gICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUExBWUVSOiAgXCIgKyBNYXRoLmZsb29yKHBsYXllci54KSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLnkpLCA1LCA4Nik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIk1PVVNFOiBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVkpLCA1LCAxMDgpO1xyXG4gICAgICAgICAgICBpZihwbGF5ZXIpIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkRJUjogXCIgKyBwbGF5ZXIuZGlyZWN0aW9uLnRvRml4ZWQoMiksIDUsIDEzMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclVJICA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xyXG4gICAgICAgIGlmICghcGxheWVyKSByZXR1cm47XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQocGxheWVyLmhwLCA1LCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMjApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXNwYXduQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuXHJcbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIHtcclxuICAgICAgICAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG4gICAgICAgICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWtCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xyXG4gICAgICAgIHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID0gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdGd1bkJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XHJcbiAgICAgICAgcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXggPSAxO1xyXG4gICAgICAgIC8vcGxheWVyLndlYXBvbiA9IG5ldyBXZWFwb24ocGxheWVyLCB3ZWFwb25zLnNob3RndW4pO1xyXG4gICAgICAgIC8vcGxheWVyLndlYXBvbiA9IG5ldyBTaG90Z3VuKClcclxuICAgIH0pO1xyXG59O1xyXG4iLCJ2YXIgQWs0NyA9IHtcclxuICAgIFwibmFtZVwiOiBcIkFLXCIsXHJcbiAgICBcIm1hZ2F6aW5lXCI6IDMwLCAvLyBidWxsZXRzXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuMSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiAxLCAvLyBzaG9vdCAxIGJ1bGxldCBhdCBhIHRpbWVcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDIsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMTcwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiAwIC8vIHNwcml0ZXNoZWV0IHkgcG9zaXRpb25cclxufTtcclxuXHJcbnZhciBzaG90Z3VuID0ge1xyXG4gICAgXCJuYW1lXCI6IFwic2hvdGd1blwiLFxyXG4gICAgXCJtYWdhemluZVwiOiA0LCAvLyBidWxsZXRzXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuNSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiA0LCAvLyA0IHNob3RndW4gc2x1Z3MgcGVyIHNob3RcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDIsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMjUwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiA2MCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBazQ3OiBBazQ3LFxyXG4gICAgc2hvdGd1bjogc2hvdGd1blxyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcbmZ1bmN0aW9uIHRvUmFkaWFucyhkZWcpIHtcbiAgICByZXR1cm4gZGVnICogKE1hdGguUEkgLyAxODApO1xufVxuXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlc1xufTtcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5BazQ3O1xyXG5cclxuY2xhc3MgQWs0NyBleHRlbmRzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyKSB7XHJcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFrNDc7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5zaG90Z3VuO1xyXG52YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0XCIpO1xyXG5cclxuY2xhc3MgU2hvdGd1biBleHRlbmRzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyKSB7XHJcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5TaG90Z3VuLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgLy8gc2hvb3QgNCBidWxsZXRzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0c1BlclNob3Q7IGkgKz0gMSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XHJcbiAgICAgICAgICAgIHg6IHRoaXMub3duZXIueCxcclxuICAgICAgICAgICAgeTogdGhpcy5vd25lci55LFxyXG4gICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uICsgTWF0aC5yYW5kb20oKSAqIDAuMjUgLSAwLjEyNSxcclxuICAgICAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXHJcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFjdGlvbjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hvdGd1bjtcclxuIiwidmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldFwiKTtcclxuXHJcbmNsYXNzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cob3duZXIsIFwiREFUQVwiLGRhdGEpO1xyXG4gICAgICAgIHRoaXMub3duZXIgPSBvd25lcjtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5tYWdhemluZSA9IGRhdGEubWFnYXppbmU7XHJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IGRhdGEuZmlyZVJhdGU7XHJcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcclxuICAgICAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XHJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XHJcbiAgICAgICAgdGhpcy5idWxsZXRzUGVyU2hvdCA9IGRhdGEuYnVsbGV0c1BlclNob3Q7XHJcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XHJcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XHJcblxyXG4gICAgICAgIHRoaXMuZmlyZVRpbWVyID0gdGhpcy5maXJlUmF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuV2VhcG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xyXG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSkgdGhpcy5maXJlVGltZXIgKz0gZHQ7XHJcbn07XHJcblxyXG5XZWFwb24ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcclxuICAgIC8vY29uc29sZS5sb2codGhpcy5vd25lci5pZCwgXCJGSVJFIVwiLCBhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcclxuXHJcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgQnVsbGV0KHtcclxuICAgICAgICB4OiB0aGlzLm93bmVyLngsXHJcbiAgICAgICAgeTogdGhpcy5vd25lci55LFxyXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5vd25lci5kaXJlY3Rpb24sXHJcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXHJcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxyXG4gICAgfSkpO1xyXG4gICAgcmV0dXJuIGFjdGlvbjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV2VhcG9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XG5cbmZ1bmN0aW9uIENsaWVudCgpe1xuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAvLyBTdHJlc3MgdGVzdFxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XG5cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgYWN0aW9ucyBmcm9tIHRoZSBob3N0XG4gICAgdGhpcy5jaGFuZ2VzID0gW107IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcblxuICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGdhbWVJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pbiB0aGUgaG9zdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJteSBjbGllbnQgcGVlcklEIGlzIFwiLCBpZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cblxuICAgICAgICAvLyBjbG9zZSBvdXQgYW55IG9sZCBjb25uZWN0aW9uc1xuICAgICAgICBpZihPYmplY3Qua2V5cyh0aGlzLmNvbm5lY3Rpb25zKS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGNvbm5QZWVyIGluIHRoaXMuY29ubmVjdGlvbnMpe1xuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdWzBdLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVsZXRlIG9sZCBob3N0cyBwbGF5ZXIgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJkZWxldGUgb2xkIHBsYXllclwiLCBjb25uUGVlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBpdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcblxuICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckpvaW5lZFwiOlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSBcInBsYXllckxlZnRcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC8vd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLmlkfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5nYW1lU3RhdGUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImNoYW5nZXNcIjogLy8gY2hhbmdlcyBhbmQgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcyA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMuY29uY2F0KGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucyA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMuY29uY2F0KGRhdGEuYWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjogLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgICAgICAgICAgICAgICAgIGRhdGEucGluZ3MuZm9yRWFjaChmdW5jdGlvbihwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3BpbmcuaWRdLnBpbmcgPSBwaW5nLnBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdLnBpbmc7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh3aW5kb3cuZ2FtZS5wbGF5ZXJzKTtcbiAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH0pO1xufVxuXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbntcbiAgICAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgaWYgKCFwbGF5ZXIpIHJldHVybjtcblxuICAgIHZhciBjdXJyZW50U3RhdGUgPSBwbGF5ZXIuZ2V0Q2xpZW50U3RhdGUoKTtcbiAgICB2YXIgbGFzdENsaWVudFN0YXRlID0gcGxheWVyLmxhc3RDbGllbnRTdGF0ZTtcbiAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0Q2xpZW50U3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcblxuICAgIC8vIGFkZCBhbnkgcGVyZm9ybWVkIGFjdGlvbnMgdG8gY2hhbmdlIHBhY2thZ2VcbiAgICBpZiAocGxheWVyLnBlcmZvcm1lZEFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgY2hhbmdlLmFjdGlvbnMgPSBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucztcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzLCBzZW5kIGVtIHRvIGhvc3RcbiAgICAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgICAgICAgICAgZXZlbnQ6IFwibmV0d29ya1VwZGF0ZVwiLFxuICAgICAgICAgICAgdXBkYXRlczogY2hhbmdlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwbGF5ZXIubGFzdENsaWVudFN0YXRlID0gY3VycmVudFN0YXRlO1xuXG5cblxuXG4gICAgLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV07XG5cbiAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgICAgIGlmIChjaGFuZ2UuaWQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UuaWRdLm5ldHdvcmtVcGRhdGUoY2hhbmdlKTtcbiAgICAgICAgICAgIH1jYXRjaCAoZXJyKSB7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XG4gICAgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTtcblxuXG5cbiAgICAvLyAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIC8vIHZhciBteVBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICAvLyBpZiAoIW15UGxheWVyKSByZXR1cm47XG4gICAgLy9cbiAgICAvLyAgaWYgKCFfLmlzRXF1YWwobXlQbGF5ZXIua2V5cywgbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlKSkge1xuICAgIC8vICAgICAvLyBzZW5kIGtleXN0YXRlIHRvIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwia2V5c1wiLFxuICAgIC8vICAgICAgICAga2V5czogbXlQbGF5ZXIua2V5c1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgfVxuICAgIC8vIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSA9IF8uY2xvbmUobXlQbGF5ZXIua2V5cyk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcbiAgICAvL1xuICAgIC8vIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XG4gICAgLy8gdmFyIGNoYW5nZXMgPSBbXTtcbiAgICAvLyB2YXIgbGFzdFN0YXRlID0gbXlQbGF5ZXIubGFzdFN0YXRlO1xuICAgIC8vIHZhciBuZXdTdGF0ZSA9IG15UGxheWVyLmdldFN0YXRlKCk7XG4gICAgLy9cbiAgICAvLyAvLyBjb21wYXJlIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgLy8gdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgIC8vIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAvLyAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAvLyAgICAgY2hhbmdlLnBsYXllcklEID0gbXlQbGF5ZXIuaWQ7XG4gICAgLy8gICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIG15UGxheWVyLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xuICAgIC8vIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXG4gICAgLy8gaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAvLyAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYgKHRoaXMuYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgIC8vIHNlbmQgYWxsIHBlcmZvcm1lZCBhY3Rpb25zIHRvIHRoZSBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImFjdGlvbnNcIixcbiAgICAvLyAgICAgICAgIGRhdGE6IHRoaXMuYWN0aW9uc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107IC8vIGNsZWFyIGFjdGlvbnMgcXVldWVcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jaGFuZ2VzW2ldLmxlbmd0aDsgaiArPSAxKSAge1xuICAgIC8vICAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldW2pdO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAvLyAgICAgICAgIGlmIChjaGFuZ2UucGxheWVySUQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHRoaXMuY2hhbmdlcyA9IFtdO1xuXG59O1xuXG4gICAgLy9cbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAvLyAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XG4gICAgLy8gICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgLy8gICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgLy8gICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvLyBwaW5nIHRlc3RcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgIC8vICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH0sIDIwMDApO1xuICAgIC8vXG4gICAgLy8gfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XG4gICAgdGhpcy5jb25ucyA9IHt9O1xuICAgIHRoaXMuYWN0aW9ucyA9IHt9OyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgYWxsIHRoZSBhY3Rpb25zIHJlY2VpdmVkIGZyb20gY2xpZW50c1xuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIHRoaXMuZGlmZiA9IG51bGw7XG5cbiAgICB0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihwZWVycyl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdFwiLCBwZWVycyk7XG5cbiAgICAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcblxuICAgICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGhvc3RzIHBsYXllciBvYmplY3QgaWYgaXQgZG9lc250IGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBpZiAoISh3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkIGluIHdpbmRvdy5nYW1lLnBsYXllcnMpKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZW5kIGEgcGluZyBldmVyeSAyIHNlY29uZHMsIHRvIHRyYWNrIHBpbmcgdGltZVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgIHBpbmdzOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZ2V0UGluZ3MoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwyMDAwKTtcblxuICAgICAgICAgICAgcGVlcnMuZm9yRWFjaChmdW5jdGlvbihwZWVySUQpIHtcbiAgICAgICAgICAgICAgICAvL2Nvbm5lY3Qgd2l0aCBlYWNoIHJlbW90ZSBwZWVyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm4gPSAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuY29ubmVjdChwZWVySUQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaG9zdElEOlwiLCB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5pZCwgXCIgY29ubmVjdCB3aXRoXCIsIHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbcGVlcklEXSA9IHBlZXI7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW3BlZXJJRF0gPSBjb25uO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCBuZXcgcGxheWVyIGRhdGEgdG8gZXZlcnlvbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckpvaW5lZFwiLCBwbGF5ZXJEYXRhOiBuZXdQbGF5ZXIuZ2V0RnVsbFN0YXRlKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBuZXcgcGxheWVyIHRoZSBmdWxsIGdhbWUgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5lbWl0KCB7Y2xpZW50SUQ6IGNvbm4ucGVlciwgZXZlbnQ6IFwiZ2FtZVN0YXRlXCIsIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKCl9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1tjb25uLnBlZXJdO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBFVkVOVFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pOyAvLyBhbnN3ZXIgdGhlIHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBjbGllbnQsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmV0d29ya1VwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBmcm9tIGEgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLm5ldHdvcmtVcGRhdGUoZGF0YS51cGRhdGVzKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YS5hY3Rpb25zKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImFjdGlvbnNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJhY3Rpb25zIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiY2hhbmdlc1wiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uY2hhbmdlKGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImtleXNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJrZXlzIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhLmtleXMsICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMgPSBfLmNsb25lKGRhdGEua2V5cyk7IC8vVE9ETzogdmVyaWZ5IGlucHV0IChjaGVjayB0aGF0IGl0IGlzIHRoZSBrZXkgb2JqZWN0IHdpdGggdHJ1ZS9mYWxzZSB2YWx1ZXMpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcbiAgICAgICAgICAgIHRoaXMuY29ubnNbY29ubl0uc2VuZChkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFTUlUIVwiLCBkYXRhKTtcbiAgICAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcblxuICAgICAgICB2YXIgY2hhbmdlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRGdWxsU3RhdGUgPSBwbGF5ZXIuZ2V0RnVsbFN0YXRlKCk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRGdWxsU3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gcGxheWVyLmxhc3RGdWxsU3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcbiAgICAgICAgICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkgfHwgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMubGVuZ3RoID4gMCkgeyAvL3RoZXJlJ3MgYmVlbiBjaGFuZ2VzIG9yIGFjdGlvbnNcbiAgICAgICAgICAgICAgICBjaGFuZ2UuaWQgPSBwbGF5ZXIuaWQ7XG4gICAgICAgICAgICAgICAgY2hhbmdlLmFjdGlvbnMgPSBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucztcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIubGFzdEZ1bGxTdGF0ZSA9IGN1cnJlbnRGdWxsU3RhdGU7XG4gICAgICAgICAgICAgICAgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgdGhpcy5nZXRQaW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGluZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICBwaW5ncy5wdXNoKHtpZDogcGxheWVyLmlkLCBwaW5nOiBwbGF5ZXIucGluZyB8fCBcImhvc3RcIn0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBpbmdzO1xuICAgIH07XG59O1xuIiwidmFyIENsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcclxudmFyIEhvc3QgPSByZXF1aXJlKFwiLi9Ib3N0XCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJSVEMoKXtcclxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoZGF0YS5wZWVycywgZGF0YS5wcmV2aW91c0hvc3QpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJKb2luZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KFtkYXRhLnBlZXJJRF0sIGRhdGEucHJldmlvdXNIb3N0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQTEFZRVIgTEVGVFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLnBsYXllcklEfSk7XHJcbiAgICB9KTtcclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbZGF0YS5pZF07XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
