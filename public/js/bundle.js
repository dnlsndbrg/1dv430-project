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

},{"./helpers":17}],2:[function(require,module,exports){
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
class Entity {
    constructor(data) {
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


    this.spritesheet = new Image();
    this.spritesheet.src = "../img/spritesheet.png";

    this.tilesheet = new Image();
    this.tilesheet.src = "../img/tiles.png";

    this.level = new Level(this.tilesheet);

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
    this.particles = [];
    this.players = {};

    this.maxParticles = 1000; // number of particles allowed on screen before they start to be removed

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
        var dts = dt / 1000;
        // calculate fps
        this.fps = Math.round(1000 / dt);

        // Update entities
        this.entities.forEach(function(entity, index) {
            entity.update(dts, index); //deltatime in seconds
        });

        // cap number of particles
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(this.particles.length - this.maxParticles, this.particles.length);
        }


        // Update particles
        for (var i = 0; i < this.particles.length; i += 1) {
            this.particles[i].update(dts, i);
        }

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
        // this.bgCtx.beginPath();
        // this.bgCtx.rect(0 - this.camera.x, 0 - this.camera.y, this.level.width, this.level.height);
        // this.bgCtx.fillStyle = "#85827d";
        // this.bgCtx.fill();

        this.level.render(this.bgCtx);

        // render all entities
        this.entities.forEach(function(entity) {
            entity.render();
        });

        // Render particles
        for (var i = 0; i < this.particles.length; i += 1) {
            this.particles[i].render();
        }

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
        //entities: this.entities.map(function(entity) {
        //    return entity.getFullState();        }),
        //players: Object.keys(this.players).map(function(key){ return JSON.stringify(window.game.players[key]); })
        players: this.getPlayersState()
    };
};

Game.prototype.getPlayersState = function() {
    return Object.keys(this.players).map(function(key){ return window.game.players[key].getFullState(); });
};

module.exports = Game;

},{"./Camera":2,"./Level":6,"./Player":13,"./Ui":14,"./webRTC/WebRTC":29}],5:[function(require,module,exports){
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
            case 82: // R
                // reload only if player is alive and weapon magazine isnt full
                if (player.alive && player.weapons[player.selectedWeaponIndex].bullets < player.weapons[player.selectedWeaponIndex].magazineSize) {
                    player.actions.push({ // add to the actions queue
                        action: "reload",
                    });
                }
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
var level1 = require("./data/level1");
//var Tile = require("./Tile");

function Level(tilesheet){
    this.tilesheet = tilesheet;
    this.tileSize = 32;
    this.level = level1;
    this.width = this.level.tiles[0].length * this.tileSize;
    this.height = this.level.tiles.length * this.tileSize;
    this.colTileCount = this.level.tiles[0].length;
    this.rowTileCount = this.level.tiles.length;
    this.imageNumTiles = 384 / this.tileSize;  // The number of tiles per row in the tileset image

    // generate Tiles


    this.render = function(ctx) {

        //draw all tiles
       for (var row = 0; row < this.rowTileCount; row += 1) {
           for (var col = 0; col < this.colTileCount; col += 1) {

                var tile = this.level.tiles[row][col];
                var tileRow = (tile / this.imageNumTiles) | 0; // Bitwise OR operation
                var tileCol = (tile % this.imageNumTiles) | 0;

                ctx.drawImage(this.tilesheet,
                    (tileCol * this.tileSize),
                    (tileRow * this.tileSize),
                    this.tileSize,
                    this.tileSize,
                    Math.floor((col * this.tileSize) - window.game.camera.x),
                    Math.floor((row * this.tileSize) - window.game.camera.y),
                    this.tileSize,
                    this.tileSize);
           }
        }
    };
}

module.exports = Level;

},{"./data/level1":15}],7:[function(require,module,exports){
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
var Particle = require("./Particle");
var helpers = require("../helpers");

class Blood extends Particle {
    constructor(data) {
        var rnd = Math.floor(Math.random() * 50);
        var r = 150 - rnd;
        var g = 50 - rnd;
        var b = 50 - rnd;

        data.color = "rgb(" + r + "," + g + "," + b + ")";
        data.lifeTime = 0.3;
        data.size = 3;

        super(data);

        this.direction = helpers.toRadians(Math.floor(Math.random() * 360) + 1);
        this.speed = 40;

    }
}

Blood.prototype.update = function(dt, index) {

    var distance = this.speed * dt;

    this.x = this.x + Math.cos(this.direction) * distance;
    this.y = this.y + Math.sin(this.direction) * distance;

    this.lifeTimer += dt;
    if (this.lifeTimer > this.lifeTime) {
        this.destroy(index);
    }
};

module.exports = Blood;

},{"../helpers":17,"./Particle":12}],10:[function(require,module,exports){
var Particle = require("./Particle");
var helpers = require("../helpers");

class Blood2 extends Particle {
    constructor(data) {
        //var rnd = Math.floor(Math.random() * 50);
        // var r = 150;
        // var g = 50;
        // var b = 50;

        data.color = "#802929";
        //data.lifeTime = 0.3;
        data.size = 3;

        super(data);

        this.direction = helpers.toRadians(Math.floor(Math.random() * 360) + 1);
        this.speed = 80;

        this.moveDistance = (Math.floor(Math.random() * 15) + 1);
        this.distanceMoved = 0;
    }
}

Blood2.prototype.update = function(dt, index) {

    if (this.distanceMoved < this.moveDistance) {
        var distance = this.speed * dt;
        this.x = this.x + Math.cos(this.direction) * distance;
        this.y = this.y + Math.sin(this.direction) * distance;
        this.distanceMoved += distance;

        if (this.distanceMoved >= this.moveDistance) this.ctx = window.game.bgCtx; // move to background ctx
    }

};

// BloodSplash.prototype.render = function() {
//     this.ctx.save(); // save current state
//     this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
//     this.ctx.beginPath();
//     this.ctx.arc(0 - this.size / 2, 0 - this.size / 2, this.size, 0, 2 * Math.PI, false);
//     this.ctx.fillStyle = this.color;
//     this.ctx.fill();
//     this.ctx.restore(); // restore original states (no rotation etc)
// };


module.exports = Blood2;

},{"../helpers":17,"./Particle":12}],11:[function(require,module,exports){
//var Particle = require("./Particle");
var Blood = require("./Blood");
var Blood2 = require("./Blood2");

function Emitter(data) {
    this.x = data.x;
    this.y = data.y;
    this.type = data.type;
    this.particles = [];
    this.emitSpeed = data.emitSpeed; // s
    this.emitTimer = 0;
    this.emitCount = data.emitCount;
    this.lifeTime = data.lifeTime;
    this.lifeTimer = 0;
    this.emit();
}

Emitter.prototype.emit = function() {
    var data = {
        x: this.x,
        y: this.y,
        emitter: this
    };
    if (this.type === "Blood") window.game.particles.push(new Blood(data));
    if (this.type === "Blood2") window.game.particles.push(new Blood2(data));
};

Emitter.prototype.update = function(dt, index) {
    // // update all particles
    // for (var i = 0; i < this.particles.length; i += 1) {
    //     this.particles[i].update(dt);
    // }


    // SET EMITTER - this is an emitter that should emit a set number of particles
    if (this.emitCount) {
        if (this.emitSpeed) { // Emit at a interval
            this.emitTimer += dt;
            if (this.emitTimer > this.emitSpeed) {
                this.emit();
                this.emitTimer = 0;
                 this.emitCount -= 1;
                 if (this.emitCount < 1){
                     console.log("destroy");
                     this.destroy(index);
                 }
            }
        } else { // Emit all at once
            for (var i = 0;i < this.emitCount; i += 1) {
                this.emit();
            }
            this.destroy(index);
        }
        return;
    }

    // TIMED EMITTER
    // update emitter lifetime (if it has a lifetime) remove emitter if its time has run out and it has no remaining particles
    if (this.lifeTime) {
        this.lifeTimer += dt;
        if (this.lifeTimer > this.lifeTime) {
            this.destroy(index);
        }
        return;
    }

    // CONTINUOUS EMITTER
    // emit new particles forever
    this.emitTimer += dt;
    if (this.emitTimer > this.emitSpeed) {
        this.emit();
        this.emitTimer = 0;
    }
};

Emitter.prototype.render = function() {

    // // render all particles
    // for (var i = 0; i < this.particles.length; i += 1) {
    //     this.particles[i].render();
    // }
};

Emitter.prototype.destroy = function(index) {
    window.game.entities.splice(index, 1);
};

module.exports = Emitter;

},{"./Blood":9,"./Blood2":10}],12:[function(require,module,exports){
//var Entity = require(".././Entity");

class Particle {
    constructor(data) {
        this.ctx = window.game.ctx;
        this.color = data.color;
        this.size = data.size;
        this.x = data.x;
        this.y = data.y;
        this.lifeTime = data.lifeTime;
        this.lifeTimer = 0;
        this.emitter = data.emitter;
    }
}

// Particle.prototype.update = function(dt, index) {
//     this.lifeTimer += dt;
//     if (this.lifeTimer > this.lifeTime) {
//         this.destroy(index);
//     }
// };

Particle.prototype.render = function() {
    this.ctx.save(); // save current state
    this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    //this.ctx.rotate(this.direction); // rotate
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(-(this.size / 2), -(this.size / 2), this.size, this.size);
    this.ctx.restore(); // restore original states (no rotation etc)
};

Particle.prototype.destroy = function(index) {
    this.emitter.particles.splice(index, 1);
};

Particle.prototype.getFullState = function() {
    return {};
};

module.exports = Particle;

},{}],13:[function(require,module,exports){
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
var Emitter = require("./particle/Emitter");
var weaponCreator = require("./weapons/weaponCreator");

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

    // position on level
    this.tileRow = 0;
    this.tileCol = 0;

    this.weapons = [];
    // recreate weapons if the player has any else create new weapons
    if (playerData.weaponState) {
        for (var i = 0; i < playerData.weaponState.length; i+= 1) {
            this.weapons.push(weaponCreator(this, playerData.weaponState[i]));
        }
    }else {
        this.weapons = [new Ak47(this), new Shotgun(this)];
    }

    //this.weapons = [new Ak47(this), new Shotgun(this)];

    this.selectedWeaponIndex = playerData.selectedWeaponIndex || 0;

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


    // this.tileRow = Math.floor(this.y / window.game.level.tileSize);
    // this.tileCol = Math.floor(this.x / window.game.level.tileSize);

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

    // var oldX = this.x;
    // var oldY = this.y;

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

// // Collision check against surrounding tiles
// Player.prototype.collisionCheck = function() {
//     var startingRow = this.tileRow - 1;
//     if (startingRow < 0) startingRow  = 0;
//     var endRow = this.tileRow +1;
//     if (endRow > window.game.level.rowTileCount) endRow = window.game.level.rowTileCount;
//     var startingCol = this.tileCol -1;
//     if (startingCol < 0) startingCol = 0;
//     var endCol = this.tileCol +1;
//     if (endCol > window.game.level.colTileCount) endCol = window.game.level.colTileCount;
//
//     for (var row = startingRow; row < endRow; row += 1) {
//         for (var col = startingCol; col < endCol; col += 1) {
//             if (window.game.level.level.tiles[row][col] === 0) continue; // every tile other than 0 are non walkable
//             // collision
//             if (this.tileRow === row && this.tileCol === col) {
//                 return false;
//             }
//         }
//     }
//     return true;
// };

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
            return this.die(action);
            //break;
        case "respawn":
            return this.respawn(action);
        case "changeWeapon":
            return this.changeWeapon(action);
        case "reload":
    }       return this.weapons[this.selectedWeaponIndex].reload(action);
};

Player.prototype.render = function(){
    if(!this.alive) return;
    this.ctx.save(); // save current state
    this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    this.ctx.rotate(this.direction); // rotate

    this.ctx.drawImage(window.game.spritesheet, this.weapons[this.selectedWeaponIndex].sx, this.weapons[this.selectedWeaponIndex].sy, this.sw, this.sh, -(this.sw / 2), -(this.sh / 2), this.dw, this.dh);
    this.ctx.restore(); // restore original states (no rotation etc)

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

    window.game.entities.push(new Emitter({
        type: "Blood2",
        emitCount: 10,
        emitSpeed: null, // null means instant
        x: this.x,
        y: this.y
    }));
};

Player.prototype.die = function() {
    this.alive = false;
    this.weapons[this.selectedWeaponIndex].stopReload();


    // // create a corpse
    // var corpse = new Entity({
    //     x: this.x + Math.cos(action.data.direction) * 10,
    //     y: this.y + Math.sin(action.data.direction) * 10,
    //     sx: 60 +( Math.floor(Math.random() * 3) * 60),
    //     sy: 120,
    //     sw: 60,
    //     sh: 60,
    //     dw: 60,
    //     dh: 60,
    //     direction: action.data.direction,
    //     ctx: window.game.bgCtx
    // });
    //window.game.entities.push(corpse);

    window.game.entities.push(new Emitter({
        type: "Blood2",
        emitCount: 30,
        emitSpeed: null, // null means instant
        x: this.x,
        y: this.y
    }));



};

Player.prototype.respawn = function(action) {
    this.x = action.data.x;
    this.y = action.data.y;
    this.hp = 100;
    this.alive = true;

    // refill all weapons
    for (var i = 0; i < this.weapons.length; i += 1) {
        this.weapons[i].fillMagazine();
    }

    return action;
};

Player.prototype.changeWeapon = function(action) {
    this.weapons[this.selectedWeaponIndex].stopReload();
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
        selectedWeaponIndex: this.selectedWeaponIndex,
        weaponState: this.getWeaponState()
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

Player.prototype.updateState = function(newState) {
    this.x = newState.x;
    this.y = newState.y;
    //id: this.id = id;
    this.hp = newState.hp;
    this.alive = newState.alive;
    this.radius = newState.radius;
    this.direction = newState.direction;
    this.viewingAngle = newState.viewingAngle;
    this.speed = newState.speed;
    this.kUp = newState.kUp;
    this.kDown = newState.kDown;
    this.kLeft = newState.kLeft;
    this.kRight = newState.kRight;
    this.mouseX = newState.mouseX;
    this.mouseY = newState.mouseY;
    this.selectedWeaponIndex = newState.selectedWeaponIndex;
    //weaponState: this.getWeaponState()
};

// get the state of each weapon
Player.prototype.getWeaponState = function() {
    var state = [];
    for (var i = 0; i < this.weapons.length; i += 1) {
        state.push(this.weapons[i].getState());
    }
    return state;
};


module.exports = Player;

},{"./Entity":3,"./Keyboard":5,"./Mouse":7,"./NetworkControls":8,"./particle/Emitter":21,"./weapons/Ak47":23,"./weapons/Shotgun":24,"./weapons/weaponCreator":26}],14:[function(require,module,exports){
// var weapons = require("./data/weapons");
// var Weapon = require("./weapons/Weapon");
//
var Emitter = require("./Particle/Emitter");

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
        window.game.ctx.fillText("PARTICLES: " + window.game.particles.length, 5, 104);
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
        if (weapon.reloading) {
            window.game.ctx.drawImage(window.game.spritesheet, 85, 214, 21, 22, 125, window.game.canvas.height - 30, 21, 22);
        } else {
            window.game.ctx.fillStyle = "rgba(0,0,0,0.25)";
            window.game.ctx.fillText(weapon.bullets, 122, window.game.canvas.height - 9);
            window.game.ctx.fillStyle = "#e7d29e";
            window.game.ctx.fillText(weapon.bullets,  122, window.game.canvas.height - 10);
        }


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

    document.querySelector("#reloadBtn").addEventListener("click", function() {
        var player = window.game.players[window.game.network.client.peer.id];
        if (player.alive) {
            player.actions.push({ // add to the actions queue
                action: "reload",
            });
        }
        // if (!player.alive) {
        //     var x = (Math.floor(Math.random() * (window.game.level.width - player.radius)) + player.radius / 2);
        //     var y = (Math.floor(Math.random() * (window.game.level.height - player.radius)) + player.radius / 2);
        //
        //     player.actions.push({ // add to the actions queue
        //         action: "respawn",
        //         data: {
        //             x: x,
        //             y: y
        //         }
        //     });
        // }
    });


        document.querySelector("#emitterBtn").addEventListener("click", function() {
            var player = window.game.players[window.game.network.client.peer.id];
            window.game.entities.push(new Emitter({
                type: "Blood2",
                emitCount: 10,
                emitSpeed: null,
                x: player.x,
                y: player.y
            }));
        });
};

},{"./Particle/Emitter":11}],15:[function(require,module,exports){
var level = {
    name: "level1",
    tiles: [
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1,0,0],
        [1,0,0,0,1,1,1,1,0,0,1,2,2,1,2,1,2,2,1,0],
        [1,0,0,0,1,1,1,1,0,0,1,2,2,2,2,2,2,2,1,0],
        [0,0,0,0,1,1,1,1,0,0,1,2,1,2,2,2,1,2,1,0],
        [0,0,0,0,1,1,1,1,0,0,1,2,2,1,1,1,2,2,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1,0,0],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],]
};

module.exports = level;

},{}],16:[function(require,module,exports){
var Ak47 = {
    "name": "Ak47",
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

},{}],17:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

// radians to degrees
function toDegrees(rad) {
    return rad * (180 / Math.PI);
}


module.exports = {
    toRadians: toRadians,
    toDegrees: toDegrees,
};

},{}],18:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});

},{"./Game.js":4}],19:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"../helpers":17,"./Particle":22,"dup":9}],20:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"../helpers":17,"./Particle":22,"dup":10}],21:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./Blood":19,"./Blood2":20,"dup":11}],22:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],23:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").Ak47;

class Ak47 extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
        super(owner, weaponData);
    }
}

module.exports = Ak47;

},{"../data/weapons":16,"./Weapon":25}],24:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").shotgun;
var Bullet = require(".././Bullet");

class Shotgun extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
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

},{".././Bullet":1,"../data/weapons":16,"./Weapon":25}],25:[function(require,module,exports){
var Bullet = require(".././Bullet");

class Weapon{
    constructor(owner, data) {
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

        this.reloading = data.reloading || false;
        this.reloadTimer = data.reloadTimer || 0;
    }
}

Weapon.prototype.update = function(dt) {
    if (this.fireTimer < this.fireRate) this.fireTimer += dt;

    if (this.reloading) {
        this.reloadTimer += dt;
        if (this.reloadTimer > this.reloadTime){
            this.fillMagazine();
            this.stopReload();
        }
    }
};

Weapon.prototype.fire = function(action) {
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

Weapon.prototype.reload = function(action) {
    this.reloading = true;
    this.reloadTimer = 0;
    return action;
};

Weapon.prototype.fillMagazine = function() {
    this.bullets = this.magazineSize;
};

Weapon.prototype.stopReload = function() {
    this.reloading = false;
    this.reloadTimer = 0;
};

Weapon.prototype.getState = function() {
    return {
        name: this.name,
        bullets: this.bullets,
        fireTimer: this.fireRate,
        reloading: this.reloading,
        reloadTimer: this.reloadTimer
    };
};
module.exports = Weapon;

},{".././Bullet":1}],26:[function(require,module,exports){
var Shotgun = require(".././weapons/Shotgun");
var Ak47 = require(".././weapons/Ak47");
var weaponData = require("../data/weapons");

function weaponCreator(owner, data) {

    var wepData = weaponData[data.name];
    for (var key in data) { wepData[key] = data[key]; }

    switch (data.name) {
        case "Ak47":
            return new Ak47(owner, wepData);
        case "shotgun":
            return new Shotgun(owner, wepData);
    }
}

module.exports = weaponCreator;

},{".././weapons/Ak47":23,".././weapons/Shotgun":24,"../data/weapons":16}],27:[function(require,module,exports){
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

                case "gameStateUpdate":
                        console.log("receiving full state", data);
                        data.gameState.players.forEach(function(player) {
                            window.game.players[player.id].updateState(player);
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

},{}],28:[function(require,module,exports){
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

            // send full game state once in a while
            setInterval(function(){
                window.game.network.host.broadcast({
                    event: "gameStateUpdate",
                    gameState: window.game.getGameState()
                });
            },1000);

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
                    // console.log("ERROR EVENT", err);
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
            // send changes
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

},{}],29:[function(require,module,exports){
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

},{"./Client":27,"./Host":28}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0NhbWVyYS5qcyIsInNyYy9qcy9FbnRpdHkuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QyLmpzIiwic3JjL2pzL1BhcnRpY2xlL0VtaXR0ZXIuanMiLCJzcmMvanMvUGFydGljbGUvUGFydGljbGUuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2RhdGEvbGV2ZWwxLmpzIiwic3JjL2pzL2RhdGEvd2VhcG9ucy5qcyIsInNyYy9qcy9oZWxwZXJzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWFwb25zL3dlYXBvbkNyZWF0b3IuanMiLCJzcmMvanMvd2ViUlRDL0NsaWVudC5qcyIsInNyYy9qcy93ZWJSVEMvSG9zdC5qcyIsInNyYy9qcy93ZWJSVEMvV2ViUlRDLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcblxuZnVuY3Rpb24gQnVsbGV0KGRhdGEpIHtcbiAgICAvLyBjcmVhdGUgdGhlIGJ1bGxldCA1IHBpeGVscyB0byB0aGUgcmlnaHQgYW5kIDMwIHBpeGVscyBmb3J3YXJkLiBzbyBpdCBhbGlnbnMgd2l0aCB0aGUgZ3VuIGJhcnJlbFxuICAgIHRoaXMueCA9IGRhdGEueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XG4gICAgdGhpcy55ID0gZGF0YS55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcblxuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uKSAqIDMwO1xuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqIDMwO1xuICAgIC8vdGhpcy54ID0gZGF0YS54O1xuICAgIC8vdGhpcy55ID0gZGF0YS55O1xuICAgIHRoaXMubGVuZ3RoID0gMTA7IC8vIHRyYWlsIGxlbmd0aFxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XG4gICAgdGhpcy5zcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XG4gICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xuXG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIC8vXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XG4gICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XG5cbiAgICAvLyBpZiBvZmYgc2NyZWVuLCByZW1vdmUgaXRcbiAgICBpZiAodGhpcy54IDwgMCB8fCB0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCB8fCB0aGlzLnkgPCAwIHx8IHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5oaXREZXRlY3Rpb24oaW5kZXgpO1xufTtcblxuQnVsbGV0LnByb3RvdHlwZS5oaXREZXRlY3Rpb24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIC8vIHRlc3QgYnVsbGV0IGFnYWluc3QgYWxsIHBsYXllcnNcbiAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG5cbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBhID0gdGhpcy54IC0gcGxheWVyLng7XG4gICAgICAgIHZhciBiID0gdGhpcy55IC0gcGxheWVyLnk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggYSphICsgYipiICk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgcGxheWVyLnJhZGl1cykge1xuICAgICAgICAgICAgLy8gaGl0XG4gICAgICAgICAgICBwbGF5ZXIudGFrZURhbWFnZSh0aGlzLmRhbWFnZSwgdGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuQnVsbGV0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xufTtcblxuQnVsbGV0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbiAtIDAuNzg1Mzk4MTYzNCk7IC8vIHJvdGF0ZVxuXG4gICAgLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcbiAgICB2YXIgZ3JhZD0gdGhpcy5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgdGhpcy5sZW5ndGgpO1xuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAsIFwicmdiYSgyNTUsMTY1LDAsMC40KVwiKTtcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLCBcInllbGxvd1wiKTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XG5cbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCAwKTtcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgpO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG5cblxuICAgIC8vIGN0eC5saW5lV2lkdGggPSAxO1xuXG4gICAgLy9cbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xuICAgIC8vIGN0eC5saW5lVG8oMCx0aGlzLmxlbmd0aCk7XG5cbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcblxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgsIDEsIDEgKTtcblxuXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxuXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIGN0eC5saW5lV2lkdGggPSAxO1xuICAgIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXG4gICAgLy8gdmFyIGdyYWQ9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZWRcIik7XG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJncmVlblwiKTtcbiAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcbiAgICAvLyBjdHgubW92ZVRvKDAsMCk7XG4gICAgLy8gY3R4LmxpbmVUbygwLGxlbmd0aCk7XG4gICAgLy8gY3R4LnN0cm9rZSgpO1xuXG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7XG4iLCJmdW5jdGlvbiBDYW1lcmEoKSB7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuICAgIC8vIHRoaXMud2lkdGggPSA7XHJcbiAgICAvLyB0aGlzLmhlaWdodCA9IHdpbmRvdy5nYW1lLmhlaWdodDtcclxuICAgIHRoaXMuZm9sbG93aW5nID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmZvbGxvdyA9IGZ1bmN0aW9uKHBsYXllcil7XHJcbiAgICAgICAgdGhpcy5mb2xsb3dpbmcgPSBwbGF5ZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZvbGxvd2luZykgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnggPSB0aGlzLmZvbGxvd2luZy54IC0gd2luZG93LmdhbWUud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMuZm9sbG93aW5nLnkgLSB3aW5kb3cuZ2FtZS5oZWlnaHQgLyAyO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7XHJcbiIsImNsYXNzIEVudGl0eSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgICAgICB0aGlzLnN4ID0gZGF0YS5zeDtcclxuICAgICAgICB0aGlzLnN5ID0gZGF0YS5zeTtcclxuICAgICAgICB0aGlzLnN3ID0gZGF0YS5zdztcclxuICAgICAgICB0aGlzLnNoID0gZGF0YS5zaDtcclxuICAgICAgICB0aGlzLmR3ID0gZGF0YS5kdztcclxuICAgICAgICB0aGlzLmRoID0gZGF0YS5kaDtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRhdGEuZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gZGF0YS5jdHg7XHJcbiAgICB9XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuXHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuXHJcbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBzeDogdGhpcy5zeCxcclxuICAgICAgICBzeTogdGhpcy5zeSxcclxuICAgICAgICBzdzogdGhpcy5zdyxcclxuICAgICAgICBzaDogdGhpcy5zaCxcclxuICAgICAgICBkaDogdGhpcy5kaCxcclxuICAgICAgICBkdzogdGhpcy5kdyxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcblxyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG5cclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMudGlsZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnRpbGVzaGVldC5zcmMgPSBcIi4uL2ltZy90aWxlcy5wbmdcIjtcclxuXHJcbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMudGlsZXNoZWV0KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmJnQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuYmdDYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuYmdDYW52YXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmJnQ3R4ID0gdGhpcy5iZ0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAxMDAwOyAvLyBudW1iZXIgb2YgcGFydGljbGVzIGFsbG93ZWQgb24gc2NyZWVuIGJlZm9yZSB0aGV5IHN0YXJ0IHRvIGJlIHJlbW92ZWRcclxuXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIHRoaXMubG9vcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdhbWUgbG9vcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApe1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxyXG5cclxuICAgICAgICBkdCA9IHRpbWVzdGFtcCAtIGxhc3Q7IC8vIHRpbWUgZWxhcHNlZCBpbiBtcyBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgYW5kIHJlbmRlciBnYW1lXHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIG5ldHdvcmtpbmcgdXBkYXRlXHJcbiAgICAgICAgaWYgKHRoaXMubmV0d29yay5ob3N0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5ob3N0LnVwZGF0ZShkdCk7IC8vIGlmIGltIHRoZSBob3N0IGRvIGhvc3Qgc3R1ZmZcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ldHdvcmsuY2xpZW50LnVwZGF0ZShkdCk7IC8vIGVsc2UgdXBkYXRlIGNsaWVudCBzdHVmZlxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICB2YXIgZHRzID0gZHQgLyAxMDAwO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdHMsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjYXAgbnVtYmVyIG9mIHBhcnRpY2xlc1xyXG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPiB0aGlzLm1heFBhcnRpY2xlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IHRoaXMucGFydGljbGVzLnNsaWNlKHRoaXMucGFydGljbGVzLmxlbmd0aCAtIHRoaXMubWF4UGFydGljbGVzLCB0aGlzLnBhcnRpY2xlcy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBwYXJ0aWNsZXNcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZShkdHMsIGkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XHJcbiAgICAgICAgLy8gVXBkYXRlIGNhbWVyYVxyXG4gICAgICAgIC8vdGhpcy5jYW1lcmEudXBkYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuYmdDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy9iZyBjb2xvclxyXG4gICAgICAgIHRoaXMuYmdDdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5yZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjNWI1ODUwXCI7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgdGVzdCBiYWNrZ3JvdW5kXHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LnJlY3QoMCAtIHRoaXMuY2FtZXJhLngsIDAgLSB0aGlzLmNhbWVyYS55LCB0aGlzLmxldmVsLndpZHRoLCB0aGlzLmxldmVsLmhlaWdodCk7XHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5maWxsU3R5bGUgPSBcIiM4NTgyN2RcIjtcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sZXZlbC5yZW5kZXIodGhpcy5iZ0N0eCk7XHJcblxyXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVuZGVyIHBhcnRpY2xlc1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0ucmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVpLnJlbmRlclVJKCk7XHJcbiAgICAgICAgdGhpcy51aS5yZW5kZXJEZWJ1ZygpO1xyXG4gICAgICAgIC8vIHJlbmRlciBmcHMgYW5kIHBpbmdcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQ0FNRVJBOiBYOlwiICsgdGhpcy5jYW1lcmEueCwgXCJcXG5ZOlwiICsgdGhpcy5jYW1lcmEueSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnBsYXllcnNbdGhpcy5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKXtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBwbGF5ZXIgYWxyZWFkeSBleGlzdHMuXHJcbiAgICBpZihkYXRhLmlkIGluIHRoaXMucGxheWVycykgcmV0dXJuO1xyXG5cclxuICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGRhdGEpO1xyXG4gICAgdGhpcy5lbnRpdGllcy5wdXNoKG5ld1BsYXllcik7XHJcbiAgICB0aGlzLnBsYXllcnNbZGF0YS5pZF0gPSBuZXdQbGF5ZXI7XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcblxyXG4gICAgcmV0dXJuIG5ld1BsYXllcjtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnJlbW92ZVBsYXllciA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2FtZSByZW1vdmluZyBwbGF5ZXJcIiwgZGF0YSk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gcGxheWVycyBvYmplY3RcclxuICAgIGRlbGV0ZSB0aGlzLnBsYXllcnNbZGF0YS5pZF07XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gZW50aXRpdGVzIGFycmF5XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW50aXRpZXNbaV0uaWQgPT09IGRhdGEuaWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmb3VuZCBoaW0gLCByZW1vdmluZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdldEdhbWVTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAvLyBlbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZW50aXR5OlwiLCBlbnRpdHkpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZW50aXR5KTtcclxuICAgICAgICAvLyB9KSxcclxuICAgICAgICAvL2VudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAvLyAgICByZXR1cm4gZW50aXR5LmdldEZ1bGxTdGF0ZSgpOyAgICAgICAgfSksXHJcbiAgICAgICAgLy9wbGF5ZXJzOiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkod2luZG93LmdhbWUucGxheWVyc1trZXldKTsgfSlcclxuICAgICAgICBwbGF5ZXJzOiB0aGlzLmdldFBsYXllcnNTdGF0ZSgpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0UGxheWVyc1N0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRGdWxsU3RhdGUoKTsgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsImZ1bmN0aW9uIEtleWJvYXJkKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgLy90aGlzLmxhc3RTdGF0ZSA9IF8uY2xvbmUocGxheWVyLmtleXMpO1xuICAgIHRoaXMua2V5RG93bkhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlKTtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwICE9PSB0cnVlKSAgcGxheWVyLmtVcD0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtEb3duICE9PSB0cnVlKSAgcGxheWVyLmtEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtSaWdodCAhPT0gdHJ1ZSkgIHBsYXllci5rUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OTogLy8gMVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiY2hhbmdlV2VhcG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTA6IC8vIDJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXggPT09IDEpIHJldHVybjtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImNoYW5nZVdlYXBvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiAxLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgyOiAvLyBSXG4gICAgICAgICAgICAgICAgLy8gcmVsb2FkIG9ubHkgaWYgcGxheWVyIGlzIGFsaXZlIGFuZCB3ZWFwb24gbWFnYXppbmUgaXNudCBmdWxsXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5hbGl2ZSAmJiBwbGF5ZXIud2VhcG9uc1twbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleF0uYnVsbGV0cyA8IHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XS5tYWdhemluZVNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlbG9hZFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5rZXlVcEhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSA4NzogLy8gV1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1VwID09PSB0cnVlKSBwbGF5ZXIua1VwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICBpZiAocGxheWVyLmtEb3duID09PSB0cnVlKSBwbGF5ZXIua0Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCA9PT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtSaWdodCA9PT0gdHJ1ZSkgIHBsYXllci5rUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcy5rZXlEb3duSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5rZXlVcEhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcbiIsInZhciBsZXZlbDEgPSByZXF1aXJlKFwiLi9kYXRhL2xldmVsMVwiKTtcclxuLy92YXIgVGlsZSA9IHJlcXVpcmUoXCIuL1RpbGVcIik7XHJcblxyXG5mdW5jdGlvbiBMZXZlbCh0aWxlc2hlZXQpe1xyXG4gICAgdGhpcy50aWxlc2hlZXQgPSB0aWxlc2hlZXQ7XHJcbiAgICB0aGlzLnRpbGVTaXplID0gMzI7XHJcbiAgICB0aGlzLmxldmVsID0gbGV2ZWwxO1xyXG4gICAgdGhpcy53aWR0aCA9IHRoaXMubGV2ZWwudGlsZXNbMF0ubGVuZ3RoICogdGhpcy50aWxlU2l6ZTtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5sZXZlbC50aWxlcy5sZW5ndGggKiB0aGlzLnRpbGVTaXplO1xyXG4gICAgdGhpcy5jb2xUaWxlQ291bnQgPSB0aGlzLmxldmVsLnRpbGVzWzBdLmxlbmd0aDtcclxuICAgIHRoaXMucm93VGlsZUNvdW50ID0gdGhpcy5sZXZlbC50aWxlcy5sZW5ndGg7XHJcbiAgICB0aGlzLmltYWdlTnVtVGlsZXMgPSAzODQgLyB0aGlzLnRpbGVTaXplOyAgLy8gVGhlIG51bWJlciBvZiB0aWxlcyBwZXIgcm93IGluIHRoZSB0aWxlc2V0IGltYWdlXHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgVGlsZXNcclxuXHJcblxyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjdHgpIHtcclxuXHJcbiAgICAgICAgLy9kcmF3IGFsbCB0aWxlc1xyXG4gICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5yb3dUaWxlQ291bnQ7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5jb2xUaWxlQ291bnQ7IGNvbCArPSAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmxldmVsLnRpbGVzW3Jvd11bY29sXTtcclxuICAgICAgICAgICAgICAgIHZhciB0aWxlUm93ID0gKHRpbGUgLyB0aGlzLmltYWdlTnVtVGlsZXMpIHwgMDsgLy8gQml0d2lzZSBPUiBvcGVyYXRpb25cclxuICAgICAgICAgICAgICAgIHZhciB0aWxlQ29sID0gKHRpbGUgJSB0aGlzLmltYWdlTnVtVGlsZXMpIHwgMDtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKHRoaXMudGlsZXNoZWV0LFxyXG4gICAgICAgICAgICAgICAgICAgICh0aWxlQ29sICogdGhpcy50aWxlU2l6ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVSb3cgKiB0aGlzLnRpbGVTaXplKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcigoY29sICogdGhpcy50aWxlU2l6ZSkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCksXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcigocm93ICogdGhpcy50aWxlU2l6ZSkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplKTtcclxuICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbDtcclxuIiwiZnVuY3Rpb24gTW91c2UocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcblxuICAgIHRoaXMuY2xpY2sgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwic2hvb3RcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB4OiB3aW5kb3cuZ2FtZS5jYW1lcmEueCArIGUub2Zmc2V0WCxcbiAgICAgICAgICAgICAgICB5OiB3aW5kb3cuZ2FtZS5jYW1lcmEueSArIGUub2Zmc2V0WVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLnB1c2goYWN0aW9uKTsgLy8gdGVsbCB0aGUgaG9zdCBvZiB0aGUgYWN0aW9uXG4gICAgfTtcblxuICAgIHRoaXMubW91c2Vtb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVggPSB3aW5kb3cuZ2FtZS5jYW1lcmEueCArIGUub2Zmc2V0WDtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VZID0gd2luZG93LmdhbWUuY2FtZXJhLnkgKyBlLm9mZnNldFk7XG4gICAgfTtcblxuICAgIHRoaXMubW91c2Vkb3duID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBzd2l0Y2goZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgMDogLy8gbGVmdCBtb3VzZSBidXR0b25cbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLm1vdXNlTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5tb3VzZUxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBzd2l0Y2goZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgMDogLy8gbGVmdCBtb3VzZSBidXR0b25cbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLm1vdXNlTGVmdCA9PT0gdHJ1ZSkgcGxheWVyLm1vdXNlTGVmdCAgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgLy93aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XG4iLCJmdW5jdGlvbiBDb250cm9scygpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgQmxvb2QgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICB2YXIgciA9IDE1MCAtIHJuZDtcclxuICAgICAgICB2YXIgZyA9IDUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBiID0gNTAgLSBybmQ7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcInJnYihcIiArIHIgKyBcIixcIiArIGcgKyBcIixcIiArIGIgKyBcIilcIjtcclxuICAgICAgICBkYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDM7XHJcblxyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGhlbHBlcnMudG9SYWRpYW5zKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxKTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gNDA7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5CbG9vZC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG5cclxuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcblxyXG4gICAgdGhpcy5saWZlVGltZXIgKz0gZHQ7XHJcbiAgICBpZiAodGhpcy5saWZlVGltZXIgPiB0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvb2Q7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgQmxvb2QyIGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIC8vdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICAvLyB2YXIgciA9IDE1MDtcclxuICAgICAgICAvLyB2YXIgZyA9IDUwO1xyXG4gICAgICAgIC8vIHZhciBiID0gNTA7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcIiM4MDI5MjlcIjtcclxuICAgICAgICAvL2RhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMztcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA4MDtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuQmxvb2QyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICBpZiAodGhpcy5kaXN0YW5jZU1vdmVkIDwgdGhpcy5tb3ZlRGlzdGFuY2UpIHtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZU1vdmVkICs9IGRpc3RhbmNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kaXN0YW5jZU1vdmVkID49IHRoaXMubW92ZURpc3RhbmNlKSB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmJnQ3R4OyAvLyBtb3ZlIHRvIGJhY2tncm91bmQgY3R4XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gQmxvb2RTcGxhc2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuLy8gICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbi8vICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbi8vIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9vZDI7XHJcbiIsIi8vdmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBCbG9vZCA9IHJlcXVpcmUoXCIuL0Jsb29kXCIpO1xyXG52YXIgQmxvb2QyID0gcmVxdWlyZShcIi4vQmxvb2QyXCIpO1xyXG5cclxuZnVuY3Rpb24gRW1pdHRlcihkYXRhKSB7XHJcbiAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGU7XHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5lbWl0U3BlZWQgPSBkYXRhLmVtaXRTcGVlZDsgLy8gc1xyXG4gICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgdGhpcy5lbWl0Q291bnQgPSBkYXRhLmVtaXRDb3VudDtcclxuICAgIHRoaXMubGlmZVRpbWUgPSBkYXRhLmxpZmVUaW1lO1xyXG4gICAgdGhpcy5saWZlVGltZXIgPSAwO1xyXG4gICAgdGhpcy5lbWl0KCk7XHJcbn1cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgZW1pdHRlcjogdGhpc1xyXG4gICAgfTtcclxuICAgIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2RcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kKGRhdGEpKTtcclxuICAgIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2QyXCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCbG9vZDIoZGF0YSkpO1xyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbiAgICAvLyAvLyB1cGRhdGUgYWxsIHBhcnRpY2xlc1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgLy8gICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZShkdCk7XHJcbiAgICAvLyB9XHJcblxyXG5cclxuICAgIC8vIFNFVCBFTUlUVEVSIC0gdGhpcyBpcyBhbiBlbWl0dGVyIHRoYXQgc2hvdWxkIGVtaXQgYSBzZXQgbnVtYmVyIG9mIHBhcnRpY2xlc1xyXG4gICAgaWYgKHRoaXMuZW1pdENvdW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW1pdFNwZWVkKSB7IC8vIEVtaXQgYXQgYSBpbnRlcnZhbFxyXG4gICAgICAgICAgICB0aGlzLmVtaXRUaW1lciArPSBkdDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW1pdFRpbWVyID4gdGhpcy5lbWl0U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgIHRoaXMuZW1pdENvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZW1pdENvdW50IDwgMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVzdHJveVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgeyAvLyBFbWl0IGFsbCBhdCBvbmNlXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwO2kgPCB0aGlzLmVtaXRDb3VudDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVElNRUQgRU1JVFRFUlxyXG4gICAgLy8gdXBkYXRlIGVtaXR0ZXIgbGlmZXRpbWUgKGlmIGl0IGhhcyBhIGxpZmV0aW1lKSByZW1vdmUgZW1pdHRlciBpZiBpdHMgdGltZSBoYXMgcnVuIG91dCBhbmQgaXQgaGFzIG5vIHJlbWFpbmluZyBwYXJ0aWNsZXNcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZXIgKz0gZHQ7XHJcbiAgICAgICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ09OVElOVU9VUyBFTUlUVEVSXHJcbiAgICAvLyBlbWl0IG5ldyBwYXJ0aWNsZXMgZm9yZXZlclxyXG4gICAgdGhpcy5lbWl0VGltZXIgKz0gZHQ7XHJcbiAgICBpZiAodGhpcy5lbWl0VGltZXIgPiB0aGlzLmVtaXRTcGVlZCkge1xyXG4gICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgIHRoaXMuZW1pdFRpbWVyID0gMDtcclxuICAgIH1cclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIC8vIHJlbmRlciBhbGwgcGFydGljbGVzXHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAvLyAgICAgdGhpcy5wYXJ0aWNsZXNbaV0ucmVuZGVyKCk7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XHJcbiIsIi8vdmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuLi8uL0VudGl0eVwiKTtcclxuXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmN0eDtcclxuICAgICAgICB0aGlzLmNvbG9yID0gZGF0YS5jb2xvcjtcclxuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XHJcbiAgICAgICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lID0gZGF0YS5saWZlVGltZTtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lciA9IDA7XHJcbiAgICAgICAgdGhpcy5lbWl0dGVyID0gZGF0YS5lbWl0dGVyO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBQYXJ0aWNsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbi8vICAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuLy8gICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuLy8gICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4vLyAgICAgfVxyXG4vLyB9O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICAvL3RoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KC0odGhpcy5zaXplIC8gMiksIC0odGhpcy5zaXplIC8gMiksIHRoaXMuc2l6ZSwgdGhpcy5zaXplKTtcclxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxufTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHRoaXMuZW1pdHRlci5wYXJ0aWNsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7fTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGU7XHJcbiIsIi8vIHZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbnZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xudmFyIEtleWJvYXJkID0gcmVxdWlyZShcIi4vS2V5Ym9hcmRcIik7XG52YXIgTmV0d29ya0NvbnRyb2xzID0gcmVxdWlyZShcIi4vTmV0d29ya0NvbnRyb2xzXCIpO1xuLy92YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4vQnVsbGV0XCIpO1xuLy92YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcbi8vdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xudmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi93ZWFwb25zL1Nob3RndW5cIik7XG52YXIgQWs0NyA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvQWs0N1wiKTtcbi8vdmFyIEFuaW1hdGlvbiA9IHJlcXVpcmUoXCIuL0FuaW1hdGlvblwiKTtcbnZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9FbnRpdHlcIik7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgd2VhcG9uQ3JlYXRvciA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvd2VhcG9uQ3JlYXRvclwiKTtcblxuZnVuY3Rpb24gUGxheWVyKHBsYXllckRhdGEpIHtcbiAgICB0aGlzLmlkID0gcGxheWVyRGF0YS5pZDtcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwOyAvLyBjaXJjbGUgcmFkaXVzXG4gICAgdGhpcy54ID0gcGxheWVyRGF0YS54IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gcGxheWVyRGF0YS52aWV3aW5nQW5nbGUgfHwgNDU7XG4gICAgdGhpcy5zcGVlZCA9IHBsYXllckRhdGEuc3BlZWQgfHwgMTAwOyAvL3BpeGVscyBwZXIgc2Vjb25kXG4gICAgdGhpcy5ocCA9IHBsYXllckRhdGEuaHAgfHwgMTAwO1xuICAgIHRoaXMuYWxpdmUgPSBwbGF5ZXJEYXRhLmFsaXZlIHx8IHRydWU7XG5cbiAgICB0aGlzLnN4ID0gMDtcbiAgICB0aGlzLnN5ID0gMDtcbiAgICB0aGlzLnN3ID0gNjA7XG4gICAgdGhpcy5zaCA9IDYwO1xuICAgIHRoaXMuZHcgPSA2MDtcbiAgICB0aGlzLmRoID0gNjA7XG5cbiAgICB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmN0eDtcblxuICAgIC8vIGtleXNcbiAgICB0aGlzLmtVcCA9IGZhbHNlO1xuICAgIHRoaXMua0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmtMZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5rUmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIG1vdXNlXG4gICAgdGhpcy5tb3VzZVggPSB0aGlzLng7XG4gICAgdGhpcy5tb3VzZVkgPSB0aGlzLnk7XG4gICAgdGhpcy5tb3VzZUxlZnQgPSBmYWxzZTtcblxuICAgIC8vIHBvc2l0aW9uIG9uIGxldmVsXG4gICAgdGhpcy50aWxlUm93ID0gMDtcbiAgICB0aGlzLnRpbGVDb2wgPSAwO1xuXG4gICAgdGhpcy53ZWFwb25zID0gW107XG4gICAgLy8gcmVjcmVhdGUgd2VhcG9ucyBpZiB0aGUgcGxheWVyIGhhcyBhbnkgZWxzZSBjcmVhdGUgbmV3IHdlYXBvbnNcbiAgICBpZiAocGxheWVyRGF0YS53ZWFwb25TdGF0ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllckRhdGEud2VhcG9uU3RhdGUubGVuZ3RoOyBpKz0gMSkge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zLnB1c2god2VhcG9uQ3JlYXRvcih0aGlzLCBwbGF5ZXJEYXRhLndlYXBvblN0YXRlW2ldKSk7XG4gICAgICAgIH1cbiAgICB9ZWxzZSB7XG4gICAgICAgIHRoaXMud2VhcG9ucyA9IFtuZXcgQWs0Nyh0aGlzKSwgbmV3IFNob3RndW4odGhpcyldO1xuICAgIH1cblxuICAgIC8vdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG5cbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBwbGF5ZXJEYXRhLnNlbGVjdGVkV2VhcG9uSW5kZXggfHwgMDtcblxuICAgIHRoaXMubGFzdENsaWVudFN0YXRlID0gdGhpcy5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHRoaXMubGFzdEZ1bGxTdGF0ZSA9IHRoaXMuZ2V0RnVsbFN0YXRlKCk7XG5cbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gYWN0aW9ucyB0byBiZSBwZXJmb3JtZWRcbiAgICB0aGlzLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTsgLy8gc3VjY2VzZnVsbHkgcGVyZm9ybWVkIGFjdGlvbnNcblxuICAgIC8vIHRoaXMuYW5pbWF0aW9ucyA9IHtcbiAgICAvLyAgICAgXCJpZGxlXCI6IG5ldyBBbmltYXRpb24oe25hbWU6IFwiaWRsZVwiLCBzeDogMCwgc3k6IDAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogZmFsc2V9KSxcbiAgICAvLyAgICAgXCJmaXJlXCI6IG5ldyBBbmltYXRpb24oe25hbWU6IFwiZmlyZVwiLCBzeDogMCwgc3k6IDYwLCB3OiA2MCwgaDogNjAsIGZyYW1lczogMSwgcGxheU9uY2U6IHRydWV9KVxuICAgIC8vIH07XG4gICAgLy9cbiAgICAvLyB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLmFuaW1hdGlvbnMuaWRsZTtcblxuICAgIC8vaXMgdGhpcyBtZSBvciBhbm90aGVyIHBsYXllclxuICAgIGlmIChwbGF5ZXJEYXRhLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgIHRoaXMuY29udHJvbHMgPSB7bW91c2U6IG5ldyBNb3VzZSh0aGlzKSwga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZCh0aGlzKX07XG4gICAgICAgIHdpbmRvdy5nYW1lLmNhbWVyYS5mb2xsb3codGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBOZXR3b3JrQ29udHJvbHMoKTtcbiAgICB9XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xuXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIHF1ZXVlZCB1cCBhY3Rpb25zIGFuZCBwZXJmb3JtIHRoZW1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aW9ucy5sZW5ndGg7IGkgKz0gMSl7XG5cbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnBlcmZvcm1BY3Rpb24odGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucy5wdXNoKHRoaXMuYWN0aW9uc1tpXSk7XG4gICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTtcblxuICAgIGlmICghdGhpcy5hbGl2ZSkgcmV0dXJuO1xuXG5cbiAgICAvLyB0aGlzLnRpbGVSb3cgPSBNYXRoLmZsb29yKHRoaXMueSAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKTtcbiAgICAvLyB0aGlzLnRpbGVDb2wgPSBNYXRoLmZsb29yKHRoaXMueCAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKTtcblxuICAgIHRoaXMubW92ZShkdCk7XG5cblxuICAgIC8vY2hlY2sgaWYgb2ZmIHNjcmVlblxuICAgIGlmICh0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCkgdGhpcy54ID0gd2luZG93LmdhbWUubGV2ZWwud2lkdGg7XG4gICAgaWYgKHRoaXMueCA8IDApIHRoaXMueCA9IDA7XG4gICAgaWYgKHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkgdGhpcy55ID0gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0O1xuICAgIGlmICh0aGlzLnkgPCAwKSB0aGlzLnkgPSAwO1xuXG4gICAgLy8gdXBkYXRlIGN1cnJlbnQgd2VhcG9uO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnVwZGF0ZShkdCk7XG5cbiAgICAvL3RoaXMuY3VycmVudEFuaW1hdGlvbi51cGRhdGUoZHQpO1xuXG4gICAgaWYgKHRoaXMubW91c2VMZWZ0KSB7IC8vIGlmIGZpcmluZ1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcImZpcmVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdXNlWCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLm1vdXNlWVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnR1cm5Ub3dhcmRzKHRoaXMubW91c2VYLCB0aGlzLm1vdXNlWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkdCkge1xuXG4gICAgLy8gdmFyIG9sZFggPSB0aGlzLng7XG4gICAgLy8gdmFyIG9sZFkgPSB0aGlzLnk7XG5cbiAgICAvLyBVcGRhdGUgbW92ZW1lbnRcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XG4gICAgaWYgKHRoaXMua1VwICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIHRoaXMueSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueCAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy54ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCArPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24gJiYgdGhpcy5rTGVmdCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgdGhpcy55ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy54IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24gJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIHRoaXMueSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueCArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggKz0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCkge1xuICAgICAgICB0aGlzLnkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZIC09IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93bikge1xuICAgICAgICB0aGlzLnkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZICs9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rTGVmdCkge1xuICAgICAgICB0aGlzLnggLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYIC09IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rUmlnaHQpIHtcbiAgICAgICAgdGhpcy54ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCArPSBkaXN0YW5jZTtcbiAgICB9XG59O1xuXG4vLyAvLyBDb2xsaXNpb24gY2hlY2sgYWdhaW5zdCBzdXJyb3VuZGluZyB0aWxlc1xuLy8gUGxheWVyLnByb3RvdHlwZS5jb2xsaXNpb25DaGVjayA9IGZ1bmN0aW9uKCkge1xuLy8gICAgIHZhciBzdGFydGluZ1JvdyA9IHRoaXMudGlsZVJvdyAtIDE7XG4vLyAgICAgaWYgKHN0YXJ0aW5nUm93IDwgMCkgc3RhcnRpbmdSb3cgID0gMDtcbi8vICAgICB2YXIgZW5kUm93ID0gdGhpcy50aWxlUm93ICsxO1xuLy8gICAgIGlmIChlbmRSb3cgPiB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpIGVuZFJvdyA9IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudDtcbi8vICAgICB2YXIgc3RhcnRpbmdDb2wgPSB0aGlzLnRpbGVDb2wgLTE7XG4vLyAgICAgaWYgKHN0YXJ0aW5nQ29sIDwgMCkgc3RhcnRpbmdDb2wgPSAwO1xuLy8gICAgIHZhciBlbmRDb2wgPSB0aGlzLnRpbGVDb2wgKzE7XG4vLyAgICAgaWYgKGVuZENvbCA+IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudCkgZW5kQ29sID0gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50O1xuLy9cbi8vICAgICBmb3IgKHZhciByb3cgPSBzdGFydGluZ1Jvdzsgcm93IDwgZW5kUm93OyByb3cgKz0gMSkge1xuLy8gICAgICAgICBmb3IgKHZhciBjb2wgPSBzdGFydGluZ0NvbDsgY29sIDwgZW5kQ29sOyBjb2wgKz0gMSkge1xuLy8gICAgICAgICAgICAgaWYgKHdpbmRvdy5nYW1lLmxldmVsLmxldmVsLnRpbGVzW3Jvd11bY29sXSA9PT0gMCkgY29udGludWU7IC8vIGV2ZXJ5IHRpbGUgb3RoZXIgdGhhbiAwIGFyZSBub24gd2Fsa2FibGVcbi8vICAgICAgICAgICAgIC8vIGNvbGxpc2lvblxuLy8gICAgICAgICAgICAgaWYgKHRoaXMudGlsZVJvdyA9PT0gcm93ICYmIHRoaXMudGlsZUNvbCA9PT0gY29sKSB7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiB0cnVlO1xuLy8gfTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXR3b3JrVXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICBkZWxldGUgdXBkYXRlLmlkO1xuICAgIC8vIG5ldHdvcmtVcGRhdGVcbiAgICBmb3IgKHZhciBrZXkgaW4gdXBkYXRlKSB7XG4gICAgICAgIGlmIChrZXkgPT09IFwiYWN0aW9uc1wiKSB0aGlzW2tleV0gPSB0aGlzW2tleV0uY29uY2F0KHVwZGF0ZVtrZXldKTtcbiAgICAgICAgZWxzZSB0aGlzW2tleV0gPSB1cGRhdGVba2V5XTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBlcmZvcm1BY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24pe1xuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcbiAgICAgICAgY2FzZSBcInR1cm5Ub3dhcmRzXCI6XG4gICAgICAgICAgICB0aGlzLnR1cm5Ub3dhcmRzKGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmaXJlXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uZmlyZShhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiZGllXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWUoYWN0aW9uKTtcbiAgICAgICAgICAgIC8vYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZXNwYXduXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNwYXduKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJjaGFuZ2VXZWFwb25cIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYW5nZVdlYXBvbihhY3Rpb24pO1xuICAgICAgICBjYXNlIFwicmVsb2FkXCI6XG4gICAgfSAgICAgICByZXR1cm4gdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0ucmVsb2FkKGFjdGlvbik7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoIXRoaXMuYWxpdmUpIHJldHVybjtcbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uKTsgLy8gcm90YXRlXG5cbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN4LCB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zeSwgdGhpcy5zdywgdGhpcy5zaCwgLSh0aGlzLnN3IC8gMiksIC0odGhpcy5zaCAvIDIpLCB0aGlzLmR3LCB0aGlzLmRoKTtcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG5cbn07XG5cblBsYXllci5wcm90b3R5cGUudHVyblRvd2FyZHMgPSBmdW5jdGlvbih4LHkpIHtcbiAgICB2YXIgeERpZmYgPSB4IC0gdGhpcy54O1xuICAgIHZhciB5RGlmZiA9IHkgLSB0aGlzLnk7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmF0YW4yKHlEaWZmLCB4RGlmZik7Ly8gKiAoMTgwIC8gTWF0aC5QSSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnRha2VEYW1hZ2UgPSBmdW5jdGlvbihkYW1hZ2UsIGRpcmVjdGlvbikge1xuICAgIHRoaXMuaHAgLT0gZGFtYWdlO1xuICAgIGlmICh0aGlzLmhwIDw9IDApIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcImRpZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICBlbWl0Q291bnQ6IDEwLFxuICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH0pKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN0b3BSZWxvYWQoKTtcblxuXG4gICAgLy8gLy8gY3JlYXRlIGEgY29ycHNlXG4gICAgLy8gdmFyIGNvcnBzZSA9IG5ldyBFbnRpdHkoe1xuICAgIC8vICAgICB4OiB0aGlzLnggKyBNYXRoLmNvcyhhY3Rpb24uZGF0YS5kaXJlY3Rpb24pICogMTAsXG4gICAgLy8gICAgIHk6IHRoaXMueSArIE1hdGguc2luKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAvLyAgICAgc3g6IDYwICsoIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICogNjApLFxuICAgIC8vICAgICBzeTogMTIwLFxuICAgIC8vICAgICBzdzogNjAsXG4gICAgLy8gICAgIHNoOiA2MCxcbiAgICAvLyAgICAgZHc6IDYwLFxuICAgIC8vICAgICBkaDogNjAsXG4gICAgLy8gICAgIGRpcmVjdGlvbjogYWN0aW9uLmRhdGEuZGlyZWN0aW9uLFxuICAgIC8vICAgICBjdHg6IHdpbmRvdy5nYW1lLmJnQ3R4XG4gICAgLy8gfSk7XG4gICAgLy93aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKGNvcnBzZSk7XG5cbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAgICAgdHlwZTogXCJCbG9vZDJcIixcbiAgICAgICAgZW1pdENvdW50OiAzMCxcbiAgICAgICAgZW1pdFNwZWVkOiBudWxsLCAvLyBudWxsIG1lYW5zIGluc3RhbnRcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICB9KSk7XG5cblxuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnJlc3Bhd24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLnggPSBhY3Rpb24uZGF0YS54O1xuICAgIHRoaXMueSA9IGFjdGlvbi5kYXRhLnk7XG4gICAgdGhpcy5ocCA9IDEwMDtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcblxuICAgIC8vIHJlZmlsbCBhbGwgd2VhcG9uc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZWFwb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMud2VhcG9uc1tpXS5maWxsTWFnYXppbmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5jaGFuZ2VXZWFwb24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zdG9wUmVsb2FkKCk7XG4gICAgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4ID0gYWN0aW9uLmRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueSxcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGhwOiB0aGlzLmhwLFxuICAgICAgICBhbGl2ZTogdGhpcy5hbGl2ZSxcbiAgICAgICAgcmFkaXVzOiB0aGlzLnJhZGl1cyxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAgdmlld2luZ0FuZ2xlOiB0aGlzLnZpZXdpbmdBbmdsZSxcbiAgICAgICAgc3BlZWQ6IHRoaXMuc3BlZWQsXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWSxcbiAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4LFxuICAgICAgICB3ZWFwb25TdGF0ZTogdGhpcy5nZXRXZWFwb25TdGF0ZSgpXG4gICAgfTtcbn07XG5cbi8vIFRoZSBzdGF0ZSB0aGUgY2xpZW50IHNlbmRzIHRvIHRoZSBob3N0XG5QbGF5ZXIucHJvdG90eXBlLmdldENsaWVudFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWVxuICAgIH07XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZVN0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICB0aGlzLnggPSBuZXdTdGF0ZS54O1xuICAgIHRoaXMueSA9IG5ld1N0YXRlLnk7XG4gICAgLy9pZDogdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaHAgPSBuZXdTdGF0ZS5ocDtcbiAgICB0aGlzLmFsaXZlID0gbmV3U3RhdGUuYWxpdmU7XG4gICAgdGhpcy5yYWRpdXMgPSBuZXdTdGF0ZS5yYWRpdXM7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBuZXdTdGF0ZS5kaXJlY3Rpb247XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBuZXdTdGF0ZS52aWV3aW5nQW5nbGU7XG4gICAgdGhpcy5zcGVlZCA9IG5ld1N0YXRlLnNwZWVkO1xuICAgIHRoaXMua1VwID0gbmV3U3RhdGUua1VwO1xuICAgIHRoaXMua0Rvd24gPSBuZXdTdGF0ZS5rRG93bjtcbiAgICB0aGlzLmtMZWZ0ID0gbmV3U3RhdGUua0xlZnQ7XG4gICAgdGhpcy5rUmlnaHQgPSBuZXdTdGF0ZS5rUmlnaHQ7XG4gICAgdGhpcy5tb3VzZVggPSBuZXdTdGF0ZS5tb3VzZVg7XG4gICAgdGhpcy5tb3VzZVkgPSBuZXdTdGF0ZS5tb3VzZVk7XG4gICAgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4ID0gbmV3U3RhdGUuc2VsZWN0ZWRXZWFwb25JbmRleDtcbiAgICAvL3dlYXBvblN0YXRlOiB0aGlzLmdldFdlYXBvblN0YXRlKClcbn07XG5cbi8vIGdldCB0aGUgc3RhdGUgb2YgZWFjaCB3ZWFwb25cblBsYXllci5wcm90b3R5cGUuZ2V0V2VhcG9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdGF0ZS5wdXNoKHRoaXMud2VhcG9uc1tpXS5nZXRTdGF0ZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcbiIsIi8vIHZhciB3ZWFwb25zID0gcmVxdWlyZShcIi4vZGF0YS93ZWFwb25zXCIpO1xuLy8gdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xuLy9cbnZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vUGFydGljbGUvRW1pdHRlclwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcblxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgdmFyIG15SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkO1xuICAgICAgICB0aGlzLmNsaWVudExpc3QuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGxheWVycyl7XG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkICsgXCIgXCIgKyBwbGF5ZXJzW2lkXS5waW5nKTtcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlckRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gXCIxMnB4IE9wZW4gU2Fuc1wiO1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJGUFM6ICBcIiArIHdpbmRvdy5nYW1lLmZwcywgNSwgMjApO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQSU5HOiBcIiArIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZywgNSwgMzQpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJDQU1FUkE6IFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS55KSwgNSwgNDgpO1xuICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQTEFZRVI6ICBcIiArIE1hdGguZmxvb3IocGxheWVyLngpICsgXCIsIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIueSksIDUsIDYyKTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIk1PVVNFOiBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVkpLCA1LCA3Nik7XG4gICAgICAgICAgICBpZihwbGF5ZXIpIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkRJUjogXCIgKyBwbGF5ZXIuZGlyZWN0aW9uLnRvRml4ZWQoMiksIDUsIDkwKTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQQVJUSUNMRVM6IFwiICsgd2luZG93LmdhbWUucGFydGljbGVzLmxlbmd0aCwgNSwgMTA0KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSBcIjI0cHggT3BlbiBTYW5zXCI7XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyVUkgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG5cbiAgICAgICAgLy9ndWkgYmcgY29sb3JcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCgwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsIDE0MCwgMzUpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMzUpXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdyYWRpZW50XG4gICAgICAgIHZhciBncmQ9IHdpbmRvdy5nYW1lLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgxNDAsMCwxOTAsMCk7XG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMCxcInJnYmEoMCwwLDAsMC4zNSlcIik7XG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMSxcInJnYmEoMCwwLDAsMClcIik7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGU9Z3JkO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFJlY3QoMTQwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsNTAsMzUpO1xuXG5cblxuICAgICAgICB2YXIgd2VhcG9uID0gIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XTtcbiAgICAgICAgLy8gZHJhdyB3ZWFwb24gaWNvblxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB3ZWFwb24uaWNvblN4LCB3ZWFwb24uaWNvblN5LCB3ZWFwb24uaWNvblcsIHdlYXBvbi5pY29uSCwgOTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMywgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgpO1xuICAgICAgICAvLyBkcmF3IG1hZ2F6aW5lIGNvdW50J1xuICAgICAgICBpZiAod2VhcG9uLnJlbG9hZGluZykge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgODUsIDIxNCwgMjEsIDIyLCAxMjUsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMCwgMjEsIDIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh3ZWFwb24uYnVsbGV0cywgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZTdkMjllXCI7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsICAxMjIsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAxMCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIGRyYXcgaGVhcnRcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgMCwgMjI4LCAxMywgMTIsIDEwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMjMsIDEzLCAxMik7XG4gICAgICAgIC8vIGRyYXcgSFBcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjI1KVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQocGxheWVyLmhwLCAzMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDkpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZTdkMjllXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xuICAgIH07XG5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzcGF3bkJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSB7XG4gICAgICAgICAgICB2YXIgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuXG4gICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZWxvYWRCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgaWYgKHBsYXllci5hbGl2ZSkge1xuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZWxvYWRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmICghcGxheWVyLmFsaXZlKSB7XG4gICAgICAgIC8vICAgICB2YXIgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgIC8vICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAvLyAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgIC8vICAgICAgICAgZGF0YToge1xuICAgICAgICAvLyAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAvLyAgICAgICAgICAgICB5OiB5XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICB9KTtcblxuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZW1pdHRlckJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgICAgICAgICAgZW1pdENvdW50OiAxMCxcbiAgICAgICAgICAgICAgICBlbWl0U3BlZWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgeDogcGxheWVyLngsXG4gICAgICAgICAgICAgICAgeTogcGxheWVyLnlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG59O1xuIiwidmFyIGxldmVsID0ge1xyXG4gICAgbmFtZTogXCJsZXZlbDFcIixcclxuICAgIHRpbGVzOiBbXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwyLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMiwyLDIsMiwyLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDEsMiwyLDIsMSwyLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwxLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsZXZlbDtcclxuIiwidmFyIEFrNDcgPSB7XHJcbiAgICBcIm5hbWVcIjogXCJBazQ3XCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAzMCwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDMwLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjEsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogMSwgLy8gc2hvb3QgMSBidWxsZXQgYXQgYSB0aW1lXHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDE3MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogMCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogMjEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMFxyXG59O1xyXG5cclxudmFyIHNob3RndW4gPSB7XHJcbiAgICBcIm5hbWVcIjogXCJzaG90Z3VuXCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAxMiwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDEyLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjUsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogNCwgLy8gNCBzaG90Z3VuIHNsdWdzIHBlciBzaG90XHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDI1MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogNjAsIC8vIHNwcml0ZXNoZWV0IHkgcG9zaXRpb25cclxuICAgIFwiaWNvblN4XCI6IDUxLFxyXG4gICAgXCJpY29uU3lcIjogMjEwLFxyXG4gICAgXCJpY29uV1wiOiAzMCxcclxuICAgIFwiaWNvbkhcIjogMzBcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQWs0NzogQWs0NyxcclxuICAgIHNob3RndW46IHNob3RndW5cclxufTtcclxuIiwiLy8gZGVncmVlcyB0byByYWRpYW5zXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XG4gICAgcmV0dXJuIGRlZyAqIChNYXRoLlBJIC8gMTgwKTtcbn1cblxuLy8gcmFkaWFucyB0byBkZWdyZWVzXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlcyxcbn07XG4iLCJ2YXIgR2FtZSA9IHJlcXVpcmUoXCIuL0dhbWUuanNcIik7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuQWs0NztcclxuXHJcbmNsYXNzIEFrNDcgZXh0ZW5kcyBXZWFwb257XHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XHJcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xyXG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBazQ3O1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xudmFyIHdlYXBvbkRhdGEgPSByZXF1aXJlKFwiLi4vZGF0YS93ZWFwb25zXCIpLnNob3RndW47XG52YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0XCIpO1xuXG5jbGFzcyBTaG90Z3VuIGV4dGVuZHMgV2VhcG9ue1xuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBleGlzdGluZ1dlYXBvbkRhdGEpIHtcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xuICAgICAgICBzdXBlcihvd25lciwgd2VhcG9uRGF0YSk7XG4gICAgfVxufVxuXG5TaG90Z3VuLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XG5cbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nIHx8IHRoaXMuYnVsbGV0cyA8IDEpIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuYnVsbGV0cyAtPSAxO1xuICAgIHRoaXMuZmlyZVRpbWVyID0gMDtcblxuICAgIHZhciBkaXJlY3Rpb25zID0gW107XG4gICAgdmFyIGRpcmVjdGlvbjtcblxuICAgIC8vIHNob290IDQgYnVsbGV0c1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzUGVyU2hvdDsgaSArPSAxKSB7XG5cbiAgICAgICAgaWYgKCFhY3Rpb24uZGF0YS5kaXJlY3Rpb25zKSB7XG4gICAgICAgICAgICAvLyByYW5kb21pemUgZGlyZWN0aW9ucyBteXNlbGZcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IHRoaXMub3duZXIuZGlyZWN0aW9uICsgTWF0aC5yYW5kb20oKSAqIDAuMjUgLSAwLjEyNTtcbiAgICAgICAgICAgIGRpcmVjdGlvbnMucHVzaChkaXJlY3Rpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gYWN0aW9uLmRhdGEuZGlyZWN0aW9uc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XG4gICAgICAgICAgICB4OiB0aGlzLm93bmVyLngsXG4gICAgICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJGSVJFXCIsIGFjdGlvbiwgZGlyZWN0aW9ucyk7XG4gICAgYWN0aW9uLmRhdGEuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnM7XG5cblxuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3RndW47XG4iLCJ2YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0XCIpO1xuXG5jbGFzcyBXZWFwb257XG4gICAgY29uc3RydWN0b3Iob3duZXIsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5vd25lciA9IG93bmVyO1xuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgIHRoaXMubWFnYXppbmVTaXplID0gZGF0YS5tYWdhemluZVNpemU7XG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IGRhdGEuYnVsbGV0cztcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IGRhdGEuZmlyZVJhdGU7XG4gICAgICAgIHRoaXMuZGFtYWdlID0gZGF0YS5kYW1hZ2U7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZSA9IGRhdGEucmVsb2FkVGltZTtcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XG4gICAgICAgIHRoaXMuYnVsbGV0c1BlclNob3QgPSBkYXRhLmJ1bGxldHNQZXJTaG90O1xuICAgICAgICB0aGlzLnN4ID0gZGF0YS5zeDtcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XG5cbiAgICAgICAgdGhpcy5pY29uU3ggPSBkYXRhLmljb25TeDtcbiAgICAgICAgdGhpcy5pY29uU3kgPSBkYXRhLmljb25TeTtcbiAgICAgICAgdGhpcy5pY29uVyA9IGRhdGEuaWNvblc7XG4gICAgICAgIHRoaXMuaWNvbkggPSBkYXRhLmljb25IO1xuXG4gICAgICAgIHRoaXMuZmlyZVRpbWVyID0gdGhpcy5maXJlUmF0ZTtcblxuICAgICAgICB0aGlzLnJlbG9hZGluZyA9IGRhdGEucmVsb2FkaW5nIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyID0gZGF0YS5yZWxvYWRUaW1lciB8fCAwO1xuICAgIH1cbn1cblxuV2VhcG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUpIHRoaXMuZmlyZVRpbWVyICs9IGR0O1xuXG4gICAgaWYgKHRoaXMucmVsb2FkaW5nKSB7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgKz0gZHQ7XG4gICAgICAgIGlmICh0aGlzLnJlbG9hZFRpbWVyID4gdGhpcy5yZWxvYWRUaW1lKXtcbiAgICAgICAgICAgIHRoaXMuZmlsbE1hZ2F6aW5lKCk7XG4gICAgICAgICAgICB0aGlzLnN0b3BSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5idWxsZXRzIC09IHRoaXMuYnVsbGV0c1BlclNob3Q7XG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xuXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgQnVsbGV0KHtcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxuICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5vd25lci5kaXJlY3Rpb24sXG4gICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSkpO1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMucmVsb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuV2VhcG9uLnByb3RvdHlwZS5maWxsTWFnYXppbmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJ1bGxldHMgPSB0aGlzLm1hZ2F6aW5lU2l6ZTtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuc3RvcFJlbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVsb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICBidWxsZXRzOiB0aGlzLmJ1bGxldHMsXG4gICAgICAgIGZpcmVUaW1lcjogdGhpcy5maXJlUmF0ZSxcbiAgICAgICAgcmVsb2FkaW5nOiB0aGlzLnJlbG9hZGluZyxcbiAgICAgICAgcmVsb2FkVGltZXI6IHRoaXMucmVsb2FkVGltZXJcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gV2VhcG9uO1xuIiwidmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL1Nob3RndW5cIik7XHJcbnZhciBBazQ3ID0gcmVxdWlyZShcIi4uLy4vd2VhcG9ucy9BazQ3XCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIik7XHJcblxyXG5mdW5jdGlvbiB3ZWFwb25DcmVhdG9yKG93bmVyLCBkYXRhKSB7XHJcblxyXG4gICAgdmFyIHdlcERhdGEgPSB3ZWFwb25EYXRhW2RhdGEubmFtZV07XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkgeyB3ZXBEYXRhW2tleV0gPSBkYXRhW2tleV07IH1cclxuXHJcbiAgICBzd2l0Y2ggKGRhdGEubmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJBazQ3XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWs0Nyhvd25lciwgd2VwRGF0YSk7XHJcbiAgICAgICAgY2FzZSBcInNob3RndW5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTaG90Z3VuKG93bmVyLCB3ZXBEYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3ZWFwb25DcmVhdG9yO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XG5cbmZ1bmN0aW9uIENsaWVudCgpe1xuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAvLyBTdHJlc3MgdGVzdFxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XG5cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgYWN0aW9ucyBmcm9tIHRoZSBob3N0XG4gICAgdGhpcy5jaGFuZ2VzID0gW107IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcblxuICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGdhbWVJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pbiB0aGUgaG9zdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJteSBjbGllbnQgcGVlcklEIGlzIFwiLCBpZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cblxuICAgICAgICAvLyBjbG9zZSBvdXQgYW55IG9sZCBjb25uZWN0aW9uc1xuICAgICAgICBpZihPYmplY3Qua2V5cyh0aGlzLmNvbm5lY3Rpb25zKS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGNvbm5QZWVyIGluIHRoaXMuY29ubmVjdGlvbnMpe1xuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdWzBdLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVsZXRlIG9sZCBob3N0cyBwbGF5ZXIgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJkZWxldGUgb2xkIHBsYXllclwiLCBjb25uUGVlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBpdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcblxuICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckpvaW5lZFwiOlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSBcInBsYXllckxlZnRcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC8vd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLmlkfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5nYW1lU3RhdGUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImdhbWVTdGF0ZVVwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWNlaXZpbmcgZnVsbCBzdGF0ZVwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3BsYXllci5pZF0udXBkYXRlU3RhdGUocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6IC8vIGNoYW5nZXMgYW5kIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzLmNvbmNhdChkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLmNvbmNhdChkYXRhLmFjdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAgICAgICAgICAgICAgICBkYXRhLnBpbmdzLmZvckVhY2goZnVuY3Rpb24ocGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twaW5nLmlkXS5waW5nID0gcGluZy5waW5nO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXS5waW5nO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3Qod2luZG93LmdhbWUucGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9KTtcbn1cblxuQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIGlmICghcGxheWVyKSByZXR1cm47XG5cbiAgICB2YXIgY3VycmVudFN0YXRlID0gcGxheWVyLmdldENsaWVudFN0YXRlKCk7XG4gICAgdmFyIGxhc3RDbGllbnRTdGF0ZSA9IHBsYXllci5sYXN0Q2xpZW50U3RhdGU7XG4gICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdENsaWVudFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG5cbiAgICAvLyBhZGQgYW55IHBlcmZvcm1lZCBhY3Rpb25zIHRvIGNoYW5nZSBwYWNrYWdlXG4gICAgaWYgKHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlcywgc2VuZCBlbSB0byBob3N0XG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAgICAgICAgIGV2ZW50OiBcIm5ldHdvcmtVcGRhdGVcIixcbiAgICAgICAgICAgIHVwZGF0ZXM6IGNoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGxheWVyLmxhc3RDbGllbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZTtcblxuXG5cblxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldO1xuXG4gICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgICAgICBpZiAoY2hhbmdlLmlkICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLmlkXS5uZXR3b3JrVXBkYXRlKGNoYW5nZSk7XG4gICAgICAgICAgICB9Y2F0Y2ggKGVycikge1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hhbmdlcyA9IFtdO1xuICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG5cblxuXG4gICAgLy8gLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICAvLyB2YXIgbXlQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgLy8gaWYgKCFteVBsYXllcikgcmV0dXJuO1xuICAgIC8vXG4gICAgLy8gIGlmICghXy5pc0VxdWFsKG15UGxheWVyLmtleXMsIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSkpIHtcbiAgICAvLyAgICAgLy8gc2VuZCBrZXlzdGF0ZSB0byBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImtleXNcIixcbiAgICAvLyAgICAgICAgIGtleXM6IG15UGxheWVyLmtleXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gIH1cbiAgICAvLyBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUgPSBfLmNsb25lKG15UGxheWVyLmtleXMpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG4gICAgLy9cbiAgICAvLyB2YXIgY3VycmVudFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIC8vIHZhciBjaGFuZ2VzID0gW107XG4gICAgLy8gdmFyIGxhc3RTdGF0ZSA9IG15UGxheWVyLmxhc3RTdGF0ZTtcbiAgICAvLyB2YXIgbmV3U3RhdGUgPSBteVBsYXllci5nZXRTdGF0ZSgpO1xuICAgIC8vXG4gICAgLy8gLy8gY29tcGFyZSBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxuICAgIC8vIHZhciBjaGFuZ2UgPSBfLm9taXQobmV3U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdFN0YXRlW2tdID09PSB2OyB9KTtcbiAgICAvLyBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgLy8gICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgLy8gICAgIGNoYW5nZS5wbGF5ZXJJRCA9IG15UGxheWVyLmlkO1xuICAgIC8vICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBteVBsYXllci5sYXN0U3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAvLyAvLyBpZiB0aGVyZSBhcmUgY2hhbmdlc1xuICAgIC8vIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgLy8gICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAvLyBzZW5kIGFsbCBwZXJmb3JtZWQgYWN0aW9ucyB0byB0aGUgaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJhY3Rpb25zXCIsXG4gICAgLy8gICAgICAgICBkYXRhOiB0aGlzLmFjdGlvbnNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBjbGVhciBhY3Rpb25zIHF1ZXVlXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY2hhbmdlc1tpXS5sZW5ndGg7IGogKz0gMSkgIHtcbiAgICAvLyAgICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXVtqXTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgLy8gICAgICAgICBpZiAoY2hhbmdlLnBsYXllcklEICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5wbGF5ZXJJRF0uY2hhbmdlKGNoYW5nZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB0aGlzLmNoYW5nZXMgPSBbXTtcblxufTtcblxuICAgIC8vXG4gICAgLy8gdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgLy8gICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Rpb24gZnJvbSBzZXJ2ZXJcIiwgdGhpcy5wZWVyLCBjb25uKTtcbiAgICAvL1xuICAgIC8vICAgICAvL2NyZWF0ZSB0aGUgcGxheWVyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKGNvbm4ucGVlcik7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvL0xpc3RlbiBmb3IgZGF0YSBldmVudHMgZnJvbSB0aGUgaG9zdFxuICAgIC8vICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAvLyAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgIC8vICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgIC8vICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy8gcGluZyB0ZXN0XG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAvLyAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9LCAyMDAwKTtcbiAgICAvL1xuICAgIC8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSG9zdCgpe1xuICAgIHRoaXMuY29ubnMgPSB7fTtcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIGFsbCB0aGUgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGNsaWVudHNcbiAgICB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICB0aGlzLmRpZmYgPSBudWxsO1xuXG4gICAgdGhpcy5jb25uZWN0ID0gZnVuY3Rpb24ocGVlcnMpe1xuICAgICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3RcIiwgcGVlcnMpO1xuXG4gICAgICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2VuZCBhIHBpbmcgZXZlcnkgMiBzZWNvbmRzLCB0byB0cmFjayBwaW5nIHRpbWVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBwaW5nczogd2luZG93LmdhbWUubmV0d29yay5ob3N0LmdldFBpbmdzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG5cbiAgICAgICAgICAgIC8vIHNlbmQgZnVsbCBnYW1lIHN0YXRlIG9uY2UgaW4gYSB3aGlsZVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IFwiZ2FtZVN0YXRlVXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMTAwMCk7XG5cbiAgICAgICAgICAgIHBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XG4gICAgICAgICAgICAgICAgLy9jb25uZWN0IHdpdGggZWFjaCByZW1vdGUgcGVlclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xuICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogbmV3UGxheWVyLmdldEZ1bGxTdGF0ZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZW1pdCgge2NsaWVudElEOiBjb25uLnBlZXIsIGV2ZW50OiBcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiRVJST1IgRVZFTlRcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTsgLy8gYW5zd2VyIHRoZSBwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgY2xpZW50LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5ldHdvcmtVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgZnJvbSBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5uZXR3b3JrVXBkYXRlKGRhdGEudXBkYXRlcyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEuYWN0aW9ucyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJhY3Rpb25zXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiYWN0aW9ucyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImNoYW5nZXNcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiSGV5IHRoZXJlIGhhcyBiZWVuIGNoYW5nZXMhXCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmNoYW5nZShkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJrZXlzXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwia2V5cyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YS5rZXlzLCAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzID0gXy5jbG9uZShkYXRhLmtleXMpOyAvL1RPRE86IHZlcmlmeSBpbnB1dCAoY2hlY2sgdGhhdCBpdCBpcyB0aGUga2V5IG9iamVjdCB3aXRoIHRydWUvZmFsc2UgdmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2cod2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGZvciAodmFyIGNvbm4gaW4gdGhpcy5jb25ucyl7XG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRU1JVCFcIiwgZGF0YSk7XG4gICAgICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG5cbiAgICAgICAgdmFyIGNoYW5nZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RnVsbFN0YXRlID0gcGxheWVyLmdldEZ1bGxTdGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50RnVsbFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIHBsYXllci5sYXN0RnVsbFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG4gICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpIHx8IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHsgLy90aGVyZSdzIGJlZW4gY2hhbmdlcyBvciBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY2hhbmdlLmlkID0gcGxheWVyLmlkO1xuICAgICAgICAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmxhc3RGdWxsU3RhdGUgPSBjdXJyZW50RnVsbFN0YXRlO1xuICAgICAgICAgICAgICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIC8vIHNlbmQgY2hhbmdlc1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgdGhpcy5nZXRQaW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGluZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICBwaW5ncy5wdXNoKHtpZDogcGxheWVyLmlkLCBwaW5nOiBwbGF5ZXIucGluZyB8fCBcImhvc3RcIn0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBpbmdzO1xuICAgIH07XG59O1xuIiwidmFyIENsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcclxudmFyIEhvc3QgPSByZXF1aXJlKFwiLi9Ib3N0XCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJSVEMoKXtcclxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoZGF0YS5wZWVycywgZGF0YS5wcmV2aW91c0hvc3QpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJKb2luZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KFtkYXRhLnBlZXJJRF0sIGRhdGEucHJldmlvdXNIb3N0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQTEFZRVIgTEVGVFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLnBsYXllcklEfSk7XHJcbiAgICB9KTtcclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbZGF0YS5pZF07XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
