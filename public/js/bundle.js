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
        entities: this.entities.map(function(entity) {
            return entity.getFullState();        }),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0NhbWVyYS5qcyIsInNyYy9qcy9FbnRpdHkuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QyLmpzIiwic3JjL2pzL1BhcnRpY2xlL0VtaXR0ZXIuanMiLCJzcmMvanMvUGFydGljbGUvUGFydGljbGUuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2RhdGEvbGV2ZWwxLmpzIiwic3JjL2pzL2RhdGEvd2VhcG9ucy5qcyIsInNyYy9qcy9oZWxwZXJzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWFwb25zL3dlYXBvbkNyZWF0b3IuanMiLCJzcmMvanMvd2ViUlRDL0NsaWVudC5qcyIsInNyYy9qcy93ZWJSVEMvSG9zdC5qcyIsInNyYy9qcy93ZWJSVEMvV2ViUlRDLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEJ1bGxldChkYXRhKSB7XHJcbiAgICAvLyBjcmVhdGUgdGhlIGJ1bGxldCA1IHBpeGVscyB0byB0aGUgcmlnaHQgYW5kIDMwIHBpeGVscyBmb3J3YXJkLiBzbyBpdCBhbGlnbnMgd2l0aCB0aGUgZ3VuIGJhcnJlbFxyXG4gICAgdGhpcy54ID0gZGF0YS54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcclxuICAgIHRoaXMueSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIC8vdGhpcy54ID0gZGF0YS54O1xyXG4gICAgLy90aGlzLnkgPSBkYXRhLnk7XHJcbiAgICB0aGlzLmxlbmd0aCA9IDEwOyAvLyB0cmFpbCBsZW5ndGhcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XHJcbiAgICB0aGlzLnNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcclxuICAgIHRoaXMuZGFtYWdlID0gZGF0YS5kYW1hZ2U7XHJcblxyXG4gICAgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5jdHg7XHJcbn1cclxuXHJcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgLy9cclxuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcblxyXG4gICAgLy8gaWYgb2ZmIHNjcmVlbiwgcmVtb3ZlIGl0XHJcbiAgICBpZiAodGhpcy54IDwgMCB8fCB0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCB8fCB0aGlzLnkgPCAwIHx8IHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaGl0RGV0ZWN0aW9uKGluZGV4KTtcclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUuaGl0RGV0ZWN0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIC8vIHRlc3QgYnVsbGV0IGFnYWluc3QgYWxsIHBsYXllcnNcclxuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcblxyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XHJcblxyXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcclxuICAgICAgICB2YXIgYiA9IHRoaXMueSAtIHBsYXllci55O1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggYSphICsgYipiICk7XHJcblxyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IHBsYXllci5yYWRpdXMpIHtcclxuICAgICAgICAgICAgLy8gaGl0XHJcbiAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKHRoaXMuZGFtYWdlLCB0aGlzLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxuQnVsbGV0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uIC0gMC43ODUzOTgxNjM0KTsgLy8gcm90YXRlXHJcblxyXG4gICAgLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcclxuICAgIHZhciBncmFkPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJnYmEoMjU1LDE2NSwwLDAuNClcIik7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLCBcInllbGxvd1wiKTtcclxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcclxuXHJcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgdGhpcy5jdHgubW92ZVRvKDAsIDApO1xyXG4gICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoKTtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG5cclxuICAgIC8vIGN0eC5saW5lV2lkdGggPSAxO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyBjdHgubW92ZVRvKDAsMCk7XHJcbiAgICAvLyBjdHgubGluZVRvKDAsdGhpcy5sZW5ndGgpO1xyXG5cclxuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCwgMSwgMSApO1xyXG5cclxuXHJcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcblxyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyBjdHgubGluZVdpZHRoID0gMTtcclxuICAgIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXHJcbiAgICAvLyB2YXIgZ3JhZD0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcclxuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDAsIFwicmVkXCIpO1xyXG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJncmVlblwiKTtcclxuICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyBjdHgubW92ZVRvKDAsMCk7XHJcbiAgICAvLyBjdHgubGluZVRvKDAsbGVuZ3RoKTtcclxuICAgIC8vIGN0eC5zdHJva2UoKTtcclxuXHJcblxyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0O1xyXG4iLCJmdW5jdGlvbiBDYW1lcmEoKSB7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuICAgIC8vIHRoaXMud2lkdGggPSA7XHJcbiAgICAvLyB0aGlzLmhlaWdodCA9IHdpbmRvdy5nYW1lLmhlaWdodDtcclxuICAgIHRoaXMuZm9sbG93aW5nID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmZvbGxvdyA9IGZ1bmN0aW9uKHBsYXllcil7XHJcbiAgICAgICAgdGhpcy5mb2xsb3dpbmcgPSBwbGF5ZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZvbGxvd2luZykgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnggPSB0aGlzLmZvbGxvd2luZy54IC0gd2luZG93LmdhbWUud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMuZm9sbG93aW5nLnkgLSB3aW5kb3cuZ2FtZS5oZWlnaHQgLyAyO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7XHJcbiIsImNsYXNzIEVudGl0eSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgICAgICB0aGlzLnN4ID0gZGF0YS5zeDtcclxuICAgICAgICB0aGlzLnN5ID0gZGF0YS5zeTtcclxuICAgICAgICB0aGlzLnN3ID0gZGF0YS5zdztcclxuICAgICAgICB0aGlzLnNoID0gZGF0YS5zaDtcclxuICAgICAgICB0aGlzLmR3ID0gZGF0YS5kdztcclxuICAgICAgICB0aGlzLmRoID0gZGF0YS5kaDtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRhdGEuZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gZGF0YS5jdHg7XHJcbiAgICB9XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuXHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuXHJcbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBzeDogdGhpcy5zeCxcclxuICAgICAgICBzeTogdGhpcy5zeSxcclxuICAgICAgICBzdzogdGhpcy5zdyxcclxuICAgICAgICBzaDogdGhpcy5zaCxcclxuICAgICAgICBkaDogdGhpcy5kaCxcclxuICAgICAgICBkdzogdGhpcy5kdyxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcblxyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG5cclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMudGlsZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnRpbGVzaGVldC5zcmMgPSBcIi4uL2ltZy90aWxlcy5wbmdcIjtcclxuXHJcbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMudGlsZXNoZWV0KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmJnQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuYmdDYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuYmdDYW52YXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmJnQ3R4ID0gdGhpcy5iZ0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAxMDAwOyAvLyBudW1iZXIgb2YgcGFydGljbGVzIGFsbG93ZWQgb24gc2NyZWVuIGJlZm9yZSB0aGV5IHN0YXJ0IHRvIGJlIHJlbW92ZWRcclxuXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIHRoaXMubG9vcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdhbWUgbG9vcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApe1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxyXG5cclxuICAgICAgICBkdCA9IHRpbWVzdGFtcCAtIGxhc3Q7IC8vIHRpbWUgZWxhcHNlZCBpbiBtcyBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgYW5kIHJlbmRlciBnYW1lXHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIG5ldHdvcmtpbmcgdXBkYXRlXHJcbiAgICAgICAgaWYgKHRoaXMubmV0d29yay5ob3N0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5ob3N0LnVwZGF0ZShkdCk7IC8vIGlmIGltIHRoZSBob3N0IGRvIGhvc3Qgc3R1ZmZcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ldHdvcmsuY2xpZW50LnVwZGF0ZShkdCk7IC8vIGVsc2UgdXBkYXRlIGNsaWVudCBzdHVmZlxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICB2YXIgZHRzID0gZHQgLyAxMDAwO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdHMsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjYXAgbnVtYmVyIG9mIHBhcnRpY2xlc1xyXG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPiB0aGlzLm1heFBhcnRpY2xlcykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IHRoaXMucGFydGljbGVzLnNsaWNlKHRoaXMucGFydGljbGVzLmxlbmd0aCAtIHRoaXMubWF4UGFydGljbGVzLCB0aGlzLnBhcnRpY2xlcy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBwYXJ0aWNsZXNcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZShkdHMsIGkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XHJcbiAgICAgICAgLy8gVXBkYXRlIGNhbWVyYVxyXG4gICAgICAgIC8vdGhpcy5jYW1lcmEudXBkYXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBjbGVhciBzY3JlZW5cclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuYmdDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy9iZyBjb2xvclxyXG4gICAgICAgIHRoaXMuYmdDdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5yZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjNWI1ODUwXCI7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgdGVzdCBiYWNrZ3JvdW5kXHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LnJlY3QoMCAtIHRoaXMuY2FtZXJhLngsIDAgLSB0aGlzLmNhbWVyYS55LCB0aGlzLmxldmVsLndpZHRoLCB0aGlzLmxldmVsLmhlaWdodCk7XHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5maWxsU3R5bGUgPSBcIiM4NTgyN2RcIjtcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sZXZlbC5yZW5kZXIodGhpcy5iZ0N0eCk7XHJcblxyXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVuZGVyIHBhcnRpY2xlc1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0ucmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVpLnJlbmRlclVJKCk7XHJcbiAgICAgICAgdGhpcy51aS5yZW5kZXJEZWJ1ZygpO1xyXG4gICAgICAgIC8vIHJlbmRlciBmcHMgYW5kIHBpbmdcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQ0FNRVJBOiBYOlwiICsgdGhpcy5jYW1lcmEueCwgXCJcXG5ZOlwiICsgdGhpcy5jYW1lcmEueSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnBsYXllcnNbdGhpcy5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKXtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBwbGF5ZXIgYWxyZWFkeSBleGlzdHMuXHJcbiAgICBpZihkYXRhLmlkIGluIHRoaXMucGxheWVycykgcmV0dXJuO1xyXG5cclxuICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGRhdGEpO1xyXG4gICAgdGhpcy5lbnRpdGllcy5wdXNoKG5ld1BsYXllcik7XHJcbiAgICB0aGlzLnBsYXllcnNbZGF0YS5pZF0gPSBuZXdQbGF5ZXI7XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcblxyXG4gICAgcmV0dXJuIG5ld1BsYXllcjtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnJlbW92ZVBsYXllciA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2FtZSByZW1vdmluZyBwbGF5ZXJcIiwgZGF0YSk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gcGxheWVycyBvYmplY3RcclxuICAgIGRlbGV0ZSB0aGlzLnBsYXllcnNbZGF0YS5pZF07XHJcblxyXG4gICAgLy8gcmVtb3ZlIGZyb20gZW50aXRpdGVzIGFycmF5XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW50aXRpZXNbaV0uaWQgPT09IGRhdGEuaWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmb3VuZCBoaW0gLCByZW1vdmluZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdldEdhbWVTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAvLyBlbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZW50aXR5OlwiLCBlbnRpdHkpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZW50aXR5KTtcclxuICAgICAgICAvLyB9KSxcclxuICAgICAgICBlbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbnRpdHkuZ2V0RnVsbFN0YXRlKCk7ICAgICAgICB9KSxcclxuICAgICAgICAvL3BsYXllcnM6IE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBKU09OLnN0cmluZ2lmeSh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0pOyB9KVxyXG4gICAgICAgIHBsYXllcnM6IHRoaXMuZ2V0UGxheWVyc1N0YXRlKClcclxuICAgIH07XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRQbGF5ZXJzU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gd2luZG93LmdhbWUucGxheWVyc1trZXldLmdldEZ1bGxTdGF0ZSgpOyB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiZnVuY3Rpb24gS2V5Ym9hcmQocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICAvL3RoaXMubGFzdFN0YXRlID0gXy5jbG9uZShwbGF5ZXIua2V5cyk7XG4gICAgdGhpcy5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgIT09IHRydWUpICBwbGF5ZXIua1VwPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gIT09IHRydWUpICBwbGF5ZXIua0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgIT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ICE9PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ5OiAvLyAxXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMCxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1MDogLy8gMlxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleCA9PT0gMSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiY2hhbmdlV2VhcG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODI6IC8vIFJcbiAgICAgICAgICAgICAgICAvLyByZWxvYWQgb25seSBpZiBwbGF5ZXIgaXMgYWxpdmUgYW5kIHdlYXBvbiBtYWdhemluZSBpc250IGZ1bGxcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmFsaXZlICYmIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XS5idWxsZXRzIDwgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLm1hZ2F6aW5lU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmtleVVwSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgPT09IHRydWUpIHBsYXllci5rVXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gPT09IHRydWUpIHBsYXllci5rRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ID09PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ID09PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwidmFyIGxldmVsMSA9IHJlcXVpcmUoXCIuL2RhdGEvbGV2ZWwxXCIpO1xyXG4vL3ZhciBUaWxlID0gcmVxdWlyZShcIi4vVGlsZVwiKTtcclxuXHJcbmZ1bmN0aW9uIExldmVsKHRpbGVzaGVldCl7XHJcbiAgICB0aGlzLnRpbGVzaGVldCA9IHRpbGVzaGVldDtcclxuICAgIHRoaXMudGlsZVNpemUgPSAzMjtcclxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDE7XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGggKiB0aGlzLnRpbGVTaXplO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmNvbFRpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXNbMF0ubGVuZ3RoO1xyXG4gICAgdGhpcy5yb3dUaWxlQ291bnQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aDtcclxuICAgIHRoaXMuaW1hZ2VOdW1UaWxlcyA9IDM4NCAvIHRoaXMudGlsZVNpemU7ICAvLyBUaGUgbnVtYmVyIG9mIHRpbGVzIHBlciByb3cgaW4gdGhlIHRpbGVzZXQgaW1hZ2VcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBUaWxlc1xyXG5cclxuXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGN0eCkge1xyXG5cclxuICAgICAgICAvL2RyYXcgYWxsIHRpbGVzXHJcbiAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLnJvd1RpbGVDb3VudDsgcm93ICs9IDEpIHtcclxuICAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbFRpbGVDb3VudDsgY29sICs9IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMubGV2ZWwudGlsZXNbcm93XVtjb2xdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVSb3cgPSAodGlsZSAvIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwOyAvLyBCaXR3aXNlIE9SIG9wZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVDb2wgPSAodGlsZSAlIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy50aWxlc2hlZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVDb2wgKiB0aGlzLnRpbGVTaXplKSxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZVJvdyAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChjb2wgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS54KSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChyb3cgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUpO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xyXG4iLCJmdW5jdGlvbiBNb3VzZShwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuXG4gICAgdGhpcy5jbGljayA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICB0aGlzLnBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJzaG9vdFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYLFxuICAgICAgICAgICAgICAgIHk6IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMucHVzaChhY3Rpb24pOyAvLyB0ZWxsIHRoZSBob3N0IG9mIHRoZSBhY3Rpb25cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWCA9IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYO1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVkgPSB3aW5kb3cuZ2FtZS5jYW1lcmEueSArIGUub2Zmc2V0WTtcbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLm1vdXNlTGVmdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ID09PSB0cnVlKSBwbGF5ZXIubW91c2VMZWZ0ICA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZCBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB2YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIHZhciByID0gMTUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBnID0gNTAgLSBybmQ7XHJcbiAgICAgICAgdmFyIGIgPSA1MCAtIHJuZDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwicmdiKFwiICsgciArIFwiLFwiICsgZyArIFwiLFwiICsgYiArIFwiKVwiO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMztcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA0MDtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbkJsb29kLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuXHJcbiAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9vZDtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZDIgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwiIzgwMjkyOVwiO1xyXG4gICAgICAgIC8vZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAzO1xyXG5cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5CbG9vZDIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJsb29kMjtcclxuIiwiLy92YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIEJsb29kID0gcmVxdWlyZShcIi4vQmxvb2RcIik7XHJcbnZhciBCbG9vZDIgPSByZXF1aXJlKFwiLi9CbG9vZDJcIik7XHJcblxyXG5mdW5jdGlvbiBFbWl0dGVyKGRhdGEpIHtcclxuICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZTtcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICB0aGlzLmVtaXRTcGVlZCA9IGRhdGEuZW1pdFNwZWVkOyAvLyBzXHJcbiAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXRDb3VudCA9IGRhdGEuZW1pdENvdW50O1xyXG4gICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICB0aGlzLmxpZmVUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXQoKTtcclxufVxyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBlbWl0dGVyOiB0aGlzXHJcbiAgICB9O1xyXG4gICAgaWYgKHRoaXMudHlwZSA9PT0gXCJCbG9vZFwiKSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQmxvb2QoZGF0YSkpO1xyXG4gICAgaWYgKHRoaXMudHlwZSA9PT0gXCJCbG9vZDJcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kMihkYXRhKSk7XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuICAgIC8vIC8vIHVwZGF0ZSBhbGwgcGFydGljbGVzXHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAvLyAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKGR0KTtcclxuICAgIC8vIH1cclxuXHJcblxyXG4gICAgLy8gU0VUIEVNSVRURVIgLSB0aGlzIGlzIGFuIGVtaXR0ZXIgdGhhdCBzaG91bGQgZW1pdCBhIHNldCBudW1iZXIgb2YgcGFydGljbGVzXHJcbiAgICBpZiAodGhpcy5lbWl0Q291bnQpIHtcclxuICAgICAgICBpZiAodGhpcy5lbWl0U3BlZWQpIHsgLy8gRW1pdCBhdCBhIGludGVydmFsXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdFRpbWVyICs9IGR0O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbWl0VGltZXIgPiB0aGlzLmVtaXRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5lbWl0Q291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbWl0Q291bnQgPCAxKXtcclxuICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZXN0cm95XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIEVtaXQgYWxsIGF0IG9uY2VcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7aSA8IHRoaXMuZW1pdENvdW50OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUSU1FRCBFTUlUVEVSXHJcbiAgICAvLyB1cGRhdGUgZW1pdHRlciBsaWZldGltZSAoaWYgaXQgaGFzIGEgbGlmZXRpbWUpIHJlbW92ZSBlbWl0dGVyIGlmIGl0cyB0aW1lIGhhcyBydW4gb3V0IGFuZCBpdCBoYXMgbm8gcmVtYWluaW5nIHBhcnRpY2xlc1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgICAgICBpZiAodGhpcy5saWZlVGltZXIgPiB0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDT05USU5VT1VTIEVNSVRURVJcclxuICAgIC8vIGVtaXQgbmV3IHBhcnRpY2xlcyBmb3JldmVyXHJcbiAgICB0aGlzLmVtaXRUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmVtaXRUaW1lciA+IHRoaXMuZW1pdFNwZWVkKSB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gLy8gcmVuZGVyIGFsbCBwYXJ0aWNsZXNcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIC8vICAgICB0aGlzLnBhcnRpY2xlc1tpXS5yZW5kZXIoKTtcclxuICAgIC8vIH1cclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcclxuIiwiLy92YXIgRW50aXR5ID0gcmVxdWlyZShcIi4uLy4vRW50aXR5XCIpO1xyXG5cclxuY2xhc3MgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcclxuICAgICAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICAgICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWUgPSBkYXRhLmxpZmVUaW1lO1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWVyID0gMDtcclxuICAgICAgICB0aGlzLmVtaXR0ZXIgPSBkYXRhLmVtaXR0ZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFBhcnRpY2xlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuLy8gICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4vLyAgICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4vLyAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbi8vICAgICB9XHJcbi8vIH07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIC8vdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uKTsgLy8gcm90YXRlXHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoLSh0aGlzLnNpemUgLyAyKSwgLSh0aGlzLnNpemUgLyAyKSwgdGhpcy5zaXplLCB0aGlzLnNpemUpO1xyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgdGhpcy5lbWl0dGVyLnBhcnRpY2xlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHt9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZTtcclxuIiwiLy8gdmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9LZXlib2FyZFwiKTtcbnZhciBOZXR3b3JrQ29udHJvbHMgPSByZXF1aXJlKFwiLi9OZXR3b3JrQ29udHJvbHNcIik7XG4vL3ZhciBCdWxsZXQgPSByZXF1aXJlKFwiLi9CdWxsZXRcIik7XG4vL3ZhciB3ZWFwb25zID0gcmVxdWlyZShcIi4vZGF0YS93ZWFwb25zXCIpO1xuLy92YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vd2VhcG9ucy9XZWFwb25cIik7XG52YXIgU2hvdGd1biA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvU2hvdGd1blwiKTtcbnZhciBBazQ3ID0gcmVxdWlyZShcIi4vd2VhcG9ucy9BazQ3XCIpO1xuLy92YXIgQW5pbWF0aW9uID0gcmVxdWlyZShcIi4vQW5pbWF0aW9uXCIpO1xudmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuL0VudGl0eVwiKTtcbnZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vcGFydGljbGUvRW1pdHRlclwiKTtcbnZhciB3ZWFwb25DcmVhdG9yID0gcmVxdWlyZShcIi4vd2VhcG9ucy93ZWFwb25DcmVhdG9yXCIpO1xuXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xuICAgIHRoaXMuaWQgPSBwbGF5ZXJEYXRhLmlkO1xuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7IC8vIGNpcmNsZSByYWRpdXNcbiAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHRoaXMueSA9IHBsYXllckRhdGEueSB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gcGxheWVyRGF0YS5kaXJlY3Rpb24gfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDE7XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcbiAgICB0aGlzLnNwZWVkID0gcGxheWVyRGF0YS5zcGVlZCB8fCAxMDA7IC8vcGl4ZWxzIHBlciBzZWNvbmRcbiAgICB0aGlzLmhwID0gcGxheWVyRGF0YS5ocCB8fCAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHBsYXllckRhdGEuYWxpdmUgfHwgdHJ1ZTtcblxuICAgIHRoaXMuc3ggPSAwO1xuICAgIHRoaXMuc3kgPSAwO1xuICAgIHRoaXMuc3cgPSA2MDtcbiAgICB0aGlzLnNoID0gNjA7XG4gICAgdGhpcy5kdyA9IDYwO1xuICAgIHRoaXMuZGggPSA2MDtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb24gb24gbGV2ZWxcbiAgICB0aGlzLnRpbGVSb3cgPSAwO1xuICAgIHRoaXMudGlsZUNvbCA9IDA7XG5cbiAgICB0aGlzLndlYXBvbnMgPSBbXTtcbiAgICAvLyByZWNyZWF0ZSB3ZWFwb25zIGlmIHRoZSBwbGF5ZXIgaGFzIGFueSBlbHNlIGNyZWF0ZSBuZXcgd2VhcG9uc1xuICAgIGlmIChwbGF5ZXJEYXRhLndlYXBvblN0YXRlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVyRGF0YS53ZWFwb25TdGF0ZS5sZW5ndGg7IGkrPSAxKSB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnMucHVzaCh3ZWFwb25DcmVhdG9yKHRoaXMsIHBsYXllckRhdGEud2VhcG9uU3RhdGVbaV0pKTtcbiAgICAgICAgfVxuICAgIH1lbHNlIHtcbiAgICAgICAgdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG4gICAgfVxuXG4gICAgLy90aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcblxuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IHBsYXllckRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleCB8fCAwO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcblxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGVyZm9ybUFjdGlvbih0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zLnB1c2godGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmFsaXZlKSByZXR1cm47XG5cblxuICAgIC8vIHRoaXMudGlsZVJvdyA9IE1hdGguZmxvb3IodGhpcy55IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpO1xuICAgIC8vIHRoaXMudGlsZUNvbCA9IE1hdGguZmxvb3IodGhpcy54IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpO1xuXG4gICAgdGhpcy5tb3ZlKGR0KTtcblxuXG4gICAgLy9jaGVjayBpZiBvZmYgc2NyZWVuXG4gICAgaWYgKHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKSB0aGlzLnggPSB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aDtcbiAgICBpZiAodGhpcy54IDwgMCkgdGhpcy54ID0gMDtcbiAgICBpZiAodGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB0aGlzLnkgPSB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQ7XG4gICAgaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG5cbiAgICAvLyB1cGRhdGUgY3VycmVudCB3ZWFwb247XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0udXBkYXRlKGR0KTtcblxuICAgIC8vdGhpcy5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZShkdCk7XG5cbiAgICBpZiAodGhpcy5tb3VzZUxlZnQpIHsgLy8gaWYgZmlyaW5nXG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwiZmlyZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW91c2VYLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMubW91c2VZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR0KSB7XG5cbiAgICAvLyB2YXIgb2xkWCA9IHRoaXMueDtcbiAgICAvLyB2YXIgb2xkWSA9IHRoaXMueTtcblxuICAgIC8vIFVwZGF0ZSBtb3ZlbWVudFxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICBpZiAodGhpcy5rVXAgJiYgdGhpcy5rTGVmdCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgdGhpcy55IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy54IC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCAtPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwICYmIHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZIC09IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYICs9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICB0aGlzLnkgKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VZICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLnggLT0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYIC09IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgdGhpcy55ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy54ICs9IGRpc3RhbmNlO1xuICAgICAgICB0aGlzLm1vdXNlWCArPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwKSB7XG4gICAgICAgIHRoaXMueSAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duKSB7XG4gICAgICAgIHRoaXMueSArPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVkgKz0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtMZWZ0KSB7XG4gICAgICAgIHRoaXMueCAtPSBkaXN0YW5jZTtcbiAgICAgICAgdGhpcy5tb3VzZVggLT0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtSaWdodCkge1xuICAgICAgICB0aGlzLnggKz0gZGlzdGFuY2U7XG4gICAgICAgIHRoaXMubW91c2VYICs9IGRpc3RhbmNlO1xuICAgIH1cbn07XG5cbi8vIC8vIENvbGxpc2lvbiBjaGVjayBhZ2FpbnN0IHN1cnJvdW5kaW5nIHRpbGVzXG4vLyBQbGF5ZXIucHJvdG90eXBlLmNvbGxpc2lvbkNoZWNrID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgdmFyIHN0YXJ0aW5nUm93ID0gdGhpcy50aWxlUm93IC0gMTtcbi8vICAgICBpZiAoc3RhcnRpbmdSb3cgPCAwKSBzdGFydGluZ1JvdyAgPSAwO1xuLy8gICAgIHZhciBlbmRSb3cgPSB0aGlzLnRpbGVSb3cgKzE7XG4vLyAgICAgaWYgKGVuZFJvdyA+IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudCkgZW5kUm93ID0gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50O1xuLy8gICAgIHZhciBzdGFydGluZ0NvbCA9IHRoaXMudGlsZUNvbCAtMTtcbi8vICAgICBpZiAoc3RhcnRpbmdDb2wgPCAwKSBzdGFydGluZ0NvbCA9IDA7XG4vLyAgICAgdmFyIGVuZENvbCA9IHRoaXMudGlsZUNvbCArMTtcbi8vICAgICBpZiAoZW5kQ29sID4gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50KSBlbmRDb2wgPSB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQ7XG4vL1xuLy8gICAgIGZvciAodmFyIHJvdyA9IHN0YXJ0aW5nUm93OyByb3cgPCBlbmRSb3c7IHJvdyArPSAxKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGNvbCA9IHN0YXJ0aW5nQ29sOyBjb2wgPCBlbmRDb2w7IGNvbCArPSAxKSB7XG4vLyAgICAgICAgICAgICBpZiAod2luZG93LmdhbWUubGV2ZWwubGV2ZWwudGlsZXNbcm93XVtjb2xdID09PSAwKSBjb250aW51ZTsgLy8gZXZlcnkgdGlsZSBvdGhlciB0aGFuIDAgYXJlIG5vbiB3YWxrYWJsZVxuLy8gICAgICAgICAgICAgLy8gY29sbGlzaW9uXG4vLyAgICAgICAgICAgICBpZiAodGhpcy50aWxlUm93ID09PSByb3cgJiYgdGhpcy50aWxlQ29sID09PSBjb2wpIHtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHRydWU7XG4vLyB9O1xuXG5QbGF5ZXIucHJvdG90eXBlLm5ldHdvcmtVcGRhdGUgPSBmdW5jdGlvbih1cGRhdGUpe1xuICAgIGRlbGV0ZSB1cGRhdGUuaWQ7XG4gICAgLy8gbmV0d29ya1VwZGF0ZVxuICAgIGZvciAodmFyIGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJhY3Rpb25zXCIpIHRoaXNba2V5XSA9IHRoaXNba2V5XS5jb25jYXQodXBkYXRlW2tleV0pO1xuICAgICAgICBlbHNlIHRoaXNba2V5XSA9IHVwZGF0ZVtrZXldO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGVyZm9ybUFjdGlvbiA9IGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgc3dpdGNoKGFjdGlvbi5hY3Rpb24pe1xuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcbiAgICAgICAgICAgIHRoaXMudHVyblRvd2FyZHMoYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImZpcmVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5maXJlKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJkaWVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpZShhY3Rpb24pO1xuICAgICAgICAgICAgLy9icmVhaztcbiAgICAgICAgY2FzZSBcInJlc3Bhd25cIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc3Bhd24oYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcImNoYW5nZVdlYXBvblwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlV2VhcG9uKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJyZWxvYWRcIjpcbiAgICB9ICAgICAgIHJldHVybiB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5yZWxvYWQoYWN0aW9uKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICBpZighdGhpcy5hbGl2ZSkgcmV0dXJuO1xuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcblxuICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3gsIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcblxufTtcblxuUGxheWVyLnByb3RvdHlwZS50dXJuVG93YXJkcyA9IGZ1bmN0aW9uKHgseSkge1xuICAgIHZhciB4RGlmZiA9IHggLSB0aGlzLng7XG4gICAgdmFyIHlEaWZmID0geSAtIHRoaXMueTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKTsvLyAqICgxODAgLyBNYXRoLlBJKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudGFrZURhbWFnZSA9IGZ1bmN0aW9uKGRhbWFnZSwgZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5ocCAtPSBkYW1hZ2U7XG4gICAgaWYgKHRoaXMuaHAgPD0gMCkge1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwiZGllXCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3RvcFJlbG9hZCgpO1xuXG5cbiAgICAvLyAvLyBjcmVhdGUgYSBjb3Jwc2VcbiAgICAvLyB2YXIgY29ycHNlID0gbmV3IEVudGl0eSh7XG4gICAgLy8gICAgIHg6IHRoaXMueCArIE1hdGguY29zKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAvLyAgICAgeTogdGhpcy55ICsgTWF0aC5zaW4oYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgIC8vICAgICBzeDogNjAgKyggTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKiA2MCksXG4gICAgLy8gICAgIHN5OiAxMjAsXG4gICAgLy8gICAgIHN3OiA2MCxcbiAgICAvLyAgICAgc2g6IDYwLFxuICAgIC8vICAgICBkdzogNjAsXG4gICAgLy8gICAgIGRoOiA2MCxcbiAgICAvLyAgICAgZGlyZWN0aW9uOiBhY3Rpb24uZGF0YS5kaXJlY3Rpb24sXG4gICAgLy8gICAgIGN0eDogd2luZG93LmdhbWUuYmdDdHhcbiAgICAvLyB9KTtcbiAgICAvL3dpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2goY29ycHNlKTtcblxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICBlbWl0Q291bnQ6IDMwLFxuICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH0pKTtcblxuXG5cbn07XG5cblBsYXllci5wcm90b3R5cGUucmVzcGF3biA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMueCA9IGFjdGlvbi5kYXRhLng7XG4gICAgdGhpcy55ID0gYWN0aW9uLmRhdGEueTtcbiAgICB0aGlzLmhwID0gMTAwO1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuXG4gICAgLy8gcmVmaWxsIGFsbCB3ZWFwb25zXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlYXBvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW2ldLmZpbGxNYWdhemluZSgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5jaGFuZ2VXZWFwb24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zdG9wUmVsb2FkKCk7XG4gICAgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4ID0gYWN0aW9uLmRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueSxcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGhwOiB0aGlzLmhwLFxuICAgICAgICBhbGl2ZTogdGhpcy5hbGl2ZSxcbiAgICAgICAgcmFkaXVzOiB0aGlzLnJhZGl1cyxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAgdmlld2luZ0FuZ2xlOiB0aGlzLnZpZXdpbmdBbmdsZSxcbiAgICAgICAgc3BlZWQ6IHRoaXMuc3BlZWQsXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWSxcbiAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4LFxuICAgICAgICB3ZWFwb25TdGF0ZTogdGhpcy5nZXRXZWFwb25TdGF0ZSgpXG4gICAgfTtcbn07XG5cbi8vIFRoZSBzdGF0ZSB0aGUgY2xpZW50IHNlbmRzIHRvIHRoZSBob3N0XG5QbGF5ZXIucHJvdG90eXBlLmdldENsaWVudFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWVxuICAgIH07XG59O1xuXG4vLyBnZXQgdGhlIHN0YXRlIG9mIGVhY2ggd2VhcG9uXG5QbGF5ZXIucHJvdG90eXBlLmdldFdlYXBvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlYXBvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3RhdGUucHVzaCh0aGlzLndlYXBvbnNbaV0uZ2V0U3RhdGUoKSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCIvLyB2YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcclxuLy8gdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xyXG4vL1xyXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlL0VtaXR0ZXJcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFVpKGdhbWUpe1xyXG4gICAgdGhpcy5jbGllbnRMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJzXCIpO1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUNsaWVudExpc3QgPSBmdW5jdGlvbihwbGF5ZXJzKSB7XHJcbiAgICAgICAgdmFyIG15SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkO1xyXG4gICAgICAgIHRoaXMuY2xpZW50TGlzdC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIGZvciAodmFyIGlkIGluIHBsYXllcnMpe1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQgKyBcIiBcIiArIHBsYXllcnNbaWRdLnBpbmcpO1xyXG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyRGVidWcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IFwiMTJweCBPcGVuIFNhbnNcIjtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZDdkN2Q3XCI7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiRlBTOiAgXCIgKyB3aW5kb3cuZ2FtZS5mcHMsIDUsIDIwKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQSU5HOiBcIiArIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZywgNSwgMzQpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkNBTUVSQTogXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS54KSArIFwiLCBcIiArIE1hdGguZmxvb3Iod2luZG93LmdhbWUuY2FtZXJhLnkpLCA1LCA0OCk7XHJcbiAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQTEFZRVI6ICBcIiArIE1hdGguZmxvb3IocGxheWVyLngpICsgXCIsIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIueSksIDUsIDYyKTtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiTU9VU0U6IFwiICsgTWF0aC5mbG9vcihwbGF5ZXIubW91c2VYKSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWSksIDUsIDc2KTtcclxuICAgICAgICAgICAgaWYocGxheWVyKSB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJESVI6IFwiICsgcGxheWVyLmRpcmVjdGlvbi50b0ZpeGVkKDIpLCA1LCA5MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBBUlRJQ0xFUzogXCIgKyB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMubGVuZ3RoLCA1LCAxMDQpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gXCIyNHB4IE9wZW4gU2Fuc1wiO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclVJICA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xyXG4gICAgICAgIGlmICghcGxheWVyKSByZXR1cm47XHJcblxyXG5cclxuICAgICAgICAvL2d1aSBiZyBjb2xvclxyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCgwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsIDE0MCwgMzUpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4zNSlcIjtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgZ3JhZGllbnRcclxuICAgICAgICB2YXIgZ3JkPSB3aW5kb3cuZ2FtZS5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMTQwLDAsMTkwLDApO1xyXG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMCxcInJnYmEoMCwwLDAsMC4zNSlcIik7XHJcbiAgICAgICAgZ3JkLmFkZENvbG9yU3RvcCgxLFwicmdiYSgwLDAsMCwwKVwiKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlPWdyZDtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFJlY3QoMTQwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsNTAsMzUpO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHZhciB3ZWFwb24gPSAgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdO1xyXG4gICAgICAgIC8vIGRyYXcgd2VhcG9uIGljb25cclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB3ZWFwb24uaWNvblN4LCB3ZWFwb24uaWNvblN5LCB3ZWFwb24uaWNvblcsIHdlYXBvbi5pY29uSCwgOTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMywgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgpO1xyXG4gICAgICAgIC8vIGRyYXcgbWFnYXppbmUgY291bnQnXHJcbiAgICAgICAgaWYgKHdlYXBvbi5yZWxvYWRpbmcpIHtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgODUsIDIxNCwgMjEsIDIyLCAxMjUsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMCwgMjEsIDIyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMjUpXCI7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh3ZWFwb24uYnVsbGV0cywgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNlN2QyOWVcIjtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHdlYXBvbi5idWxsZXRzLCAgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIGRyYXcgaGVhcnRcclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCAwLCAyMjgsIDEzLCAxMiwgMTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAyMywgMTMsIDEyKTtcclxuICAgICAgICAvLyBkcmF3IEhQXHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjI1KVwiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXNwYXduQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcclxuXHJcbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIHtcclxuICAgICAgICAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG4gICAgICAgICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZWxvYWRCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xyXG4gICAgICAgIGlmIChwbGF5ZXIuYWxpdmUpIHtcclxuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlbG9hZFwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgKCFwbGF5ZXIuYWxpdmUpIHtcclxuICAgICAgICAvLyAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG4gICAgICAgIC8vICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcclxuICAgICAgICAvLyAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXHJcbiAgICAgICAgLy8gICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAvLyAgICAgICAgICAgICB5OiB5XHJcbiAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgIH0pO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNlbWl0dGVyQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XHJcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJCbG9vZDJcIixcclxuICAgICAgICAgICAgICAgIGVtaXRDb3VudDogMTAsXHJcbiAgICAgICAgICAgICAgICBlbWl0U3BlZWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB4OiBwbGF5ZXIueCxcclxuICAgICAgICAgICAgICAgIHk6IHBsYXllci55XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9KTtcclxufTtcclxuIiwidmFyIGxldmVsID0ge1xyXG4gICAgbmFtZTogXCJsZXZlbDFcIixcclxuICAgIHRpbGVzOiBbXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwyLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMiwyLDIsMiwyLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDEsMiwyLDIsMSwyLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwxLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsZXZlbDtcclxuIiwidmFyIEFrNDcgPSB7XHJcbiAgICBcIm5hbWVcIjogXCJBazQ3XCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAzMCwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDMwLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjEsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogMSwgLy8gc2hvb3QgMSBidWxsZXQgYXQgYSB0aW1lXHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDE3MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogMCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogMjEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMFxyXG59O1xyXG5cclxudmFyIHNob3RndW4gPSB7XHJcbiAgICBcIm5hbWVcIjogXCJzaG90Z3VuXCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAxMiwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDEyLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjUsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogNCwgLy8gNCBzaG90Z3VuIHNsdWdzIHBlciBzaG90XHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDI1MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogNjAsIC8vIHNwcml0ZXNoZWV0IHkgcG9zaXRpb25cclxuICAgIFwiaWNvblN4XCI6IDUxLFxyXG4gICAgXCJpY29uU3lcIjogMjEwLFxyXG4gICAgXCJpY29uV1wiOiAzMCxcclxuICAgIFwiaWNvbkhcIjogMzBcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQWs0NzogQWs0NyxcclxuICAgIHNob3RndW46IHNob3RndW5cclxufTtcclxuIiwiLy8gZGVncmVlcyB0byByYWRpYW5zXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XG4gICAgcmV0dXJuIGRlZyAqIChNYXRoLlBJIC8gMTgwKTtcbn1cblxuLy8gcmFkaWFucyB0byBkZWdyZWVzXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlcyxcbn07XG4iLCJ2YXIgR2FtZSA9IHJlcXVpcmUoXCIuL0dhbWUuanNcIik7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lLnN0YXJ0KCk7XHJcbn0pO1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuQWs0NztcclxuXHJcbmNsYXNzIEFrNDcgZXh0ZW5kcyBXZWFwb257XHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XHJcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xyXG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBazQ3O1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuc2hvdGd1bjtcclxudmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldFwiKTtcclxuXHJcbmNsYXNzIFNob3RndW4gZXh0ZW5kcyBXZWFwb257XHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XHJcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xyXG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuU2hvdGd1bi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG5cclxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYnVsbGV0cyAtPSAxO1xyXG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xyXG5cclxuICAgIHZhciBkaXJlY3Rpb25zID0gW107XHJcbiAgICB2YXIgZGlyZWN0aW9uO1xyXG5cclxuICAgIC8vIHNob290IDQgYnVsbGV0c1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHNQZXJTaG90OyBpICs9IDEpIHtcclxuXHJcbiAgICAgICAgaWYgKCFhY3Rpb24uZGF0YS5kaXJlY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIC8vIHJhbmRvbWl6ZSBkaXJlY3Rpb25zIG15c2VsZlxyXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLm93bmVyLmRpcmVjdGlvbiArIE1hdGgucmFuZG9tKCkgKiAwLjI1IC0gMC4xMjU7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvbnMucHVzaChkaXJlY3Rpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IGFjdGlvbi5kYXRhLmRpcmVjdGlvbnNbaV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBCdWxsZXQoe1xyXG4gICAgICAgICAgICB4OiB0aGlzLm93bmVyLngsXHJcbiAgICAgICAgICAgIHk6IHRoaXMub3duZXIueSxcclxuICAgICAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb24sXHJcbiAgICAgICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxyXG4gICAgICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiRklSRVwiLCBhY3Rpb24sIGRpcmVjdGlvbnMpO1xyXG4gICAgYWN0aW9uLmRhdGEuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnM7XHJcblxyXG5cclxuICAgIHJldHVybiBhY3Rpb247XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNob3RndW47XHJcbiIsInZhciBCdWxsZXQgPSByZXF1aXJlKFwiLi4vLi9CdWxsZXRcIik7XHJcblxyXG5jbGFzcyBXZWFwb257XHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZGF0YSkge1xyXG4gICAgICAgIHRoaXMub3duZXIgPSBvd25lcjtcclxuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5tYWdhemluZVNpemUgPSBkYXRhLm1hZ2F6aW5lU2l6ZTtcclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBkYXRhLmJ1bGxldHM7XHJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IGRhdGEuZmlyZVJhdGU7XHJcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcclxuICAgICAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XHJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XHJcbiAgICAgICAgdGhpcy5idWxsZXRzUGVyU2hvdCA9IGRhdGEuYnVsbGV0c1BlclNob3Q7XHJcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XHJcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvblN4ID0gZGF0YS5pY29uU3g7XHJcbiAgICAgICAgdGhpcy5pY29uU3kgPSBkYXRhLmljb25TeTtcclxuICAgICAgICB0aGlzLmljb25XID0gZGF0YS5pY29uVztcclxuICAgICAgICB0aGlzLmljb25IID0gZGF0YS5pY29uSDtcclxuXHJcbiAgICAgICAgdGhpcy5maXJlVGltZXIgPSB0aGlzLmZpcmVSYXRlO1xyXG5cclxuICAgICAgICB0aGlzLnJlbG9hZGluZyA9IGRhdGEucmVsb2FkaW5nIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgPSBkYXRhLnJlbG9hZFRpbWVyIHx8IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbldlYXBvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUpIHRoaXMuZmlyZVRpbWVyICs9IGR0O1xyXG5cclxuICAgIGlmICh0aGlzLnJlbG9hZGluZykge1xyXG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgKz0gZHQ7XHJcbiAgICAgICAgaWYgKHRoaXMucmVsb2FkVGltZXIgPiB0aGlzLnJlbG9hZFRpbWUpe1xyXG4gICAgICAgICAgICB0aGlzLmZpbGxNYWdhemluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BSZWxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5XZWFwb24ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcclxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYnVsbGV0cyAtPSB0aGlzLmJ1bGxldHNQZXJTaG90O1xyXG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xyXG5cclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEJ1bGxldCh7XHJcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxyXG4gICAgICAgIHk6IHRoaXMub3duZXIueSxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uLFxyXG4gICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxyXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcclxuICAgIH0pKTtcclxuICAgIHJldHVybiBhY3Rpb247XHJcbn07XHJcblxyXG5XZWFwb24ucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgdGhpcy5yZWxvYWRpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XHJcbiAgICByZXR1cm4gYWN0aW9uO1xyXG59O1xyXG5cclxuV2VhcG9uLnByb3RvdHlwZS5maWxsTWFnYXppbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYnVsbGV0cyA9IHRoaXMubWFnYXppbmVTaXplO1xyXG59O1xyXG5cclxuV2VhcG9uLnByb3RvdHlwZS5zdG9wUmVsb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJlbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XHJcbn07XHJcblxyXG5XZWFwb24ucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICBidWxsZXRzOiB0aGlzLmJ1bGxldHMsXHJcbiAgICAgICAgZmlyZVRpbWVyOiB0aGlzLmZpcmVSYXRlLFxyXG4gICAgICAgIHJlbG9hZGluZzogdGhpcy5yZWxvYWRpbmcsXHJcbiAgICAgICAgcmVsb2FkVGltZXI6IHRoaXMucmVsb2FkVGltZXJcclxuICAgIH07XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gV2VhcG9uO1xyXG4iLCJ2YXIgU2hvdGd1biA9IHJlcXVpcmUoXCIuLi8uL3dlYXBvbnMvU2hvdGd1blwiKTtcclxudmFyIEFrNDcgPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL0FrNDdcIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKTtcclxuXHJcbmZ1bmN0aW9uIHdlYXBvbkNyZWF0b3Iob3duZXIsIGRhdGEpIHtcclxuXHJcbiAgICB2YXIgd2VwRGF0YSA9IHdlYXBvbkRhdGFbZGF0YS5uYW1lXTtcclxuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7IHdlcERhdGFba2V5XSA9IGRhdGFba2V5XTsgfVxyXG5cclxuICAgIHN3aXRjaCAoZGF0YS5uYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIkFrNDdcIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBazQ3KG93bmVyLCB3ZXBEYXRhKTtcclxuICAgICAgICBjYXNlIFwic2hvdGd1blwiOlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNob3RndW4ob3duZXIsIHdlcERhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdlYXBvbkNyZWF0b3I7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gdmFyIFBsYXllciA9IHJlcXVpcmUoXCIuLy4uL1BsYXllclwiKTtcblxuZnVuY3Rpb24gQ2xpZW50KCl7XG4gICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcblxuICAgIC8vIFN0cmVzcyB0ZXN0XG4gICAgdGhpcy50ZXN0c1JlY2VpdmVkID0gMDtcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdOy8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBhY3Rpb25zIGZyb20gdGhlIGhvc3RcbiAgICB0aGlzLmNoYW5nZXMgPSBbXTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGNoYW5nZXMgZnJvbSB0aGUgaG9zdFxuXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAvLyBpdmUgZ290IG15IHBlZXJJRCBhbmQgZ2FtZUlELCBsZXRzIHNlbmQgaXQgdG8gdGhlIHNlcnZlciB0byBqb2luIHRoZSBob3N0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuc29ja2V0LmVtaXQoXCJqb2luXCIsIHtwZWVySUQ6IGlkLCBnYW1lSUQ6IHdpbmRvdy5nYW1lLmdhbWVJRH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuXG4gICAgICAgIC8vIGNsb3NlIG91dCBhbnkgb2xkIGNvbm5lY3Rpb25zXG4gICAgICAgIGlmKE9iamVjdC5rZXlzKHRoaXMuY29ubmVjdGlvbnMpLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgY29ublBlZXIgaW4gdGhpcy5jb25uZWN0aW9ucyl7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5QZWVyICE9PSBjb25uLnBlZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl1bMF0uY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgb2xkIGhvc3RzIHBsYXllciBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImRlbGV0ZSBvbGQgcGxheWVyXCIsIGNvbm5QZWVyKTtcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgd2luZG93LmdhbWUucGxheWVyc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHN0b3JlIGl0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xuXG4gICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcbiAgICAgICAgICAgICAgICBjYXNlIFwicGxheWVySm9pbmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyBjYXNlIFwicGxheWVyTGVmdFwiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHdpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGRhdGEuaWR9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImdhbWVTdGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICBkYXRhLmdhbWVTdGF0ZS5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24ocGxheWVyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcihwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiY2hhbmdlc1wiOiAvLyBjaGFuZ2VzIGFuZCBhY3Rpb25zIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5jb25jYXQoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5jb25jYXQoZGF0YS5hY3Rpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOiAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgICAgICAgICAgICAgICAgZGF0YS5waW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbcGluZy5pZF0ucGluZyA9IHBpbmcucGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF0ucGluZztcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHdpbmRvdy5nYW1lLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG59XG5cbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHZhciBsYXN0Q2xpZW50U3RhdGUgPSBwbGF5ZXIubGFzdENsaWVudFN0YXRlO1xuICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RDbGllbnRTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuXG4gICAgLy8gYWRkIGFueSBwZXJmb3JtZWQgYWN0aW9ucyB0byBjaGFuZ2UgcGFja2FnZVxuICAgIGlmIChwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgIH1cblxuICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXMsIHNlbmQgZW0gdG8gaG9zdFxuICAgICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgICAgICAgICBldmVudDogXCJuZXR3b3JrVXBkYXRlXCIsXG4gICAgICAgICAgICB1cGRhdGVzOiBjaGFuZ2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBsYXllci5sYXN0Q2xpZW50U3RhdGUgPSBjdXJyZW50U3RhdGU7XG5cblxuXG5cbiAgICAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXTtcblxuICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZS5pZCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5pZF0ubmV0d29ya1VwZGF0ZShjaGFuZ2UpO1xuICAgICAgICAgICAgfWNhdGNoIChlcnIpIHtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZXMgPSBbXTtcbiAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuXG5cblxuICAgIC8vIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgLy8gdmFyIG15UGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIC8vIGlmICghbXlQbGF5ZXIpIHJldHVybjtcbiAgICAvL1xuICAgIC8vICBpZiAoIV8uaXNFcXVhbChteVBsYXllci5rZXlzLCBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUpKSB7XG4gICAgLy8gICAgIC8vIHNlbmQga2V5c3RhdGUgdG8gaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJrZXlzXCIsXG4gICAgLy8gICAgICAgICBrZXlzOiBteVBsYXllci5rZXlzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICB9XG4gICAgLy8gbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlID0gXy5jbG9uZShteVBsYXllci5rZXlzKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuICAgIC8vXG4gICAgLy8gdmFyIGN1cnJlbnRQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICAvLyB2YXIgY2hhbmdlcyA9IFtdO1xuICAgIC8vIHZhciBsYXN0U3RhdGUgPSBteVBsYXllci5sYXN0U3RhdGU7XG4gICAgLy8gdmFyIG5ld1N0YXRlID0gbXlQbGF5ZXIuZ2V0U3RhdGUoKTtcbiAgICAvL1xuICAgIC8vIC8vIGNvbXBhcmUgcGxheWVycyBuZXcgc3RhdGUgd2l0aCBpdCdzIGxhc3Qgc3RhdGVcbiAgICAvLyB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XG4gICAgLy8gaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgIC8vICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlc1xuICAgIC8vICAgICBjaGFuZ2UucGxheWVySUQgPSBteVBsYXllci5pZDtcbiAgICAvLyAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gbXlQbGF5ZXIubGFzdFN0YXRlID0gbmV3U3RhdGU7XG4gICAgLy8gLy8gaWYgdGhlcmUgYXJlIGNoYW5nZXNcbiAgICAvLyBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgIC8vICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZiAodGhpcy5hY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAvLyAgICAgLy8gc2VuZCBhbGwgcGVyZm9ybWVkIGFjdGlvbnMgdG8gdGhlIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiYWN0aW9uc1wiLFxuICAgIC8vICAgICAgICAgZGF0YTogdGhpcy5hY3Rpb25zXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gY2xlYXIgYWN0aW9ucyBxdWV1ZVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmNoYW5nZXNbaV0ubGVuZ3RoOyBqICs9IDEpICB7XG4gICAgLy8gICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV1bal07XG4gICAgLy9cbiAgICAvLyAgICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgIC8vICAgICAgICAgaWYgKGNoYW5nZS5wbGF5ZXJJRCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UucGxheWVySURdLmNoYW5nZShjaGFuZ2UpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdGhpcy5jaGFuZ2VzID0gW107XG5cbn07XG5cbiAgICAvL1xuICAgIC8vIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgIC8vICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIHRoaXMucGVlciwgY29ubik7XG4gICAgLy9cbiAgICAvLyAgICAgLy9jcmVhdGUgdGhlIHBsYXllclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnBsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcihjb25uLnBlZXIpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy9MaXN0ZW4gZm9yIGRhdGEgZXZlbnRzIGZyb20gdGhlIGhvc3RcbiAgICAvLyAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgLy8gICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikgeyAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAvLyAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAvLyAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vIHBpbmcgdGVzdFxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5waW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgLy8gICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfSwgMjAwMCk7XG4gICAgLy9cbiAgICAvLyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhvc3QoKXtcbiAgICB0aGlzLmNvbm5zID0ge307XG4gICAgdGhpcy5hY3Rpb25zID0ge307IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSBhbGwgdGhlIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBjbGllbnRzXG4gICAgdGhpcy5sYXN0UGxheWVyc1N0YXRlID0gW107XG4gICAgdGhpcy5kaWZmID0gbnVsbDtcblxuICAgIHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKHBlZXJzKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0XCIsIHBlZXJzKTtcblxuICAgICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuXG4gICAgICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgaG9zdHMgcGxheWVyIG9iamVjdCBpZiBpdCBkb2VzbnQgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGlmICghKHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQgaW4gd2luZG93LmdhbWUucGxheWVycykpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNlbmQgYSBwaW5nIGV2ZXJ5IDIgc2Vjb25kcywgdG8gdHJhY2sgcGluZyB0aW1lXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgcGluZ3M6IHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5nZXRQaW5ncygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LDIwMDApO1xuXG4gICAgICAgICAgICBwZWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBlZXJJRCkge1xuICAgICAgICAgICAgICAgIC8vY29ubmVjdCB3aXRoIGVhY2ggcmVtb3RlIHBlZXJcbiAgICAgICAgICAgICAgICB2YXIgY29ubiA9ICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5jb25uZWN0KHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJob3N0SUQ6XCIsIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmlkLCBcIiBjb25uZWN0IHdpdGhcIiwgcGVlcklEKTtcbiAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1twZWVySURdID0gcGVlcjtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbcGVlcklEXSA9IGNvbm47XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHBsYXllclxuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIG5ldyBwbGF5ZXIgZGF0YSB0byBldmVyeW9uZVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IG5ld1BsYXllci5nZXRGdWxsU3RhdGUoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgdGhlIG5ldyBwbGF5ZXIgdGhlIGZ1bGwgZ2FtZSBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmVtaXQoIHtjbGllbnRJRDogY29ubi5wZWVyLCBldmVudDogXCJnYW1lU3RhdGVcIiwgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKX0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW2Nvbm4ucGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImVycm9yXCIsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIEVWRU5UXCIsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7IC8vIGFuc3dlciB0aGUgcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGNsaWVudCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJuZXR3b3JrVXBkYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGZyb20gYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ubmV0d29ya1VwZGF0ZShkYXRhLnVwZGF0ZXMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhLmFjdGlvbnMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiYWN0aW9uc1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImFjdGlvbnMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJjaGFuZ2VzXCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcIkhleSB0aGVyZSBoYXMgYmVlbiBjaGFuZ2VzIVwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5jaGFuZ2UoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwia2V5c1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImtleXMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEua2V5cywgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyA9IF8uY2xvbmUoZGF0YS5rZXlzKTsgLy9UT0RPOiB2ZXJpZnkgaW5wdXQgKGNoZWNrIHRoYXQgaXQgaXMgdGhlIGtleSBvYmplY3Qgd2l0aCB0cnVlL2ZhbHNlIHZhbHVlcylcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xuICAgICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGp1c3Qgc2VuZCBkYXRhIHRvIGEgc3BlY2lmaWMgY2xpZW50XG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVNSVQhXCIsIGRhdGEpO1xuICAgICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuXG4gICAgICAgIHZhciBjaGFuZ2VzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICB2YXIgY3VycmVudEZ1bGxTdGF0ZSA9IHBsYXllci5nZXRGdWxsU3RhdGUoKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudEZ1bGxTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBwbGF5ZXIubGFzdEZ1bGxTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSB8fCBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7IC8vdGhlcmUncyBiZWVuIGNoYW5nZXMgb3IgYWN0aW9uc1xuICAgICAgICAgICAgICAgIGNoYW5nZS5pZCA9IHBsYXllci5pZDtcbiAgICAgICAgICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIHBsYXllci5sYXN0RnVsbFN0YXRlID0gY3VycmVudEZ1bGxTdGF0ZTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmdldFBpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwaW5ncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHBpbmdzLnB1c2goe2lkOiBwbGF5ZXIuaWQsIHBpbmc6IHBsYXllci5waW5nIHx8IFwiaG9zdFwifSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGluZ3M7XG4gICAgfTtcbn07XG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5waW5nID0gXCItXCI7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvKCk7XHJcbiAgICB0aGlzLmNsaWVudCA9IG5ldyBDbGllbnQoKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInlvdUFyZUhvc3RcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW0gdGhlIGhvc3RcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0ID0gbmV3IEhvc3QoKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdChkYXRhLnBlZXJzLCBkYXRhLnByZXZpb3VzSG9zdCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3QoW2RhdGEucGVlcklEXSwgZGF0YS5wcmV2aW91c0hvc3QpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBMQVlFUiBMRUZUXCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGRhdGEucGxheWVySUR9KTtcclxuICAgIH0pO1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICBkZWxldGUgd2luZG93LmdhbWUucGxheWVyc1tkYXRhLmlkXTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXJzID0ge307XHJcbiAgICAvLyB0aGlzLmNvbm5zID0ge307XHJcbiAgICAvLyB0aGlzLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcbiAgICAvLyAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4gPSB0aGlzLnBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGlkLCBkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gdGhpcy5wZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IHRoaXMuY29ubjtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGEgcGVlciBoYXMgZGlzY29ubmVjdGVkXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgdGhpcy5jb25uLCBcIlBFRVJcIiwgdGhpcy5wZWVyKTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlZXJzW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5zW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KCk7XHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gfSk7XHJcbn07XHJcbiJdfQ==
