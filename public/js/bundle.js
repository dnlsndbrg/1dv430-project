(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var helpers = require("./helpers");
//var Emitter = require("./particle/Emitter");
var collisionDetection = require("./util/collisionDetection");
var BulletHole = require("./particle/BulletHole");
var bresenham = require("./util/bresenham");

function Bullet(data) {


    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    this.x = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    this.y = data.y + Math.sin(data.direction + 1.5707963268) * 5;

    this.x = this.x + Math.cos(data.direction) * 30;
    this.y = this.y + Math.sin(data.direction) * 30;

    this.originX = this.x; // remember the starting position
    this.originY = this.y;


    // check that the bullet spawn location is inside the game
    if (!helpers.isInsideGame(this.x, this.y)) return;

    // check if bullet starting location is inside a tile
    var tileX = Math.floor(this.x / 32);
    var tileY = Math.floor(this.y / 32);
    if (helpers.getTile(tileX,tileY) === 1) return;

    //var targetX = this.x + Math.cos(data.direction) * 10; // shoot straight ahead from the barrel
    //var targetY = this.y + Math.sin(data.direction) * 10; // shoot straight ahead from the barrel

    //this.x = data.x;
    //this.y = data.y;
    //
    // var xDiff = data.targetX - this.x;
    // var yDiff = data.targetY - this.y;
    // this.direction = Math.atan2(yDiff, xDiff);

    this.length = 10; // trail length
    this.direction = data.direction;
    this.speed = data.speed;
    this.damage = data.damage;

    this.ctx = window.game.ctx;

    window.game.entities.push(this);
}

Bullet.prototype.update = function(dt, index) {

    var distance = this.speed * dt;
    //
    this.x = this.x + Math.cos(this.direction) * distance;
    this.y = this.y + Math.sin(this.direction) * distance;

    // hit check against players
    //this.hitDetection(index);



    var line = {
        start: {x: this.originX, y: this.originY},
        end: {x: this.x, y: this.y}
    };


    //console.log(line.start.x, line.start.y, line.end.x, line.end.y);
    var intersect = null;

    var collision = bresenham(this.originX, this.originY, this.x, this.y, false); // find colliding rectangles


    if (collision) {
        switch(collision.type) {
            case "tile":
                intersect = collisionDetection.lineRectIntersect2(line, {x: collision.x * 32, y: collision.y * 32, w: 32, h: 32});
                window.game.particles.push(new BulletHole(intersect));
                this.destroy(index);
                return;
            case "player":
                collision.player.takeDamage(this.damage, this.direction);
                this.destroy(index);
                return;
            case "outside":
                this.destroy(index);
        }
    }

    this.originX = this.x;
    this.originY = this.y;

    //
    //
    // // collision detection against tiles and outside of map
    // var collision = helpers.collisionCheck({x: x, y: y});
    // if (!collision) {
    //     this.x = x;
    //     this.y = y;
    // } else {
    //     // add richocet particle effect
    //     // window.game.entities.push(new Emitter({
    //     //     type: "Ricochet",
    //     //     emitCount: 1,
    //     //     emitSpeed: null, // null means instant
    //     //     x: this.x,
    //     //     y: this.y
    //     // }));
    //
    //     // find where the bullet trajectory intersected with the colliding rect
    //
    //     var line = {start: {x: this.originX, y: this.originY}, end: {x: x, y:y}}; // the line that goes from the bullet origin position to its current position
    //     var rect = helpers.getRectFromPoint({x: x, y: y}); // rect of the colliding box
    //     var pos = collisionDetection.lineRectIntersect(line, rect);
    //
    //     //console.log(pos);
    //
    //     window.game.particles.push(new BulletHole(pos));
    //
    //     this.destroy(index);
    // }
    // //
    // // // if off screen, remove it
    // // if (this.x < 0 || this.x > window.game.level.width || this.y < 0 || this.y > window.game.level.height) {
    // //     this.destroy(index);
    // //     return;
    // // }
    // //


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

},{"./helpers":18,"./particle/BulletHole":22,"./util/bresenham":28,"./util/collisionDetection":29}],2:[function(require,module,exports){
function Button(data) {
    this.text = data.text;
    this.fontSize = data.fontSize;
    // this.x = data.x;
    // this.y = data.y;
    // this.w = data.w;
    // this.h = data.h;

    this.rect = { x: data.x, y: data.y, w: data.w, h: data.h };

    this.context = data.context;
    this.clickFunction = data.clickFunction;
}

Button.prototype.render = function() {

    window.game.ctx.beginPath();
    window.game.ctx.rect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    window.game.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    window.game.ctx.fill();

    window.game.ctx.font = this.fontSize + "px Open Sans";
    window.game.ctx.fillStyle = "#d7d7d7";
    window.game.ctx.fillText(this.text, this.rect.x + 9, this.rect.y + 28);
};

module.exports = Button;

},{}],3:[function(require,module,exports){
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

    // Load sounds
    createjs.Sound.registerSound("./../audio/ak.wav", "ak");
    createjs.Sound.registerSound("./../audio/ak-reload.mp3", "ak-reload");
    createjs.Sound.registerSound("./../audio/shotgun.ogg", "shotgun");
    createjs.Sound.registerSound("./../audio/shotgun-reload.ogg", "shotgun-reload");
    createjs.Sound.registerSound("./../audio/empty.wav", "empty");
    createjs.Sound.registerSound("./../audio/hit1.wav", "hit1");
    createjs.Sound.registerSound("./../audio/hit2.wav", "hit2");
    createjs.Sound.registerSound("./../audio/death1.ogg", "death1");
    createjs.Sound.registerSound("./../audio/death2.ogg", "death2");

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
    this.uiElements = []; // holds buttons etc

    this.maxParticles = 30; // number of particles allowed on screen before they start to be removed

    this.camera = new Camera();

    var last = 0; // time variable
    var dt; //delta time

    this.start = function(){
        this.started = true;
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

        // // cap number of particles
        // if (this.particles.length > this.maxParticles) {
        //     this.particles = this.particles.slice(this.particles.length - this.maxParticles, this.particles.length);
        // }

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

        // render buttons etc
        for (i = 0; i < window.game.uiElements.length; i += 1) {
            window.game.uiElements[i].render();
        }


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

},{"./Camera":3,"./Level":6,"./Player":14,"./Ui":15,"./webRTC/WebRTC":37}],5:[function(require,module,exports){
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

},{"./data/level1":16}],7:[function(require,module,exports){
var collisionCheck = require("./util/collisionDetection") ;

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

                // check for clicks on ui elements
                for (var i = 0; i < window.game.uiElements.length; i += 1) {
                    var element = window.game.uiElements[i];
                    if (!element.clickFunction) continue;
                    if (collisionCheck.pointRect({x: e.offsetX, y: e.offsetY}, element.rect)) {
                        element.clickFunction.bind(element.context)();
                        return;
                    }
                }

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

},{"./util/collisionDetection":29}],8:[function(require,module,exports){
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
        data.container = window.game.particles;
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

},{"../helpers":18,"./Particle":12}],10:[function(require,module,exports){
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
        data.container = window.game.particles;
        data.lifeTime = 10;
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

    this.lifeTime -= dt;
    if (this.lifeTime < 0) this.destroy(index);

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

},{"../helpers":18,"./Particle":12}],11:[function(require,module,exports){
//var Particle = require("./Particle");
var Blood = require("./Blood");
var Blood2 = require("./Blood2");
var Ricochet = require("./Ricochet");

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
    else if (this.type === "Blood2") window.game.particles.push(new Blood2(data));
    else if (this.type === "Ricochet") window.game.particles.push(new Ricochet(data));
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

},{"./Blood":9,"./Blood2":10,"./Ricochet":13}],12:[function(require,module,exports){
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
        this.container = data.container;
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
    this.container.splice(index, 1);
};

Particle.prototype.getFullState = function() {
    return {};
};

module.exports = Particle;

},{}],13:[function(require,module,exports){
var Particle = require("./Particle");
var helpers = require("../helpers");

class Ricochet extends Particle {
    constructor(data) {

        data.color = "#4d4d4d";
        data.size = 1;

        super(data);

        this.direction = helpers.toRadians(Math.floor(Math.random() * 360) + 1);
        this.speed = 80;

        this.moveDistance = (Math.floor(Math.random() * 15) + 1);
        this.distanceMoved = 0;
    }
}

Ricochet.prototype.update = function(dt, index) {

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


module.exports = Ricochet;

},{"../helpers":18,"./Particle":12}],14:[function(require,module,exports){
var helpers = require("./helpers");
var Mouse = require("./Mouse");
var Keyboard = require("./Keyboard");
var NetworkControls = require("./NetworkControls");
//var Bullet = require("./Bullet");
//var weapons = require("./data/weapons");
//var Weapon = require("./weapons/Weapon");
var Shotgun = require("./weapons/Shotgun");
var Ak47 = require("./weapons/Ak47");
//var Animation = require("./Animation");
//var Entity = require("./Entity");
var Emitter = require("./particle/Emitter");
var weaponCreator = require("./weapons/weaponCreator");
var UiButton = require("./Button");
var UiRect = require("./uiElements/Rectangle");
var UiText = require("./uiElements/Text");



function Player(playerData) {
    this.id = playerData.id;
    this.radius = playerData.radius || 20; // circle radius

    if (!playerData.x || !playerData.y) {
        var spawnLocation = helpers.findSpawnLocation();
        this.x = spawnLocation.x;
        this.y = spawnLocation.y;
    } else {
        this.x = playerData.x;
        this.y = playerData.y;
    }
    // this.x = playerData.x || (Math.floor(Math.random() * (window.game.level.width - this.radius)) + this.radius / 2);
    // this.y = playerData.y || (Math.floor(Math.random() * (window.game.level.height - this.radius)) + this.radius / 2);

    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 100; //pixels per second
    this.hp = playerData.hp || 100;


    Object.defineProperty(this, "alive",{
             "get": function() { return this.__alive; },
             "set": function(newValue) {
                 if (newValue === false && this.alive !== false && window.game.myPlayerID === this.id) {
                     // I just died. show death screen
                     var bg = new UiRect(0,0,window.game.canvas.width, window.game.canvas.height, "rgba(0,0,0,0.8)");
                     var text = new UiText({text: "YOU HAVE DIED!", fontSize: 18, x: 250, y: window.game.canvas.height / 2 - 20});
                     var button = new UiButton({text: "RESPAWN", fontSize: 24, x: window.game.canvas.width / 2 - 63, y: window.game.canvas.height / 2, w: 130, h: 40, clickFunction: this.wantToRespawn, context: this});
                     window.game.uiElements = [bg, text, button];
                 }
                 this.__alive = newValue; }
    });

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


    this.move(dt);
    //check if off screen
    // if (this.x > window.game.level.width) this.x = window.game.level.width;
    // if (this.x < 0) this.x = 0;
    // if (this.y > window.game.level.height) this.y = window.game.level.height;
    // if (this.y < 0) this.y = 0;

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
    var moveX;
    var moveY;

    if (this.kUp && this.kLeft) {
        distance = distance * 0.71;
        moveX = -distance;
        moveY = -distance;
    } else if (this.kUp && this.kRight) {
        distance = distance * 0.71;
        moveX = distance;
        moveY = -distance;
    } else if (this.kDown && this.kLeft) {
        distance = distance * 0.71;
        moveX = -distance;
        moveY = distance;
    } else if (this.kDown && this.kRight) {
        distance = distance * 0.71;
        moveX = distance;
        moveY = distance;
    } else if (this.kUp) {
        moveY = -distance;
    } else if (this.kDown) {
        moveY = distance;
    } else if (this.kLeft) {
        moveX = -distance;
    } else if (this.kRight) {
        moveX = distance;
    }

    var collision;
    if (moveX) {
        collision = helpers.collisionCheck({x: this.x + moveX, y: this.y});
        if (!collision) {
            this.x += moveX;
            this.mouseX += moveX;
        }
    }
    if (moveY) {
        collision = helpers.collisionCheck({x: this.x, y: this.y + moveY});
        if (!collision) {
            this.y += moveY;
            this.mouseY += moveY;
        }
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

    // play sounds
    if (this.id === window.game.network.client.peer.id)
        createjs.Sound.play("hit2");
    else
        createjs.Sound.play("hit1");

    // add blood splash emitter
    window.game.entities.push(new Emitter({
        type: "Blood2",
        emitCount: 10,
        emitSpeed: null, // null means instant
        x: this.x,
        y: this.y
    }));
};

Player.prototype.die = function() {

    if (!this.alive) return;

    this.alive = false;
    this.weapons[this.selectedWeaponIndex].stopReload();


    // play sounds
    if (this.id === window.game.network.client.peer.id)
        createjs.Sound.play("death2");
    else
        createjs.Sound.play("death1");

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

    // if (this.id === window.game.network.client.peer.id) { // if its my player, show respawn button
    //     // create respawn Button and dim the background
    //
    // }


};

Player.prototype.wantToRespawn = function() {
    if (!this.alive) {
        this.actions.push({ // add to the actions queue
            action: "respawn",
            data: helpers.findSpawnLocation()
        });

        // clear ui of buttons
        window.game.uiElements = [];
    }
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
    this.x = newState.x || this.x;
    this.y = newState.y || this.y;
    //id: this.id = id;
    this.hp = newState.hp || this.hp;
    //this.alive = newState.alive;
    this.alive = typeof newState.alive !== "undefined" ? newState.alive : this.alive;
    this.radius = newState.radius || this.radius;
    this.direction = newState.direction || this.direction;
    this.viewingAngle = newState.viewingAngle || this.viewingAngle;
    this.speed = newState.speed || this.speed;
    this.kUp = typeof newState.kUp !== "undefined" ? newState.kUp : this.kUp;
    this.kUp = typeof newState.kUp !== "undefined" ? newState.kUp : this.kUp;
    this.kLeft = typeof newState.kLeft !== "undefined" ? newState.kLeft : this.kLeft;
    this.kRight = typeof newState.kRight !== "undefined" ? newState.kRight : this.kRight;
    this.mouseX = typeof newState.mouseX !== "undefined" ? newState.mouseX : this.mouseX;
    this.mouseY = typeof newState.mouseY !== "undefined" ? newState.mouseY : this.mouseY;
    this.selectedWeaponIndex = newState.selectedWeaponIndex || this.selectedWeaponIndex;
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

},{"./Button":2,"./Keyboard":5,"./Mouse":7,"./NetworkControls":8,"./helpers":18,"./particle/Emitter":23,"./uiElements/Rectangle":26,"./uiElements/Text":27,"./weapons/Ak47":31,"./weapons/Shotgun":32,"./weapons/weaponCreator":34}],15:[function(require,module,exports){
// var weapons = require("./data/weapons");
// var Weapon = require("./weapons/Weapon");
//
var Emitter = require("./Particle/Emitter");
var helpers = require("./helpers");

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

            // var spawnLocationFound = false;
            // var x;
            // var y;
            // while (!spawnLocationFound) {
            //     x = (Math.floor(Math.random() * (window.game.level.width - player.radius)) + player.radius / 2);
            //     y = (Math.floor(Math.random() * (window.game.level.height - player.radius)) + player.radius / 2);
            //
            //     if (helpers.collisionCheck({x: x, y: y})) spawnLocationFound = true;
            // }


            player.actions.push({ // add to the actions queue
                action: "respawn",
                data: helpers.findSpawnLocation()
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

},{"./Particle/Emitter":11,"./helpers":18}],16:[function(require,module,exports){
var level = {
    name: "level1",
    tiles: [
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1,0,0],
        [1,0,0,0,1,1,1,1,0,0,1,2,2,1,2,1,2,2,1,0],
        [1,0,0,0,1,1,1,1,0,0,1,2,2,2,2,2,2,2,1,0],
        [1,0,0,0,1,1,1,1,0,0,1,2,1,2,2,2,1,2,1,0],
        [1,0,0,0,1,1,1,1,0,0,1,2,2,1,1,1,2,2,1,0],
        [1,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1,0,0],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],]
};

module.exports = level;

},{}],17:[function(require,module,exports){
var Ak47 = {
    "name": "Ak47",
    "magazineSize": 30, // bullets
    "bullets": 30,
    "fireRate": 0.1, // shots per second
    "bulletsPerShot": 1, // shoot 1 bullet at a time
    "damage": 10, // hp
    "reloadTime": 1.6, // s
    "bulletSpeed": 1700, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 0, // spritesheet y position
    "iconSx": 21,
    "iconSy": 210,
    "iconW": 30,
    "iconH": 30,
    "sound": "ak",
    "reloadSound": "ak-reload"
};

var shotgun = {
    "name": "shotgun",
    "magazineSize": 12, // bullets
    "bullets": 12,
    "fireRate": 0.5, // shots per second
    "bulletsPerShot": 4, // 4 shotgun slugs per shot
    "damage": 10, // hp
    "reloadTime": 1.6, // s
    "bulletSpeed": 2500, // pixels per second
    "sx": 0, // spritesheet x position
    "sy": 60, // spritesheet y position
    "iconSx": 51,
    "iconSy": 210,
    "iconW": 30,
    "iconH": 30,
    "sound": "shotgun",
    "reloadSound": "shotgun-reload"
};

module.exports = {
    Ak47: Ak47,
    shotgun: shotgun
};

},{}],18:[function(require,module,exports){
// degrees to radians
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

// radians to degrees
function toDegrees(rad) {
    return rad * (180 / Math.PI);
}

// check if this point is inside a non walkable tile. returns true if not walkable
function collisionCheck(point) {
    var tileRow = Math.floor(point.y / window.game.level.tileSize);
    var tileCol = Math.floor(point.x / window.game.level.tileSize);
    if (tileRow < 0 || tileRow >= window.game.level.rowTileCount || tileCol < 0 || tileCol >= window.game.level.colTileCount ) return true; // outside map
    return (window.game.level.level.tiles[tileRow][tileCol] > 0);
}

// takes a point and retuns tile xywh that is under that point
function getRectFromPoint(point) {
    var y = Math.floor(point.y / window.game.level.tileSize) * window.game.level.tileSize;
    var x = Math.floor(point.x / window.game.level.tileSize) * window.game.level.tileSize;
    return {x: x, y: y, w: window.game.level.tileSize, h: window.game.level.tileSize};
}

// returns tile
function getTile(x, y) {
    if(x >= 0 && x < window.game.level.colTileCount && y >= 0 && y < window.game.level.rowTileCount)
        return window.game.level.level.tiles[y][x];
}

// finds a random walkable tile on the map
function findSpawnLocation() {
    var x;
    var y;
    do {
        x = Math.floor(Math.random() * window.game.level.width);
        y = Math.floor(Math.random() * window.game.level.height);
    }
    while (collisionCheck({x: x, y: y}));

    return {x: x, y: y};
}

// checks that a xy point is inside the game world
function isInsideGame(x, y) {
    // console.log("x:",x, "y:",y, "width:",window.game.level.width, "height:",window.game.level.height);
    // console.log(x >= 0, x < window.game.level.width,  y >= 0, y < window.game.level.height);
    if (x >= 0 && x < window.game.level.width && y >= 0 && y < window.game.level.height) return true;
}


module.exports = {
    toRadians: toRadians,
    toDegrees: toDegrees,
    collisionCheck: collisionCheck,
    findSpawnLocation: findSpawnLocation,
    getRectFromPoint: getRectFromPoint,
    getTile: getTile,
    isInsideGame: isInsideGame
};

},{}],19:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
});

},{"./Game.js":4}],20:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"../helpers":18,"./Particle":24,"dup":9}],21:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"../helpers":18,"./Particle":24,"dup":10}],22:[function(require,module,exports){
var Particle = require("./Particle");
//var helpers = require("../helpers");

class BulletHole extends Particle {
    constructor(data) {
        //var rnd = Math.floor(Math.random() * 50);
        // var r = 150;
        // var g = 50;
        // var b = 50;

        data.color = "rgb(66, 66, 66)";
        //data.lifeTime = 0.3;
        data.size = 2;
        data.container = window.game.particles;
        super(data);

        this.lifeTime = 10;
        //this.direction = helpers.toRadians(Math.floor(Math.random() * 360) + 1);
        //this.speed = 80;

        //this.moveDistance = (Math.floor(Math.random() * 15) + 1);
        //this.distanceMoved = 0;
    }
}

BulletHole.prototype.update = function(dt, index) {
    this.lifeTime -= dt;
    if (this.lifeTime < 0) this.destroy(index);
    // if (this.distanceMoved < this.moveDistance) {
    //     var distance = this.speed * dt;
    //     this.x = this.x + Math.cos(this.direction) * distance;
    //     this.y = this.y + Math.sin(this.direction) * distance;
    //     this.distanceMoved += distance;
    //
    //     if (this.distanceMoved >= this.moveDistance) this.ctx = window.game.bgCtx; // move to background ctx
    // }

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


module.exports = BulletHole;

},{"./Particle":24}],23:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./Blood":20,"./Blood2":21,"./Ricochet":25,"dup":11}],24:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],25:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"../helpers":18,"./Particle":24,"dup":13}],26:[function(require,module,exports){
function Rectangle (x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rect = {x:x, y:y, w:w, h:h};
    this.color = color;
}

Rectangle.prototype.render = function() {
    window.game.ctx.beginPath();
    window.game.ctx.rect(this.x, this.y, this.w, this.h);
    window.game.ctx.fillStyle = this.color;
    window.game.ctx.fill();
};

module.exports = Rectangle;

},{}],27:[function(require,module,exports){
function Rectangle (data) {
    this.x = data.x;
    this.y = data.y;
    this.color = data.color;
    this.text = data.text;
    this.fontSize = data.fontSize;
}

Rectangle.prototype.render = function() {
    window.game.ctx.font = this.fontSize + "px Open Sans";
    window.game.ctx.fillStyle = "#d7d7d7";
    window.game.ctx.fillText(this.text, this.x, this.y);
};

module.exports = Rectangle;

},{}],28:[function(require,module,exports){
//var tiles = require("./level").tiles;
var helpers = require("./../helpers.js");
var collisionDetection = require("./collisionDetection");

function bline(x0, y0, x1, y1) {

    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);

  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  var err = (dx>dy ? dx : -dy)/2;


  while (true) {


    if (x0 === x1 && y0 === y1) {
        break;
    }
    var e2 = err;
    if (e2 > -dx) { err -= dy; x0 += sx; }
    if (e2 < dy) { err += dx; y0 += sy; }

    // check if outside map
    if (!helpers.isInsideGame(x0, y0)) return {type: "outside"};

    // hit check against players
    for (var key in window.game.players) {
        var player = window.game.players[key];
        if (!player.alive) continue;
        var hit = collisionDetection.pointCircle({x: x0, y: y0}, {x: player.x, y: player.y, radius: player.radius});
        if (hit) {
            return {type: "player", player: player};
        }

    }

    var tileX = Math.floor(x0 / 32);
    var tileY = Math.floor(y0 / 32);
    // check against tiles
    if (helpers.getTile(tileX,tileY) === 1) return {type: "tile", x: tileX, y: tileY};
  }
}

module.exports = bline;

},{"./../helpers.js":18,"./collisionDetection":29}],29:[function(require,module,exports){
var intersection = require("./intersection");

function lineRectIntersect(line, rect) {

        //if (point is inside rect)
        // intersect = point;

        // check left
        var left = {start:{x: rect.x, y: rect.y}, end:{x: rect.x, y: rect.y + rect.h}};
        var leftIntersect = intersection.intersect(line,left);
        if (leftIntersect.y >= left.start.y && leftIntersect.y <= left.end.y && line.start.x <= left.start.x ) {
            leftIntersect.x += 1;
            return leftIntersect;
        }

        // check top
        var top = {start:{x: rect.x, y: rect.y}, end:{x: rect.x + rect.w, y: rect.y}};
        var topIntersect = intersection.intersect(line, top);
        if (topIntersect.x >= top.start.x && topIntersect.x <= top.end.x && line.start.y <= top.start.y) {
            topIntersect.y += 1;
            return topIntersect;

        }

        // check right
        var right = {start:{x: rect.x + rect.w ,y: rect.y }, end:{x: rect.x + rect.w, y: rect.y + rect.h}};
        var rightIntersect = intersection.intersect(line, right);
        if (rightIntersect.y >= right.start.y && rightIntersect.y < right.end.y) {
            rightIntersect.x -= 1;
            return rightIntersect;

        }

        // check down
        var down = {start:{x: rect.x, y: rect.y + rect.h}, end:{x: rect.x + rect.w, y: rect.y + rect.h}};
        var downIntersect = intersection.intersect(line, down);
        topIntersect.y -= 1;
        return downIntersect;
}

// find the point where a line intersects a rectangle. this function assumes the line and rect intersects
function lineRectIntersect2(line, rect) {
    //if (point is inside rect)
    // intersect = point;

    // check left
    var leftLine = {start:{x: rect.x, y: rect.y}, end:{x: rect.x, y: rect.y + rect.h}};
    var intersectionPoint = intersection.intersect(line,leftLine);
    if (intersectionPoint.y >= leftLine.start.y && intersectionPoint.y <= leftLine.end.y && line.start.x <= leftLine.start.x ) {
        return intersectionPoint;
    }

    // check top
    var topLine = {start:{x: rect.x, y: rect.y}, end:{x: rect.x + rect.w, y: rect.y}};
    intersectionPoint = intersection.intersect(line, topLine);
    if (intersectionPoint.x >= topLine.start.x && intersectionPoint.x <= topLine.end.x && line.start.y <= topLine.start.y) {
        return intersectionPoint;
    }

    // check right
    var rightLine = {start:{x: rect.x + rect.w ,y: rect.y }, end:{x: rect.x + rect.w, y: rect.y + rect.h}};
    intersectionPoint = intersection.intersect(line, rightLine);
    if (intersectionPoint.y >= rightLine.start.y && intersectionPoint.y < rightLine.end.y && line.start.x >= rightLine.start.x) {
        return intersectionPoint;
    }

    // check down
    var down = {start:{x: rect.x, y: rect.y + rect.h}, end:{x: rect.x + rect.w, y: rect.y + rect.h}};
    intersectionPoint = intersection.intersect(line, down);
    return intersectionPoint;
}


// Checks if a point is inside a circle
function pointCircle(point, circle) {
        var a = point.x - circle.x;
        var b = point.y - circle.y;
        var distance = Math.sqrt( a*a + b*b );
        if (distance < circle.radius) { // point is inside circle
            return true;
        }
}

// Checks if a point is inside a rectangle
function pointRect(point, rect) {
    return (point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h);
}

module.exports = {
    lineRectIntersect: lineRectIntersect,
    pointCircle: pointCircle,
    pointRect: pointRect,
    lineRectIntersect2: lineRectIntersect2
};

},{"./intersection":30}],30:[function(require,module,exports){
var intersection = function() {
    var vector = {};
    vector.oA = function(segment) {
        return segment.start;
    };
    vector.AB = function(segment) {
        var start = segment.start;
        var end = segment.end;
        return {x:end.x - start.x, y: end.y - start.y};
    };
    vector.add = function(v1,v2) {
        return {x: v1.x + v2.x, y: v1.y + v2.y};
    }
    vector.sub = function(v1,v2) {
        return {x:v1.x - v2.x, y: v1.y - v2.y};
    }
    vector.scalarMult = function(s, v) {
        return {x: s * v.x, y: s * v.y};
    }
    vector.crossProduct = function(v1,v2) {
        return (v1.x * v2.y) - (v2.x * v1.y);
    };
    var self = {};
    self.vector = function(segment) {
        return vector.AB(segment);
    };
    self.intersectSegments = function(a,b) {
        // turn a = p + t*r where 0<=t<=1 (parameter)
        // b = q + u*s where 0<=u<=1 (parameter)
        var p = vector.oA(a);
        var r = vector.AB(a);

        var q = vector.oA(b);
        var s = vector.AB(b);

        var cross = vector.crossProduct(r,s);
        var qmp = vector.sub(q,p);
        var numerator = vector.crossProduct(qmp, s);
        var t = numerator / cross;
        var intersection = vector.add(p,vector.scalarMult(t,r));
        return intersection;
    };
    self.isParallel = function(a,b) {
        // a and b are line segments.
        // returns true if a and b are parallel (or co-linear)
        var r = vector.AB(a);
        var s = vector.AB(b);
        return (vector.crossProduct(r,s) === 0);
    };
    self.isCollinear = function(a,b) {
        // a and b are line segments.
        // returns true if a and b are co-linear
        var p = vector.oA(a);
        var r = vector.AB(a);

        var q = vector.oA(b);
        var s = vector.AB(b);
        return (vector.crossProduct(vector.sub(p,q), r) === 0);
    };
    self.safeIntersect = function(a,b) {
        if (self.isParallel(a,b) === false) {
            return self.intersectSegments(a,b);
        } else {
            return false;
        }
    };
    return self;
};
intersection.intersectSegments = intersection().intersectSegments;
intersection.intersect = intersection().safeIntersect;
intersection.isParallel = intersection().isParallel;
intersection.isCollinear = intersection().isCollinear;
intersection.describe = function(a,b) {
    var isCollinear = intersection().isCollinear(a,b);
    var isParallel = intersection().isParallel(a,b);
    var pointOfIntersection = undefined;
    if (isParallel === false) {
        pointOfIntersection = intersection().intersectSegments(a,b);
    }
    return {collinear: isCollinear,parallel: isParallel,intersection:pointOfIntersection};
};

exports = module.exports = intersection;

},{}],31:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").Ak47;

class Ak47 extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
        super(owner, weaponData);
    }
}

module.exports = Ak47;

},{"../data/weapons":17,"./Weapon":33}],32:[function(require,module,exports){
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

    // play empty clip sound if out of bullets
    if ( this.bullets < 1 && !this.reloading) {
        if (!this.soundInstanceEmptyClip) {
            this.soundInstanceEmptyClip = createjs.Sound.play("empty");
            this.soundInstanceEmptyClip.on("complete", function() {
                this.soundInstanceEmptyClip = null;
            }.bind(this));
        }
    }

    if (this.fireTimer < this.fireRate || this.reloading || this.bullets < 1) return false;

    this.bullets -= 1;
    this.fireTimer = 0;

    var directions = [];
    var direction;

    //var targetLocations = [];
    //var targetLocations;

    createjs.Sound.play(this.sound);
    // shoot 4 bullets
    for (var i = 0; i < this.bulletsPerShot; i += 1) {

        if (!action.data.directions) {
            // randomize directions myself
            direction = this.owner.direction + Math.random() * 0.25 - 0.125;
            directions.push(direction);
        } else {
            direction = action.data.directions[i];
        }

        var bullet = new Bullet({
            x: this.owner.x,
            y: this.owner.y,
            direction:direction,
            damage: this.damage,
            speed: this.bulletSpeed
        });
    }

    //console.log("FIRE", action, directions);
    action.data.directions = directions;


    return action;
};

module.exports = Shotgun;

},{".././Bullet":1,"../data/weapons":17,"./Weapon":33}],33:[function(require,module,exports){
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

        this.sound = data.sound;
        this.reloadSound = data.reloadSound;

        this.soundInstanceEmptyClip = null;
        this.soundInstanceReload = createjs.Sound.createInstance(this.reloadSound);

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

    // play empty clip sound if out of bullets
    if ( this.bullets < 1 && !this.reloading) {
        if (!this.soundInstanceEmptyClip) {
            this.soundInstanceEmptyClip = createjs.Sound.play("empty");
            this.soundInstanceEmptyClip.on("complete", function() {
                this.soundInstanceEmptyClip = null;
            }.bind(this));
        }
    }

    if (this.fireTimer < this.fireRate || this.reloading || this.bullets < 1) return false;

    this.bullets -= this.bulletsPerShot;
    this.fireTimer = 0;

    createjs.Sound.play(this.sound);

    //window.game.sounds[this.sound].play();
    var bullet = new Bullet({
        x: this.owner.x,
        y: this.owner.y,
        direction: this.owner.direction,
        damage: this.damage,
        speed: this.bulletSpeed
    });
    return action;
};

Weapon.prototype.reload = function(action) {
    if (this.owner.id === window.game.network.client.peer.id) // if this is my player. play reload sound
        this.soundInstanceReload.play();
    this.reloading = true;
    this.reloadTimer = 0;
    return action;
};

Weapon.prototype.fillMagazine = function() {
    this.bullets = this.magazineSize;
};

Weapon.prototype.stopReload = function() {
    if (this.owner.id === window.game.network.client.peer.id) // if this is my player. stop reload sound
        this.soundInstanceReload.stop();
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

},{".././Bullet":1}],34:[function(require,module,exports){
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

},{".././weapons/Ak47":31,".././weapons/Shotgun":32,"../data/weapons":17}],35:[function(require,module,exports){
"use strict";
// var Player = require("./../Player");

function Client(ID){
    //this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    this.peer = new Peer(ID, {host: window.location.hostname, port: window.location.port, path: "/peer"});

    // Stress test
    this.testsReceived = 0;

    this.actions = [];// here we will store received actions from the host
    this.changes = []; // here we will store received changes from the host

    this.peer.on("open", function(id) {
        // ive got my peerID and gameID, lets send it to the server to join the host
        window.game.network.socket.emit("join", {peerID: id, gameID: window.game.gameID});
        console.log("my client peerID is ", id);

        window.game.myPlayerID = id;

        if (!window.game.started) window.game.start();
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

                    data.gameState.players.forEach(function(newState) {
                        var player = window.game.players[newState.id];

                        if (player.id === window.game.network.client.peer.id) {
                            // if its my own state, we ignore keystate and other properties
                            newState = {
                                x: player.x,
                                y: player.y,
                                hp: newState.hp,
                                alive: newState.alive,
                            };
                        }

                        player.updateState(newState);
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

               case "pong": // we've received a pong from the host, calculate pingtime
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

},{}],36:[function(require,module,exports){
module.exports = function Host(){
    this.conns = {};
    this.actions = {}; // here we will store all the actions received from clients
    this.lastPlayersState = [];
    this.diff = null;

    this.connect = function(data){
        //this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
        this.peer = new Peer(data.hostID, {host: window.location.hostname, port: window.location.port, path: "/peer"});

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

            data.peers.forEach(function(peerID) {
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

},{}],37:[function(require,module,exports){
var Client = require("./Client");
var Host = require("./Host");

module.exports = function WebRTC(){
    this.ping = "-";
    this.socket = io();

    // receiving my client ID
    this.socket.on("ID", function(data) {
        window.game.network.client = new Client(data.ID);
    });

    this.socket.on("youAreHost", function(data) {
        console.log("im the host", data);
        window.game.network.host = new Host();
        window.game.network.host.connect({hostID: data.hostID, peers: data.peers});
    });

    this.socket.on("playerJoined", function(data) {
        console.log("player joined", data);
        window.game.network.host.connect({hostID: data.hostID, peers:[data.peerID]});
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

},{"./Client":35,"./Host":36}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0J1dHRvbi5qcyIsInNyYy9qcy9DYW1lcmEuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QyLmpzIiwic3JjL2pzL1BhcnRpY2xlL0VtaXR0ZXIuanMiLCJzcmMvanMvUGFydGljbGUvUGFydGljbGUuanMiLCJzcmMvanMvUGFydGljbGUvUmljb2NoZXQuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2RhdGEvbGV2ZWwxLmpzIiwic3JjL2pzL2RhdGEvd2VhcG9ucy5qcyIsInNyYy9qcy9oZWxwZXJzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvcGFydGljbGUvQnVsbGV0SG9sZS5qcyIsInNyYy9qcy91aUVsZW1lbnRzL1JlY3RhbmdsZS5qcyIsInNyYy9qcy91aUVsZW1lbnRzL1RleHQuanMiLCJzcmMvanMvdXRpbC9icmVzZW5oYW0uanMiLCJzcmMvanMvdXRpbC9jb2xsaXNpb25EZXRlY3Rpb24uanMiLCJzcmMvanMvdXRpbC9pbnRlcnNlY3Rpb24uanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWFwb25zL3dlYXBvbkNyZWF0b3IuanMiLCJzcmMvanMvd2ViUlRDL0NsaWVudC5qcyIsInNyYy9qcy93ZWJSVEMvSG9zdC5qcyIsInNyYy9qcy93ZWJSVEMvV2ViUlRDLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG4vL3ZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vcGFydGljbGUvRW1pdHRlclwiKTtcbnZhciBjb2xsaXNpb25EZXRlY3Rpb24gPSByZXF1aXJlKFwiLi91dGlsL2NvbGxpc2lvbkRldGVjdGlvblwiKTtcbnZhciBCdWxsZXRIb2xlID0gcmVxdWlyZShcIi4vcGFydGljbGUvQnVsbGV0SG9sZVwiKTtcbnZhciBicmVzZW5oYW0gPSByZXF1aXJlKFwiLi91dGlsL2JyZXNlbmhhbVwiKTtcblxuZnVuY3Rpb24gQnVsbGV0KGRhdGEpIHtcblxuXG4gICAgLy8gY3JlYXRlIHRoZSBidWxsZXQgNSBwaXhlbHMgdG8gdGhlIHJpZ2h0IGFuZCAzMCBwaXhlbHMgZm9yd2FyZC4gc28gaXQgYWxpZ25zIHdpdGggdGhlIGd1biBiYXJyZWxcbiAgICB0aGlzLnggPSBkYXRhLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xuICAgIHRoaXMueSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XG5cbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAzMDtcblxuICAgIHRoaXMub3JpZ2luWCA9IHRoaXMueDsgLy8gcmVtZW1iZXIgdGhlIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgdGhpcy5vcmlnaW5ZID0gdGhpcy55O1xuXG5cbiAgICAvLyBjaGVjayB0aGF0IHRoZSBidWxsZXQgc3Bhd24gbG9jYXRpb24gaXMgaW5zaWRlIHRoZSBnYW1lXG4gICAgaWYgKCFoZWxwZXJzLmlzSW5zaWRlR2FtZSh0aGlzLngsIHRoaXMueSkpIHJldHVybjtcblxuICAgIC8vIGNoZWNrIGlmIGJ1bGxldCBzdGFydGluZyBsb2NhdGlvbiBpcyBpbnNpZGUgYSB0aWxlXG4gICAgdmFyIHRpbGVYID0gTWF0aC5mbG9vcih0aGlzLnggLyAzMik7XG4gICAgdmFyIHRpbGVZID0gTWF0aC5mbG9vcih0aGlzLnkgLyAzMik7XG4gICAgaWYgKGhlbHBlcnMuZ2V0VGlsZSh0aWxlWCx0aWxlWSkgPT09IDEpIHJldHVybjtcblxuICAgIC8vdmFyIHRhcmdldFggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAxMDsgLy8gc2hvb3Qgc3RyYWlnaHQgYWhlYWQgZnJvbSB0aGUgYmFycmVsXG4gICAgLy92YXIgdGFyZ2V0WSA9IHRoaXMueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqIDEwOyAvLyBzaG9vdCBzdHJhaWdodCBhaGVhZCBmcm9tIHRoZSBiYXJyZWxcblxuICAgIC8vdGhpcy54ID0gZGF0YS54O1xuICAgIC8vdGhpcy55ID0gZGF0YS55O1xuICAgIC8vXG4gICAgLy8gdmFyIHhEaWZmID0gZGF0YS50YXJnZXRYIC0gdGhpcy54O1xuICAgIC8vIHZhciB5RGlmZiA9IGRhdGEudGFyZ2V0WSAtIHRoaXMueTtcbiAgICAvLyB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKTtcblxuICAgIHRoaXMubGVuZ3RoID0gMTA7IC8vIHRyYWlsIGxlbmd0aFxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XG4gICAgdGhpcy5zcGVlZCA9IGRhdGEuc3BlZWQ7XG4gICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaCh0aGlzKTtcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcblxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICAvL1xuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xuXG4gICAgLy8gaGl0IGNoZWNrIGFnYWluc3QgcGxheWVyc1xuICAgIC8vdGhpcy5oaXREZXRlY3Rpb24oaW5kZXgpO1xuXG5cblxuICAgIHZhciBsaW5lID0ge1xuICAgICAgICBzdGFydDoge3g6IHRoaXMub3JpZ2luWCwgeTogdGhpcy5vcmlnaW5ZfSxcbiAgICAgICAgZW5kOiB7eDogdGhpcy54LCB5OiB0aGlzLnl9XG4gICAgfTtcblxuXG4gICAgLy9jb25zb2xlLmxvZyhsaW5lLnN0YXJ0LngsIGxpbmUuc3RhcnQueSwgbGluZS5lbmQueCwgbGluZS5lbmQueSk7XG4gICAgdmFyIGludGVyc2VjdCA9IG51bGw7XG5cbiAgICB2YXIgY29sbGlzaW9uID0gYnJlc2VuaGFtKHRoaXMub3JpZ2luWCwgdGhpcy5vcmlnaW5ZLCB0aGlzLngsIHRoaXMueSwgZmFsc2UpOyAvLyBmaW5kIGNvbGxpZGluZyByZWN0YW5nbGVzXG5cblxuICAgIGlmIChjb2xsaXNpb24pIHtcbiAgICAgICAgc3dpdGNoKGNvbGxpc2lvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidGlsZVwiOlxuICAgICAgICAgICAgICAgIGludGVyc2VjdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5saW5lUmVjdEludGVyc2VjdDIobGluZSwge3g6IGNvbGxpc2lvbi54ICogMzIsIHk6IGNvbGxpc2lvbi55ICogMzIsIHc6IDMyLCBoOiAzMn0pO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCdWxsZXRIb2xlKGludGVyc2VjdCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBcInBsYXllclwiOlxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbi5wbGF5ZXIudGFrZURhbWFnZSh0aGlzLmRhbWFnZSwgdGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBcIm91dHNpZGVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW5YID0gdGhpcy54O1xuICAgIHRoaXMub3JpZ2luWSA9IHRoaXMueTtcblxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uIGFnYWluc3QgdGlsZXMgYW5kIG91dHNpZGUgb2YgbWFwXG4gICAgLy8gdmFyIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KTtcbiAgICAvLyBpZiAoIWNvbGxpc2lvbikge1xuICAgIC8vICAgICB0aGlzLnggPSB4O1xuICAgIC8vICAgICB0aGlzLnkgPSB5O1xuICAgIC8vIH0gZWxzZSB7XG4gICAgLy8gICAgIC8vIGFkZCByaWNob2NldCBwYXJ0aWNsZSBlZmZlY3RcbiAgICAvLyAgICAgLy8gd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgLy8gICAgIC8vICAgICB0eXBlOiBcIlJpY29jaGV0XCIsXG4gICAgLy8gICAgIC8vICAgICBlbWl0Q291bnQ6IDEsXG4gICAgLy8gICAgIC8vICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgIC8vICAgICAvLyAgICAgeDogdGhpcy54LFxuICAgIC8vICAgICAvLyAgICAgeTogdGhpcy55XG4gICAgLy8gICAgIC8vIH0pKTtcbiAgICAvL1xuICAgIC8vICAgICAvLyBmaW5kIHdoZXJlIHRoZSBidWxsZXQgdHJhamVjdG9yeSBpbnRlcnNlY3RlZCB3aXRoIHRoZSBjb2xsaWRpbmcgcmVjdFxuICAgIC8vXG4gICAgLy8gICAgIHZhciBsaW5lID0ge3N0YXJ0OiB7eDogdGhpcy5vcmlnaW5YLCB5OiB0aGlzLm9yaWdpbll9LCBlbmQ6IHt4OiB4LCB5Onl9fTsgLy8gdGhlIGxpbmUgdGhhdCBnb2VzIGZyb20gdGhlIGJ1bGxldCBvcmlnaW4gcG9zaXRpb24gdG8gaXRzIGN1cnJlbnQgcG9zaXRpb25cbiAgICAvLyAgICAgdmFyIHJlY3QgPSBoZWxwZXJzLmdldFJlY3RGcm9tUG9pbnQoe3g6IHgsIHk6IHl9KTsgLy8gcmVjdCBvZiB0aGUgY29sbGlkaW5nIGJveFxuICAgIC8vICAgICB2YXIgcG9zID0gY29sbGlzaW9uRGV0ZWN0aW9uLmxpbmVSZWN0SW50ZXJzZWN0KGxpbmUsIHJlY3QpO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY29uc29sZS5sb2cocG9zKTtcbiAgICAvL1xuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQnVsbGV0SG9sZShwb3MpKTtcbiAgICAvL1xuICAgIC8vICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgIC8vIH1cbiAgICAvLyAvL1xuICAgIC8vIC8vIC8vIGlmIG9mZiBzY3JlZW4sIHJlbW92ZSBpdFxuICAgIC8vIC8vIGlmICh0aGlzLnggPCAwIHx8IHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIHx8IHRoaXMueSA8IDAgfHwgdGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB7XG4gICAgLy8gLy8gICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgLy8gLy8gICAgIHJldHVybjtcbiAgICAvLyAvLyB9XG4gICAgLy8gLy9cblxuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlLmhpdERldGVjdGlvbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgLy8gdGVzdCBidWxsZXQgYWdhaW5zdCBhbGwgcGxheWVyc1xuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG5cbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcblxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XG5cbiAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcbiAgICAgICAgdmFyIGIgPSB0aGlzLnkgLSBwbGF5ZXIueTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBhKmEgKyBiKmIgKTtcblxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBwbGF5ZXIucmFkaXVzKSB7XG4gICAgICAgICAgICAvLyBoaXRcbiAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKHRoaXMuZGFtYWdlLCB0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uIC0gMC43ODUzOTgxNjM0KTsgLy8gcm90YXRlXG5cbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxuICAgIHZhciBncmFkPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2JhKDI1NSwxNjUsMCwwLjQpXCIpO1xuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwieWVsbG93XCIpO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKDAsIDApO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcblxuXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgICAvL1xuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcbiAgICAvLyBjdHgubW92ZVRvKDAsMCk7XG4gICAgLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcblxuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCwgMSwgMSApO1xuXG5cbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcbiAgICAvLyB2YXIgZ3JhZD0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgxLCBcImdyZWVuXCIpO1xuICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5tb3ZlVG8oMCwwKTtcbiAgICAvLyBjdHgubGluZVRvKDAsbGVuZ3RoKTtcbiAgICAvLyBjdHguc3Ryb2tlKCk7XG5cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcbiIsImZ1bmN0aW9uIEJ1dHRvbihkYXRhKSB7XHJcbiAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XHJcbiAgICB0aGlzLmZvbnRTaXplID0gZGF0YS5mb250U2l6ZTtcclxuICAgIC8vIHRoaXMueCA9IGRhdGEueDtcclxuICAgIC8vIHRoaXMueSA9IGRhdGEueTtcclxuICAgIC8vIHRoaXMudyA9IGRhdGEudztcclxuICAgIC8vIHRoaXMuaCA9IGRhdGEuaDtcclxuXHJcbiAgICB0aGlzLnJlY3QgPSB7IHg6IGRhdGEueCwgeTogZGF0YS55LCB3OiBkYXRhLncsIGg6IGRhdGEuaCB9O1xyXG5cclxuICAgIHRoaXMuY29udGV4dCA9IGRhdGEuY29udGV4dDtcclxuICAgIHRoaXMuY2xpY2tGdW5jdGlvbiA9IGRhdGEuY2xpY2tGdW5jdGlvbjtcclxufVxyXG5cclxuQnV0dG9uLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCh0aGlzLnJlY3QueCwgdGhpcy5yZWN0LnksIHRoaXMucmVjdC53LCB0aGlzLnJlY3QuaCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSlcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XHJcblxyXG4gICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSB0aGlzLmZvbnRTaXplICsgXCJweCBPcGVuIFNhbnNcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNkN2Q3ZDdcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh0aGlzLnRleHQsIHRoaXMucmVjdC54ICsgOSwgdGhpcy5yZWN0LnkgKyAyOCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcbnZhciBOZXR3b3JrID0gcmVxdWlyZShcIi4vd2ViUlRDL1dlYlJUQ1wiKTtcbnZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi9QbGF5ZXJcIik7XG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xudmFyIExldmVsID0gcmVxdWlyZShcIi4vTGV2ZWxcIik7XG5cblxuZnVuY3Rpb24gR2FtZSgpIHtcblxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcbiAgICB0aGlzLmhlaWdodCA9IDQ4MDtcblxuICAgIC8vIExvYWQgc291bmRzXG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vYWsud2F2XCIsIFwiYWtcIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vYWstcmVsb2FkLm1wM1wiLCBcImFrLXJlbG9hZFwiKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiLi8uLi9hdWRpby9zaG90Z3VuLm9nZ1wiLCBcInNob3RndW5cIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vc2hvdGd1bi1yZWxvYWQub2dnXCIsIFwic2hvdGd1bi1yZWxvYWRcIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vZW1wdHkud2F2XCIsIFwiZW1wdHlcIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vaGl0MS53YXZcIiwgXCJoaXQxXCIpO1xuICAgIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXCIuLy4uL2F1ZGlvL2hpdDIud2F2XCIsIFwiaGl0MlwiKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiLi8uLi9hdWRpby9kZWF0aDEub2dnXCIsIFwiZGVhdGgxXCIpO1xuICAgIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXCIuLy4uL2F1ZGlvL2RlYXRoMi5vZ2dcIiwgXCJkZWF0aDJcIik7XG5cbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5zcHJpdGVzaGVldC5zcmMgPSBcIi4uL2ltZy9zcHJpdGVzaGVldC5wbmdcIjtcblxuICAgIHRoaXMudGlsZXNoZWV0ID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy50aWxlc2hlZXQuc3JjID0gXCIuLi9pbWcvdGlsZXMucG5nXCI7XG5cbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMudGlsZXNoZWV0KTtcblxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICB0aGlzLmJnQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICB0aGlzLmJnQ2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICB0aGlzLmJnQ2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmJnQ2FudmFzKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHRoaXMuYmdDdHggPSB0aGlzLmJnQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjI0cHggT3BlbiBTYW5zXCI7XG5cbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XG5cbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XG5cbiAgICB0aGlzLmVudGl0aWVzID0gW107IC8vIGdhbWUgZW50aXRpZXNcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgIHRoaXMucGxheWVycyA9IHt9O1xuICAgIHRoaXMudWlFbGVtZW50cyA9IFtdOyAvLyBob2xkcyBidXR0b25zIGV0Y1xuXG4gICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAzMDsgLy8gbnVtYmVyIG9mIHBhcnRpY2xlcyBhbGxvd2VkIG9uIHNjcmVlbiBiZWZvcmUgdGhleSBzdGFydCB0byBiZSByZW1vdmVkXG5cbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcblxuICAgIHZhciBsYXN0ID0gMDsgLy8gdGltZSB2YXJpYWJsZVxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5sb29wKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdhbWUgbG9vcFxuICAgICAqL1xuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxuXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG5cblxuICAgICAgICAvLyBuZXR3b3JraW5nIHVwZGF0ZVxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5ob3N0LnVwZGF0ZShkdCk7IC8vIGlmIGltIHRoZSBob3N0IGRvIGhvc3Qgc3R1ZmZcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXG4gICAgICAgIH1cblxuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZVxuICAgICAqL1xuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xuICAgICAgICB2YXIgZHRzID0gZHQgLyAxMDAwO1xuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXG4gICAgICAgIHRoaXMuZnBzID0gTWF0aC5yb3VuZCgxMDAwIC8gZHQpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5LCBpbmRleCkge1xuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdHMsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyAvLyBjYXAgbnVtYmVyIG9mIHBhcnRpY2xlc1xuICAgICAgICAvLyBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcbiAgICAgICAgLy8gICAgIHRoaXMucGFydGljbGVzID0gdGhpcy5wYXJ0aWNsZXMuc2xpY2UodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIC0gdGhpcy5tYXhQYXJ0aWNsZXMsIHRoaXMucGFydGljbGVzLmxlbmd0aCk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBVcGRhdGUgcGFydGljbGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZShkdHMsIGkpO1xuICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmFcbiAgICAgICAgLy90aGlzLmNhbWVyYS51cGRhdGUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVuZGVyaW5nXG4gICAgICovXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBjbGVhciBzY3JlZW5cbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5iZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vYmcgY29sb3JcbiAgICAgICAgdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5iZ0N0eC5yZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzViNTg1MFwiO1xuICAgICAgICB0aGlzLmJnQ3R4LmZpbGwoKTtcblxuICAgICAgICAvLyBkcmF3IHRlc3QgYmFja2dyb3VuZFxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAvLyB0aGlzLmJnQ3R4LnJlY3QoMCAtIHRoaXMuY2FtZXJhLngsIDAgLSB0aGlzLmNhbWVyYS55LCB0aGlzLmxldmVsLndpZHRoLCB0aGlzLmxldmVsLmhlaWdodCk7XG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjODU4MjdkXCI7XG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbCgpO1xuXG4gICAgICAgIHRoaXMubGV2ZWwucmVuZGVyKHRoaXMuYmdDdHgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZW50aXR5LnJlbmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZW5kZXIgcGFydGljbGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51aS5yZW5kZXJVSSgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBidXR0b25zIGV0Y1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgd2luZG93LmdhbWUudWlFbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50c1tpXS5yZW5kZXIoKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgdGhpcy51aS5yZW5kZXJEZWJ1ZygpO1xuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNBTUVSQTogWDpcIiArIHRoaXMuY2FtZXJhLngsIFwiXFxuWTpcIiArIHRoaXMuY2FtZXJhLnkpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucGxheWVyc1t0aGlzLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdKTtcbiAgICB9O1xufVxuXG5HYW1lLnByb3RvdHlwZS5hZGRQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKXtcblxuICAgIC8vIGNoZWNrIGlmIHBsYXllciBhbHJlYWR5IGV4aXN0cy5cbiAgICBpZihkYXRhLmlkIGluIHRoaXMucGxheWVycykgcmV0dXJuO1xuXG4gICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIoZGF0YSk7XG4gICAgdGhpcy5lbnRpdGllcy5wdXNoKG5ld1BsYXllcik7XG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xuXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XG5cbiAgICByZXR1cm4gbmV3UGxheWVyO1xufTtcblxuR2FtZS5wcm90b3R5cGUucmVtb3ZlUGxheWVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiZ2FtZSByZW1vdmluZyBwbGF5ZXJcIiwgZGF0YSk7XG5cbiAgICAvLyByZW1vdmUgZnJvbSBwbGF5ZXJzIG9iamVjdFxuICAgIGRlbGV0ZSB0aGlzLnBsYXllcnNbZGF0YS5pZF07XG5cbiAgICAvLyByZW1vdmUgZnJvbSBlbnRpdGl0ZXMgYXJyYXlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGhpbSAsIHJlbW92aW5nXCIpO1xuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xufTtcblxuR2FtZS5wcm90b3R5cGUuZ2V0R2FtZVN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJlbnRpdHk6XCIsIGVudGl0eSk7XG4gICAgICAgIC8vICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZW50aXR5KTtcbiAgICAgICAgLy8gfSksXG4gICAgICAgIC8vZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAvLyAgICByZXR1cm4gZW50aXR5LmdldEZ1bGxTdGF0ZSgpOyAgICAgICAgfSksXG4gICAgICAgIC8vcGxheWVyczogT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XSk7IH0pXG4gICAgICAgIHBsYXllcnM6IHRoaXMuZ2V0UGxheWVyc1N0YXRlKClcbiAgICB9O1xufTtcblxuR2FtZS5wcm90b3R5cGUuZ2V0UGxheWVyc1N0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uZ2V0RnVsbFN0YXRlKCk7IH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xuIiwiZnVuY3Rpb24gS2V5Ym9hcmQocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICAvL3RoaXMubGFzdFN0YXRlID0gXy5jbG9uZShwbGF5ZXIua2V5cyk7XG4gICAgdGhpcy5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgIT09IHRydWUpICBwbGF5ZXIua1VwPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gIT09IHRydWUpICBwbGF5ZXIua0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgIT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ICE9PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ5OiAvLyAxXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMCxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1MDogLy8gMlxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleCA9PT0gMSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiY2hhbmdlV2VhcG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODI6IC8vIFJcbiAgICAgICAgICAgICAgICAvLyByZWxvYWQgb25seSBpZiBwbGF5ZXIgaXMgYWxpdmUgYW5kIHdlYXBvbiBtYWdhemluZSBpc250IGZ1bGxcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmFsaXZlICYmIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XS5idWxsZXRzIDwgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLm1hZ2F6aW5lU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmtleVVwSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgPT09IHRydWUpIHBsYXllci5rVXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gPT09IHRydWUpIHBsYXllci5rRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ID09PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ID09PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwidmFyIGxldmVsMSA9IHJlcXVpcmUoXCIuL2RhdGEvbGV2ZWwxXCIpO1xyXG4vL3ZhciBUaWxlID0gcmVxdWlyZShcIi4vVGlsZVwiKTtcclxuXHJcbmZ1bmN0aW9uIExldmVsKHRpbGVzaGVldCl7XHJcbiAgICB0aGlzLnRpbGVzaGVldCA9IHRpbGVzaGVldDtcclxuICAgIHRoaXMudGlsZVNpemUgPSAzMjtcclxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDE7XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGggKiB0aGlzLnRpbGVTaXplO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmNvbFRpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXNbMF0ubGVuZ3RoO1xyXG4gICAgdGhpcy5yb3dUaWxlQ291bnQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aDtcclxuICAgIHRoaXMuaW1hZ2VOdW1UaWxlcyA9IDM4NCAvIHRoaXMudGlsZVNpemU7ICAvLyBUaGUgbnVtYmVyIG9mIHRpbGVzIHBlciByb3cgaW4gdGhlIHRpbGVzZXQgaW1hZ2VcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBUaWxlc1xyXG5cclxuXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGN0eCkge1xyXG5cclxuICAgICAgICAvL2RyYXcgYWxsIHRpbGVzXHJcbiAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLnJvd1RpbGVDb3VudDsgcm93ICs9IDEpIHtcclxuICAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbFRpbGVDb3VudDsgY29sICs9IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMubGV2ZWwudGlsZXNbcm93XVtjb2xdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVSb3cgPSAodGlsZSAvIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwOyAvLyBCaXR3aXNlIE9SIG9wZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVDb2wgPSAodGlsZSAlIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy50aWxlc2hlZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVDb2wgKiB0aGlzLnRpbGVTaXplKSxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZVJvdyAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChjb2wgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS54KSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChyb3cgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUpO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xyXG4iLCJ2YXIgY29sbGlzaW9uQ2hlY2sgPSByZXF1aXJlKFwiLi91dGlsL2NvbGxpc2lvbkRldGVjdGlvblwiKSA7XG5cbmZ1bmN0aW9uIE1vdXNlKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSl7XG5cblxuICAgICAgICB0aGlzLnBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJzaG9vdFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYLFxuICAgICAgICAgICAgICAgIHk6IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMucHVzaChhY3Rpb24pOyAvLyB0ZWxsIHRoZSBob3N0IG9mIHRoZSBhY3Rpb25cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWCA9IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYO1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVkgPSB3aW5kb3cuZ2FtZS5jYW1lcmEueSArIGUub2Zmc2V0WTtcbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGNsaWNrcyBvbiB1aSBlbGVtZW50c1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2luZG93LmdhbWUudWlFbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IHdpbmRvdy5nYW1lLnVpRWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5jbGlja0Z1bmN0aW9uKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbkNoZWNrLnBvaW50UmVjdCh7eDogZS5vZmZzZXRYLCB5OiBlLm9mZnNldFl9LCBlbGVtZW50LnJlY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsaWNrRnVuY3Rpb24uYmluZChlbGVtZW50LmNvbnRleHQpKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLm1vdXNlTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5tb3VzZUxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBzd2l0Y2goZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgMDogLy8gbGVmdCBtb3VzZSBidXR0b25cbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLm1vdXNlTGVmdCA9PT0gdHJ1ZSkgcGxheWVyLm1vdXNlTGVmdCAgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgLy93aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XG4iLCJmdW5jdGlvbiBDb250cm9scygpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgQmxvb2QgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICB2YXIgciA9IDE1MCAtIHJuZDtcclxuICAgICAgICB2YXIgZyA9IDUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBiID0gNTAgLSBybmQ7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcInJnYihcIiArIHIgKyBcIixcIiArIGcgKyBcIixcIiArIGIgKyBcIilcIjtcclxuICAgICAgICBkYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDM7XHJcbiAgICAgICAgZGF0YS5jb250YWluZXIgPSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXM7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA0MDtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbkJsb29kLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuXHJcbiAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9vZDtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZDIgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwiIzgwMjkyOVwiO1xyXG4gICAgICAgIC8vZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAzO1xyXG4gICAgICAgIGRhdGEuY29udGFpbmVyID0gd2luZG93LmdhbWUucGFydGljbGVzO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAxMDtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5CbG9vZDIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvb2QyO1xyXG4iLCIvL3ZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgQmxvb2QgPSByZXF1aXJlKFwiLi9CbG9vZFwiKTtcclxudmFyIEJsb29kMiA9IHJlcXVpcmUoXCIuL0Jsb29kMlwiKTtcclxudmFyIFJpY29jaGV0ID0gcmVxdWlyZShcIi4vUmljb2NoZXRcIik7XHJcblxyXG5mdW5jdGlvbiBFbWl0dGVyKGRhdGEpIHtcclxuICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZTtcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICB0aGlzLmVtaXRTcGVlZCA9IGRhdGEuZW1pdFNwZWVkOyAvLyBzXHJcbiAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXRDb3VudCA9IGRhdGEuZW1pdENvdW50O1xyXG4gICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICB0aGlzLmxpZmVUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXQoKTtcclxufVxyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBlbWl0dGVyOiB0aGlzXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2RcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kKGRhdGEpKTtcclxuICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gXCJCbG9vZDJcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kMihkYXRhKSk7XHJcbiAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IFwiUmljb2NoZXRcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IFJpY29jaGV0KGRhdGEpKTtcclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4gICAgLy8gLy8gdXBkYXRlIGFsbCBwYXJ0aWNsZXNcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIC8vICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoZHQpO1xyXG4gICAgLy8gfVxyXG5cclxuXHJcbiAgICAvLyBTRVQgRU1JVFRFUiAtIHRoaXMgaXMgYW4gZW1pdHRlciB0aGF0IHNob3VsZCBlbWl0IGEgc2V0IG51bWJlciBvZiBwYXJ0aWNsZXNcclxuICAgIGlmICh0aGlzLmVtaXRDb3VudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVtaXRTcGVlZCkgeyAvLyBFbWl0IGF0IGEgaW50ZXJ2YWxcclxuICAgICAgICAgICAgdGhpcy5lbWl0VGltZXIgKz0gZHQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVtaXRUaW1lciA+IHRoaXMuZW1pdFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgICB0aGlzLmVtaXRDb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgIGlmICh0aGlzLmVtaXRDb3VudCA8IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gRW1pdCBhbGwgYXQgb25jZVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDtpIDwgdGhpcy5lbWl0Q291bnQ7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRJTUVEIEVNSVRURVJcclxuICAgIC8vIHVwZGF0ZSBlbWl0dGVyIGxpZmV0aW1lIChpZiBpdCBoYXMgYSBsaWZldGltZSkgcmVtb3ZlIGVtaXR0ZXIgaWYgaXRzIHRpbWUgaGFzIHJ1biBvdXQgYW5kIGl0IGhhcyBubyByZW1haW5pbmcgcGFydGljbGVzXHJcbiAgICBpZiAodGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4gICAgICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENPTlRJTlVPVVMgRU1JVFRFUlxyXG4gICAgLy8gZW1pdCBuZXcgcGFydGljbGVzIGZvcmV2ZXJcclxuICAgIHRoaXMuZW1pdFRpbWVyICs9IGR0O1xyXG4gICAgaWYgKHRoaXMuZW1pdFRpbWVyID4gdGhpcy5lbWl0U3BlZWQpIHtcclxuICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyAvLyByZW5kZXIgYWxsIHBhcnRpY2xlc1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgLy8gICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xyXG4gICAgLy8gfVxyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xyXG4iLCIvL3ZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi4vLi9FbnRpdHlcIik7XHJcblxyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5jdHg7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGRhdGEuY29sb3I7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xyXG4gICAgICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgICAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuZW1pdHRlciA9IGRhdGEuZW1pdHRlcjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGRhdGEuY29udGFpbmVyO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBQYXJ0aWNsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbi8vICAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuLy8gICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuLy8gICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4vLyAgICAgfVxyXG4vLyB9O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICAvL3RoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KC0odGhpcy5zaXplIC8gMiksIC0odGhpcy5zaXplIC8gMiksIHRoaXMuc2l6ZSwgdGhpcy5zaXplKTtcclxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxufTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHRoaXMuY29udGFpbmVyLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge307XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIFJpY29jaGV0IGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCIjNGQ0ZDRkXCI7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMTtcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA4MDtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuUmljb2NoZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJpY29jaGV0O1xyXG4iLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoXCIuL0tleWJvYXJkXCIpO1xudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcbi8vdmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuL0J1bGxldFwiKTtcbi8vdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vL3ZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbnZhciBTaG90Z3VuID0gcmVxdWlyZShcIi4vd2VhcG9ucy9TaG90Z3VuXCIpO1xudmFyIEFrNDcgPSByZXF1aXJlKFwiLi93ZWFwb25zL0FrNDdcIik7XG4vL3ZhciBBbmltYXRpb24gPSByZXF1aXJlKFwiLi9BbmltYXRpb25cIik7XG4vL3ZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9FbnRpdHlcIik7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgd2VhcG9uQ3JlYXRvciA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvd2VhcG9uQ3JlYXRvclwiKTtcbnZhciBVaUJ1dHRvbiA9IHJlcXVpcmUoXCIuL0J1dHRvblwiKTtcbnZhciBVaVJlY3QgPSByZXF1aXJlKFwiLi91aUVsZW1lbnRzL1JlY3RhbmdsZVwiKTtcbnZhciBVaVRleHQgPSByZXF1aXJlKFwiLi91aUVsZW1lbnRzL1RleHRcIik7XG5cblxuXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xuICAgIHRoaXMuaWQgPSBwbGF5ZXJEYXRhLmlkO1xuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7IC8vIGNpcmNsZSByYWRpdXNcblxuICAgIGlmICghcGxheWVyRGF0YS54IHx8ICFwbGF5ZXJEYXRhLnkpIHtcbiAgICAgICAgdmFyIHNwYXduTG9jYXRpb24gPSBoZWxwZXJzLmZpbmRTcGF3bkxvY2F0aW9uKCk7XG4gICAgICAgIHRoaXMueCA9IHNwYXduTG9jYXRpb24ueDtcbiAgICAgICAgdGhpcy55ID0gc3Bhd25Mb2NhdGlvbi55O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMueCA9IHBsYXllckRhdGEueDtcbiAgICAgICAgdGhpcy55ID0gcGxheWVyRGF0YS55O1xuICAgIH1cbiAgICAvLyB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIC8vIHRoaXMueSA9IHBsYXllckRhdGEueSB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBwbGF5ZXJEYXRhLmRpcmVjdGlvbiB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMTtcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IHBsYXllckRhdGEudmlld2luZ0FuZ2xlIHx8IDQ1O1xuICAgIHRoaXMuc3BlZWQgPSBwbGF5ZXJEYXRhLnNwZWVkIHx8IDEwMDsgLy9waXhlbHMgcGVyIHNlY29uZFxuICAgIHRoaXMuaHAgPSBwbGF5ZXJEYXRhLmhwIHx8IDEwMDtcblxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiYWxpdmVcIix7XG4gICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9fYWxpdmU7IH0sXG4gICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlID09PSBmYWxzZSAmJiB0aGlzLmFsaXZlICE9PSBmYWxzZSAmJiB3aW5kb3cuZ2FtZS5teVBsYXllcklEID09PSB0aGlzLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAvLyBJIGp1c3QgZGllZC4gc2hvdyBkZWF0aCBzY3JlZW5cbiAgICAgICAgICAgICAgICAgICAgIHZhciBiZyA9IG5ldyBVaVJlY3QoMCwwLHdpbmRvdy5nYW1lLmNhbnZhcy53aWR0aCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCwgXCJyZ2JhKDAsMCwwLDAuOClcIik7XG4gICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IG5ldyBVaVRleHQoe3RleHQ6IFwiWU9VIEhBVkUgRElFRCFcIiwgZm9udFNpemU6IDE4LCB4OiAyNTAsIHk6IHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLyAyIC0gMjB9KTtcbiAgICAgICAgICAgICAgICAgICAgIHZhciBidXR0b24gPSBuZXcgVWlCdXR0b24oe3RleHQ6IFwiUkVTUEFXTlwiLCBmb250U2l6ZTogMjQsIHg6IHdpbmRvdy5nYW1lLmNhbnZhcy53aWR0aCAvIDIgLSA2MywgeTogd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAvIDIsIHc6IDEzMCwgaDogNDAsIGNsaWNrRnVuY3Rpb246IHRoaXMud2FudFRvUmVzcGF3biwgY29udGV4dDogdGhpc30pO1xuICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50cyA9IFtiZywgdGV4dCwgYnV0dG9uXTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB0aGlzLl9fYWxpdmUgPSBuZXdWYWx1ZTsgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hbGl2ZSA9IHBsYXllckRhdGEuYWxpdmUgfHwgdHJ1ZTtcblxuICAgIHRoaXMuc3ggPSAwO1xuICAgIHRoaXMuc3kgPSAwO1xuICAgIHRoaXMuc3cgPSA2MDtcbiAgICB0aGlzLnNoID0gNjA7XG4gICAgdGhpcy5kdyA9IDYwO1xuICAgIHRoaXMuZGggPSA2MDtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb24gb24gbGV2ZWxcbiAgICB0aGlzLnRpbGVSb3cgPSAwO1xuICAgIHRoaXMudGlsZUNvbCA9IDA7XG5cbiAgICB0aGlzLndlYXBvbnMgPSBbXTtcbiAgICAvLyByZWNyZWF0ZSB3ZWFwb25zIGlmIHRoZSBwbGF5ZXIgaGFzIGFueSBlbHNlIGNyZWF0ZSBuZXcgd2VhcG9uc1xuICAgIGlmIChwbGF5ZXJEYXRhLndlYXBvblN0YXRlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVyRGF0YS53ZWFwb25TdGF0ZS5sZW5ndGg7IGkrPSAxKSB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnMucHVzaCh3ZWFwb25DcmVhdG9yKHRoaXMsIHBsYXllckRhdGEud2VhcG9uU3RhdGVbaV0pKTtcbiAgICAgICAgfVxuICAgIH1lbHNlIHtcbiAgICAgICAgdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG4gICAgfVxuXG4gICAgLy90aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcblxuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IHBsYXllckRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleCB8fCAwO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcblxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGVyZm9ybUFjdGlvbih0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zLnB1c2godGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmFsaXZlKSByZXR1cm47XG5cblxuICAgIHRoaXMubW92ZShkdCk7XG4gICAgLy9jaGVjayBpZiBvZmYgc2NyZWVuXG4gICAgLy8gaWYgKHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKSB0aGlzLnggPSB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aDtcbiAgICAvLyBpZiAodGhpcy54IDwgMCkgdGhpcy54ID0gMDtcbiAgICAvLyBpZiAodGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB0aGlzLnkgPSB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQ7XG4gICAgLy8gaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG5cbiAgICAvLyB1cGRhdGUgY3VycmVudCB3ZWFwb247XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0udXBkYXRlKGR0KTtcblxuICAgIC8vdGhpcy5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZShkdCk7XG5cbiAgICBpZiAodGhpcy5tb3VzZUxlZnQpIHsgLy8gaWYgZmlyaW5nXG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwiZmlyZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW91c2VYLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMubW91c2VZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR0KSB7XG5cbiAgICAvLyBVcGRhdGUgbW92ZW1lbnRcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XG4gICAgdmFyIG1vdmVYO1xuICAgIHZhciBtb3ZlWTtcblxuICAgIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gLWRpc3RhbmNlO1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwKSB7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93bikge1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rTGVmdCkge1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgdmFyIGNvbGxpc2lvbjtcbiAgICBpZiAobW92ZVgpIHtcbiAgICAgICAgY29sbGlzaW9uID0gaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogdGhpcy54ICsgbW92ZVgsIHk6IHRoaXMueX0pO1xuICAgICAgICBpZiAoIWNvbGxpc2lvbikge1xuICAgICAgICAgICAgdGhpcy54ICs9IG1vdmVYO1xuICAgICAgICAgICAgdGhpcy5tb3VzZVggKz0gbW92ZVg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1vdmVZKSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHRoaXMueCwgeTogdGhpcy55ICsgbW92ZVl9KTtcbiAgICAgICAgaWYgKCFjb2xsaXNpb24pIHtcbiAgICAgICAgICAgIHRoaXMueSArPSBtb3ZlWTtcbiAgICAgICAgICAgIHRoaXMubW91c2VZICs9IG1vdmVZO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gLy8gQ29sbGlzaW9uIGNoZWNrIGFnYWluc3Qgc3Vycm91bmRpbmcgdGlsZXNcbi8vIFBsYXllci5wcm90b3R5cGUuY29sbGlzaW9uQ2hlY2sgPSBmdW5jdGlvbigpIHtcbi8vICAgICB2YXIgc3RhcnRpbmdSb3cgPSB0aGlzLnRpbGVSb3cgLSAxO1xuLy8gICAgIGlmIChzdGFydGluZ1JvdyA8IDApIHN0YXJ0aW5nUm93ICA9IDA7XG4vLyAgICAgdmFyIGVuZFJvdyA9IHRoaXMudGlsZVJvdyArMTtcbi8vICAgICBpZiAoZW5kUm93ID4gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50KSBlbmRSb3cgPSB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQ7XG4vLyAgICAgdmFyIHN0YXJ0aW5nQ29sID0gdGhpcy50aWxlQ29sIC0xO1xuLy8gICAgIGlmIChzdGFydGluZ0NvbCA8IDApIHN0YXJ0aW5nQ29sID0gMDtcbi8vICAgICB2YXIgZW5kQ29sID0gdGhpcy50aWxlQ29sICsxO1xuLy8gICAgIGlmIChlbmRDb2wgPiB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQpIGVuZENvbCA9IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudDtcbi8vXG4vLyAgICAgZm9yICh2YXIgcm93ID0gc3RhcnRpbmdSb3c7IHJvdyA8IGVuZFJvdzsgcm93ICs9IDEpIHtcbi8vICAgICAgICAgZm9yICh2YXIgY29sID0gc3RhcnRpbmdDb2w7IGNvbCA8IGVuZENvbDsgY29sICs9IDEpIHtcbi8vICAgICAgICAgICAgIGlmICh3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1tyb3ddW2NvbF0gPT09IDApIGNvbnRpbnVlOyAvLyBldmVyeSB0aWxlIG90aGVyIHRoYW4gMCBhcmUgbm9uIHdhbGthYmxlXG4vLyAgICAgICAgICAgICAvLyBjb2xsaXNpb25cbi8vICAgICAgICAgICAgIGlmICh0aGlzLnRpbGVSb3cgPT09IHJvdyAmJiB0aGlzLnRpbGVDb2wgPT09IGNvbCkge1xuLy8gICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gdHJ1ZTtcbi8vIH07XG5cblBsYXllci5wcm90b3R5cGUubmV0d29ya1VwZGF0ZSA9IGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgZGVsZXRlIHVwZGF0ZS5pZDtcbiAgICAvLyBuZXR3b3JrVXBkYXRlXG4gICAgZm9yICh2YXIga2V5IGluIHVwZGF0ZSkge1xuICAgICAgICBpZiAoa2V5ID09PSBcImFjdGlvbnNcIikgdGhpc1trZXldID0gdGhpc1trZXldLmNvbmNhdCh1cGRhdGVba2V5XSk7XG4gICAgICAgIGVsc2UgdGhpc1trZXldID0gdXBkYXRlW2tleV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wZXJmb3JtQWN0aW9uID0gZnVuY3Rpb24oYWN0aW9uKXtcbiAgICBzd2l0Y2goYWN0aW9uLmFjdGlvbil7XG4gICAgICAgIGNhc2UgXCJ0dXJuVG93YXJkc1wiOlxuICAgICAgICAgICAgdGhpcy50dXJuVG93YXJkcyhhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZmlyZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLmZpcmUoYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcImRpZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGllKGFjdGlvbik7XG4gICAgICAgICAgICAvL2JyZWFrO1xuICAgICAgICBjYXNlIFwicmVzcGF3blwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzcGF3bihhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiY2hhbmdlV2VhcG9uXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VXZWFwb24oYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcInJlbG9hZFwiOlxuICAgIH0gICAgICAgcmV0dXJuIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnJlbG9hZChhY3Rpb24pO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIGlmKCF0aGlzLmFsaXZlKSByZXR1cm47XG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxuXG4gICAgdGhpcy5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zeCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnR1cm5Ub3dhcmRzID0gZnVuY3Rpb24oeCx5KSB7XG4gICAgdmFyIHhEaWZmID0geCAtIHRoaXMueDtcbiAgICB2YXIgeURpZmYgPSB5IC0gdGhpcy55O1xuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpOy8vICogKDE4MCAvIE1hdGguUEkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS50YWtlRGFtYWdlID0gZnVuY3Rpb24oZGFtYWdlLCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmhwIC09IGRhbWFnZTtcbiAgICBpZiAodGhpcy5ocCA8PSAwKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJkaWVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBwbGF5IHNvdW5kc1xuICAgIGlmICh0aGlzLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKVxuICAgICAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KFwiaGl0MlwiKTtcbiAgICBlbHNlXG4gICAgICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJoaXQxXCIpO1xuXG4gICAgLy8gYWRkIGJsb29kIHNwbGFzaCBlbWl0dGVyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy5hbGl2ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN0b3BSZWxvYWQoKTtcblxuXG4gICAgLy8gcGxheSBzb3VuZHNcbiAgICBpZiAodGhpcy5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZClcbiAgICAgICAgY3JlYXRlanMuU291bmQucGxheShcImRlYXRoMlwiKTtcbiAgICBlbHNlXG4gICAgICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJkZWF0aDFcIik7XG5cbiAgICAvLyAvLyBjcmVhdGUgYSBjb3Jwc2VcbiAgICAvLyB2YXIgY29ycHNlID0gbmV3IEVudGl0eSh7XG4gICAgLy8gICAgIHg6IHRoaXMueCArIE1hdGguY29zKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAvLyAgICAgeTogdGhpcy55ICsgTWF0aC5zaW4oYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgIC8vICAgICBzeDogNjAgKyggTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKiA2MCksXG4gICAgLy8gICAgIHN5OiAxMjAsXG4gICAgLy8gICAgIHN3OiA2MCxcbiAgICAvLyAgICAgc2g6IDYwLFxuICAgIC8vICAgICBkdzogNjAsXG4gICAgLy8gICAgIGRoOiA2MCxcbiAgICAvLyAgICAgZGlyZWN0aW9uOiBhY3Rpb24uZGF0YS5kaXJlY3Rpb24sXG4gICAgLy8gICAgIGN0eDogd2luZG93LmdhbWUuYmdDdHhcbiAgICAvLyB9KTtcbiAgICAvL3dpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2goY29ycHNlKTtcblxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICBlbWl0Q291bnQ6IDMwLFxuICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH0pKTtcblxuICAgIC8vIGlmICh0aGlzLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7IC8vIGlmIGl0cyBteSBwbGF5ZXIsIHNob3cgcmVzcGF3biBidXR0b25cbiAgICAvLyAgICAgLy8gY3JlYXRlIHJlc3Bhd24gQnV0dG9uIGFuZCBkaW0gdGhlIGJhY2tncm91bmRcbiAgICAvL1xuICAgIC8vIH1cblxuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLndhbnRUb1Jlc3Bhd24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuYWxpdmUpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgICAgICBkYXRhOiBoZWxwZXJzLmZpbmRTcGF3bkxvY2F0aW9uKClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2xlYXIgdWkgb2YgYnV0dG9uc1xuICAgICAgICB3aW5kb3cuZ2FtZS51aUVsZW1lbnRzID0gW107XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZXNwYXduID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy54ID0gYWN0aW9uLmRhdGEueDtcbiAgICB0aGlzLnkgPSBhY3Rpb24uZGF0YS55O1xuICAgIHRoaXMuaHAgPSAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG5cbiAgICAvLyByZWZpbGwgYWxsIHdlYXBvbnNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLndlYXBvbnNbaV0uZmlsbE1hZ2F6aW5lKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hhbmdlV2VhcG9uID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3RvcFJlbG9hZCgpO1xuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IGFjdGlvbi5kYXRhLnNlbGVjdGVkV2VhcG9uSW5kZXg7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnksXG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBocDogdGhpcy5ocCxcbiAgICAgICAgYWxpdmU6IHRoaXMuYWxpdmUsXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIHZpZXdpbmdBbmdsZTogdGhpcy52aWV3aW5nQW5nbGUsXG4gICAgICAgIHNwZWVkOiB0aGlzLnNwZWVkLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVksXG4gICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCxcbiAgICAgICAgd2VhcG9uU3RhdGU6IHRoaXMuZ2V0V2VhcG9uU3RhdGUoKVxuICAgIH07XG59O1xuXG4vLyBUaGUgc3RhdGUgdGhlIGNsaWVudCBzZW5kcyB0byB0aGUgaG9zdFxuUGxheWVyLnByb3RvdHlwZS5nZXRDbGllbnRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVlcbiAgICB9O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGVTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgdGhpcy54ID0gbmV3U3RhdGUueCB8fCB0aGlzLng7XG4gICAgdGhpcy55ID0gbmV3U3RhdGUueSB8fCB0aGlzLnk7XG4gICAgLy9pZDogdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaHAgPSBuZXdTdGF0ZS5ocCB8fCB0aGlzLmhwO1xuICAgIC8vdGhpcy5hbGl2ZSA9IG5ld1N0YXRlLmFsaXZlO1xuICAgIHRoaXMuYWxpdmUgPSB0eXBlb2YgbmV3U3RhdGUuYWxpdmUgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5hbGl2ZSA6IHRoaXMuYWxpdmU7XG4gICAgdGhpcy5yYWRpdXMgPSBuZXdTdGF0ZS5yYWRpdXMgfHwgdGhpcy5yYWRpdXM7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBuZXdTdGF0ZS5kaXJlY3Rpb24gfHwgdGhpcy5kaXJlY3Rpb247XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBuZXdTdGF0ZS52aWV3aW5nQW5nbGUgfHwgdGhpcy52aWV3aW5nQW5nbGU7XG4gICAgdGhpcy5zcGVlZCA9IG5ld1N0YXRlLnNwZWVkIHx8IHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5rVXAgPSB0eXBlb2YgbmV3U3RhdGUua1VwICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUua1VwIDogdGhpcy5rVXA7XG4gICAgdGhpcy5rVXAgPSB0eXBlb2YgbmV3U3RhdGUua1VwICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUua1VwIDogdGhpcy5rVXA7XG4gICAgdGhpcy5rTGVmdCA9IHR5cGVvZiBuZXdTdGF0ZS5rTGVmdCAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLmtMZWZ0IDogdGhpcy5rTGVmdDtcbiAgICB0aGlzLmtSaWdodCA9IHR5cGVvZiBuZXdTdGF0ZS5rUmlnaHQgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5rUmlnaHQgOiB0aGlzLmtSaWdodDtcbiAgICB0aGlzLm1vdXNlWCA9IHR5cGVvZiBuZXdTdGF0ZS5tb3VzZVggIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5tb3VzZVggOiB0aGlzLm1vdXNlWDtcbiAgICB0aGlzLm1vdXNlWSA9IHR5cGVvZiBuZXdTdGF0ZS5tb3VzZVkgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5tb3VzZVkgOiB0aGlzLm1vdXNlWTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBuZXdTdGF0ZS5zZWxlY3RlZFdlYXBvbkluZGV4IHx8IHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleDtcbn07XG5cbi8vIGdldCB0aGUgc3RhdGUgb2YgZWFjaCB3ZWFwb25cblBsYXllci5wcm90b3R5cGUuZ2V0V2VhcG9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdGF0ZS5wdXNoKHRoaXMud2VhcG9uc1tpXS5nZXRTdGF0ZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcbiIsIi8vIHZhciB3ZWFwb25zID0gcmVxdWlyZShcIi4vZGF0YS93ZWFwb25zXCIpO1xuLy8gdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xuLy9cbnZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vUGFydGljbGUvRW1pdHRlclwiKTtcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcblxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgdmFyIG15SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkO1xuICAgICAgICB0aGlzLmNsaWVudExpc3QuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGxheWVycyl7XG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkICsgXCIgXCIgKyBwbGF5ZXJzW2lkXS5waW5nKTtcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlckRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gXCIxMnB4IE9wZW4gU2Fuc1wiO1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJGUFM6ICBcIiArIHdpbmRvdy5nYW1lLmZwcywgNSwgMjApO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQSU5HOiBcIiArIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZywgNSwgMzQpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJDQU1FUkE6IFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS55KSwgNSwgNDgpO1xuICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQTEFZRVI6ICBcIiArIE1hdGguZmxvb3IocGxheWVyLngpICsgXCIsIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIueSksIDUsIDYyKTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIk1PVVNFOiBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVkpLCA1LCA3Nik7XG4gICAgICAgICAgICBpZihwbGF5ZXIpIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkRJUjogXCIgKyBwbGF5ZXIuZGlyZWN0aW9uLnRvRml4ZWQoMiksIDUsIDkwKTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQQVJUSUNMRVM6IFwiICsgd2luZG93LmdhbWUucGFydGljbGVzLmxlbmd0aCwgNSwgMTA0KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSBcIjI0cHggT3BlbiBTYW5zXCI7XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyVUkgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG5cbiAgICAgICAgLy9ndWkgYmcgY29sb3JcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCgwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsIDE0MCwgMzUpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMzUpXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdyYWRpZW50XG4gICAgICAgIHZhciBncmQ9IHdpbmRvdy5nYW1lLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgxNDAsMCwxOTAsMCk7XG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMCxcInJnYmEoMCwwLDAsMC4zNSlcIik7XG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMSxcInJnYmEoMCwwLDAsMClcIik7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGU9Z3JkO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFJlY3QoMTQwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsNTAsMzUpO1xuXG5cblxuICAgICAgICB2YXIgd2VhcG9uID0gIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XTtcbiAgICAgICAgLy8gZHJhdyB3ZWFwb24gaWNvblxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB3ZWFwb24uaWNvblN4LCB3ZWFwb24uaWNvblN5LCB3ZWFwb24uaWNvblcsIHdlYXBvbi5pY29uSCwgOTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMywgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgpO1xuICAgICAgICAvLyBkcmF3IG1hZ2F6aW5lIGNvdW50J1xuICAgICAgICBpZiAod2VhcG9uLnJlbG9hZGluZykge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgODUsIDIxNCwgMjEsIDIyLCAxMjUsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMCwgMjEsIDIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh3ZWFwb24uYnVsbGV0cywgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZTdkMjllXCI7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsICAxMjIsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAxMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkcmF3IGhlYXJ0XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIDAsIDIyOCwgMTMsIDEyLCAxMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDIzLCAxMywgMTIpO1xuICAgICAgICAvLyBkcmF3IEhQXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHBsYXllci5ocCwgMzAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSA5KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQocGxheWVyLmhwLCAzMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDEwKTtcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXNwYXduQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG5cbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIHtcblxuICAgICAgICAgICAgLy8gdmFyIHNwYXduTG9jYXRpb25Gb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdmFyIHg7XG4gICAgICAgICAgICAvLyB2YXIgeTtcbiAgICAgICAgICAgIC8vIHdoaWxlICghc3Bhd25Mb2NhdGlvbkZvdW5kKSB7XG4gICAgICAgICAgICAvLyAgICAgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgICAgICAvLyAgICAgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICBpZiAoaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogeCwgeTogeX0pKSBzcGF3bkxvY2F0aW9uRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gfVxuXG5cbiAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IGhlbHBlcnMuZmluZFNwYXduTG9jYXRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVsb2FkQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgIGlmIChwbGF5ZXIuYWxpdmUpIHtcbiAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiAoIXBsYXllci5hbGl2ZSkge1xuICAgICAgICAvLyAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAvLyAgICAgdmFyIHkgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgLy8gICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgICAgICAvLyAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgeDogeCxcbiAgICAgICAgLy8gICAgICAgICAgICAgeTogeVxuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgfSk7XG5cblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VtaXR0ZXJCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICAgICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgICAgICAgICAgZW1pdFNwZWVkOiBudWxsLFxuICAgICAgICAgICAgICAgIHg6IHBsYXllci54LFxuICAgICAgICAgICAgICAgIHk6IHBsYXllci55XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xufTtcbiIsInZhciBsZXZlbCA9IHtcclxuICAgIG5hbWU6IFwibGV2ZWwxXCIsXHJcbiAgICB0aWxlczogW1xyXG4gICAgICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDEsMCwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDEsMiwxLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDIsMiwyLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwxLDIsMiwyLDEsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDEsMSwxLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDBdLFxyXG4gICAgICAgIFsxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDEsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDBdLF1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGV2ZWw7XHJcbiIsInZhciBBazQ3ID0ge1xyXG4gICAgXCJuYW1lXCI6IFwiQWs0N1wiLFxyXG4gICAgXCJtYWdhemluZVNpemVcIjogMzAsIC8vIGJ1bGxldHNcclxuICAgIFwiYnVsbGV0c1wiOiAzMCxcclxuICAgIFwiZmlyZVJhdGVcIjogMC4xLCAvLyBzaG90cyBwZXIgc2Vjb25kXHJcbiAgICBcImJ1bGxldHNQZXJTaG90XCI6IDEsIC8vIHNob290IDEgYnVsbGV0IGF0IGEgdGltZVxyXG4gICAgXCJkYW1hZ2VcIjogMTAsIC8vIGhwXHJcbiAgICBcInJlbG9hZFRpbWVcIjogMS42LCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDE3MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogMCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogMjEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMCxcclxuICAgIFwic291bmRcIjogXCJha1wiLFxyXG4gICAgXCJyZWxvYWRTb3VuZFwiOiBcImFrLXJlbG9hZFwiXHJcbn07XHJcblxyXG52YXIgc2hvdGd1biA9IHtcclxuICAgIFwibmFtZVwiOiBcInNob3RndW5cIixcclxuICAgIFwibWFnYXppbmVTaXplXCI6IDEyLCAvLyBidWxsZXRzXHJcbiAgICBcImJ1bGxldHNcIjogMTIsXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuNSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiA0LCAvLyA0IHNob3RndW4gc2x1Z3MgcGVyIHNob3RcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDEuNiwgLy8gc1xyXG4gICAgXCJidWxsZXRTcGVlZFwiOiAyNTAwLCAvLyBwaXhlbHMgcGVyIHNlY29uZFxyXG4gICAgXCJzeFwiOiAwLCAvLyBzcHJpdGVzaGVldCB4IHBvc2l0aW9uXHJcbiAgICBcInN5XCI6IDYwLCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbiAgICBcImljb25TeFwiOiA1MSxcclxuICAgIFwiaWNvblN5XCI6IDIxMCxcclxuICAgIFwiaWNvbldcIjogMzAsXHJcbiAgICBcImljb25IXCI6IDMwLFxyXG4gICAgXCJzb3VuZFwiOiBcInNob3RndW5cIixcclxuICAgIFwicmVsb2FkU291bmRcIjogXCJzaG90Z3VuLXJlbG9hZFwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFrNDc6IEFrNDcsXHJcbiAgICBzaG90Z3VuOiBzaG90Z3VuXHJcbn07XHJcbiIsIi8vIGRlZ3JlZXMgdG8gcmFkaWFuc1xuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xuICAgIHJldHVybiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG59XG5cbi8vIHJhZGlhbnMgdG8gZGVncmVlc1xuZnVuY3Rpb24gdG9EZWdyZWVzKHJhZCkge1xuICAgIHJldHVybiByYWQgKiAoMTgwIC8gTWF0aC5QSSk7XG59XG5cbi8vIGNoZWNrIGlmIHRoaXMgcG9pbnQgaXMgaW5zaWRlIGEgbm9uIHdhbGthYmxlIHRpbGUuIHJldHVybnMgdHJ1ZSBpZiBub3Qgd2Fsa2FibGVcbmZ1bmN0aW9uIGNvbGxpc2lvbkNoZWNrKHBvaW50KSB7XG4gICAgdmFyIHRpbGVSb3cgPSBNYXRoLmZsb29yKHBvaW50LnkgLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSk7XG4gICAgdmFyIHRpbGVDb2wgPSBNYXRoLmZsb29yKHBvaW50LnggLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSk7XG4gICAgaWYgKHRpbGVSb3cgPCAwIHx8IHRpbGVSb3cgPj0gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50IHx8IHRpbGVDb2wgPCAwIHx8IHRpbGVDb2wgPj0gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50ICkgcmV0dXJuIHRydWU7IC8vIG91dHNpZGUgbWFwXG4gICAgcmV0dXJuICh3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t0aWxlUm93XVt0aWxlQ29sXSA+IDApO1xufVxuXG4vLyB0YWtlcyBhIHBvaW50IGFuZCByZXR1bnMgdGlsZSB4eXdoIHRoYXQgaXMgdW5kZXIgdGhhdCBwb2ludFxuZnVuY3Rpb24gZ2V0UmVjdEZyb21Qb2ludChwb2ludCkge1xuICAgIHZhciB5ID0gTWF0aC5mbG9vcihwb2ludC55IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpICogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemU7XG4gICAgdmFyIHggPSBNYXRoLmZsb29yKHBvaW50LnggLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSkgKiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZTtcbiAgICByZXR1cm4ge3g6IHgsIHk6IHksIHc6IHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplLCBoOiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZX07XG59XG5cbi8vIHJldHVybnMgdGlsZVxuZnVuY3Rpb24gZ2V0VGlsZSh4LCB5KSB7XG4gICAgaWYoeCA+PSAwICYmIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgJiYgeSA+PSAwICYmIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpXG4gICAgICAgIHJldHVybiB3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t5XVt4XTtcbn1cblxuLy8gZmluZHMgYSByYW5kb20gd2Fsa2FibGUgdGlsZSBvbiB0aGUgbWFwXG5mdW5jdGlvbiBmaW5kU3Bhd25Mb2NhdGlvbigpIHtcbiAgICB2YXIgeDtcbiAgICB2YXIgeTtcbiAgICBkbyB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIH1cbiAgICB3aGlsZSAoY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KSk7XG5cbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xufVxuXG4vLyBjaGVja3MgdGhhdCBhIHh5IHBvaW50IGlzIGluc2lkZSB0aGUgZ2FtZSB3b3JsZFxuZnVuY3Rpb24gaXNJbnNpZGVHYW1lKHgsIHkpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIng6XCIseCwgXCJ5OlwiLHksIFwid2lkdGg6XCIsd2luZG93LmdhbWUubGV2ZWwud2lkdGgsIFwiaGVpZ2h0OlwiLHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCk7XG4gICAgLy8gY29uc29sZS5sb2coeCA+PSAwLCB4IDwgd2luZG93LmdhbWUubGV2ZWwud2lkdGgsICB5ID49IDAsIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIGlmICh4ID49IDAgJiYgeCA8IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoICYmIHkgPj0gMCAmJiB5IDwgd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSByZXR1cm4gdHJ1ZTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlcyxcbiAgICBjb2xsaXNpb25DaGVjazogY29sbGlzaW9uQ2hlY2ssXG4gICAgZmluZFNwYXduTG9jYXRpb246IGZpbmRTcGF3bkxvY2F0aW9uLFxuICAgIGdldFJlY3RGcm9tUG9pbnQ6IGdldFJlY3RGcm9tUG9pbnQsXG4gICAgZ2V0VGlsZTogZ2V0VGlsZSxcbiAgICBpc0luc2lkZUdhbWU6IGlzSW5zaWRlR2FtZVxufTtcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG59KTtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbi8vdmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIEJ1bGxldEhvbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwicmdiKDY2LCA2NiwgNjYpXCI7XHJcbiAgICAgICAgLy9kYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDI7XHJcbiAgICAgICAgZGF0YS5jb250YWluZXIgPSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXM7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlmZVRpbWUgPSAxMDtcclxuICAgICAgICAvL3RoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIC8vdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICAvL3RoaXMubW92ZURpc3RhbmNlID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE1KSArIDEpO1xyXG4gICAgICAgIC8vdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuQnVsbGV0SG9sZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAvLyAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgLy8gICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgLy8gfVxyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0SG9sZTtcclxuIiwiZnVuY3Rpb24gUmVjdGFuZ2xlICh4LCB5LCB3LCBoLCBjb2xvcikge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLncgPSB3O1xyXG4gICAgdGhpcy5oID0gaDtcclxuICAgIHRoaXMucmVjdCA9IHt4OngsIHk6eSwgdzp3LCBoOmh9O1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG59XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LnJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMudywgdGhpcy5oKTtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGwoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlO1xyXG4iLCJmdW5jdGlvbiBSZWN0YW5nbGUgKGRhdGEpIHtcclxuICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xyXG4gICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xyXG4gICAgdGhpcy5mb250U2l6ZSA9IGRhdGEuZm9udFNpemU7XHJcbn1cclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IHRoaXMuZm9udFNpemUgKyBcInB4IE9wZW4gU2Fuc1wiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy54LCB0aGlzLnkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWN0YW5nbGU7XHJcbiIsIi8vdmFyIHRpbGVzID0gcmVxdWlyZShcIi4vbGV2ZWxcIikudGlsZXM7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vLi4vaGVscGVycy5qc1wiKTtcclxudmFyIGNvbGxpc2lvbkRldGVjdGlvbiA9IHJlcXVpcmUoXCIuL2NvbGxpc2lvbkRldGVjdGlvblwiKTtcclxuXHJcbmZ1bmN0aW9uIGJsaW5lKHgwLCB5MCwgeDEsIHkxKSB7XHJcblxyXG4gICAgeDAgPSBNYXRoLmZsb29yKHgwKTtcclxuICAgIHkwID0gTWF0aC5mbG9vcih5MCk7XHJcbiAgICB4MSA9IE1hdGguZmxvb3IoeDEpO1xyXG4gICAgeTEgPSBNYXRoLmZsb29yKHkxKTtcclxuXHJcbiAgdmFyIGR4ID0gTWF0aC5hYnMoeDEgLSB4MCksIHN4ID0geDAgPCB4MSA/IDEgOiAtMTtcclxuICB2YXIgZHkgPSBNYXRoLmFicyh5MSAtIHkwKSwgc3kgPSB5MCA8IHkxID8gMSA6IC0xO1xyXG4gIHZhciBlcnIgPSAoZHg+ZHkgPyBkeCA6IC1keSkvMjtcclxuXHJcblxyXG4gIHdoaWxlICh0cnVlKSB7XHJcblxyXG5cclxuICAgIGlmICh4MCA9PT0geDEgJiYgeTAgPT09IHkxKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB2YXIgZTIgPSBlcnI7XHJcbiAgICBpZiAoZTIgPiAtZHgpIHsgZXJyIC09IGR5OyB4MCArPSBzeDsgfVxyXG4gICAgaWYgKGUyIDwgZHkpIHsgZXJyICs9IGR4OyB5MCArPSBzeTsgfVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIG91dHNpZGUgbWFwXHJcbiAgICBpZiAoIWhlbHBlcnMuaXNJbnNpZGVHYW1lKHgwLCB5MCkpIHJldHVybiB7dHlwZTogXCJvdXRzaWRlXCJ9O1xyXG5cclxuICAgIC8vIGhpdCBjaGVjayBhZ2FpbnN0IHBsYXllcnNcclxuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcclxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIGhpdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5wb2ludENpcmNsZSh7eDogeDAsIHk6IHkwfSwge3g6IHBsYXllci54LCB5OiBwbGF5ZXIueSwgcmFkaXVzOiBwbGF5ZXIucmFkaXVzfSk7XHJcbiAgICAgICAgaWYgKGhpdCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge3R5cGU6IFwicGxheWVyXCIsIHBsYXllcjogcGxheWVyfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0aWxlWCA9IE1hdGguZmxvb3IoeDAgLyAzMik7XHJcbiAgICB2YXIgdGlsZVkgPSBNYXRoLmZsb29yKHkwIC8gMzIpO1xyXG4gICAgLy8gY2hlY2sgYWdhaW5zdCB0aWxlc1xyXG4gICAgaWYgKGhlbHBlcnMuZ2V0VGlsZSh0aWxlWCx0aWxlWSkgPT09IDEpIHJldHVybiB7dHlwZTogXCJ0aWxlXCIsIHg6IHRpbGVYLCB5OiB0aWxlWX07XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJsaW5lO1xyXG4iLCJ2YXIgaW50ZXJzZWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gbGluZVJlY3RJbnRlcnNlY3QobGluZSwgcmVjdCkge1xyXG5cclxuICAgICAgICAvL2lmIChwb2ludCBpcyBpbnNpZGUgcmVjdClcclxuICAgICAgICAvLyBpbnRlcnNlY3QgPSBwb2ludDtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgbGVmdFxyXG4gICAgICAgIHZhciBsZWZ0ID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgICAgICB2YXIgbGVmdEludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSxsZWZ0KTtcclxuICAgICAgICBpZiAobGVmdEludGVyc2VjdC55ID49IGxlZnQuc3RhcnQueSAmJiBsZWZ0SW50ZXJzZWN0LnkgPD0gbGVmdC5lbmQueSAmJiBsaW5lLnN0YXJ0LnggPD0gbGVmdC5zdGFydC54ICkge1xyXG4gICAgICAgICAgICBsZWZ0SW50ZXJzZWN0LnggKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIGxlZnRJbnRlcnNlY3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayB0b3BcclxuICAgICAgICB2YXIgdG9wID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0Lnl9fTtcclxuICAgICAgICB2YXIgdG9wSW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCB0b3ApO1xyXG4gICAgICAgIGlmICh0b3BJbnRlcnNlY3QueCA+PSB0b3Auc3RhcnQueCAmJiB0b3BJbnRlcnNlY3QueCA8PSB0b3AuZW5kLnggJiYgbGluZS5zdGFydC55IDw9IHRvcC5zdGFydC55KSB7XHJcbiAgICAgICAgICAgIHRvcEludGVyc2VjdC55ICs9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3BJbnRlcnNlY3Q7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hlY2sgcmlnaHRcclxuICAgICAgICB2YXIgcmlnaHQgPSB7c3RhcnQ6e3g6IHJlY3QueCArIHJlY3QudyAseTogcmVjdC55IH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgICAgICB2YXIgcmlnaHRJbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHJpZ2h0KTtcclxuICAgICAgICBpZiAocmlnaHRJbnRlcnNlY3QueSA+PSByaWdodC5zdGFydC55ICYmIHJpZ2h0SW50ZXJzZWN0LnkgPCByaWdodC5lbmQueSkge1xyXG4gICAgICAgICAgICByaWdodEludGVyc2VjdC54IC09IDE7XHJcbiAgICAgICAgICAgIHJldHVybiByaWdodEludGVyc2VjdDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayBkb3duXHJcbiAgICAgICAgdmFyIGRvd24gPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciBkb3duSW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCBkb3duKTtcclxuICAgICAgICB0b3BJbnRlcnNlY3QueSAtPSAxO1xyXG4gICAgICAgIHJldHVybiBkb3duSW50ZXJzZWN0O1xyXG59XHJcblxyXG4vLyBmaW5kIHRoZSBwb2ludCB3aGVyZSBhIGxpbmUgaW50ZXJzZWN0cyBhIHJlY3RhbmdsZS4gdGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoZSBsaW5lIGFuZCByZWN0IGludGVyc2VjdHNcclxuZnVuY3Rpb24gbGluZVJlY3RJbnRlcnNlY3QyKGxpbmUsIHJlY3QpIHtcclxuICAgIC8vaWYgKHBvaW50IGlzIGluc2lkZSByZWN0KVxyXG4gICAgLy8gaW50ZXJzZWN0ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gY2hlY2sgbGVmdFxyXG4gICAgdmFyIGxlZnRMaW5lID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgIHZhciBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSxsZWZ0TGluZSk7XHJcbiAgICBpZiAoaW50ZXJzZWN0aW9uUG9pbnQueSA+PSBsZWZ0TGluZS5zdGFydC55ICYmIGludGVyc2VjdGlvblBvaW50LnkgPD0gbGVmdExpbmUuZW5kLnkgJiYgbGluZS5zdGFydC54IDw9IGxlZnRMaW5lLnN0YXJ0LnggKSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIHRvcFxyXG4gICAgdmFyIHRvcExpbmUgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueX19O1xyXG4gICAgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHRvcExpbmUpO1xyXG4gICAgaWYgKGludGVyc2VjdGlvblBvaW50LnggPj0gdG9wTGluZS5zdGFydC54ICYmIGludGVyc2VjdGlvblBvaW50LnggPD0gdG9wTGluZS5lbmQueCAmJiBsaW5lLnN0YXJ0LnkgPD0gdG9wTGluZS5zdGFydC55KSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIHJpZ2h0XHJcbiAgICB2YXIgcmlnaHRMaW5lID0ge3N0YXJ0Ont4OiByZWN0LnggKyByZWN0LncgLHk6IHJlY3QueSB9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgcmlnaHRMaW5lKTtcclxuICAgIGlmIChpbnRlcnNlY3Rpb25Qb2ludC55ID49IHJpZ2h0TGluZS5zdGFydC55ICYmIGludGVyc2VjdGlvblBvaW50LnkgPCByaWdodExpbmUuZW5kLnkgJiYgbGluZS5zdGFydC54ID49IHJpZ2h0TGluZS5zdGFydC54KSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGRvd25cclxuICAgIHZhciBkb3duID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCBkb3duKTtcclxuICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxufVxyXG5cclxuXHJcbi8vIENoZWNrcyBpZiBhIHBvaW50IGlzIGluc2lkZSBhIGNpcmNsZVxyXG5mdW5jdGlvbiBwb2ludENpcmNsZShwb2ludCwgY2lyY2xlKSB7XHJcbiAgICAgICAgdmFyIGEgPSBwb2ludC54IC0gY2lyY2xlLng7XHJcbiAgICAgICAgdmFyIGIgPSBwb2ludC55IC0gY2lyY2xlLnk7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBhKmEgKyBiKmIgKTtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBjaXJjbGUucmFkaXVzKSB7IC8vIHBvaW50IGlzIGluc2lkZSBjaXJjbGVcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG4vLyBDaGVja3MgaWYgYSBwb2ludCBpcyBpbnNpZGUgYSByZWN0YW5nbGVcclxuZnVuY3Rpb24gcG9pbnRSZWN0KHBvaW50LCByZWN0KSB7XHJcbiAgICByZXR1cm4gKHBvaW50LnggPj0gcmVjdC54ICYmIHBvaW50LnggPD0gcmVjdC54ICsgcmVjdC53ICYmIHBvaW50LnkgPj0gcmVjdC55ICYmIHBvaW50LnkgPD0gcmVjdC55ICsgcmVjdC5oKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBsaW5lUmVjdEludGVyc2VjdDogbGluZVJlY3RJbnRlcnNlY3QsXHJcbiAgICBwb2ludENpcmNsZTogcG9pbnRDaXJjbGUsXHJcbiAgICBwb2ludFJlY3Q6IHBvaW50UmVjdCxcclxuICAgIGxpbmVSZWN0SW50ZXJzZWN0MjogbGluZVJlY3RJbnRlcnNlY3QyXHJcbn07XHJcbiIsInZhciBpbnRlcnNlY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2ZWN0b3IgPSB7fTtcclxuICAgIHZlY3Rvci5vQSA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm4gc2VnbWVudC5zdGFydDtcclxuICAgIH07XHJcbiAgICB2ZWN0b3IuQUIgPSBmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gc2VnbWVudC5zdGFydDtcclxuICAgICAgICB2YXIgZW5kID0gc2VnbWVudC5lbmQ7XHJcbiAgICAgICAgcmV0dXJuIHt4OmVuZC54IC0gc3RhcnQueCwgeTogZW5kLnkgLSBzdGFydC55fTtcclxuICAgIH07XHJcbiAgICB2ZWN0b3IuYWRkID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4ge3g6IHYxLnggKyB2Mi54LCB5OiB2MS55ICsgdjIueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3Iuc3ViID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4ge3g6djEueCAtIHYyLngsIHk6IHYxLnkgLSB2Mi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5zY2FsYXJNdWx0ID0gZnVuY3Rpb24ocywgdikge1xyXG4gICAgICAgIHJldHVybiB7eDogcyAqIHYueCwgeTogcyAqIHYueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3IuY3Jvc3NQcm9kdWN0ID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4gKHYxLnggKiB2Mi55KSAtICh2Mi54ICogdjEueSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIHNlbGYgPSB7fTtcclxuICAgIHNlbGYudmVjdG9yID0gZnVuY3Rpb24oc2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybiB2ZWN0b3IuQUIoc2VnbWVudCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pbnRlcnNlY3RTZWdtZW50cyA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIHR1cm4gYSA9IHAgKyB0KnIgd2hlcmUgMDw9dDw9MSAocGFyYW1ldGVyKVxyXG4gICAgICAgIC8vIGIgPSBxICsgdSpzIHdoZXJlIDA8PXU8PTEgKHBhcmFtZXRlcilcclxuICAgICAgICB2YXIgcCA9IHZlY3Rvci5vQShhKTtcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuXHJcbiAgICAgICAgdmFyIHEgPSB2ZWN0b3Iub0EoYik7XHJcbiAgICAgICAgdmFyIHMgPSB2ZWN0b3IuQUIoYik7XHJcblxyXG4gICAgICAgIHZhciBjcm9zcyA9IHZlY3Rvci5jcm9zc1Byb2R1Y3QocixzKTtcclxuICAgICAgICB2YXIgcW1wID0gdmVjdG9yLnN1YihxLHApO1xyXG4gICAgICAgIHZhciBudW1lcmF0b3IgPSB2ZWN0b3IuY3Jvc3NQcm9kdWN0KHFtcCwgcyk7XHJcbiAgICAgICAgdmFyIHQgPSBudW1lcmF0b3IgLyBjcm9zcztcclxuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gdmVjdG9yLmFkZChwLHZlY3Rvci5zY2FsYXJNdWx0KHQscikpO1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb247XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pc1BhcmFsbGVsID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gYSBhbmQgYiBhcmUgbGluZSBzZWdtZW50cy5cclxuICAgICAgICAvLyByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBhcmUgcGFyYWxsZWwgKG9yIGNvLWxpbmVhcilcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuICAgICAgICByZXR1cm4gKHZlY3Rvci5jcm9zc1Byb2R1Y3QocixzKSA9PT0gMCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pc0NvbGxpbmVhciA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIGEgYW5kIGIgYXJlIGxpbmUgc2VnbWVudHMuXHJcbiAgICAgICAgLy8gcmV0dXJucyB0cnVlIGlmIGEgYW5kIGIgYXJlIGNvLWxpbmVhclxyXG4gICAgICAgIHZhciBwID0gdmVjdG9yLm9BKGEpO1xyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG5cclxuICAgICAgICB2YXIgcSA9IHZlY3Rvci5vQShiKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuICAgICAgICByZXR1cm4gKHZlY3Rvci5jcm9zc1Byb2R1Y3QodmVjdG9yLnN1YihwLHEpLCByKSA9PT0gMCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5zYWZlSW50ZXJzZWN0ID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuaXNQYXJhbGxlbChhLGIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcnNlY3RTZWdtZW50cyhhLGIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbn07XHJcbmludGVyc2VjdGlvbi5pbnRlcnNlY3RTZWdtZW50cyA9IGludGVyc2VjdGlvbigpLmludGVyc2VjdFNlZ21lbnRzO1xyXG5pbnRlcnNlY3Rpb24uaW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uKCkuc2FmZUludGVyc2VjdDtcclxuaW50ZXJzZWN0aW9uLmlzUGFyYWxsZWwgPSBpbnRlcnNlY3Rpb24oKS5pc1BhcmFsbGVsO1xyXG5pbnRlcnNlY3Rpb24uaXNDb2xsaW5lYXIgPSBpbnRlcnNlY3Rpb24oKS5pc0NvbGxpbmVhcjtcclxuaW50ZXJzZWN0aW9uLmRlc2NyaWJlID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICB2YXIgaXNDb2xsaW5lYXIgPSBpbnRlcnNlY3Rpb24oKS5pc0NvbGxpbmVhcihhLGIpO1xyXG4gICAgdmFyIGlzUGFyYWxsZWwgPSBpbnRlcnNlY3Rpb24oKS5pc1BhcmFsbGVsKGEsYik7XHJcbiAgICB2YXIgcG9pbnRPZkludGVyc2VjdGlvbiA9IHVuZGVmaW5lZDtcclxuICAgIGlmIChpc1BhcmFsbGVsID09PSBmYWxzZSkge1xyXG4gICAgICAgIHBvaW50T2ZJbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb24oKS5pbnRlcnNlY3RTZWdtZW50cyhhLGIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtjb2xsaW5lYXI6IGlzQ29sbGluZWFyLHBhcmFsbGVsOiBpc1BhcmFsbGVsLGludGVyc2VjdGlvbjpwb2ludE9mSW50ZXJzZWN0aW9ufTtcclxufTtcclxuXHJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdGlvbjtcclxuIiwidmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL1dlYXBvblwiKTtcclxudmFyIHdlYXBvbkRhdGEgPSByZXF1aXJlKFwiLi4vZGF0YS93ZWFwb25zXCIpLkFrNDc7XHJcblxyXG5jbGFzcyBBazQ3IGV4dGVuZHMgV2VhcG9ue1xyXG4gICAgY29uc3RydWN0b3Iob3duZXIsIGV4aXN0aW5nV2VhcG9uRGF0YSkge1xyXG4gICAgICAgIHdlYXBvbkRhdGEgPSBleGlzdGluZ1dlYXBvbkRhdGEgfHwgd2VhcG9uRGF0YTtcclxuICAgICAgICBzdXBlcihvd25lciwgd2VhcG9uRGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWs0NztcclxuIiwidmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL1dlYXBvblwiKTtcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5zaG90Z3VuO1xudmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldFwiKTtcblxuY2xhc3MgU2hvdGd1biBleHRlbmRzIFdlYXBvbntcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XG4gICAgICAgIHdlYXBvbkRhdGEgPSBleGlzdGluZ1dlYXBvbkRhdGEgfHwgd2VhcG9uRGF0YTtcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xuICAgIH1cbn1cblxuU2hvdGd1bi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuXG4gICAgLy8gcGxheSBlbXB0eSBjbGlwIHNvdW5kIGlmIG91dCBvZiBidWxsZXRzXG4gICAgaWYgKCB0aGlzLmJ1bGxldHMgPCAxICYmICF0aGlzLnJlbG9hZGluZykge1xuICAgICAgICBpZiAoIXRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCkge1xuICAgICAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwID0gY3JlYXRlanMuU291bmQucGxheShcImVtcHR5XCIpO1xuICAgICAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwLm9uKFwiY29tcGxldGVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwID0gbnVsbDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nIHx8IHRoaXMuYnVsbGV0cyA8IDEpIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuYnVsbGV0cyAtPSAxO1xuICAgIHRoaXMuZmlyZVRpbWVyID0gMDtcblxuICAgIHZhciBkaXJlY3Rpb25zID0gW107XG4gICAgdmFyIGRpcmVjdGlvbjtcblxuICAgIC8vdmFyIHRhcmdldExvY2F0aW9ucyA9IFtdO1xuICAgIC8vdmFyIHRhcmdldExvY2F0aW9ucztcblxuICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkodGhpcy5zb3VuZCk7XG4gICAgLy8gc2hvb3QgNCBidWxsZXRzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHNQZXJTaG90OyBpICs9IDEpIHtcblxuICAgICAgICBpZiAoIWFjdGlvbi5kYXRhLmRpcmVjdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIHJhbmRvbWl6ZSBkaXJlY3Rpb25zIG15c2VsZlxuICAgICAgICAgICAgZGlyZWN0aW9uID0gdGhpcy5vd25lci5kaXJlY3Rpb24gKyBNYXRoLnJhbmRvbSgpICogMC4yNSAtIDAuMTI1O1xuICAgICAgICAgICAgZGlyZWN0aW9ucy5wdXNoKGRpcmVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBhY3Rpb24uZGF0YS5kaXJlY3Rpb25zW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoe1xuICAgICAgICAgICAgeDogdGhpcy5vd25lci54LFxuICAgICAgICAgICAgeTogdGhpcy5vd25lci55LFxuICAgICAgICAgICAgZGlyZWN0aW9uOmRpcmVjdGlvbixcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2UsXG4gICAgICAgICAgICBzcGVlZDogdGhpcy5idWxsZXRTcGVlZFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKFwiRklSRVwiLCBhY3Rpb24sIGRpcmVjdGlvbnMpO1xuICAgIGFjdGlvbi5kYXRhLmRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zO1xuXG5cbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG90Z3VuO1xuIiwidmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldFwiKTtcblxuY2xhc3MgV2VhcG9ue1xuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBkYXRhKSB7XG4gICAgICAgIHRoaXMub3duZXIgPSBvd25lcjtcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xuICAgICAgICB0aGlzLm1hZ2F6aW5lU2l6ZSA9IGRhdGEubWFnYXppbmVTaXplO1xuICAgICAgICB0aGlzLmJ1bGxldHMgPSBkYXRhLmJ1bGxldHM7XG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSBkYXRhLmZpcmVSYXRlO1xuICAgICAgICB0aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSBkYXRhLmJ1bGxldFNwZWVkO1xuICAgICAgICB0aGlzLmJ1bGxldHNQZXJTaG90ID0gZGF0YS5idWxsZXRzUGVyU2hvdDtcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XG4gICAgICAgIHRoaXMuc3kgPSBkYXRhLnN5O1xuXG4gICAgICAgIHRoaXMuaWNvblN4ID0gZGF0YS5pY29uU3g7XG4gICAgICAgIHRoaXMuaWNvblN5ID0gZGF0YS5pY29uU3k7XG4gICAgICAgIHRoaXMuaWNvblcgPSBkYXRhLmljb25XO1xuICAgICAgICB0aGlzLmljb25IID0gZGF0YS5pY29uSDtcblxuICAgICAgICB0aGlzLnNvdW5kID0gZGF0YS5zb3VuZDtcbiAgICAgICAgdGhpcy5yZWxvYWRTb3VuZCA9IGRhdGEucmVsb2FkU291bmQ7XG5cbiAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwID0gbnVsbDtcbiAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlUmVsb2FkID0gY3JlYXRlanMuU291bmQuY3JlYXRlSW5zdGFuY2UodGhpcy5yZWxvYWRTb3VuZCk7XG5cbiAgICAgICAgdGhpcy5maXJlVGltZXIgPSB0aGlzLmZpcmVSYXRlO1xuXG4gICAgICAgIHRoaXMucmVsb2FkaW5nID0gZGF0YS5yZWxvYWRpbmcgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgPSBkYXRhLnJlbG9hZFRpbWVyIHx8IDA7XG4gICAgfVxufVxuXG5XZWFwb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSkgdGhpcy5maXJlVGltZXIgKz0gZHQ7XG5cbiAgICBpZiAodGhpcy5yZWxvYWRpbmcpIHtcbiAgICAgICAgdGhpcy5yZWxvYWRUaW1lciArPSBkdDtcbiAgICAgICAgaWYgKHRoaXMucmVsb2FkVGltZXIgPiB0aGlzLnJlbG9hZFRpbWUpe1xuICAgICAgICAgICAgdGhpcy5maWxsTWFnYXppbmUoKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcFJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuV2VhcG9uLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XG5cbiAgICAvLyBwbGF5IGVtcHR5IGNsaXAgc291bmQgaWYgb3V0IG9mIGJ1bGxldHNcbiAgICBpZiAoIHRoaXMuYnVsbGV0cyA8IDEgJiYgIXRoaXMucmVsb2FkaW5nKSB7XG4gICAgICAgIGlmICghdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwKSB7XG4gICAgICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAgPSBjcmVhdGVqcy5Tb3VuZC5wbGF5KFwiZW1wdHlcIik7XG4gICAgICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAub24oXCJjb21wbGV0ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5idWxsZXRzIC09IHRoaXMuYnVsbGV0c1BlclNob3Q7XG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xuXG4gICAgY3JlYXRlanMuU291bmQucGxheSh0aGlzLnNvdW5kKTtcblxuICAgIC8vd2luZG93LmdhbWUuc291bmRzW3RoaXMuc291bmRdLnBsYXkoKTtcbiAgICB2YXIgYnVsbGV0ID0gbmV3IEJ1bGxldCh7XG4gICAgICAgIHg6IHRoaXMub3duZXIueCxcbiAgICAgICAgeTogdGhpcy5vd25lci55LFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlLFxuICAgICAgICBzcGVlZDogdGhpcy5idWxsZXRTcGVlZFxuICAgIH0pO1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmICh0aGlzLm93bmVyLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSAvLyBpZiB0aGlzIGlzIG15IHBsYXllci4gcGxheSByZWxvYWQgc291bmRcbiAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlUmVsb2FkLnBsYXkoKTtcbiAgICB0aGlzLnJlbG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZmlsbE1hZ2F6aW5lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5idWxsZXRzID0gdGhpcy5tYWdhemluZVNpemU7XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLnN0b3BSZWxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5vd25lci5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgLy8gaWYgdGhpcyBpcyBteSBwbGF5ZXIuIHN0b3AgcmVsb2FkIHNvdW5kXG4gICAgICAgIHRoaXMuc291bmRJbnN0YW5jZVJlbG9hZC5zdG9wKCk7XG4gICAgdGhpcy5yZWxvYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIGJ1bGxldHM6IHRoaXMuYnVsbGV0cyxcbiAgICAgICAgZmlyZVRpbWVyOiB0aGlzLmZpcmVSYXRlLFxuICAgICAgICByZWxvYWRpbmc6IHRoaXMucmVsb2FkaW5nLFxuICAgICAgICByZWxvYWRUaW1lcjogdGhpcy5yZWxvYWRUaW1lclxuICAgIH07XG59O1xubW9kdWxlLmV4cG9ydHMgPSBXZWFwb247XG4iLCJ2YXIgU2hvdGd1biA9IHJlcXVpcmUoXCIuLi8uL3dlYXBvbnMvU2hvdGd1blwiKTtcclxudmFyIEFrNDcgPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL0FrNDdcIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKTtcclxuXHJcbmZ1bmN0aW9uIHdlYXBvbkNyZWF0b3Iob3duZXIsIGRhdGEpIHtcclxuXHJcbiAgICB2YXIgd2VwRGF0YSA9IHdlYXBvbkRhdGFbZGF0YS5uYW1lXTtcclxuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7IHdlcERhdGFba2V5XSA9IGRhdGFba2V5XTsgfVxyXG5cclxuICAgIHN3aXRjaCAoZGF0YS5uYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIkFrNDdcIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBazQ3KG93bmVyLCB3ZXBEYXRhKTtcclxuICAgICAgICBjYXNlIFwic2hvdGd1blwiOlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNob3RndW4ob3duZXIsIHdlcERhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdlYXBvbkNyZWF0b3I7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gdmFyIFBsYXllciA9IHJlcXVpcmUoXCIuLy4uL1BsYXllclwiKTtcblxuZnVuY3Rpb24gQ2xpZW50KElEKXtcbiAgICAvL3RoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG4gICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoSUQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsIHBvcnQ6IHdpbmRvdy5sb2NhdGlvbi5wb3J0LCBwYXRoOiBcIi9wZWVyXCJ9KTtcblxuICAgIC8vIFN0cmVzcyB0ZXN0XG4gICAgdGhpcy50ZXN0c1JlY2VpdmVkID0gMDtcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdOy8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBhY3Rpb25zIGZyb20gdGhlIGhvc3RcbiAgICB0aGlzLmNoYW5nZXMgPSBbXTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGNoYW5nZXMgZnJvbSB0aGUgaG9zdFxuXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAvLyBpdmUgZ290IG15IHBlZXJJRCBhbmQgZ2FtZUlELCBsZXRzIHNlbmQgaXQgdG8gdGhlIHNlcnZlciB0byBqb2luIHRoZSBob3N0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuc29ja2V0LmVtaXQoXCJqb2luXCIsIHtwZWVySUQ6IGlkLCBnYW1lSUQ6IHdpbmRvdy5nYW1lLmdhbWVJRH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcblxuICAgICAgICB3aW5kb3cuZ2FtZS5teVBsYXllcklEID0gaWQ7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuZ2FtZS5zdGFydGVkKSB3aW5kb3cuZ2FtZS5zdGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG5cbiAgICAgICAgLy8gY2xvc2Ugb3V0IGFueSBvbGQgY29ubmVjdGlvbnNcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcbiAgICAgICAgICAgICAgICBpZiAoY29ublBlZXIgIT09IGNvbm4ucGVlcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXVswXS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBvbGQgaG9zdHMgcGxheWVyIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZGVsZXRlIG9sZCBwbGF5ZXJcIiwgY29ublBlZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgaXRcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG5cbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJKb2luZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgXCJwbGF5ZXJMZWZ0XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVVcGRhdGVcIjpcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLmdhbWVTdGF0ZS5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW25ld1N0YXRlLmlkXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0cyBteSBvd24gc3RhdGUsIHdlIGlnbm9yZSBrZXlzdGF0ZSBhbmQgb3RoZXIgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBwbGF5ZXIueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogcGxheWVyLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhwOiBuZXdTdGF0ZS5ocCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpdmU6IG5ld1N0YXRlLmFsaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci51cGRhdGVTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6IC8vIGNoYW5nZXMgYW5kIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzLmNvbmNhdChkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLmNvbmNhdChkYXRhLmFjdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAgICAgICAgICAgICAgICBkYXRhLnBpbmdzLmZvckVhY2goZnVuY3Rpb24ocGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twaW5nLmlkXS5waW5nID0gcGluZy5waW5nO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXS5waW5nO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3Qod2luZG93LmdhbWUucGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWxjdWxhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG59XG5cbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHZhciBsYXN0Q2xpZW50U3RhdGUgPSBwbGF5ZXIubGFzdENsaWVudFN0YXRlO1xuICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RDbGllbnRTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuXG4gICAgLy8gYWRkIGFueSBwZXJmb3JtZWQgYWN0aW9ucyB0byBjaGFuZ2UgcGFja2FnZVxuICAgIGlmIChwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgIH1cblxuICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXMsIHNlbmQgZW0gdG8gaG9zdFxuICAgICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgICAgICAgICBldmVudDogXCJuZXR3b3JrVXBkYXRlXCIsXG4gICAgICAgICAgICB1cGRhdGVzOiBjaGFuZ2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBsYXllci5sYXN0Q2xpZW50U3RhdGUgPSBjdXJyZW50U3RhdGU7XG5cblxuXG5cbiAgICAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXTtcblxuICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZS5pZCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5pZF0ubmV0d29ya1VwZGF0ZShjaGFuZ2UpO1xuICAgICAgICAgICAgfWNhdGNoIChlcnIpIHtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZXMgPSBbXTtcbiAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuXG5cblxuICAgIC8vIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgLy8gdmFyIG15UGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIC8vIGlmICghbXlQbGF5ZXIpIHJldHVybjtcbiAgICAvL1xuICAgIC8vICBpZiAoIV8uaXNFcXVhbChteVBsYXllci5rZXlzLCBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUpKSB7XG4gICAgLy8gICAgIC8vIHNlbmQga2V5c3RhdGUgdG8gaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJrZXlzXCIsXG4gICAgLy8gICAgICAgICBrZXlzOiBteVBsYXllci5rZXlzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICB9XG4gICAgLy8gbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlID0gXy5jbG9uZShteVBsYXllci5rZXlzKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuICAgIC8vXG4gICAgLy8gdmFyIGN1cnJlbnRQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICAvLyB2YXIgY2hhbmdlcyA9IFtdO1xuICAgIC8vIHZhciBsYXN0U3RhdGUgPSBteVBsYXllci5sYXN0U3RhdGU7XG4gICAgLy8gdmFyIG5ld1N0YXRlID0gbXlQbGF5ZXIuZ2V0U3RhdGUoKTtcbiAgICAvL1xuICAgIC8vIC8vIGNvbXBhcmUgcGxheWVycyBuZXcgc3RhdGUgd2l0aCBpdCdzIGxhc3Qgc3RhdGVcbiAgICAvLyB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XG4gICAgLy8gaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgIC8vICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlc1xuICAgIC8vICAgICBjaGFuZ2UucGxheWVySUQgPSBteVBsYXllci5pZDtcbiAgICAvLyAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gbXlQbGF5ZXIubGFzdFN0YXRlID0gbmV3U3RhdGU7XG4gICAgLy8gLy8gaWYgdGhlcmUgYXJlIGNoYW5nZXNcbiAgICAvLyBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgIC8vICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZiAodGhpcy5hY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAvLyAgICAgLy8gc2VuZCBhbGwgcGVyZm9ybWVkIGFjdGlvbnMgdG8gdGhlIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiYWN0aW9uc1wiLFxuICAgIC8vICAgICAgICAgZGF0YTogdGhpcy5hY3Rpb25zXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gY2xlYXIgYWN0aW9ucyBxdWV1ZVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmNoYW5nZXNbaV0ubGVuZ3RoOyBqICs9IDEpICB7XG4gICAgLy8gICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV1bal07XG4gICAgLy9cbiAgICAvLyAgICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgIC8vICAgICAgICAgaWYgKGNoYW5nZS5wbGF5ZXJJRCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UucGxheWVySURdLmNoYW5nZShjaGFuZ2UpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdGhpcy5jaGFuZ2VzID0gW107XG5cbn07XG5cbiAgICAvL1xuICAgIC8vIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgIC8vICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIHRoaXMucGVlciwgY29ubik7XG4gICAgLy9cbiAgICAvLyAgICAgLy9jcmVhdGUgdGhlIHBsYXllclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnBsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcihjb25uLnBlZXIpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy9MaXN0ZW4gZm9yIGRhdGEgZXZlbnRzIGZyb20gdGhlIGhvc3RcbiAgICAvLyAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgLy8gICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikgeyAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAvLyAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAvLyAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vIHBpbmcgdGVzdFxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5waW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgLy8gICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfSwgMjAwMCk7XG4gICAgLy9cbiAgICAvLyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhvc3QoKXtcbiAgICB0aGlzLmNvbm5zID0ge307XG4gICAgdGhpcy5hY3Rpb25zID0ge307IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSBhbGwgdGhlIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBjbGllbnRzXG4gICAgdGhpcy5sYXN0UGxheWVyc1N0YXRlID0gW107XG4gICAgdGhpcy5kaWZmID0gbnVsbDtcblxuICAgIHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAvL3RoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG4gICAgICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKGRhdGEuaG9zdElELCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLCBwb3J0OiB3aW5kb3cubG9jYXRpb24ucG9ydCwgcGF0aDogXCIvcGVlclwifSk7XG5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2VuZCBhIHBpbmcgZXZlcnkgMiBzZWNvbmRzLCB0byB0cmFjayBwaW5nIHRpbWVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBwaW5nczogd2luZG93LmdhbWUubmV0d29yay5ob3N0LmdldFBpbmdzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG5cbiAgICAgICAgICAgIC8vIHNlbmQgZnVsbCBnYW1lIHN0YXRlIG9uY2UgaW4gYSB3aGlsZVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IFwiZ2FtZVN0YXRlVXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMTAwMCk7XG5cbiAgICAgICAgICAgIGRhdGEucGVlcnMuZm9yRWFjaChmdW5jdGlvbihwZWVySUQpIHtcbiAgICAgICAgICAgICAgICAvL2Nvbm5lY3Qgd2l0aCBlYWNoIHJlbW90ZSBwZWVyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm4gPSAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuY29ubmVjdChwZWVySUQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaG9zdElEOlwiLCB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5pZCwgXCIgY29ubmVjdCB3aXRoXCIsIHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbcGVlcklEXSA9IHBlZXI7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW3BlZXJJRF0gPSBjb25uO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCBuZXcgcGxheWVyIGRhdGEgdG8gZXZlcnlvbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckpvaW5lZFwiLCBwbGF5ZXJEYXRhOiBuZXdQbGF5ZXIuZ2V0RnVsbFN0YXRlKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBuZXcgcGxheWVyIHRoZSBmdWxsIGdhbWUgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5lbWl0KCB7Y2xpZW50SUQ6IGNvbm4ucGVlciwgZXZlbnQ6IFwiZ2FtZVN0YXRlXCIsIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKCl9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1tjb25uLnBlZXJdO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJFUlJPUiBFVkVOVFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pOyAvLyBhbnN3ZXIgdGhlIHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBjbGllbnQsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmV0d29ya1VwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBmcm9tIGEgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLm5ldHdvcmtVcGRhdGUoZGF0YS51cGRhdGVzKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YS5hY3Rpb25zKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImFjdGlvbnNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJhY3Rpb25zIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiY2hhbmdlc1wiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uY2hhbmdlKGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImtleXNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJrZXlzIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhLmtleXMsICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMgPSBfLmNsb25lKGRhdGEua2V5cyk7IC8vVE9ETzogdmVyaWZ5IGlucHV0IChjaGVjayB0aGF0IGl0IGlzIHRoZSBrZXkgb2JqZWN0IHdpdGggdHJ1ZS9mYWxzZSB2YWx1ZXMpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcbiAgICAgICAgICAgIHRoaXMuY29ubnNbY29ubl0uc2VuZChkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFTUlUIVwiLCBkYXRhKTtcbiAgICAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcblxuICAgICAgICB2YXIgY2hhbmdlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRGdWxsU3RhdGUgPSBwbGF5ZXIuZ2V0RnVsbFN0YXRlKCk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRGdWxsU3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gcGxheWVyLmxhc3RGdWxsU3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcbiAgICAgICAgICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkgfHwgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMubGVuZ3RoID4gMCkgeyAvL3RoZXJlJ3MgYmVlbiBjaGFuZ2VzIG9yIGFjdGlvbnNcbiAgICAgICAgICAgICAgICBjaGFuZ2UuaWQgPSBwbGF5ZXIuaWQ7XG4gICAgICAgICAgICAgICAgY2hhbmdlLmFjdGlvbnMgPSBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucztcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIubGFzdEZ1bGxTdGF0ZSA9IGN1cnJlbnRGdWxsU3RhdGU7XG4gICAgICAgICAgICAgICAgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgLy8gc2VuZCBjaGFuZ2VzXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmdldFBpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwaW5ncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHBpbmdzLnB1c2goe2lkOiBwbGF5ZXIuaWQsIHBpbmc6IHBsYXllci5waW5nIHx8IFwiaG9zdFwifSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGluZ3M7XG4gICAgfTtcbn07XG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5waW5nID0gXCItXCI7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvKCk7XHJcblxyXG4gICAgLy8gcmVjZWl2aW5nIG15IGNsaWVudCBJRFxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJJRFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQgPSBuZXcgQ2xpZW50KGRhdGEuSUQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3Qoe2hvc3RJRDogZGF0YS5ob3N0SUQsIHBlZXJzOiBkYXRhLnBlZXJzfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgam9pbmVkXCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KHtob3N0SUQ6IGRhdGEuaG9zdElELCBwZWVyczpbZGF0YS5wZWVySURdfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUExBWUVSIExFRlRcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5wbGF5ZXJJRH0pO1xyXG4gICAgfSk7XHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2RhdGEuaWRdO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIC8vIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIC8vIHRoaXMuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxufTtcclxuIl19
