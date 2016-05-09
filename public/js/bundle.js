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
    grad.addColorStop(0, "rgba(255,165,0,0.4)");
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

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(this.length, this.length, 1, 1 );


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

    document.querySelector("#canvases").appendChild(this.bgCanvas);
    document.querySelector("#canvases").appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.bgCtx = this.bgCanvas.getContext("2d");

    this.ctx.font = "24px Open Sans";

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

        //bg color
        this.bgCtx.beginPath();
        this.bgCtx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.bgCtx.fillStyle = "#5b5850";
        this.bgCtx.fill();

        // draw test background
        this.bgCtx.beginPath();
        this.bgCtx.rect(0 - this.camera.x, 0 - this.camera.y, this.level.width, this.level.height);
        this.bgCtx.fillStyle = "#85827d";
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
        console.log(e.keyCode);
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
            case 49: // 1
                if (player.selectedWeaponIndex === 0) return;
                player.actions.push({
                    action: "changeWeapon",
                    data: {
                        selectedWeaponIndex: 0,
                    }
                });
                break;
            case 50: // 2
                if (player.selectedWeaponIndex === 1) return;
                player.actions.push({
                    action: "changeWeapon",
                    data: {
                        selectedWeaponIndex: 1,
                    }
                });
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
        case "changeWeapon":
            return this.changeWeapon(action);
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

Player.prototype.changeWeapon = function(action) {
    this.selectedWeaponIndex = action.data.selectedWeaponIndex;
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
        mouseY: this.mouseY,
        selectedWeaponIndex: this.selectedWeaponIndex
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
            li.appendChild(content);
            this.clientList.appendChild(li);
        }
    };

    this.renderDebug = function() {
        window.game.ctx.font = "12px Open Sans";
        var player = window.game.players[window.game.network.client.peer.id];
        window.game.ctx.fillStyle = "#d7d7d7";
        window.game.ctx.fillText("FPS:  " + window.game.fps, 5, 20);
        window.game.ctx.fillText("PING: " + window.game.network.ping, 5, 34);
        window.game.ctx.fillText("CAMERA: " + Math.floor(window.game.camera.x) + ", " + Math.floor(window.game.camera.y), 5, 48);
        if (player) {
            window.game.ctx.fillText("PLAYER:  " + Math.floor(player.x) + ", " + Math.floor(player.y), 5, 62);
            window.game.ctx.fillText("MOUSE: " + Math.floor(player.mouseX) + ", " + Math.floor(player.mouseY), 5, 76);
            if(player) window.game.ctx.fillText("DIR: " + player.direction.toFixed(2), 5, 90);
        }
        window.game.ctx.font = "24px Open Sans";
    };

    this.renderUI  = function() {
        var player = window.game.players[window.game.network.client.peer.id];
        if (!player) return;


        //gui bg color
        window.game.ctx.beginPath();
        window.game.ctx.rect(0, window.game.canvas.height - 35, 140, 35);
        window.game.ctx.fillStyle = "rgba(0,0,0,0.35)";
        window.game.ctx.fill();

        // Create gradient
        var grd= window.game.ctx.createLinearGradient(140,0,190,0);
        grd.addColorStop(0,"rgba(0,0,0,0.35)");
        grd.addColorStop(1,"rgba(0,0,0,0)");
        window.game.ctx.fillStyle=grd;
        window.game.ctx.fillRect(140, window.game.canvas.height - 35,50,35);



        var weapon =  player.weapons[player.selectedWeaponIndex];
        // draw weapon icon
        window.game.ctx.drawImage(window.game.spritesheet, weapon.iconSx, weapon.iconSy, weapon.iconW, weapon.iconH, 90, window.game.canvas.height - 33, weapon.iconW, weapon.iconH);
        // draw magazine count'
        window.game.ctx.fillStyle = "rgba(0,0,0,0.25)";
        window.game.ctx.fillText(weapon.bullets, 122, window.game.canvas.height - 9);
        window.game.ctx.fillStyle = "#e7d29e";
        window.game.ctx.fillText(weapon.bullets,  122, window.game.canvas.height - 10);

        // draw heart
        window.game.ctx.drawImage(window.game.spritesheet, 0, 228, 13, 12, 10, window.game.canvas.height - 23, 13, 12);
        // draw HP
        window.game.ctx.fillStyle = "rgba(0,0,0,0.25)";
        window.game.ctx.fillText(player.hp, 30, window.game.canvas.height - 9);
        window.game.ctx.fillStyle = "#e7d29e";
        window.game.ctx.fillText(player.hp, 30, window.game.canvas.height - 10);
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
};

},{"./data/weapons":11,"./weapons/Weapon":16}],11:[function(require,module,exports){
var Ak47 = {
    "name": "AK",
    "magazineSize": 30, // bullets
    "bullets": 30,
    "fireRate": 0.1, // shots per second
    "bulletsPerShot": 1, // shoot 1 bullet at a time
    "damage": 10, // hp
    "reloadTime": 2, // s
    "bulletSpeed": 1700, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 0, // spritesheet y position
    "iconSx": 21,
    "iconSy": 210,
    "iconW": 30,
    "iconH": 30
};

var shotgun = {
    "name": "shotgun",
    "magazineSize": 12, // bullets
    "bullets": 12,
    "fireRate": 0.5, // shots per second
    "bulletsPerShot": 4, // 4 shotgun slugs per shot
    "damage": 10, // hp
    "reloadTime": 2, // s
    "bulletSpeed": 2500, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 60, // spritesheet y position
    "iconSx": 51,
    "iconSy": 210,
    "iconW": 30,
    "iconH": 30
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

    if (this.fireTimer < this.fireRate || this.reloading || this.bullets < 1) return false;

    this.bullets -= 1;
    this.fireTimer = 0;

    var directions = [];
    var direction;

    // shoot 4 bullets
    for (var i = 0; i < this.bulletsPerShot; i += 1) {

        if (!action.data.directions) {
            // randomize directions myself
            direction = this.owner.direction + Math.random() * 0.25 - 0.125;
            directions.push(direction);
        } else {
            direction = action.data.directions[i];
        }

        window.game.entities.push(new Bullet({
            x: this.owner.x,
            y: this.owner.y,
            direction: direction,
            bulletSpeed: this.bulletSpeed,
            damage: this.damage
        }));
    }

    console.log("FIRE", action, directions);
    action.data.directions = directions;


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
        this.magazineSize = data.magazineSize;
        this.bullets = data.bullets;
        this.fireRate = data.fireRate;
        this.damage = data.damage;
        this.reloadTime = data.reloadTime;
        this.bulletSpeed = data.bulletSpeed;
        this.bulletsPerShot = data.bulletsPerShot;
        this.sx = data.sx;
        this.sy = data.sy;

        this.iconSx = data.iconSx;
        this.iconSy = data.iconSy;
        this.iconW = data.iconW;
        this.iconH = data.iconH;

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

    if (this.fireTimer < this.fireRate || this.reloading || this.bullets < 1) return false;

    this.bullets -= this.bulletsPerShot;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0NhbWVyYS5qcyIsInNyYy9qcy9FbnRpdHkuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2RhdGEvd2VhcG9ucy5qcyIsInNyYy9qcy9oZWxwZXJzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWJSVEMvQ2xpZW50LmpzIiwic3JjL2pzL3dlYlJUQy9Ib3N0LmpzIiwic3JjL2pzL3dlYlJUQy9XZWJSVEMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XHJcblxyXG5mdW5jdGlvbiBCdWxsZXQoZGF0YSkge1xyXG4gICAgLy8gY3JlYXRlIHRoZSBidWxsZXQgNSBwaXhlbHMgdG8gdGhlIHJpZ2h0IGFuZCAzMCBwaXhlbHMgZm9yd2FyZC4gc28gaXQgYWxpZ25zIHdpdGggdGhlIGd1biBiYXJyZWxcclxuICAgIHRoaXMueCA9IGRhdGEueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcbiAgICB0aGlzLnkgPSBkYXRhLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xyXG5cclxuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uKSAqIDMwO1xyXG4gICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcbiAgICAvL3RoaXMueCA9IGRhdGEueDtcclxuICAgIC8vdGhpcy55ID0gZGF0YS55O1xyXG4gICAgdGhpcy5sZW5ndGggPSAxMDsgLy8gdHJhaWwgbGVuZ3RoXHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IGRhdGEuZGlyZWN0aW9uO1xyXG4gICAgdGhpcy5zcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XHJcbiAgICB0aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xyXG5cclxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xyXG59XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgIC8vXHJcbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG5cclxuICAgIC8vIGlmIG9mZiBzY3JlZW4sIHJlbW92ZSBpdFxyXG4gICAgaWYgKHRoaXMueCA8IDAgfHwgdGhpcy54ID4gd2luZG93LmdhbWUubGV2ZWwud2lkdGggfHwgdGhpcy55IDwgMCB8fCB0aGlzLnkgPiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpIHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmhpdERldGVjdGlvbihpbmRleCk7XHJcbn07XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLmhpdERldGVjdGlvbiA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAvLyB0ZXN0IGJ1bGxldCBhZ2FpbnN0IGFsbCBwbGF5ZXJzXHJcbiAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xyXG5cclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xyXG5cclxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XHJcblxyXG4gICAgICAgIHZhciBhID0gdGhpcy54IC0gcGxheWVyLng7XHJcbiAgICAgICAgdmFyIGIgPSB0aGlzLnkgLSBwbGF5ZXIueTtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xyXG5cclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBwbGF5ZXIucmFkaXVzKSB7XHJcbiAgICAgICAgICAgIC8vIGhpdFxyXG4gICAgICAgICAgICBwbGF5ZXIudGFrZURhbWFnZSh0aGlzLmRhbWFnZSwgdGhpcy5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbiAtIDAuNzg1Mzk4MTYzNCk7IC8vIHJvdGF0ZVxyXG5cclxuICAgIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXHJcbiAgICB2YXIgZ3JhZD0gdGhpcy5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2JhKDI1NSwxNjUsMCwwLjQpXCIpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJ5ZWxsb3dcIik7XHJcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcblxyXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCAwKTtcclxuICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuXHJcbiAgICAvLyBjdHgubGluZVdpZHRoID0gMTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcclxuXHJcbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgsIDEsIDEgKTtcclxuXHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxyXG4gICAgLy8gdmFyIGdyYWQ9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcclxuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwiZ3JlZW5cIik7XHJcbiAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gY3R4LmxpbmVUbygwLGxlbmd0aCk7XHJcbiAgICAvLyBjdHguc3Ryb2tlKCk7XHJcblxyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJmdW5jdGlvbiBFbnRpdHkoZGF0YSkge1xyXG4gICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgdGhpcy5zeCA9IGRhdGEuc3g7XHJcbiAgICB0aGlzLnN5ID0gZGF0YS5zeTtcclxuICAgIHRoaXMuc3cgPSBkYXRhLnN3O1xyXG4gICAgdGhpcy5zaCA9IGRhdGEuc2g7XHJcbiAgICB0aGlzLmR3ID0gZGF0YS5kdztcclxuICAgIHRoaXMuZGggPSBkYXRhLmRoO1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkYXRhLmRpcmVjdGlvbjtcclxuICAgIHRoaXMuY3R4ID0gZGF0YS5jdHg7XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuXHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuXHJcbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBzeDogdGhpcy5zeCxcclxuICAgICAgICBzeTogdGhpcy5zeSxcclxuICAgICAgICBzdzogdGhpcy5zdyxcclxuICAgICAgICBzaDogdGhpcy5zaCxcclxuICAgICAgICBkaDogdGhpcy5kaCxcclxuICAgICAgICBkdzogdGhpcy5kdyxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcblxyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG5cclxuICAgIHRoaXMubGV2ZWwgPSBuZXcgTGV2ZWwoKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuYmdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmJnQ2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzZXNcIikuYXBwZW5kQ2hpbGQodGhpcy5iZ0NhbnZhcyk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIHRoaXMuYmdDdHggPSB0aGlzLmJnQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCIyNHB4IE9wZW4gU2Fuc1wiO1xyXG5cclxuICAgIHRoaXMuZ2FtZUlEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KFwiL1wiKVsyXTtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsoKTtcclxuXHJcbiAgICB0aGlzLmVudGl0aWVzID0gW107IC8vIGdhbWUgZW50aXRpZXNcclxuICAgIHRoaXMucGxheWVycyA9IHt9O1xyXG5cclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSgpO1xyXG5cclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcblxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdCAvIDEwMDAsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmFcclxuICAgICAgICAvL3RoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcmluZ1xyXG4gICAgICovXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vYmcgY29sb3JcclxuICAgICAgICB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuYmdDdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzViNTg1MFwiO1xyXG4gICAgICAgIHRoaXMuYmdDdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAvLyBkcmF3IHRlc3QgYmFja2dyb3VuZFxyXG4gICAgICAgIHRoaXMuYmdDdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5yZWN0KDAgLSB0aGlzLmNhbWVyYS54LCAwIC0gdGhpcy5jYW1lcmEueSwgdGhpcy5sZXZlbC53aWR0aCwgdGhpcy5sZXZlbC5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjODU4MjdkXCI7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy51aS5yZW5kZXJVSSgpO1xyXG4gICAgICAgIHRoaXMudWkucmVuZGVyRGVidWcoKTtcclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNBTUVSQTogWDpcIiArIHRoaXMuY2FtZXJhLngsIFwiXFxuWTpcIiArIHRoaXMuY2FtZXJhLnkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5wbGF5ZXJzW3RoaXMubmV0d29yay5jbGllbnQucGVlci5pZF0pO1xyXG4gICAgfTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkUGxheWVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAgaWYoZGF0YS5pZCBpbiB0aGlzLnBsYXllcnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG5cclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVtb3ZpbmcgcGxheWVyXCIsIGRhdGEpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XHJcbiAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudGl0eSk7XHJcbiAgICAgICAgLy8gfSksXHJcbiAgICAgICAgZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkgeyByZXR1cm4gZW50aXR5LmdldEZ1bGxTdGF0ZSgpOyAgICAgICAgfSksXHJcbiAgICAgICAgLy9wbGF5ZXJzOiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkod2luZG93LmdhbWUucGxheWVyc1trZXldKTsgfSlcclxuICAgICAgICBwbGF5ZXJzOiB0aGlzLmdldFBsYXllcnNTdGF0ZSgpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0UGxheWVyc1N0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRGdWxsU3RhdGUoKTsgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsImZ1bmN0aW9uIEtleWJvYXJkKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgLy90aGlzLmxhc3RTdGF0ZSA9IF8uY2xvbmUocGxheWVyLmtleXMpO1xuICAgIHRoaXMua2V5RG93bkhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlKTtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwICE9PSB0cnVlKSAgcGxheWVyLmtVcD0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtEb3duICE9PSB0cnVlKSAgcGxheWVyLmtEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtSaWdodCAhPT0gdHJ1ZSkgIHBsYXllci5rUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OTogLy8gMVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiY2hhbmdlV2VhcG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTA6IC8vIDJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXggPT09IDEpIHJldHVybjtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImNoYW5nZVdlYXBvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiAxLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5rZXlVcEhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwID09PSB0cnVlKSBwbGF5ZXIua1VwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICBpZiAocGxheWVyLmtEb3duID09PSB0cnVlKSBwbGF5ZXIua0Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCA9PT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtSaWdodCA9PT0gdHJ1ZSkgIHBsYXllci5rUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcy5rZXlEb3duSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcbiIsImZ1bmN0aW9uIExldmVsKCl7XHJcbiAgICB0aGlzLndpZHRoID0gNjQwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSA0ODA7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHRoaXMucGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcInNob290XCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LmdhbWUuY2FtZXJhLnkgKyBlLm9mZnNldFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5wdXNoKGFjdGlvbik7IC8vIHRlbGwgdGhlIGhvc3Qgb2YgdGhlIGFjdGlvblxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VYID0gd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFg7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWSA9IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZO1xuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5tb3VzZUxlZnQgIT09IHRydWUpICBwbGF5ZXIubW91c2VMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5tb3VzZUxlZnQgPT09IHRydWUpIHBsYXllci5tb3VzZUxlZnQgID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIC8vd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xuIiwiZnVuY3Rpb24gQ29udHJvbHMoKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xyXG4iLCIvLyB2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoXCIuL0tleWJvYXJkXCIpO1xudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcbi8vdmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuL0J1bGxldFwiKTtcbi8vdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vL3ZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbnZhciBTaG90Z3VuID0gcmVxdWlyZShcIi4vd2VhcG9ucy9TaG90Z3VuXCIpO1xudmFyIEFrNDcgPSByZXF1aXJlKFwiLi93ZWFwb25zL0FrNDdcIik7XG4vL3ZhciBBbmltYXRpb24gPSByZXF1aXJlKFwiLi9BbmltYXRpb25cIik7XG52YXIgRW50aXR5ID0gcmVxdWlyZShcIi4vRW50aXR5XCIpO1xuXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xuICAgIHRoaXMuaWQgPSBwbGF5ZXJEYXRhLmlkO1xuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7IC8vIGNpcmNsZSByYWRpdXNcbiAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHRoaXMueSA9IHBsYXllckRhdGEueSB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gcGxheWVyRGF0YS5kaXJlY3Rpb24gfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDE7XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcbiAgICB0aGlzLnNwZWVkID0gcGxheWVyRGF0YS5zcGVlZCB8fCAxMDA7IC8vcGl4ZWxzIHBlciBzZWNvbmRcbiAgICB0aGlzLmhwID0gcGxheWVyRGF0YS5ocCB8fCAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHBsYXllckRhdGEuYWxpdmUgfHwgdHJ1ZTtcblxuICAgIHRoaXMuc3ggPSAwO1xuICAgIHRoaXMuc3kgPSAwO1xuICAgIHRoaXMuc3cgPSA2MDtcbiAgICB0aGlzLnNoID0gNjA7XG4gICAgdGhpcy5kdyA9IDYwO1xuICAgIHRoaXMuZGggPSA2MDtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgLy90aGlzLndlYXBvbiA9IG5ldyBXZWFwb24odGhpcywgd2VhcG9ucy5BSyk7XG4gICAgLy9cbiAgICAvL3RoaXMud2VhcG9uID0gbmV3IFNob3RndW4odGhpcyk7XG5cbiAgICB0aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSAwO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcblxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGVyZm9ybUFjdGlvbih0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zLnB1c2godGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmFsaXZlKSByZXR1cm47XG5cbiAgICB0aGlzLm1vdmUoZHQpO1xuXG4gICAgLy9jaGVjayBpZiBvZmYgc2NyZWVuXG4gICAgaWYgKHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKSB0aGlzLnggPSB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aDtcbiAgICBpZiAodGhpcy54IDwgMCkgdGhpcy54ID0gMDtcbiAgICBpZiAodGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB0aGlzLnkgPSB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQ7XG4gICAgaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG5cbiAgICAvLyB1cGRhdGUgY3VycmVudCB3ZWFwb247XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0udXBkYXRlKGR0KTtcblxuICAgIC8vdGhpcy5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZShkdCk7XG5cbiAgICBpZiAodGhpcy5tb3VzZUxlZnQpIHsgLy8gaWYgZmlyaW5nXG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwiZmlyZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW91c2VYLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMubW91c2VZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gICAgLy8gVXBkYXRlIG1vdmVtZW50XG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZIC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYIC09IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXAgJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIHRoaXMueSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueCArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggKz0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIHRoaXMueSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueCAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYICs9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXApIHtcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24pIHtcbiAgICAgICAgdGhpcy55ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSArPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0xlZnQpIHtcbiAgICAgICAgdGhpcy54IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIHRoaXMueCArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggKz0gZGlzdGFuY2U7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXR3b3JrVXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICBkZWxldGUgdXBkYXRlLmlkO1xuICAgIC8vIG5ldHdvcmtVcGRhdGVcbiAgICBmb3IgKHZhciBrZXkgaW4gdXBkYXRlKSB7XG4gICAgICAgIGlmIChrZXkgPT09IFwiYWN0aW9uc1wiKSB0aGlzW2tleV0gPSB0aGlzW2tleV0uY29uY2F0KHVwZGF0ZVtrZXldKTtcbiAgICAgICAgZWxzZSB0aGlzW2tleV0gPSB1cGRhdGVba2V5XTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBlcmZvcm1BY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24pe1xuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcbiAgICAgICAgY2FzZSBcInR1cm5Ub3dhcmRzXCI6XG4gICAgICAgICAgICB0aGlzLnR1cm5Ub3dhcmRzKGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmaXJlXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uZmlyZShhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiZGllXCI6XG4gICAgICAgICAgICB0aGlzLmRpZShhY3Rpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZXNwYXduXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNwYXduKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJjaGFuZ2VXZWFwb25cIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYW5nZVdlYXBvbihhY3Rpb24pO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICBpZighdGhpcy5hbGl2ZSkgcmV0dXJuO1xuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcblxuICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3gsIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xuICAgIC8vIGN0eC5kcmF3SW1hZ2UoXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCAvLyBpbWFnZVxuICAgIC8vICAgICB0aGlzLnN4LCAvLyB4IG9uIGltYWdlXG4gICAgLy8gICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbi5zeSwgLy8geSBvbiBpbWFnZVxuICAgIC8vICAgICB0aGlzLmN1cnJlbnRBbmltYXRpb24udywgLy8gd2lkdGhcbiAgICAvLyAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uLmgsIC8vIGhlaWdodFxuICAgIC8vICAgICAtKHRoaXMuY3VycmVudEFuaW1hdGlvbi53IC8gMiksIC8vIGNlbnRlciB4XG4gICAgLy8gICAgIC0odGhpcy5jdXJyZW50QW5pbWF0aW9uLmggLyAyKSwgLy8gY2VudGVyIHlcbiAgICAvLyAgICAgdGhpcy5kdyxcbiAgICAvLyAgICAgdGhpcy5kaFxuICAgIC8vICk7XG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxuICAgIC8vIGN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIC8vIGN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcbiAgICAvLyBjdHgucmVjdCgtMiwgLTIsIDQsIDQpO1xuICAgIC8vIGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xuICAgIC8vIGN0eC5maWxsKCk7XG4gICAgLy8gIGN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnR1cm5Ub3dhcmRzID0gZnVuY3Rpb24oeCx5KSB7XG4gICAgdmFyIHhEaWZmID0geCAtIHRoaXMueDtcbiAgICB2YXIgeURpZmYgPSB5IC0gdGhpcy55O1xuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpOy8vICogKDE4MCAvIE1hdGguUEkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS50YWtlRGFtYWdlID0gZnVuY3Rpb24oZGFtYWdlLCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmhwIC09IGRhbWFnZTtcbiAgICBpZiAodGhpcy5ocCA8PSAwKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJkaWVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcblxuICAgIC8vIGNyZWF0ZSBhIGNvcnBzZVxuICAgIHZhciBjb3Jwc2UgPSBuZXcgRW50aXR5KHtcbiAgICAgICAgeDogdGhpcy54ICsgTWF0aC5jb3MoYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgICAgICB5OiB0aGlzLnkgKyBNYXRoLnNpbihhY3Rpb24uZGF0YS5kaXJlY3Rpb24pICogMTAsXG4gICAgICAgIHN4OiAwLFxuICAgICAgICBzeTogMTIwLFxuICAgICAgICBzdzogNjAsXG4gICAgICAgIHNoOiA2MCxcbiAgICAgICAgZHc6IDYwLFxuICAgICAgICBkaDogNjAsXG4gICAgICAgIGRpcmVjdGlvbjogYWN0aW9uLmRhdGEuZGlyZWN0aW9uLFxuICAgICAgICBjdHg6IHdpbmRvdy5nYW1lLmJnQ3R4XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKGNvcnBzZSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnJlc3Bhd24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLnggPSBhY3Rpb24uZGF0YS54O1xuICAgIHRoaXMueSA9IGFjdGlvbi5kYXRhLnk7XG4gICAgdGhpcy5ocCA9IDEwMDtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5jaGFuZ2VXZWFwb24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBhY3Rpb24uZGF0YS5zZWxlY3RlZFdlYXBvbkluZGV4O1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55LFxuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgaHA6IHRoaXMuaHAsXG4gICAgICAgIGFsaXZlOiB0aGlzLmFsaXZlLFxuICAgICAgICByYWRpdXM6IHRoaXMucmFkaXVzLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxuICAgICAgICBzcGVlZDogdGhpcy5zcGVlZCxcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZLFxuICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhcbiAgICB9O1xufTtcblxuLy8gVGhlIHN0YXRlIHRoZSBjbGllbnQgc2VuZHMgdG8gdGhlIGhvc3RcblBsYXllci5wcm90b3R5cGUuZ2V0Q2xpZW50U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZXG4gICAgfTtcbn07XG5cbi8vIFBsYXllci5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuaWQsIFwiZmlyZSFcIiwgYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XG4vL1xuLy8gICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XG4vLyAgICAgICAgIHg6IHRoaXMueCxcbi8vICAgICAgICAgeTogdGhpcy55LFxuLy8gICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uXG4vLyAgICAgfSkpO1xuLy8gICAgIHJldHVybiBhY3Rpb247IC8vIGV2ZXJ5IHNob290IGlzIHZhbGlkIHJpZ2h0IG5vd1xuLy8gfTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCJ2YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcclxudmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcclxuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyc1wiKTtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGxheWVycykge1xyXG4gICAgICAgIHZhciBteUlEID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZDtcclxuICAgICAgICB0aGlzLmNsaWVudExpc3QuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBmb3IgKHZhciBpZCBpbiBwbGF5ZXJzKXtcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkICsgXCIgXCIgKyBwbGF5ZXJzW2lkXS5waW5nKTtcclxuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50TGlzdC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnJlbmRlckRlYnVnID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSBcIjEycHggT3BlbiBTYW5zXCI7XHJcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgd2luZG93LmdhbWUuZnBzLCA1LCAyMCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcsIDUsIDM0KTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJDQU1FUkE6IFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS55KSwgNSwgNDgpO1xyXG4gICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUExBWUVSOiAgXCIgKyBNYXRoLmZsb29yKHBsYXllci54KSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLnkpLCA1LCA2Mik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIk1PVVNFOiBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVkpLCA1LCA3Nik7XHJcbiAgICAgICAgICAgIGlmKHBsYXllcikgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiRElSOiBcIiArIHBsYXllci5kaXJlY3Rpb24udG9GaXhlZCgyKSwgNSwgOTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5yZW5kZXJVSSAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuICAgICAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xyXG5cclxuXHJcbiAgICAgICAgLy9ndWkgYmcgY29sb3JcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LnJlY3QoMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDM1LCAxNDAsIDM1KTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMzUpXCI7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGdyYWRpZW50XHJcbiAgICAgICAgdmFyIGdyZD0gd2luZG93LmdhbWUuY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDE0MCwwLDE5MCwwKTtcclxuICAgICAgICBncmQuYWRkQ29sb3JTdG9wKDAsXCJyZ2JhKDAsMCwwLDAuMzUpXCIpO1xyXG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMSxcInJnYmEoMCwwLDAsMClcIik7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZT1ncmQ7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxSZWN0KDE0MCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDM1LDUwLDM1KTtcclxuXHJcblxyXG5cclxuICAgICAgICB2YXIgd2VhcG9uID0gIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XTtcclxuICAgICAgICAvLyBkcmF3IHdlYXBvbiBpY29uXHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgd2VhcG9uLmljb25TeCwgd2VhcG9uLmljb25TeSwgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgsIDkwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzMsIHdlYXBvbi5pY29uVywgd2VhcG9uLmljb25IKTtcclxuICAgICAgICAvLyBkcmF3IG1hZ2F6aW5lIGNvdW50J1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsIDEyMiwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDkpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNlN2QyOWVcIjtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsICAxMjIsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAxMCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgaGVhcnRcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCAwLCAyMjgsIDEzLCAxMiwgMTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAyMywgMTMsIDEyKTtcclxuICAgICAgICAvLyBkcmF3IEhQXHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjI1KVwiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXNwYXduQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuXHJcbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIHtcclxuICAgICAgICAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG4gICAgICAgICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcbiIsInZhciBBazQ3ID0ge1xyXG4gICAgXCJuYW1lXCI6IFwiQUtcIixcclxuICAgIFwibWFnYXppbmVTaXplXCI6IDMwLCAvLyBidWxsZXRzXHJcbiAgICBcImJ1bGxldHNcIjogMzAsXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuMSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiAxLCAvLyBzaG9vdCAxIGJ1bGxldCBhdCBhIHRpbWVcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDIsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMTcwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiAwLCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbiAgICBcImljb25TeFwiOiAyMSxcclxuICAgIFwiaWNvblN5XCI6IDIxMCxcclxuICAgIFwiaWNvbldcIjogMzAsXHJcbiAgICBcImljb25IXCI6IDMwXHJcbn07XHJcblxyXG52YXIgc2hvdGd1biA9IHtcclxuICAgIFwibmFtZVwiOiBcInNob3RndW5cIixcclxuICAgIFwibWFnYXppbmVTaXplXCI6IDEyLCAvLyBidWxsZXRzXHJcbiAgICBcImJ1bGxldHNcIjogMTIsXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuNSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiA0LCAvLyA0IHNob3RndW4gc2x1Z3MgcGVyIHNob3RcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDIsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMjUwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiA2MCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogNTEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBazQ3OiBBazQ3LFxyXG4gICAgc2hvdGd1bjogc2hvdGd1blxyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcbmZ1bmN0aW9uIHRvUmFkaWFucyhkZWcpIHtcbiAgICByZXR1cm4gZGVnICogKE1hdGguUEkgLyAxODApO1xufVxuXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlc1xufTtcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUuc3RhcnQoKTtcclxufSk7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5BazQ3O1xyXG5cclxuY2xhc3MgQWs0NyBleHRlbmRzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyKSB7XHJcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFrNDc7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5zaG90Z3VuO1xyXG52YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0XCIpO1xyXG5cclxuY2xhc3MgU2hvdGd1biBleHRlbmRzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyKSB7XHJcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5TaG90Z3VuLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSB8fCB0aGlzLnJlbG9hZGluZyB8fCB0aGlzLmJ1bGxldHMgPCAxKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5idWxsZXRzIC09IDE7XHJcbiAgICB0aGlzLmZpcmVUaW1lciA9IDA7XHJcblxyXG4gICAgdmFyIGRpcmVjdGlvbnMgPSBbXTtcclxuICAgIHZhciBkaXJlY3Rpb247XHJcblxyXG4gICAgLy8gc2hvb3QgNCBidWxsZXRzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0c1BlclNob3Q7IGkgKz0gMSkge1xyXG5cclxuICAgICAgICBpZiAoIWFjdGlvbi5kYXRhLmRpcmVjdGlvbnMpIHtcclxuICAgICAgICAgICAgLy8gcmFuZG9taXplIGRpcmVjdGlvbnMgbXlzZWxmXHJcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IHRoaXMub3duZXIuZGlyZWN0aW9uICsgTWF0aC5yYW5kb20oKSAqIDAuMjUgLSAwLjEyNTtcclxuICAgICAgICAgICAgZGlyZWN0aW9ucy5wdXNoKGRpcmVjdGlvbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGlyZWN0aW9uID0gYWN0aW9uLmRhdGEuZGlyZWN0aW9uc1tpXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XHJcbiAgICAgICAgICAgIHg6IHRoaXMub3duZXIueCxcclxuICAgICAgICAgICAgeTogdGhpcy5vd25lci55LFxyXG4gICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcclxuICAgICAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXHJcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJGSVJFXCIsIGFjdGlvbiwgZGlyZWN0aW9ucyk7XHJcbiAgICBhY3Rpb24uZGF0YS5kaXJlY3Rpb25zID0gZGlyZWN0aW9ucztcclxuXHJcblxyXG4gICAgcmV0dXJuIGFjdGlvbjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hvdGd1bjtcclxuIiwidmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldFwiKTtcclxuXHJcbmNsYXNzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cob3duZXIsIFwiREFUQVwiLGRhdGEpO1xyXG4gICAgICAgIHRoaXMub3duZXIgPSBvd25lcjtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5tYWdhemluZVNpemUgPSBkYXRhLm1hZ2F6aW5lU2l6ZTtcclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBkYXRhLmJ1bGxldHM7XHJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IGRhdGEuZmlyZVJhdGU7XHJcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcclxuICAgICAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XHJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XHJcbiAgICAgICAgdGhpcy5idWxsZXRzUGVyU2hvdCA9IGRhdGEuYnVsbGV0c1BlclNob3Q7XHJcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XHJcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvblN4ID0gZGF0YS5pY29uU3g7XHJcbiAgICAgICAgdGhpcy5pY29uU3kgPSBkYXRhLmljb25TeTtcclxuICAgICAgICB0aGlzLmljb25XID0gZGF0YS5pY29uVztcclxuICAgICAgICB0aGlzLmljb25IID0gZGF0YS5pY29uSDtcclxuXHJcbiAgICAgICAgdGhpcy5maXJlVGltZXIgPSB0aGlzLmZpcmVSYXRlO1xyXG5cclxuICAgICAgICB0aGlzLnJlbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5XZWFwb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlKSB0aGlzLmZpcmVUaW1lciArPSBkdDtcclxufTtcclxuXHJcbldlYXBvbi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm93bmVyLmlkLCBcIkZJUkUhXCIsIGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xyXG5cclxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYnVsbGV0cyAtPSB0aGlzLmJ1bGxldHNQZXJTaG90O1xyXG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xyXG5cclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XHJcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxyXG4gICAgICAgIHk6IHRoaXMub3duZXIueSxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uLFxyXG4gICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxyXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcclxuICAgIH0pKTtcclxuICAgIHJldHVybiBhY3Rpb247XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdlYXBvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyB2YXIgUGxheWVyID0gcmVxdWlyZShcIi4vLi4vUGxheWVyXCIpO1xuXG5mdW5jdGlvbiBDbGllbnQoKXtcbiAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuXG4gICAgLy8gU3RyZXNzIHRlc3RcbiAgICB0aGlzLnRlc3RzUmVjZWl2ZWQgPSAwO1xuXG4gICAgdGhpcy5hY3Rpb25zID0gW107Ly8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGFjdGlvbnMgZnJvbSB0aGUgaG9zdFxuICAgIHRoaXMuY2hhbmdlcyA9IFtdOyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgY2hhbmdlcyBmcm9tIHRoZSBob3N0XG5cbiAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBnYW1lSUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW4gdGhlIGhvc3RcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5zb2NrZXQuZW1pdChcImpvaW5cIiwge3BlZXJJRDogaWQsIGdhbWVJRDogd2luZG93LmdhbWUuZ2FtZUlEfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibXkgY2xpZW50IHBlZXJJRCBpcyBcIiwgaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG5cbiAgICAgICAgLy8gY2xvc2Ugb3V0IGFueSBvbGQgY29ubmVjdGlvbnNcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcbiAgICAgICAgICAgICAgICBpZiAoY29ublBlZXIgIT09IGNvbm4ucGVlcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXVswXS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBvbGQgaG9zdHMgcGxheWVyIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZGVsZXRlIG9sZCBwbGF5ZXJcIiwgY29ublBlZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgaXRcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG5cbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJKb2luZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgXCJwbGF5ZXJMZWZ0XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6IC8vIGNoYW5nZXMgYW5kIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzLmNvbmNhdChkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLmNvbmNhdChkYXRhLmFjdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAgICAgICAgICAgICAgICBkYXRhLnBpbmdzLmZvckVhY2goZnVuY3Rpb24ocGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twaW5nLmlkXS5waW5nID0gcGluZy5waW5nO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXS5waW5nO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3Qod2luZG93LmdhbWUucGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9KTtcbn1cblxuQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIGlmICghcGxheWVyKSByZXR1cm47XG5cbiAgICB2YXIgY3VycmVudFN0YXRlID0gcGxheWVyLmdldENsaWVudFN0YXRlKCk7XG4gICAgdmFyIGxhc3RDbGllbnRTdGF0ZSA9IHBsYXllci5sYXN0Q2xpZW50U3RhdGU7XG4gICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdENsaWVudFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG5cbiAgICAvLyBhZGQgYW55IHBlcmZvcm1lZCBhY3Rpb25zIHRvIGNoYW5nZSBwYWNrYWdlXG4gICAgaWYgKHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlcywgc2VuZCBlbSB0byBob3N0XG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAgICAgICAgIGV2ZW50OiBcIm5ldHdvcmtVcGRhdGVcIixcbiAgICAgICAgICAgIHVwZGF0ZXM6IGNoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGxheWVyLmxhc3RDbGllbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZTtcblxuXG5cblxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldO1xuXG4gICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgICAgICBpZiAoY2hhbmdlLmlkICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLmlkXS5uZXR3b3JrVXBkYXRlKGNoYW5nZSk7XG4gICAgICAgICAgICB9Y2F0Y2ggKGVycikge1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hhbmdlcyA9IFtdO1xuICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG5cblxuXG4gICAgLy8gLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICAvLyB2YXIgbXlQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgLy8gaWYgKCFteVBsYXllcikgcmV0dXJuO1xuICAgIC8vXG4gICAgLy8gIGlmICghXy5pc0VxdWFsKG15UGxheWVyLmtleXMsIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSkpIHtcbiAgICAvLyAgICAgLy8gc2VuZCBrZXlzdGF0ZSB0byBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImtleXNcIixcbiAgICAvLyAgICAgICAgIGtleXM6IG15UGxheWVyLmtleXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gIH1cbiAgICAvLyBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUgPSBfLmNsb25lKG15UGxheWVyLmtleXMpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG4gICAgLy9cbiAgICAvLyB2YXIgY3VycmVudFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIC8vIHZhciBjaGFuZ2VzID0gW107XG4gICAgLy8gdmFyIGxhc3RTdGF0ZSA9IG15UGxheWVyLmxhc3RTdGF0ZTtcbiAgICAvLyB2YXIgbmV3U3RhdGUgPSBteVBsYXllci5nZXRTdGF0ZSgpO1xuICAgIC8vXG4gICAgLy8gLy8gY29tcGFyZSBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxuICAgIC8vIHZhciBjaGFuZ2UgPSBfLm9taXQobmV3U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdFN0YXRlW2tdID09PSB2OyB9KTtcbiAgICAvLyBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgLy8gICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgLy8gICAgIGNoYW5nZS5wbGF5ZXJJRCA9IG15UGxheWVyLmlkO1xuICAgIC8vICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBteVBsYXllci5sYXN0U3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAvLyAvLyBpZiB0aGVyZSBhcmUgY2hhbmdlc1xuICAgIC8vIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgLy8gICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAvLyBzZW5kIGFsbCBwZXJmb3JtZWQgYWN0aW9ucyB0byB0aGUgaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJhY3Rpb25zXCIsXG4gICAgLy8gICAgICAgICBkYXRhOiB0aGlzLmFjdGlvbnNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBjbGVhciBhY3Rpb25zIHF1ZXVlXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY2hhbmdlc1tpXS5sZW5ndGg7IGogKz0gMSkgIHtcbiAgICAvLyAgICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXVtqXTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgLy8gICAgICAgICBpZiAoY2hhbmdlLnBsYXllcklEICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5wbGF5ZXJJRF0uY2hhbmdlKGNoYW5nZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB0aGlzLmNoYW5nZXMgPSBbXTtcblxufTtcblxuICAgIC8vXG4gICAgLy8gdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgLy8gICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Rpb24gZnJvbSBzZXJ2ZXJcIiwgdGhpcy5wZWVyLCBjb25uKTtcbiAgICAvL1xuICAgIC8vICAgICAvL2NyZWF0ZSB0aGUgcGxheWVyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKGNvbm4ucGVlcik7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvL0xpc3RlbiBmb3IgZGF0YSBldmVudHMgZnJvbSB0aGUgaG9zdFxuICAgIC8vICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAvLyAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgIC8vICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgIC8vICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy8gcGluZyB0ZXN0XG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAvLyAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9LCAyMDAwKTtcbiAgICAvL1xuICAgIC8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSG9zdCgpe1xuICAgIHRoaXMuY29ubnMgPSB7fTtcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIGFsbCB0aGUgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGNsaWVudHNcbiAgICB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICB0aGlzLmRpZmYgPSBudWxsO1xuXG4gICAgdGhpcy5jb25uZWN0ID0gZnVuY3Rpb24ocGVlcnMpe1xuICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3RcIiwgcGVlcnMpO1xuXG4gICAgICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2VuZCBhIHBpbmcgZXZlcnkgMiBzZWNvbmRzLCB0byB0cmFjayBwaW5nIHRpbWVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBwaW5nczogd2luZG93LmdhbWUubmV0d29yay5ob3N0LmdldFBpbmdzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG5cbiAgICAgICAgICAgIHBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XG4gICAgICAgICAgICAgICAgLy9jb25uZWN0IHdpdGggZWFjaCByZW1vdGUgcGVlclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xuICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogbmV3UGxheWVyLmdldEZ1bGxTdGF0ZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZW1pdCgge2NsaWVudElEOiBjb25uLnBlZXIsIGV2ZW50OiBcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgRVZFTlRcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTsgLy8gYW5zd2VyIHRoZSBwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgY2xpZW50LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5ldHdvcmtVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgZnJvbSBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5uZXR3b3JrVXBkYXRlKGRhdGEudXBkYXRlcyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEuYWN0aW9ucyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJhY3Rpb25zXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiYWN0aW9ucyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImNoYW5nZXNcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiSGV5IHRoZXJlIGhhcyBiZWVuIGNoYW5nZXMhXCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmNoYW5nZShkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJrZXlzXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwia2V5cyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YS5rZXlzLCAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzID0gXy5jbG9uZShkYXRhLmtleXMpOyAvL1RPRE86IHZlcmlmeSBpbnB1dCAoY2hlY2sgdGhhdCBpdCBpcyB0aGUga2V5IG9iamVjdCB3aXRoIHRydWUvZmFsc2UgdmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2cod2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGZvciAodmFyIGNvbm4gaW4gdGhpcy5jb25ucyl7XG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRU1JVCFcIiwgZGF0YSk7XG4gICAgICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG5cbiAgICAgICAgdmFyIGNoYW5nZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RnVsbFN0YXRlID0gcGxheWVyLmdldEZ1bGxTdGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50RnVsbFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIHBsYXllci5sYXN0RnVsbFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG4gICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpIHx8IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHsgLy90aGVyZSdzIGJlZW4gY2hhbmdlcyBvciBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY2hhbmdlLmlkID0gcGxheWVyLmlkO1xuICAgICAgICAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmxhc3RGdWxsU3RhdGUgPSBjdXJyZW50RnVsbFN0YXRlO1xuICAgICAgICAgICAgICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIHRoaXMuZ2V0UGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBpbmdzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgcGluZ3MucHVzaCh7aWQ6IHBsYXllci5pZCwgcGluZzogcGxheWVyLnBpbmcgfHwgXCJob3N0XCJ9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwaW5ncztcbiAgICB9O1xufTtcbiIsInZhciBDbGllbnQgPSByZXF1aXJlKFwiLi9DbGllbnRcIik7XHJcbnZhciBIb3N0ID0gcmVxdWlyZShcIi4vSG9zdFwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gV2ViUlRDKCl7XHJcbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8oKTtcclxuICAgIHRoaXMuY2xpZW50ID0gbmV3IENsaWVudCgpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwieW91QXJlSG9zdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJpbSB0aGUgaG9zdFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QgPSBuZXcgSG9zdCgpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KGRhdGEucGVlcnMsIGRhdGEucHJldmlvdXNIb3N0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVySm9pbmVkXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdChbZGF0YS5wZWVySURdLCBkYXRhLnByZXZpb3VzSG9zdCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUExBWUVSIExFRlRcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5wbGF5ZXJJRH0pO1xyXG4gICAgfSk7XHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2RhdGEuaWRdO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIC8vIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIC8vIHRoaXMuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxufTtcclxuIl19
