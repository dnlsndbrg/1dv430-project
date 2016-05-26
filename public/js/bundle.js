(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var helpers = require("./helpers");
//var Emitter = require("./particle/Emitter");
var bresenham = require("./util/bresenham");
//var lineRectIntersect = require("./util/lineRectIntersect");
var BulletHole = require("./particle/BulletHole");
var Flash = require("./particle/Flash");
var collisionDetection = require("./util/collisionDetection");

// instant bullet
function Bullet(data) {
    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    var startX = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    var startY = data.y + Math.sin(data.direction + 1.5707963268) * 5;
    startX = startX + Math.cos(data.direction) * 30;
    startY= startY + Math.sin(data.direction) * 30;

    // create muzzle flashes
    var size = Math.floor(Math.random() * 3) + 3;
    window.game.particles.push(new Flash({x: startX, y: startY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    var smallFlashX = startX + Math.cos(data.direction) *  (Math.floor(Math.random() * 2) + 3);
    var smallFlashY= startY + Math.sin(data.direction) *  (Math.floor(Math.random() * 2) + 3);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 1;
    smallFlashX = startX + Math.cos(data.direction) *  (Math.floor(Math.random() * 2) + 8);
    smallFlashY= startY + Math.sin(data.direction) *  (Math.floor(Math.random() * 2) + 8);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    smallFlashX = startX + Math.cos(data.direction) *  (Math.floor(Math.random() * 2) + 5);
    smallFlashY= startY + Math.sin(data.direction) *  (Math.floor(Math.random() * 2) + 5);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    smallFlashX = startX + Math.cos(data.direction + 1.5707963268) *  (Math.floor(Math.random() * 2) + 3);
    smallFlashY = startY + Math.sin(data.direction + 1.5707963268) *  (Math.floor(Math.random() * 2) + 3);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    smallFlashX = startX + Math.cos(data.direction + 1.5707963268) * - (Math.floor(Math.random() * 2) + 3);
    smallFlashY = startY + Math.sin(data.direction + 1.5707963268) * - (Math.floor(Math.random() * 2) + 3);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));

    // check that the bullet spawn location is inside the game
    if (!helpers.isInsideGame(startX, startY)) return;

    // check if bullet starting location is inside a tile
    var tileX = Math.floor(startX / 32);
    var tileY = Math.floor(startY / 32);
    if (helpers.getTile(tileX,tileY) === 1) return;

    //this.direction = data.direction;
    //this.speed = data.bulletSpeed;
    //this.damage = data.damage;
    //
    var line = {
        start: {x: startX, y: startY},
        end: {x: data.targetX, y: data.targetY}
    };

    var intersect = null;

    var collision = bresenham(startX, startY, data.targetX, data.targetY); // find colliding rectangles
    if (collision) {
        switch(collision.type) {
            case "tile":
                intersect = collisionDetection.lineRectIntersect2(line, {x: collision.x * 32, y: collision.y * 32, w: 32, h: 32});
                window.game.particles.push(new BulletHole(intersect));
                break;
            case "player":
                collision.player.takeDamage(data.damage, data.direction);
                break;
        }

    }






    // var cx = this.x; // Begin/current cell coords
    // var cy = this.y;
    // var ex = EndX; // End cell coords
    // var ey = EndY;
    //
    // // Delta or direction
    // double dx = EndX-BeginX;
    // double dy = EndY-BeginY;
    //
    // while (cx < ex && cy < ey)
    // {
    //   // find intersection "time" in x dir
    //   float t0 = (ceil(BeginX)-BeginX)/dx;
    //   float t1 = (ceil(BeginY)-BeginY)/dy;
    //
    //   visit_cell(cx, cy);
    //
    //   if (t0 < t1) // cross x boundary first=?
    //   {
    //     ++cx;
    //     BeginX += t0*dx;
    //     BeginY += t0*dy;
    //   }
    //   else
    //   {
    //     ++cy;
    //     BeginX += t1*dx;
    //     BeginY += t1*dy;
    //   }
    // }

}

Bullet.prototype.update = function(dt, index) {


    //
    //
    //
    // var distance = this.speed * dt;
    // //
    // var x = this.x + Math.cos(this.direction) * distance;
    // var y = this.y + Math.sin(this.direction) * distance;
    //
    // // hit check against players
    // this.hitDetection(index);
    //
    // // collision detection against tiles and outside of map
    // var collision = helpers.collisionCheck({x: x, y: y});
    // if (!collision) {
    //     this.x = x;
    //     this.y = y;
    // } else {
    //     // add richocet particle effect
    //     window.game.entities.push(new Emitter({
    //         type: "Ricochet",
    //         emitCount: 1,
    //         emitSpeed: null, // null means instant
    //         x: this.x,
    //         y: this.y
    //     }));
    //     this.destroy(index);
    // }
    //
    // // if off screen, remove it
    // if (this.x < 0 || this.x > window.game.level.width || this.y < 0 || this.y > window.game.level.height) {
    //     this.destroy(index);
    //     return;
    // }
    //


};

// Bullet.prototype.hitDetection = function(index) {
//     // test bullet against all players
//     for (var key in window.game.players) {
//
//         var player = window.game.players[key];
//
//         if (!player.alive) continue;
//
//         var a = this.x - player.x;
//         var b = this.y - player.y;
//         var distance = Math.sqrt( a*a + b*b );
//
//         if (distance < player.radius) {
//             // hit
//             player.takeDamage(this.damage, this.direction);
//             this.destroy(index);
//         }
//     }
//
// };

Bullet.prototype.destroy = function(index) {
    window.game.entities.splice(index, 1);
};

Bullet.prototype.render = function(){
    //
    // this.ctx.save(); // save current state
    // this.ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    // this.ctx.rotate(this.direction - 0.7853981634); // rotate
    //
    // // // linear gradient from start to end of line
    // var grad= this.ctx.createLinearGradient(0, 0, 0, this.length);
    // grad.addColorStop(0, "rgba(255,165,0,0.4)");
    // grad.addColorStop(1, "yellow");
    // this.ctx.strokeStyle = grad;
    //
    // this.ctx.beginPath();
    //   this.ctx.moveTo(0, 0);
    //   this.ctx.lineTo(this.length, this.length);
    //   this.ctx.stroke();
    //
    //
    // // ctx.lineWidth = 1;
    //
    // //
    // // ctx.beginPath();
    // // ctx.moveTo(0,0);
    // // ctx.lineTo(0,this.length);
    //
    // this.ctx.stroke();
    //
    // this.ctx.fillStyle = "white";
    // this.ctx.fillRect(this.length, this.length, 1, 1 );
    //
    //
    // this.ctx.restore(); // restore original states (no rotation etc)
    //
    // //
    // //
    // // ctx.lineWidth = 1;
    // // // linear gradient from start to end of line
    // // var grad= ctx.createLinearGradient(0, 0, 0, this.length);
    // // grad.addColorStop(0, "red");
    // // grad.addColorStop(1, "green");
    // // ctx.strokeStyle = grad;
    // // ctx.beginPath();
    // // ctx.moveTo(0,0);
    // // ctx.lineTo(0,length);
    // // ctx.stroke();
    //


};

module.exports = Bullet;

},{"./helpers":18,"./particle/BulletHole":22,"./particle/Flash":24,"./util/bresenham":29,"./util/collisionDetection":30}],2:[function(require,module,exports){
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

},{"./Camera":3,"./Level":6,"./Player":14,"./Ui":15,"./webRTC/WebRTC":38}],5:[function(require,module,exports){
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

},{"./util/collisionDetection":30}],8:[function(require,module,exports){
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

    if (this.id === window.game.network.client.peer.id) { // if its my player, show respawn button
        // create respawn Button and dim the background
        var bg = new UiRect(0,0,window.game.canvas.width, window.game.canvas.height, "rgba(0,0,0,0.8)");
        var text = new UiText({text: "YOU HAVE DIED!", fontSize: 18, x: 250, y: window.game.canvas.height / 2 - 20});
        var button = new UiButton({text: "RESPAWN", fontSize: 24, x: window.game.canvas.width / 2 - 63, y: window.game.canvas.height / 2, w: 130, h: 40, clickFunction: this.wantToRespawn, context: this});
        window.game.uiElements.push(bg);
        window.game.uiElements.push(text);
        window.game.uiElements.push(button);
    }


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

},{"./Button":2,"./Keyboard":5,"./Mouse":7,"./NetworkControls":8,"./helpers":18,"./particle/Emitter":23,"./uiElements/Rectangle":27,"./uiElements/Text":28,"./weapons/Ak47":32,"./weapons/Shotgun":33,"./weapons/weaponCreator":35}],15:[function(require,module,exports){
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
},{"../helpers":18,"./Particle":25,"dup":9}],21:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"../helpers":18,"./Particle":25,"dup":10}],22:[function(require,module,exports){
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

},{"./Particle":25}],23:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./Blood":20,"./Blood2":21,"./Ricochet":26,"dup":11}],24:[function(require,module,exports){
var Particle = require("./Particle");
var helpers = require("../helpers");

class Flash extends Particle {
    constructor(data) {
        //var rnd = Math.floor(Math.random() * 50);
        // var r = 150;
        // var g = 50;
        // var b = 50;

        data.color = "#ffe600";
        data.lifeTime = 0.05;
        data.container = window.game.particles;
        super(data);

        //this.lifeTime = 0.05;

        //this.direction = helpers.toRadians(Math.floor(Math.random() * 360) + 1);
    }
}

Flash.prototype.update = function(dt, index) {
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


module.exports = Flash;

},{"../helpers":18,"./Particle":25}],25:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],26:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"../helpers":18,"./Particle":25,"dup":13}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
//var tiles = require("./level").tiles;
var helpers = require("./../helpers.js");
var collisionDetection = require("./collisionDetection");

function bline(x0, y0, x1, y1) {

  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  var err = (dx>dy ? dx : -dy)/2;

  while (true) {

    if (x0 === x1 && y0 === y1) break;
    var e2 = err;
    if (e2 > -dx) { err -= dy; x0 += sx; }
    if (e2 < dy) { err += dx; y0 += sy; }



    // check if outside map
    if (!helpers.isInsideGame(x0, y0)) return;


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

},{"./../helpers.js":18,"./collisionDetection":30}],30:[function(require,module,exports){
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

},{"./intersection":31}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").Ak47;

class Ak47 extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
        super(owner, weaponData);
    }
}

module.exports = Ak47;

},{"../data/weapons":17,"./Weapon":34}],33:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").shotgun;
var Bullet = require(".././Bullet2");

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
            targetX: this.owner.mouseX,
            targetY: this.owner.mouseY,
            direction:direction,
            damage: this.damage
        });

        // window.game.entities.push(new Bullet({
        //     x: this.owner.x,
        //     y: this.owner.y,
        //     targetX: this.owner.mouseX,
        //     targetY: this.owner.mouseY,
        //     direction: direction,
        //     bulletSpeed: this.bulletSpeed,
        //     damage: this.damage
        // }));
    }

    //console.log("FIRE", action, directions);
    action.data.directions = directions;


    return action;
};

module.exports = Shotgun;

},{".././Bullet2":1,"../data/weapons":17,"./Weapon":34}],34:[function(require,module,exports){
var Bullet = require(".././Bullet2");

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
        targetX: this.owner.mouseX,
        targetY: this.owner.mouseY,
        direction: this.owner.direction,
        damage: this.damage
    });
    return action;
};

Weapon.prototype.reload = function(action) {
    console.log("reload");
    this.soundInstanceReload.play();
    this.reloading = true;
    this.reloadTimer = 0;
    return action;
};

Weapon.prototype.fillMagazine = function() {
    this.bullets = this.magazineSize;
};

Weapon.prototype.stopReload = function() {
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

},{".././Bullet2":1}],35:[function(require,module,exports){
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

},{".././weapons/Ak47":32,".././weapons/Shotgun":33,"../data/weapons":17}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"./Client":36,"./Host":37}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0Mi5qcyIsInNyYy9qcy9CdXR0b24uanMiLCJzcmMvanMvQ2FtZXJhLmpzIiwic3JjL2pzL0dhbWUuanMiLCJzcmMvanMvS2V5Ym9hcmQuanMiLCJzcmMvanMvTGV2ZWwuanMiLCJzcmMvanMvTW91c2UuanMiLCJzcmMvanMvTmV0d29ya0NvbnRyb2xzLmpzIiwic3JjL2pzL1BhcnRpY2xlL0Jsb29kLmpzIiwic3JjL2pzL1BhcnRpY2xlL0Jsb29kMi5qcyIsInNyYy9qcy9QYXJ0aWNsZS9FbWl0dGVyLmpzIiwic3JjL2pzL1BhcnRpY2xlL1BhcnRpY2xlLmpzIiwic3JjL2pzL1BhcnRpY2xlL1JpY29jaGV0LmpzIiwic3JjL2pzL1BsYXllci5qcyIsInNyYy9qcy9VaS5qcyIsInNyYy9qcy9kYXRhL2xldmVsMS5qcyIsInNyYy9qcy9kYXRhL3dlYXBvbnMuanMiLCJzcmMvanMvaGVscGVycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3BhcnRpY2xlL0J1bGxldEhvbGUuanMiLCJzcmMvanMvcGFydGljbGUvRmxhc2guanMiLCJzcmMvanMvdWlFbGVtZW50cy9SZWN0YW5nbGUuanMiLCJzcmMvanMvdWlFbGVtZW50cy9UZXh0LmpzIiwic3JjL2pzL3V0aWwvYnJlc2VuaGFtLmpzIiwic3JjL2pzL3V0aWwvY29sbGlzaW9uRGV0ZWN0aW9uLmpzIiwic3JjL2pzL3V0aWwvaW50ZXJzZWN0aW9uLmpzIiwic3JjL2pzL3dlYXBvbnMvQWs0Ny5qcyIsInNyYy9qcy93ZWFwb25zL1Nob3RndW4uanMiLCJzcmMvanMvd2VhcG9ucy9XZWFwb24uanMiLCJzcmMvanMvd2VhcG9ucy93ZWFwb25DcmVhdG9yLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuLy92YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XHJcbnZhciBicmVzZW5oYW0gPSByZXF1aXJlKFwiLi91dGlsL2JyZXNlbmhhbVwiKTtcclxuLy92YXIgbGluZVJlY3RJbnRlcnNlY3QgPSByZXF1aXJlKFwiLi91dGlsL2xpbmVSZWN0SW50ZXJzZWN0XCIpO1xyXG52YXIgQnVsbGV0SG9sZSA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0J1bGxldEhvbGVcIik7XHJcbnZhciBGbGFzaCA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0ZsYXNoXCIpO1xyXG52YXIgY29sbGlzaW9uRGV0ZWN0aW9uID0gcmVxdWlyZShcIi4vdXRpbC9jb2xsaXNpb25EZXRlY3Rpb25cIik7XHJcblxyXG4vLyBpbnN0YW50IGJ1bGxldFxyXG5mdW5jdGlvbiBCdWxsZXQoZGF0YSkge1xyXG4gICAgLy8gY3JlYXRlIHRoZSBidWxsZXQgNSBwaXhlbHMgdG8gdGhlIHJpZ2h0IGFuZCAzMCBwaXhlbHMgZm9yd2FyZC4gc28gaXQgYWxpZ25zIHdpdGggdGhlIGd1biBiYXJyZWxcclxuICAgIHZhciBzdGFydFggPSBkYXRhLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xyXG4gICAgdmFyIHN0YXJ0WSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcbiAgICBzdGFydFggPSBzdGFydFggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIHN0YXJ0WT0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcblxyXG4gICAgLy8gY3JlYXRlIG11enpsZSBmbGFzaGVzXHJcbiAgICB2YXIgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMztcclxuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc3RhcnRYLCB5OiBzdGFydFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xyXG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMjtcclxuICAgIHZhciBzbWFsbEZsYXNoWCA9IHN0YXJ0WCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcclxuICAgIHZhciBzbWFsbEZsYXNoWT0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDMpO1xyXG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEZsYXNoKHt4OiBzbWFsbEZsYXNoWCwgeTogc21hbGxGbGFzaFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xyXG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMTtcclxuICAgIHNtYWxsRmxhc2hYID0gc3RhcnRYICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24pICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDgpO1xyXG4gICAgc21hbGxGbGFzaFk9IHN0YXJ0WSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyA4KTtcclxuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc21hbGxGbGFzaFgsIHk6IHNtYWxsRmxhc2hZLCBzaXplOiBzaXplLCBjb250YWluZXI6IHdpbmRvdy5nYW1lLnBhcnRpY2xlc30pKTtcclxuICAgIHNpemUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDI7XHJcbiAgICBzbWFsbEZsYXNoWCA9IHN0YXJ0WCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyA1KTtcclxuICAgIHNtYWxsRmxhc2hZPSBzdGFydFkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgNSk7XHJcbiAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgRmxhc2goe3g6IHNtYWxsRmxhc2hYLCB5OiBzbWFsbEZsYXNoWSwgc2l6ZTogc2l6ZSwgY29udGFpbmVyOiB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXN9KSk7XHJcbiAgICBzaXplID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAyO1xyXG4gICAgc21hbGxGbGFzaFggPSBzdGFydFggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMyk7XHJcbiAgICBzbWFsbEZsYXNoWSA9IHN0YXJ0WSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcclxuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc21hbGxGbGFzaFgsIHk6IHNtYWxsRmxhc2hZLCBzaXplOiBzaXplLCBjb250YWluZXI6IHdpbmRvdy5nYW1lLnBhcnRpY2xlc30pKTtcclxuICAgIHNpemUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDI7XHJcbiAgICBzbWFsbEZsYXNoWCA9IHN0YXJ0WCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIC0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMyk7XHJcbiAgICBzbWFsbEZsYXNoWSA9IHN0YXJ0WSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIC0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMyk7XHJcbiAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgRmxhc2goe3g6IHNtYWxsRmxhc2hYLCB5OiBzbWFsbEZsYXNoWSwgc2l6ZTogc2l6ZSwgY29udGFpbmVyOiB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXN9KSk7XHJcblxyXG4gICAgLy8gY2hlY2sgdGhhdCB0aGUgYnVsbGV0IHNwYXduIGxvY2F0aW9uIGlzIGluc2lkZSB0aGUgZ2FtZVxyXG4gICAgaWYgKCFoZWxwZXJzLmlzSW5zaWRlR2FtZShzdGFydFgsIHN0YXJ0WSkpIHJldHVybjtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBidWxsZXQgc3RhcnRpbmcgbG9jYXRpb24gaXMgaW5zaWRlIGEgdGlsZVxyXG4gICAgdmFyIHRpbGVYID0gTWF0aC5mbG9vcihzdGFydFggLyAzMik7XHJcbiAgICB2YXIgdGlsZVkgPSBNYXRoLmZsb29yKHN0YXJ0WSAvIDMyKTtcclxuICAgIGlmIChoZWxwZXJzLmdldFRpbGUodGlsZVgsdGlsZVkpID09PSAxKSByZXR1cm47XHJcblxyXG4gICAgLy90aGlzLmRpcmVjdGlvbiA9IGRhdGEuZGlyZWN0aW9uO1xyXG4gICAgLy90aGlzLnNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcclxuICAgIC8vdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcclxuICAgIC8vXHJcbiAgICB2YXIgbGluZSA9IHtcclxuICAgICAgICBzdGFydDoge3g6IHN0YXJ0WCwgeTogc3RhcnRZfSxcclxuICAgICAgICBlbmQ6IHt4OiBkYXRhLnRhcmdldFgsIHk6IGRhdGEudGFyZ2V0WX1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIGludGVyc2VjdCA9IG51bGw7XHJcblxyXG4gICAgdmFyIGNvbGxpc2lvbiA9IGJyZXNlbmhhbShzdGFydFgsIHN0YXJ0WSwgZGF0YS50YXJnZXRYLCBkYXRhLnRhcmdldFkpOyAvLyBmaW5kIGNvbGxpZGluZyByZWN0YW5nbGVzXHJcbiAgICBpZiAoY29sbGlzaW9uKSB7XHJcbiAgICAgICAgc3dpdGNoKGNvbGxpc2lvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0aWxlXCI6XHJcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3QgPSBjb2xsaXNpb25EZXRlY3Rpb24ubGluZVJlY3RJbnRlcnNlY3QyKGxpbmUsIHt4OiBjb2xsaXNpb24ueCAqIDMyLCB5OiBjb2xsaXNpb24ueSAqIDMyLCB3OiAzMiwgaDogMzJ9KTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCdWxsZXRIb2xlKGludGVyc2VjdCkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJcIjpcclxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbi5wbGF5ZXIudGFrZURhbWFnZShkYXRhLmRhbWFnZSwgZGF0YS5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIC8vIHZhciBjeCA9IHRoaXMueDsgLy8gQmVnaW4vY3VycmVudCBjZWxsIGNvb3Jkc1xyXG4gICAgLy8gdmFyIGN5ID0gdGhpcy55O1xyXG4gICAgLy8gdmFyIGV4ID0gRW5kWDsgLy8gRW5kIGNlbGwgY29vcmRzXHJcbiAgICAvLyB2YXIgZXkgPSBFbmRZO1xyXG4gICAgLy9cclxuICAgIC8vIC8vIERlbHRhIG9yIGRpcmVjdGlvblxyXG4gICAgLy8gZG91YmxlIGR4ID0gRW5kWC1CZWdpblg7XHJcbiAgICAvLyBkb3VibGUgZHkgPSBFbmRZLUJlZ2luWTtcclxuICAgIC8vXHJcbiAgICAvLyB3aGlsZSAoY3ggPCBleCAmJiBjeSA8IGV5KVxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAvLyBmaW5kIGludGVyc2VjdGlvbiBcInRpbWVcIiBpbiB4IGRpclxyXG4gICAgLy8gICBmbG9hdCB0MCA9IChjZWlsKEJlZ2luWCktQmVnaW5YKS9keDtcclxuICAgIC8vICAgZmxvYXQgdDEgPSAoY2VpbChCZWdpblkpLUJlZ2luWSkvZHk7XHJcbiAgICAvL1xyXG4gICAgLy8gICB2aXNpdF9jZWxsKGN4LCBjeSk7XHJcbiAgICAvL1xyXG4gICAgLy8gICBpZiAodDAgPCB0MSkgLy8gY3Jvc3MgeCBib3VuZGFyeSBmaXJzdD0/XHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICArK2N4O1xyXG4gICAgLy8gICAgIEJlZ2luWCArPSB0MCpkeDtcclxuICAgIC8vICAgICBCZWdpblkgKz0gdDAqZHk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vICAgZWxzZVxyXG4gICAgLy8gICB7XHJcbiAgICAvLyAgICAgKytjeTtcclxuICAgIC8vICAgICBCZWdpblggKz0gdDEqZHg7XHJcbiAgICAvLyAgICAgQmVnaW5ZICs9IHQxKmR5O1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcblxyXG59XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcbiAgICAvLyAvL1xyXG4gICAgLy8gdmFyIHggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIC8vIHZhciB5ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAvL1xyXG4gICAgLy8gLy8gaGl0IGNoZWNrIGFnYWluc3QgcGxheWVyc1xyXG4gICAgLy8gdGhpcy5oaXREZXRlY3Rpb24oaW5kZXgpO1xyXG4gICAgLy9cclxuICAgIC8vIC8vIGNvbGxpc2lvbiBkZXRlY3Rpb24gYWdhaW5zdCB0aWxlcyBhbmQgb3V0c2lkZSBvZiBtYXBcclxuICAgIC8vIHZhciBjb2xsaXNpb24gPSBoZWxwZXJzLmNvbGxpc2lvbkNoZWNrKHt4OiB4LCB5OiB5fSk7XHJcbiAgICAvLyBpZiAoIWNvbGxpc2lvbikge1xyXG4gICAgLy8gICAgIHRoaXMueCA9IHg7XHJcbiAgICAvLyAgICAgdGhpcy55ID0geTtcclxuICAgIC8vIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgLy8gYWRkIHJpY2hvY2V0IHBhcnRpY2xlIGVmZmVjdFxyXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xyXG4gICAgLy8gICAgICAgICB0eXBlOiBcIlJpY29jaGV0XCIsXHJcbiAgICAvLyAgICAgICAgIGVtaXRDb3VudDogMSxcclxuICAgIC8vICAgICAgICAgZW1pdFNwZWVkOiBudWxsLCAvLyBudWxsIG1lYW5zIGluc3RhbnRcclxuICAgIC8vICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgLy8gICAgICAgICB5OiB0aGlzLnlcclxuICAgIC8vICAgICB9KSk7XHJcbiAgICAvLyAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyAvLyBpZiBvZmYgc2NyZWVuLCByZW1vdmUgaXRcclxuICAgIC8vIGlmICh0aGlzLnggPCAwIHx8IHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIHx8IHRoaXMueSA8IDAgfHwgdGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB7XHJcbiAgICAvLyAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgIC8vICAgICByZXR1cm47XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG5cclxuXHJcbn07XHJcblxyXG4vLyBCdWxsZXQucHJvdG90eXBlLmhpdERldGVjdGlvbiA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbi8vICAgICAvLyB0ZXN0IGJ1bGxldCBhZ2FpbnN0IGFsbCBwbGF5ZXJzXHJcbi8vICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xyXG4vL1xyXG4vLyAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XHJcbi8vXHJcbi8vICAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIGNvbnRpbnVlO1xyXG4vL1xyXG4vLyAgICAgICAgIHZhciBhID0gdGhpcy54IC0gcGxheWVyLng7XHJcbi8vICAgICAgICAgdmFyIGIgPSB0aGlzLnkgLSBwbGF5ZXIueTtcclxuLy8gICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xyXG4vL1xyXG4vLyAgICAgICAgIGlmIChkaXN0YW5jZSA8IHBsYXllci5yYWRpdXMpIHtcclxuLy8gICAgICAgICAgICAgLy8gaGl0XHJcbi8vICAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKHRoaXMuZGFtYWdlLCB0aGlzLmRpcmVjdGlvbik7XHJcbi8vICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfVxyXG4vL1xyXG4vLyB9O1xyXG5cclxuQnVsbGV0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIC8vIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICAvLyB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24gLSAwLjc4NTM5ODE2MzQpOyAvLyByb3RhdGVcclxuICAgIC8vXHJcbiAgICAvLyAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxyXG4gICAgLy8gdmFyIGdyYWQ9IHRoaXMuY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcclxuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDAsIFwicmdiYSgyNTUsMTY1LDAsMC40KVwiKTtcclxuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwieWVsbG93XCIpO1xyXG4gICAgLy8gdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gICB0aGlzLmN0eC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAvLyAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgLy8gICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAvL1xyXG4gICAgLy8gLy9cclxuICAgIC8vIC8vIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIC8vIC8vIGN0eC5tb3ZlVG8oMCwwKTtcclxuICAgIC8vIC8vIGN0eC5saW5lVG8oMCx0aGlzLmxlbmd0aCk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgLy8gdGhpcy5jdHguZmlsbFJlY3QodGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoLCAxLCAxICk7XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuICAgIC8vXHJcbiAgICAvLyAvL1xyXG4gICAgLy8gLy9cclxuICAgIC8vIC8vIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgLy8gLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcclxuICAgIC8vIC8vIHZhciBncmFkPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgLy8gLy8gZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZWRcIik7XHJcbiAgICAvLyAvLyBncmFkLmFkZENvbG9yU3RvcCgxLCBcImdyZWVuXCIpO1xyXG4gICAgLy8gLy8gY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcclxuICAgIC8vIC8vIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIC8vIC8vIGN0eC5tb3ZlVG8oMCwwKTtcclxuICAgIC8vIC8vIGN0eC5saW5lVG8oMCxsZW5ndGgpO1xyXG4gICAgLy8gLy8gY3R4LnN0cm9rZSgpO1xyXG4gICAgLy9cclxuXHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7XHJcbiIsImZ1bmN0aW9uIEJ1dHRvbihkYXRhKSB7XHJcbiAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XHJcbiAgICB0aGlzLmZvbnRTaXplID0gZGF0YS5mb250U2l6ZTtcclxuICAgIC8vIHRoaXMueCA9IGRhdGEueDtcclxuICAgIC8vIHRoaXMueSA9IGRhdGEueTtcclxuICAgIC8vIHRoaXMudyA9IGRhdGEudztcclxuICAgIC8vIHRoaXMuaCA9IGRhdGEuaDtcclxuXHJcbiAgICB0aGlzLnJlY3QgPSB7IHg6IGRhdGEueCwgeTogZGF0YS55LCB3OiBkYXRhLncsIGg6IGRhdGEuaCB9O1xyXG5cclxuICAgIHRoaXMuY29udGV4dCA9IGRhdGEuY29udGV4dDtcclxuICAgIHRoaXMuY2xpY2tGdW5jdGlvbiA9IGRhdGEuY2xpY2tGdW5jdGlvbjtcclxufVxyXG5cclxuQnV0dG9uLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCh0aGlzLnJlY3QueCwgdGhpcy5yZWN0LnksIHRoaXMucmVjdC53LCB0aGlzLnJlY3QuaCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSlcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XHJcblxyXG4gICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSB0aGlzLmZvbnRTaXplICsgXCJweCBPcGVuIFNhbnNcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNkN2Q3ZDdcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh0aGlzLnRleHQsIHRoaXMucmVjdC54ICsgOSwgdGhpcy5yZWN0LnkgKyAyOCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcblxyXG5mdW5jdGlvbiBHYW1lKCkge1xyXG5cclxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSA2NDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDQ4MDtcclxuXHJcbiAgICAvLyBMb2FkIHNvdW5kc1xyXG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vYWsud2F2XCIsIFwiYWtcIik7XHJcbiAgICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiLi8uLi9hdWRpby9hay1yZWxvYWQubXAzXCIsIFwiYWstcmVsb2FkXCIpO1xyXG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vc2hvdGd1bi5vZ2dcIiwgXCJzaG90Z3VuXCIpO1xyXG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vc2hvdGd1bi1yZWxvYWQub2dnXCIsIFwic2hvdGd1bi1yZWxvYWRcIik7XHJcbiAgICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiLi8uLi9hdWRpby9lbXB0eS53YXZcIiwgXCJlbXB0eVwiKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMudGlsZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnRpbGVzaGVldC5zcmMgPSBcIi4uL2ltZy90aWxlcy5wbmdcIjtcclxuXHJcbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMudGlsZXNoZWV0KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmJnQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuYmdDYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuYmdDYW52YXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmJnQ3R4ID0gdGhpcy5iZ0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0ge307XHJcbiAgICB0aGlzLnVpRWxlbWVudHMgPSBbXTsgLy8gaG9sZHMgYnV0dG9ucyBldGNcclxuXHJcbiAgICB0aGlzLm1heFBhcnRpY2xlcyA9IDMwOyAvLyBudW1iZXIgb2YgcGFydGljbGVzIGFsbG93ZWQgb24gc2NyZWVuIGJlZm9yZSB0aGV5IHN0YXJ0IHRvIGJlIHJlbW92ZWRcclxuXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmxvb3AoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHYW1lIGxvb3BcclxuICAgICAqL1xyXG4gICAgdGhpcy5sb29wID0gZnVuY3Rpb24odGltZXN0YW1wKXtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wLmJpbmQodGhpcykpOyAvLyBxdWV1ZSB1cCBuZXh0IGxvb3BcclxuXHJcbiAgICAgICAgZHQgPSB0aW1lc3RhbXAgLSBsYXN0OyAvLyB0aW1lIGVsYXBzZWQgaW4gbXMgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgICAgbGFzdCA9IHRpbWVzdGFtcDtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGFuZCByZW5kZXIgZ2FtZVxyXG4gICAgICAgIHRoaXMudXBkYXRlKGR0KTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG5cclxuXHJcblxyXG4gICAgICAgIC8vIG5ldHdvcmtpbmcgdXBkYXRlXHJcbiAgICAgICAgaWYgKHRoaXMubmV0d29yay5ob3N0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5ob3N0LnVwZGF0ZShkdCk7IC8vIGlmIGltIHRoZSBob3N0IGRvIGhvc3Qgc3R1ZmZcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ldHdvcmsuY2xpZW50LnVwZGF0ZShkdCk7IC8vIGVsc2UgdXBkYXRlIGNsaWVudCBzdHVmZlxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcclxuICAgICAgICB2YXIgZHRzID0gZHQgLyAxMDAwO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmcHNcclxuICAgICAgICB0aGlzLmZwcyA9IE1hdGgucm91bmQoMTAwMCAvIGR0KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdHMsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyAvLyBjYXAgbnVtYmVyIG9mIHBhcnRpY2xlc1xyXG4gICAgICAgIC8vIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPiB0aGlzLm1heFBhcnRpY2xlcykge1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhcnRpY2xlcyA9IHRoaXMucGFydGljbGVzLnNsaWNlKHRoaXMucGFydGljbGVzLmxlbmd0aCAtIHRoaXMubWF4UGFydGljbGVzLCB0aGlzLnBhcnRpY2xlcy5sZW5ndGgpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBhcnRpY2xlc1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKGR0cywgaSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGUoKTtcclxuICAgICAgICAvLyBVcGRhdGUgY2FtZXJhXHJcbiAgICAgICAgLy90aGlzLmNhbWVyYS51cGRhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXJpbmdcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIGNsZWFyIHNjcmVlblxyXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvL2JnIGNvbG9yXHJcbiAgICAgICAgdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmJnQ3R4LnJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5maWxsU3R5bGUgPSBcIiM1YjU4NTBcIjtcclxuICAgICAgICB0aGlzLmJnQ3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgLy8gZHJhdyB0ZXN0IGJhY2tncm91bmRcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIC8vIHRoaXMuYmdDdHgucmVjdCgwIC0gdGhpcy5jYW1lcmEueCwgMCAtIHRoaXMuY2FtZXJhLnksIHRoaXMubGV2ZWwud2lkdGgsIHRoaXMubGV2ZWwuaGVpZ2h0KTtcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzg1ODI3ZFwiO1xyXG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbCgpO1xyXG5cclxuICAgICAgICB0aGlzLmxldmVsLnJlbmRlcih0aGlzLmJnQ3R4KTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGFsbCBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZW5kZXIgcGFydGljbGVzXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5yZW5kZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudWkucmVuZGVyVUkoKTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGJ1dHRvbnMgZXRjXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHdpbmRvdy5nYW1lLnVpRWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50c1tpXS5yZW5kZXIoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLnVpLnJlbmRlckRlYnVnKCk7XHJcbiAgICAgICAgLy8gcmVuZGVyIGZwcyBhbmQgcGluZ1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDQU1FUkE6IFg6XCIgKyB0aGlzLmNhbWVyYS54LCBcIlxcblk6XCIgKyB0aGlzLmNhbWVyYS55KTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucGxheWVyc1t0aGlzLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdKTtcclxuICAgIH07XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLmFkZFBsYXllciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIHBsYXllciBhbHJlYWR5IGV4aXN0cy5cclxuICAgIGlmKGRhdGEuaWQgaW4gdGhpcy5wbGF5ZXJzKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIoZGF0YSk7XHJcbiAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3UGxheWVyKTtcclxuICAgIHRoaXMucGxheWVyc1tkYXRhLmlkXSA9IG5ld1BsYXllcjtcclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3UGxheWVyO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUucmVtb3ZlUGxheWVyID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coXCJnYW1lIHJlbW92aW5nIHBsYXllclwiLCBkYXRhKTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBwbGF5ZXJzIG9iamVjdFxyXG4gICAgZGVsZXRlIHRoaXMucGxheWVyc1tkYXRhLmlkXTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBlbnRpdGl0ZXMgYXJyYXlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5pZCA9PT0gZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGhpbSAsIHJlbW92aW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0R2FtZVN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC8vIGVudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJlbnRpdHk6XCIsIGVudGl0eSk7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShlbnRpdHkpO1xyXG4gICAgICAgIC8vIH0pLFxyXG4gICAgICAgIC8vZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgIHJldHVybiBlbnRpdHkuZ2V0RnVsbFN0YXRlKCk7ICAgICAgICB9KSxcclxuICAgICAgICAvL3BsYXllcnM6IE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBKU09OLnN0cmluZ2lmeSh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0pOyB9KVxyXG4gICAgICAgIHBsYXllcnM6IHRoaXMuZ2V0UGxheWVyc1N0YXRlKClcclxuICAgIH07XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRQbGF5ZXJzU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gd2luZG93LmdhbWUucGxheWVyc1trZXldLmdldEZ1bGxTdGF0ZSgpOyB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiZnVuY3Rpb24gS2V5Ym9hcmQocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICAvL3RoaXMubGFzdFN0YXRlID0gXy5jbG9uZShwbGF5ZXIua2V5cyk7XG4gICAgdGhpcy5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgIT09IHRydWUpICBwbGF5ZXIua1VwPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gIT09IHRydWUpICBwbGF5ZXIua0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgIT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ICE9PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ5OiAvLyAxXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMCxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1MDogLy8gMlxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleCA9PT0gMSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiY2hhbmdlV2VhcG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODI6IC8vIFJcbiAgICAgICAgICAgICAgICAvLyByZWxvYWQgb25seSBpZiBwbGF5ZXIgaXMgYWxpdmUgYW5kIHdlYXBvbiBtYWdhemluZSBpc250IGZ1bGxcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmFsaXZlICYmIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XS5idWxsZXRzIDwgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLm1hZ2F6aW5lU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmtleVVwSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgPT09IHRydWUpIHBsYXllci5rVXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gPT09IHRydWUpIHBsYXllci5rRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ID09PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ID09PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwidmFyIGxldmVsMSA9IHJlcXVpcmUoXCIuL2RhdGEvbGV2ZWwxXCIpO1xyXG4vL3ZhciBUaWxlID0gcmVxdWlyZShcIi4vVGlsZVwiKTtcclxuXHJcbmZ1bmN0aW9uIExldmVsKHRpbGVzaGVldCl7XHJcbiAgICB0aGlzLnRpbGVzaGVldCA9IHRpbGVzaGVldDtcclxuICAgIHRoaXMudGlsZVNpemUgPSAzMjtcclxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDE7XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGggKiB0aGlzLnRpbGVTaXplO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmNvbFRpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXNbMF0ubGVuZ3RoO1xyXG4gICAgdGhpcy5yb3dUaWxlQ291bnQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aDtcclxuICAgIHRoaXMuaW1hZ2VOdW1UaWxlcyA9IDM4NCAvIHRoaXMudGlsZVNpemU7ICAvLyBUaGUgbnVtYmVyIG9mIHRpbGVzIHBlciByb3cgaW4gdGhlIHRpbGVzZXQgaW1hZ2VcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBUaWxlc1xyXG5cclxuXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGN0eCkge1xyXG5cclxuICAgICAgICAvL2RyYXcgYWxsIHRpbGVzXHJcbiAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLnJvd1RpbGVDb3VudDsgcm93ICs9IDEpIHtcclxuICAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbFRpbGVDb3VudDsgY29sICs9IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMubGV2ZWwudGlsZXNbcm93XVtjb2xdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVSb3cgPSAodGlsZSAvIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwOyAvLyBCaXR3aXNlIE9SIG9wZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVDb2wgPSAodGlsZSAlIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy50aWxlc2hlZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVDb2wgKiB0aGlzLnRpbGVTaXplKSxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZVJvdyAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChjb2wgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS54KSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChyb3cgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUpO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xyXG4iLCJ2YXIgY29sbGlzaW9uQ2hlY2sgPSByZXF1aXJlKFwiLi91dGlsL2NvbGxpc2lvbkRldGVjdGlvblwiKSA7XG5cbmZ1bmN0aW9uIE1vdXNlKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSl7XG5cblxuICAgICAgICB0aGlzLnBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJzaG9vdFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYLFxuICAgICAgICAgICAgICAgIHk6IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMucHVzaChhY3Rpb24pOyAvLyB0ZWxsIHRoZSBob3N0IG9mIHRoZSBhY3Rpb25cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWCA9IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYO1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVkgPSB3aW5kb3cuZ2FtZS5jYW1lcmEueSArIGUub2Zmc2V0WTtcbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGNsaWNrcyBvbiB1aSBlbGVtZW50c1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2luZG93LmdhbWUudWlFbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IHdpbmRvdy5nYW1lLnVpRWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5jbGlja0Z1bmN0aW9uKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbkNoZWNrLnBvaW50UmVjdCh7eDogZS5vZmZzZXRYLCB5OiBlLm9mZnNldFl9LCBlbGVtZW50LnJlY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsaWNrRnVuY3Rpb24uYmluZChlbGVtZW50LmNvbnRleHQpKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLm1vdXNlTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5tb3VzZUxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBzd2l0Y2goZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgMDogLy8gbGVmdCBtb3VzZSBidXR0b25cbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLm1vdXNlTGVmdCA9PT0gdHJ1ZSkgcGxheWVyLm1vdXNlTGVmdCAgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgLy93aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XG4iLCJmdW5jdGlvbiBDb250cm9scygpIHtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgQmxvb2QgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICB2YXIgciA9IDE1MCAtIHJuZDtcclxuICAgICAgICB2YXIgZyA9IDUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBiID0gNTAgLSBybmQ7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcInJnYihcIiArIHIgKyBcIixcIiArIGcgKyBcIixcIiArIGIgKyBcIilcIjtcclxuICAgICAgICBkYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDM7XHJcbiAgICAgICAgZGF0YS5jb250YWluZXIgPSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXM7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA0MDtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbkJsb29kLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuXHJcbiAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9vZDtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZDIgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwiIzgwMjkyOVwiO1xyXG4gICAgICAgIC8vZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAzO1xyXG4gICAgICAgIGRhdGEuY29udGFpbmVyID0gd2luZG93LmdhbWUucGFydGljbGVzO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAxMDtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5CbG9vZDIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvb2QyO1xyXG4iLCIvL3ZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgQmxvb2QgPSByZXF1aXJlKFwiLi9CbG9vZFwiKTtcclxudmFyIEJsb29kMiA9IHJlcXVpcmUoXCIuL0Jsb29kMlwiKTtcclxudmFyIFJpY29jaGV0ID0gcmVxdWlyZShcIi4vUmljb2NoZXRcIik7XHJcblxyXG5mdW5jdGlvbiBFbWl0dGVyKGRhdGEpIHtcclxuICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZTtcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICB0aGlzLmVtaXRTcGVlZCA9IGRhdGEuZW1pdFNwZWVkOyAvLyBzXHJcbiAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXRDb3VudCA9IGRhdGEuZW1pdENvdW50O1xyXG4gICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICB0aGlzLmxpZmVUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXQoKTtcclxufVxyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBlbWl0dGVyOiB0aGlzXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2RcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kKGRhdGEpKTtcclxuICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gXCJCbG9vZDJcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kMihkYXRhKSk7XHJcbiAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IFwiUmljb2NoZXRcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IFJpY29jaGV0KGRhdGEpKTtcclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4gICAgLy8gLy8gdXBkYXRlIGFsbCBwYXJ0aWNsZXNcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIC8vICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoZHQpO1xyXG4gICAgLy8gfVxyXG5cclxuXHJcbiAgICAvLyBTRVQgRU1JVFRFUiAtIHRoaXMgaXMgYW4gZW1pdHRlciB0aGF0IHNob3VsZCBlbWl0IGEgc2V0IG51bWJlciBvZiBwYXJ0aWNsZXNcclxuICAgIGlmICh0aGlzLmVtaXRDb3VudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVtaXRTcGVlZCkgeyAvLyBFbWl0IGF0IGEgaW50ZXJ2YWxcclxuICAgICAgICAgICAgdGhpcy5lbWl0VGltZXIgKz0gZHQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVtaXRUaW1lciA+IHRoaXMuZW1pdFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgICB0aGlzLmVtaXRDb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgIGlmICh0aGlzLmVtaXRDb3VudCA8IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gRW1pdCBhbGwgYXQgb25jZVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDtpIDwgdGhpcy5lbWl0Q291bnQ7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRJTUVEIEVNSVRURVJcclxuICAgIC8vIHVwZGF0ZSBlbWl0dGVyIGxpZmV0aW1lIChpZiBpdCBoYXMgYSBsaWZldGltZSkgcmVtb3ZlIGVtaXR0ZXIgaWYgaXRzIHRpbWUgaGFzIHJ1biBvdXQgYW5kIGl0IGhhcyBubyByZW1haW5pbmcgcGFydGljbGVzXHJcbiAgICBpZiAodGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4gICAgICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENPTlRJTlVPVVMgRU1JVFRFUlxyXG4gICAgLy8gZW1pdCBuZXcgcGFydGljbGVzIGZvcmV2ZXJcclxuICAgIHRoaXMuZW1pdFRpbWVyICs9IGR0O1xyXG4gICAgaWYgKHRoaXMuZW1pdFRpbWVyID4gdGhpcy5lbWl0U3BlZWQpIHtcclxuICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyAvLyByZW5kZXIgYWxsIHBhcnRpY2xlc1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgLy8gICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xyXG4gICAgLy8gfVxyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xyXG4iLCIvL3ZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi4vLi9FbnRpdHlcIik7XHJcblxyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5jdHg7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGRhdGEuY29sb3I7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xyXG4gICAgICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgICAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuZW1pdHRlciA9IGRhdGEuZW1pdHRlcjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGRhdGEuY29udGFpbmVyO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBQYXJ0aWNsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbi8vICAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuLy8gICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuLy8gICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4vLyAgICAgfVxyXG4vLyB9O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICAvL3RoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxyXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KC0odGhpcy5zaXplIC8gMiksIC0odGhpcy5zaXplIC8gMiksIHRoaXMuc2l6ZSwgdGhpcy5zaXplKTtcclxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxufTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHRoaXMuY29udGFpbmVyLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge307XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIFJpY29jaGV0IGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCIjNGQ0ZDRkXCI7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMTtcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA4MDtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuUmljb2NoZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJpY29jaGV0O1xyXG4iLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoXCIuL0tleWJvYXJkXCIpO1xudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcbi8vdmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuL0J1bGxldFwiKTtcbi8vdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vL3ZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbnZhciBTaG90Z3VuID0gcmVxdWlyZShcIi4vd2VhcG9ucy9TaG90Z3VuXCIpO1xudmFyIEFrNDcgPSByZXF1aXJlKFwiLi93ZWFwb25zL0FrNDdcIik7XG4vL3ZhciBBbmltYXRpb24gPSByZXF1aXJlKFwiLi9BbmltYXRpb25cIik7XG4vL3ZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9FbnRpdHlcIik7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgd2VhcG9uQ3JlYXRvciA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvd2VhcG9uQ3JlYXRvclwiKTtcbnZhciBVaUJ1dHRvbiA9IHJlcXVpcmUoXCIuL0J1dHRvblwiKTtcbnZhciBVaVJlY3QgPSByZXF1aXJlKFwiLi91aUVsZW1lbnRzL1JlY3RhbmdsZVwiKTtcbnZhciBVaVRleHQgPSByZXF1aXJlKFwiLi91aUVsZW1lbnRzL1RleHRcIik7XG5cblxuXG5mdW5jdGlvbiBQbGF5ZXIocGxheWVyRGF0YSkge1xuICAgIHRoaXMuaWQgPSBwbGF5ZXJEYXRhLmlkO1xuICAgIHRoaXMucmFkaXVzID0gcGxheWVyRGF0YS5yYWRpdXMgfHwgMjA7IC8vIGNpcmNsZSByYWRpdXNcblxuICAgIGlmICghcGxheWVyRGF0YS54IHx8ICFwbGF5ZXJEYXRhLnkpIHtcbiAgICAgICAgdmFyIHNwYXduTG9jYXRpb24gPSBoZWxwZXJzLmZpbmRTcGF3bkxvY2F0aW9uKCk7XG4gICAgICAgIHRoaXMueCA9IHNwYXduTG9jYXRpb24ueDtcbiAgICAgICAgdGhpcy55ID0gc3Bhd25Mb2NhdGlvbi55O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMueCA9IHBsYXllckRhdGEueDtcbiAgICAgICAgdGhpcy55ID0gcGxheWVyRGF0YS55O1xuICAgIH1cbiAgICAvLyB0aGlzLnggPSBwbGF5ZXJEYXRhLnggfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuICAgIC8vIHRoaXMueSA9IHBsYXllckRhdGEueSB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHRoaXMucmFkaXVzKSkgKyB0aGlzLnJhZGl1cyAvIDIpO1xuXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBwbGF5ZXJEYXRhLmRpcmVjdGlvbiB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMTtcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IHBsYXllckRhdGEudmlld2luZ0FuZ2xlIHx8IDQ1O1xuICAgIHRoaXMuc3BlZWQgPSBwbGF5ZXJEYXRhLnNwZWVkIHx8IDEwMDsgLy9waXhlbHMgcGVyIHNlY29uZFxuICAgIHRoaXMuaHAgPSBwbGF5ZXJEYXRhLmhwIHx8IDEwMDtcbiAgICB0aGlzLmFsaXZlID0gcGxheWVyRGF0YS5hbGl2ZSB8fCB0cnVlO1xuXG4gICAgdGhpcy5zeCA9IDA7XG4gICAgdGhpcy5zeSA9IDA7XG4gICAgdGhpcy5zdyA9IDYwO1xuICAgIHRoaXMuc2ggPSA2MDtcbiAgICB0aGlzLmR3ID0gNjA7XG4gICAgdGhpcy5kaCA9IDYwO1xuXG4gICAgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5jdHg7XG5cbiAgICAvLyBrZXlzXG4gICAgdGhpcy5rVXAgPSBmYWxzZTtcbiAgICB0aGlzLmtEb3duID0gZmFsc2U7XG4gICAgdGhpcy5rTGVmdCA9IGZhbHNlO1xuICAgIHRoaXMua1JpZ2h0ID0gZmFsc2U7XG5cbiAgICAvLyBtb3VzZVxuICAgIHRoaXMubW91c2VYID0gdGhpcy54O1xuICAgIHRoaXMubW91c2VZID0gdGhpcy55O1xuICAgIHRoaXMubW91c2VMZWZ0ID0gZmFsc2U7XG5cbiAgICAvLyBwb3NpdGlvbiBvbiBsZXZlbFxuICAgIHRoaXMudGlsZVJvdyA9IDA7XG4gICAgdGhpcy50aWxlQ29sID0gMDtcblxuICAgIHRoaXMud2VhcG9ucyA9IFtdO1xuICAgIC8vIHJlY3JlYXRlIHdlYXBvbnMgaWYgdGhlIHBsYXllciBoYXMgYW55IGVsc2UgY3JlYXRlIG5ldyB3ZWFwb25zXG4gICAgaWYgKHBsYXllckRhdGEud2VhcG9uU3RhdGUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGF5ZXJEYXRhLndlYXBvblN0YXRlLmxlbmd0aDsgaSs9IDEpIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKHdlYXBvbkNyZWF0b3IodGhpcywgcGxheWVyRGF0YS53ZWFwb25TdGF0ZVtpXSkpO1xuICAgICAgICB9XG4gICAgfWVsc2Uge1xuICAgICAgICB0aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcbiAgICB9XG5cbiAgICAvL3RoaXMud2VhcG9ucyA9IFtuZXcgQWs0Nyh0aGlzKSwgbmV3IFNob3RndW4odGhpcyldO1xuXG4gICAgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4ID0gcGxheWVyRGF0YS5zZWxlY3RlZFdlYXBvbkluZGV4IHx8IDA7XG5cbiAgICB0aGlzLmxhc3RDbGllbnRTdGF0ZSA9IHRoaXMuZ2V0Q2xpZW50U3RhdGUoKTtcbiAgICB0aGlzLmxhc3RGdWxsU3RhdGUgPSB0aGlzLmdldEZ1bGxTdGF0ZSgpO1xuXG4gICAgdGhpcy5waW5nID0gXCItXCI7XG4gICAgdGhpcy5hY3Rpb25zID0gW107IC8vIGFjdGlvbnMgdG8gYmUgcGVyZm9ybWVkXG4gICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zID0gW107IC8vIHN1Y2Nlc2Z1bGx5IHBlcmZvcm1lZCBhY3Rpb25zXG5cbiAgICAvLyB0aGlzLmFuaW1hdGlvbnMgPSB7XG4gICAgLy8gICAgIFwiaWRsZVwiOiBuZXcgQW5pbWF0aW9uKHtuYW1lOiBcImlkbGVcIiwgc3g6IDAsIHN5OiAwLCB3OiA2MCwgaDogNjAsIGZyYW1lczogMSwgcGxheU9uY2U6IGZhbHNlfSksXG4gICAgLy8gICAgIFwiZmlyZVwiOiBuZXcgQW5pbWF0aW9uKHtuYW1lOiBcImZpcmVcIiwgc3g6IDAsIHN5OiA2MCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiB0cnVlfSlcbiAgICAvLyB9O1xuICAgIC8vXG4gICAgLy8gdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gdGhpcy5hbmltYXRpb25zLmlkbGU7XG5cbiAgICAvL2lzIHRoaXMgbWUgb3IgYW5vdGhlciBwbGF5ZXJcbiAgICBpZiAocGxheWVyRGF0YS5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0ge21vdXNlOiBuZXcgTW91c2UodGhpcyksIGtleWJvYXJkOiBuZXcgS2V5Ym9hcmQodGhpcyl9O1xuICAgICAgICB3aW5kb3cuZ2FtZS5jYW1lcmEuZm9sbG93KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29udHJvbHMgPSBuZXcgTmV0d29ya0NvbnRyb2xzKCk7XG4gICAgfVxufVxuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KXtcblxuICAgIC8vIGdvIHRocm91Z2ggYWxsIHRoZSBxdWV1ZWQgdXAgYWN0aW9ucyBhbmQgcGVyZm9ybSB0aGVtXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGlvbnMubGVuZ3RoOyBpICs9IDEpe1xuXG4gICAgICAgIHZhciBzdWNjZXNzID0gdGhpcy5wZXJmb3JtQWN0aW9uKHRoaXMuYWN0aW9uc1tpXSk7XG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1lZEFjdGlvbnMucHVzaCh0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICB9XG4gICAgLy8gICAgIH1cbiAgICB9XG4gICAgdGhpcy5hY3Rpb25zID0gW107XG5cbiAgICBpZiAoIXRoaXMuYWxpdmUpIHJldHVybjtcblxuXG4gICAgdGhpcy5tb3ZlKGR0KTtcbiAgICAvL2NoZWNrIGlmIG9mZiBzY3JlZW5cbiAgICAvLyBpZiAodGhpcy54ID4gd2luZG93LmdhbWUubGV2ZWwud2lkdGgpIHRoaXMueCA9IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoO1xuICAgIC8vIGlmICh0aGlzLnggPCAwKSB0aGlzLnggPSAwO1xuICAgIC8vIGlmICh0aGlzLnkgPiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpIHRoaXMueSA9IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodDtcbiAgICAvLyBpZiAodGhpcy55IDwgMCkgdGhpcy55ID0gMDtcblxuICAgIC8vIHVwZGF0ZSBjdXJyZW50IHdlYXBvbjtcbiAgICB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS51cGRhdGUoZHQpO1xuXG4gICAgLy90aGlzLmN1cnJlbnRBbmltYXRpb24udXBkYXRlKGR0KTtcblxuICAgIGlmICh0aGlzLm1vdXNlTGVmdCkgeyAvLyBpZiBmaXJpbmdcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJmaXJlXCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5tb3VzZVgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5tb3VzZVlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy50dXJuVG93YXJkcyh0aGlzLm1vdXNlWCwgdGhpcy5tb3VzZVkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZHQpIHtcblxuICAgIC8vIFVwZGF0ZSBtb3ZlbWVudFxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICB2YXIgbW92ZVg7XG4gICAgdmFyIG1vdmVZO1xuXG4gICAgaWYgKHRoaXMua1VwICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gLWRpc3RhbmNlO1xuICAgICAgICBtb3ZlWSA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwICYmIHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IGRpc3RhbmNlO1xuICAgICAgICBtb3ZlWSA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24gJiYgdGhpcy5rTGVmdCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSAtZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IGRpc3RhbmNlO1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXApIHtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duKSB7XG4gICAgICAgIG1vdmVZID0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtMZWZ0KSB7XG4gICAgICAgIG1vdmVYID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rUmlnaHQpIHtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICB9XG5cbiAgICB2YXIgY29sbGlzaW9uO1xuICAgIGlmIChtb3ZlWCkge1xuICAgICAgICBjb2xsaXNpb24gPSBoZWxwZXJzLmNvbGxpc2lvbkNoZWNrKHt4OiB0aGlzLnggKyBtb3ZlWCwgeTogdGhpcy55fSk7XG4gICAgICAgIGlmICghY29sbGlzaW9uKSB7XG4gICAgICAgICAgICB0aGlzLnggKz0gbW92ZVg7XG4gICAgICAgICAgICB0aGlzLm1vdXNlWCArPSBtb3ZlWDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobW92ZVkpIHtcbiAgICAgICAgY29sbGlzaW9uID0gaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogdGhpcy54LCB5OiB0aGlzLnkgKyBtb3ZlWX0pO1xuICAgICAgICBpZiAoIWNvbGxpc2lvbikge1xuICAgICAgICAgICAgdGhpcy55ICs9IG1vdmVZO1xuICAgICAgICAgICAgdGhpcy5tb3VzZVkgKz0gbW92ZVk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyAvLyBDb2xsaXNpb24gY2hlY2sgYWdhaW5zdCBzdXJyb3VuZGluZyB0aWxlc1xuLy8gUGxheWVyLnByb3RvdHlwZS5jb2xsaXNpb25DaGVjayA9IGZ1bmN0aW9uKCkge1xuLy8gICAgIHZhciBzdGFydGluZ1JvdyA9IHRoaXMudGlsZVJvdyAtIDE7XG4vLyAgICAgaWYgKHN0YXJ0aW5nUm93IDwgMCkgc3RhcnRpbmdSb3cgID0gMDtcbi8vICAgICB2YXIgZW5kUm93ID0gdGhpcy50aWxlUm93ICsxO1xuLy8gICAgIGlmIChlbmRSb3cgPiB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpIGVuZFJvdyA9IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudDtcbi8vICAgICB2YXIgc3RhcnRpbmdDb2wgPSB0aGlzLnRpbGVDb2wgLTE7XG4vLyAgICAgaWYgKHN0YXJ0aW5nQ29sIDwgMCkgc3RhcnRpbmdDb2wgPSAwO1xuLy8gICAgIHZhciBlbmRDb2wgPSB0aGlzLnRpbGVDb2wgKzE7XG4vLyAgICAgaWYgKGVuZENvbCA+IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudCkgZW5kQ29sID0gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50O1xuLy9cbi8vICAgICBmb3IgKHZhciByb3cgPSBzdGFydGluZ1Jvdzsgcm93IDwgZW5kUm93OyByb3cgKz0gMSkge1xuLy8gICAgICAgICBmb3IgKHZhciBjb2wgPSBzdGFydGluZ0NvbDsgY29sIDwgZW5kQ29sOyBjb2wgKz0gMSkge1xuLy8gICAgICAgICAgICAgaWYgKHdpbmRvdy5nYW1lLmxldmVsLmxldmVsLnRpbGVzW3Jvd11bY29sXSA9PT0gMCkgY29udGludWU7IC8vIGV2ZXJ5IHRpbGUgb3RoZXIgdGhhbiAwIGFyZSBub24gd2Fsa2FibGVcbi8vICAgICAgICAgICAgIC8vIGNvbGxpc2lvblxuLy8gICAgICAgICAgICAgaWYgKHRoaXMudGlsZVJvdyA9PT0gcm93ICYmIHRoaXMudGlsZUNvbCA9PT0gY29sKSB7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiB0cnVlO1xuLy8gfTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXR3b3JrVXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICBkZWxldGUgdXBkYXRlLmlkO1xuICAgIC8vIG5ldHdvcmtVcGRhdGVcbiAgICBmb3IgKHZhciBrZXkgaW4gdXBkYXRlKSB7XG4gICAgICAgIGlmIChrZXkgPT09IFwiYWN0aW9uc1wiKSB0aGlzW2tleV0gPSB0aGlzW2tleV0uY29uY2F0KHVwZGF0ZVtrZXldKTtcbiAgICAgICAgZWxzZSB0aGlzW2tleV0gPSB1cGRhdGVba2V5XTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBlcmZvcm1BY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24pe1xuICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uKXtcbiAgICAgICAgY2FzZSBcInR1cm5Ub3dhcmRzXCI6XG4gICAgICAgICAgICB0aGlzLnR1cm5Ub3dhcmRzKGFjdGlvbi5kYXRhLngsIGFjdGlvbi5kYXRhLnkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmaXJlXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uZmlyZShhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiZGllXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWUoYWN0aW9uKTtcbiAgICAgICAgICAgIC8vYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZXNwYXduXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNwYXduKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJjaGFuZ2VXZWFwb25cIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYW5nZVdlYXBvbihhY3Rpb24pO1xuICAgICAgICBjYXNlIFwicmVsb2FkXCI6XG4gICAgfSAgICAgICByZXR1cm4gdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0ucmVsb2FkKGFjdGlvbik7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoIXRoaXMuYWxpdmUpIHJldHVybjtcbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uKTsgLy8gcm90YXRlXG5cbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN4LCB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zeSwgdGhpcy5zdywgdGhpcy5zaCwgLSh0aGlzLnN3IC8gMiksIC0odGhpcy5zaCAvIDIpLCB0aGlzLmR3LCB0aGlzLmRoKTtcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG5cbn07XG5cblBsYXllci5wcm90b3R5cGUudHVyblRvd2FyZHMgPSBmdW5jdGlvbih4LHkpIHtcbiAgICB2YXIgeERpZmYgPSB4IC0gdGhpcy54O1xuICAgIHZhciB5RGlmZiA9IHkgLSB0aGlzLnk7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmF0YW4yKHlEaWZmLCB4RGlmZik7Ly8gKiAoMTgwIC8gTWF0aC5QSSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnRha2VEYW1hZ2UgPSBmdW5jdGlvbihkYW1hZ2UsIGRpcmVjdGlvbikge1xuICAgIHRoaXMuaHAgLT0gZGFtYWdlO1xuICAgIGlmICh0aGlzLmhwIDw9IDApIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcImRpZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGFkZCBibG9vZCBzcGxhc2ggZW1pdHRlclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICBlbWl0Q291bnQ6IDEwLFxuICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH0pKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXRoaXMuYWxpdmUpIHJldHVybjtcblxuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgICB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zdG9wUmVsb2FkKCk7XG5cblxuICAgIC8vIC8vIGNyZWF0ZSBhIGNvcnBzZVxuICAgIC8vIHZhciBjb3Jwc2UgPSBuZXcgRW50aXR5KHtcbiAgICAvLyAgICAgeDogdGhpcy54ICsgTWF0aC5jb3MoYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgIC8vICAgICB5OiB0aGlzLnkgKyBNYXRoLnNpbihhY3Rpb24uZGF0YS5kaXJlY3Rpb24pICogMTAsXG4gICAgLy8gICAgIHN4OiA2MCArKCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSAqIDYwKSxcbiAgICAvLyAgICAgc3k6IDEyMCxcbiAgICAvLyAgICAgc3c6IDYwLFxuICAgIC8vICAgICBzaDogNjAsXG4gICAgLy8gICAgIGR3OiA2MCxcbiAgICAvLyAgICAgZGg6IDYwLFxuICAgIC8vICAgICBkaXJlY3Rpb246IGFjdGlvbi5kYXRhLmRpcmVjdGlvbixcbiAgICAvLyAgICAgY3R4OiB3aW5kb3cuZ2FtZS5iZ0N0eFxuICAgIC8vIH0pO1xuICAgIC8vd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChjb3Jwc2UpO1xuXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMzAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xuXG4gICAgaWYgKHRoaXMuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHsgLy8gaWYgaXRzIG15IHBsYXllciwgc2hvdyByZXNwYXduIGJ1dHRvblxuICAgICAgICAvLyBjcmVhdGUgcmVzcGF3biBCdXR0b24gYW5kIGRpbSB0aGUgYmFja2dyb3VuZFxuICAgICAgICB2YXIgYmcgPSBuZXcgVWlSZWN0KDAsMCx3aW5kb3cuZ2FtZS5jYW52YXMud2lkdGgsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQsIFwicmdiYSgwLDAsMCwwLjgpXCIpO1xuICAgICAgICB2YXIgdGV4dCA9IG5ldyBVaVRleHQoe3RleHQ6IFwiWU9VIEhBVkUgRElFRCFcIiwgZm9udFNpemU6IDE4LCB4OiAyNTAsIHk6IHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLyAyIC0gMjB9KTtcbiAgICAgICAgdmFyIGJ1dHRvbiA9IG5ldyBVaUJ1dHRvbih7dGV4dDogXCJSRVNQQVdOXCIsIGZvbnRTaXplOiAyNCwgeDogd2luZG93LmdhbWUuY2FudmFzLndpZHRoIC8gMiAtIDYzLCB5OiB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC8gMiwgdzogMTMwLCBoOiA0MCwgY2xpY2tGdW5jdGlvbjogdGhpcy53YW50VG9SZXNwYXduLCBjb250ZXh0OiB0aGlzfSk7XG4gICAgICAgIHdpbmRvdy5nYW1lLnVpRWxlbWVudHMucHVzaChiZyk7XG4gICAgICAgIHdpbmRvdy5nYW1lLnVpRWxlbWVudHMucHVzaCh0ZXh0KTtcbiAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50cy5wdXNoKGJ1dHRvbik7XG4gICAgfVxuXG5cbn07XG5cblBsYXllci5wcm90b3R5cGUud2FudFRvUmVzcGF3biA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5hbGl2ZSkge1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcbiAgICAgICAgICAgIGRhdGE6IGhlbHBlcnMuZmluZFNwYXduTG9jYXRpb24oKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjbGVhciB1aSBvZiBidXR0b25zXG4gICAgICAgIHdpbmRvdy5nYW1lLnVpRWxlbWVudHMgPSBbXTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnJlc3Bhd24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLnggPSBhY3Rpb24uZGF0YS54O1xuICAgIHRoaXMueSA9IGFjdGlvbi5kYXRhLnk7XG4gICAgdGhpcy5ocCA9IDEwMDtcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcblxuICAgIC8vIHJlZmlsbCBhbGwgd2VhcG9uc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZWFwb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMud2VhcG9uc1tpXS5maWxsTWFnYXppbmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5jaGFuZ2VXZWFwb24gPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zdG9wUmVsb2FkKCk7XG4gICAgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4ID0gYWN0aW9uLmRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueSxcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGhwOiB0aGlzLmhwLFxuICAgICAgICBhbGl2ZTogdGhpcy5hbGl2ZSxcbiAgICAgICAgcmFkaXVzOiB0aGlzLnJhZGl1cyxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAgdmlld2luZ0FuZ2xlOiB0aGlzLnZpZXdpbmdBbmdsZSxcbiAgICAgICAgc3BlZWQ6IHRoaXMuc3BlZWQsXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWSxcbiAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4LFxuICAgICAgICB3ZWFwb25TdGF0ZTogdGhpcy5nZXRXZWFwb25TdGF0ZSgpXG4gICAgfTtcbn07XG5cbi8vIFRoZSBzdGF0ZSB0aGUgY2xpZW50IHNlbmRzIHRvIHRoZSBob3N0XG5QbGF5ZXIucHJvdG90eXBlLmdldENsaWVudFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIGtVcDogdGhpcy5rVXAsXG4gICAgICAgIGtEb3duOiB0aGlzLmtEb3duLFxuICAgICAgICBrTGVmdDogdGhpcy5rTGVmdCxcbiAgICAgICAga1JpZ2h0OiB0aGlzLmtSaWdodCxcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWVxuICAgIH07XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZVN0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICB0aGlzLnggPSBuZXdTdGF0ZS54IHx8IHRoaXMueDtcbiAgICB0aGlzLnkgPSBuZXdTdGF0ZS55IHx8IHRoaXMueTtcbiAgICAvL2lkOiB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5ocCA9IG5ld1N0YXRlLmhwIHx8IHRoaXMuaHA7XG4gICAgLy90aGlzLmFsaXZlID0gbmV3U3RhdGUuYWxpdmU7XG4gICAgdGhpcy5hbGl2ZSA9IHR5cGVvZiBuZXdTdGF0ZS5hbGl2ZSAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLmFsaXZlIDogdGhpcy5hbGl2ZTtcbiAgICB0aGlzLnJhZGl1cyA9IG5ld1N0YXRlLnJhZGl1cyB8fCB0aGlzLnJhZGl1cztcbiAgICB0aGlzLmRpcmVjdGlvbiA9IG5ld1N0YXRlLmRpcmVjdGlvbiB8fCB0aGlzLmRpcmVjdGlvbjtcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IG5ld1N0YXRlLnZpZXdpbmdBbmdsZSB8fCB0aGlzLnZpZXdpbmdBbmdsZTtcbiAgICB0aGlzLnNwZWVkID0gbmV3U3RhdGUuc3BlZWQgfHwgdGhpcy5zcGVlZDtcbiAgICB0aGlzLmtVcCA9IHR5cGVvZiBuZXdTdGF0ZS5rVXAgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5rVXAgOiB0aGlzLmtVcDtcbiAgICB0aGlzLmtVcCA9IHR5cGVvZiBuZXdTdGF0ZS5rVXAgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5rVXAgOiB0aGlzLmtVcDtcbiAgICB0aGlzLmtMZWZ0ID0gdHlwZW9mIG5ld1N0YXRlLmtMZWZ0ICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUua0xlZnQgOiB0aGlzLmtMZWZ0O1xuICAgIHRoaXMua1JpZ2h0ID0gdHlwZW9mIG5ld1N0YXRlLmtSaWdodCAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLmtSaWdodCA6IHRoaXMua1JpZ2h0O1xuICAgIHRoaXMubW91c2VYID0gdHlwZW9mIG5ld1N0YXRlLm1vdXNlWCAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLm1vdXNlWCA6IHRoaXMubW91c2VYO1xuICAgIHRoaXMubW91c2VZID0gdHlwZW9mIG5ld1N0YXRlLm1vdXNlWSAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLm1vdXNlWSA6IHRoaXMubW91c2VZO1xuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IG5ld1N0YXRlLnNlbGVjdGVkV2VhcG9uSW5kZXggfHwgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4O1xufTtcblxuLy8gZ2V0IHRoZSBzdGF0ZSBvZiBlYWNoIHdlYXBvblxuUGxheWVyLnByb3RvdHlwZS5nZXRXZWFwb25TdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZWFwb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHN0YXRlLnB1c2godGhpcy53ZWFwb25zW2ldLmdldFN0YXRlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGU7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xuIiwiLy8gdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vLyB2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vd2VhcG9ucy9XZWFwb25cIik7XG4vL1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZS9FbWl0dGVyXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFVpKGdhbWUpe1xuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyc1wiKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICB2YXIgbXlJRCA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQ7XG4gICAgICAgIHRoaXMuY2xpZW50TGlzdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpZCBpbiBwbGF5ZXJzKXtcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQgKyBcIiBcIiArIHBsYXllcnNbaWRdLnBpbmcpO1xuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgICAgICAgICB0aGlzLmNsaWVudExpc3QuYXBwZW5kQ2hpbGQobGkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyRGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSBcIjEycHggT3BlbiBTYW5zXCI7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZDdkN2Q3XCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgd2luZG93LmdhbWUuZnBzLCA1LCAyMCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBJTkc6IFwiICsgd2luZG93LmdhbWUubmV0d29yay5waW5nLCA1LCAzNCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkNBTUVSQTogXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS54KSArIFwiLCBcIiArIE1hdGguZmxvb3Iod2luZG93LmdhbWUuY2FtZXJhLnkpLCA1LCA0OCk7XG4gICAgICAgIGlmIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBMQVlFUjogIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci55KSwgNSwgNjIpO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiTU9VU0U6IFwiICsgTWF0aC5mbG9vcihwbGF5ZXIubW91c2VYKSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWSksIDUsIDc2KTtcbiAgICAgICAgICAgIGlmKHBsYXllcikgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiRElSOiBcIiArIHBsYXllci5kaXJlY3Rpb24udG9GaXhlZCgyKSwgNSwgOTApO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBBUlRJQ0xFUzogXCIgKyB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMubGVuZ3RoLCA1LCAxMDQpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJVSSAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgIGlmICghcGxheWVyKSByZXR1cm47XG5cblxuICAgICAgICAvL2d1aSBiZyBjb2xvclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5yZWN0KDAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzNSwgMTQwLCAzNSk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4zNSlcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGwoKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ3JhZGllbnRcbiAgICAgICAgdmFyIGdyZD0gd2luZG93LmdhbWUuY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDE0MCwwLDE5MCwwKTtcbiAgICAgICAgZ3JkLmFkZENvbG9yU3RvcCgwLFwicmdiYSgwLDAsMCwwLjM1KVwiKTtcbiAgICAgICAgZ3JkLmFkZENvbG9yU3RvcCgxLFwicmdiYSgwLDAsMCwwKVwiKTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZT1ncmQ7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsUmVjdCgxNDAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzNSw1MCwzNSk7XG5cblxuXG4gICAgICAgIHZhciB3ZWFwb24gPSAgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdO1xuICAgICAgICAvLyBkcmF3IHdlYXBvbiBpY29uXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHdlYXBvbi5pY29uU3gsIHdlYXBvbi5pY29uU3ksIHdlYXBvbi5pY29uVywgd2VhcG9uLmljb25ILCA5MCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDMzLCB3ZWFwb24uaWNvblcsIHdlYXBvbi5pY29uSCk7XG4gICAgICAgIC8vIGRyYXcgbWFnYXppbmUgY291bnQnXG4gICAgICAgIGlmICh3ZWFwb24ucmVsb2FkaW5nKSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCA4NSwgMjE0LCAyMSwgMjIsIDEyNSwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDMwLCAyMSwgMjIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjI1KVwiO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHdlYXBvbi5idWxsZXRzLCAxMjIsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSA5KTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNlN2QyOWVcIjtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh3ZWFwb24uYnVsbGV0cywgIDEyMiwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRyYXcgaGVhcnRcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgMCwgMjI4LCAxMywgMTIsIDEwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMjMsIDEzLCAxMik7XG4gICAgICAgIC8vIGRyYXcgSFBcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjI1KVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQocGxheWVyLmhwLCAzMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDkpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZTdkMjllXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3Bhd25CdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcblxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkge1xuXG4gICAgICAgICAgICAvLyB2YXIgc3Bhd25Mb2NhdGlvbkZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB2YXIgeDtcbiAgICAgICAgICAgIC8vIHZhciB5O1xuICAgICAgICAgICAgLy8gd2hpbGUgKCFzcGF3bkxvY2F0aW9uRm91bmQpIHtcbiAgICAgICAgICAgIC8vICAgICB4ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAgICAgICAgIC8vICAgICB5ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIGlmIChoZWxwZXJzLmNvbGxpc2lvbkNoZWNrKHt4OiB4LCB5OiB5fSkpIHNwYXduTG9jYXRpb25Gb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAvLyB9XG5cblxuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogaGVscGVycy5maW5kU3Bhd25Mb2NhdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZWxvYWRCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgaWYgKHBsYXllci5hbGl2ZSkge1xuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZWxvYWRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmICghcGxheWVyLmFsaXZlKSB7XG4gICAgICAgIC8vICAgICB2YXIgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgIC8vICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAvLyAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgIC8vICAgICAgICAgZGF0YToge1xuICAgICAgICAvLyAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAvLyAgICAgICAgICAgICB5OiB5XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICB9KTtcblxuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZW1pdHRlckJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgICAgICAgICAgZW1pdENvdW50OiAxMCxcbiAgICAgICAgICAgICAgICBlbWl0U3BlZWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgeDogcGxheWVyLngsXG4gICAgICAgICAgICAgICAgeTogcGxheWVyLnlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG59O1xuIiwidmFyIGxldmVsID0ge1xyXG4gICAgbmFtZTogXCJsZXZlbDFcIixcclxuICAgIHRpbGVzOiBbXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwyLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMiwyLDIsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDEsMiwyLDIsMSwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwxLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsZXZlbDtcclxuIiwidmFyIEFrNDcgPSB7XHJcbiAgICBcIm5hbWVcIjogXCJBazQ3XCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAzMCwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDMwLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjEsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogMSwgLy8gc2hvb3QgMSBidWxsZXQgYXQgYSB0aW1lXHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAxLjYsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMTcwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiAwLCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbiAgICBcImljb25TeFwiOiAyMSxcclxuICAgIFwiaWNvblN5XCI6IDIxMCxcclxuICAgIFwiaWNvbldcIjogMzAsXHJcbiAgICBcImljb25IXCI6IDMwLFxyXG4gICAgXCJzb3VuZFwiOiBcImFrXCIsXHJcbiAgICBcInJlbG9hZFNvdW5kXCI6IFwiYWstcmVsb2FkXCJcclxufTtcclxuXHJcbnZhciBzaG90Z3VuID0ge1xyXG4gICAgXCJuYW1lXCI6IFwic2hvdGd1blwiLFxyXG4gICAgXCJtYWdhemluZVNpemVcIjogMTIsIC8vIGJ1bGxldHNcclxuICAgIFwiYnVsbGV0c1wiOiAxMixcclxuICAgIFwiZmlyZVJhdGVcIjogMC41LCAvLyBzaG90cyBwZXIgc2Vjb25kXHJcbiAgICBcImJ1bGxldHNQZXJTaG90XCI6IDQsIC8vIDQgc2hvdGd1biBzbHVncyBwZXIgc2hvdFxyXG4gICAgXCJkYW1hZ2VcIjogMTAsIC8vIGhwXHJcbiAgICBcInJlbG9hZFRpbWVcIjogMS42LCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDI1MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogNjAsIC8vIHNwcml0ZXNoZWV0IHkgcG9zaXRpb25cclxuICAgIFwiaWNvblN4XCI6IDUxLFxyXG4gICAgXCJpY29uU3lcIjogMjEwLFxyXG4gICAgXCJpY29uV1wiOiAzMCxcclxuICAgIFwiaWNvbkhcIjogMzAsXHJcbiAgICBcInNvdW5kXCI6IFwic2hvdGd1blwiLFxyXG4gICAgXCJyZWxvYWRTb3VuZFwiOiBcInNob3RndW4tcmVsb2FkXCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQWs0NzogQWs0NyxcclxuICAgIHNob3RndW46IHNob3RndW5cclxufTtcclxuIiwiLy8gZGVncmVlcyB0byByYWRpYW5zXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XG4gICAgcmV0dXJuIGRlZyAqIChNYXRoLlBJIC8gMTgwKTtcbn1cblxuLy8gcmFkaWFucyB0byBkZWdyZWVzXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuLy8gY2hlY2sgaWYgdGhpcyBwb2ludCBpcyBpbnNpZGUgYSBub24gd2Fsa2FibGUgdGlsZS4gcmV0dXJucyB0cnVlIGlmIG5vdCB3YWxrYWJsZVxuZnVuY3Rpb24gY29sbGlzaW9uQ2hlY2socG9pbnQpIHtcbiAgICB2YXIgdGlsZVJvdyA9IE1hdGguZmxvb3IocG9pbnQueSAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKTtcbiAgICB2YXIgdGlsZUNvbCA9IE1hdGguZmxvb3IocG9pbnQueCAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKTtcbiAgICBpZiAodGlsZVJvdyA8IDAgfHwgdGlsZVJvdyA+PSB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQgfHwgdGlsZUNvbCA8IDAgfHwgdGlsZUNvbCA+PSB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgKSByZXR1cm4gdHJ1ZTsgLy8gb3V0c2lkZSBtYXBcbiAgICByZXR1cm4gKHdpbmRvdy5nYW1lLmxldmVsLmxldmVsLnRpbGVzW3RpbGVSb3ddW3RpbGVDb2xdID4gMCk7XG59XG5cbi8vIHRha2VzIGEgcG9pbnQgYW5kIHJldHVucyB0aWxlIHh5d2ggdGhhdCBpcyB1bmRlciB0aGF0IHBvaW50XG5mdW5jdGlvbiBnZXRSZWN0RnJvbVBvaW50KHBvaW50KSB7XG4gICAgdmFyIHkgPSBNYXRoLmZsb29yKHBvaW50LnkgLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSkgKiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZTtcbiAgICB2YXIgeCA9IE1hdGguZmxvb3IocG9pbnQueCAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKSAqIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplO1xuICAgIHJldHVybiB7eDogeCwgeTogeSwgdzogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUsIGg6IHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplfTtcbn1cblxuLy8gcmV0dXJucyB0aWxlXG5mdW5jdGlvbiBnZXRUaWxlKHgsIHkpIHtcbiAgICBpZih4ID49IDAgJiYgeCA8IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudCAmJiB5ID49IDAgJiYgeSA8IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudClcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5nYW1lLmxldmVsLmxldmVsLnRpbGVzW3ldW3hdO1xufVxuXG4vLyBmaW5kcyBhIHJhbmRvbSB3YWxrYWJsZSB0aWxlIG9uIHRoZSBtYXBcbmZ1bmN0aW9uIGZpbmRTcGF3bkxvY2F0aW9uKCkge1xuICAgIHZhciB4O1xuICAgIHZhciB5O1xuICAgIGRvIHtcbiAgICAgICAgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKTtcbiAgICAgICAgeSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCk7XG4gICAgfVxuICAgIHdoaWxlIChjb2xsaXNpb25DaGVjayh7eDogeCwgeTogeX0pKTtcblxuICAgIHJldHVybiB7eDogeCwgeTogeX07XG59XG5cbi8vIGNoZWNrcyB0aGF0IGEgeHkgcG9pbnQgaXMgaW5zaWRlIHRoZSBnYW1lIHdvcmxkXG5mdW5jdGlvbiBpc0luc2lkZUdhbWUoeCwgeSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwieDpcIix4LCBcInk6XCIseSwgXCJ3aWR0aDpcIix3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCwgXCJoZWlnaHQ6XCIsd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KTtcbiAgICAvLyBjb25zb2xlLmxvZyh4ID49IDAsIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCwgIHkgPj0gMCwgeSA8IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCk7XG4gICAgaWYgKHggPj0gMCAmJiB4IDwgd2luZG93LmdhbWUubGV2ZWwud2lkdGggJiYgeSA+PSAwICYmIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpIHJldHVybiB0cnVlO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRvUmFkaWFuczogdG9SYWRpYW5zLFxuICAgIHRvRGVncmVlczogdG9EZWdyZWVzLFxuICAgIGNvbGxpc2lvbkNoZWNrOiBjb2xsaXNpb25DaGVjayxcbiAgICBmaW5kU3Bhd25Mb2NhdGlvbjogZmluZFNwYXduTG9jYXRpb24sXG4gICAgZ2V0UmVjdEZyb21Qb2ludDogZ2V0UmVjdEZyb21Qb2ludCxcbiAgICBnZXRUaWxlOiBnZXRUaWxlLFxuICAgIGlzSW5zaWRlR2FtZTogaXNJbnNpZGVHYW1lXG59O1xuIiwidmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lLmpzXCIpO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn0pO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxuLy92YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgQnVsbGV0SG9sZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICAvL3ZhciBybmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCk7XHJcbiAgICAgICAgLy8gdmFyIHIgPSAxNTA7XHJcbiAgICAgICAgLy8gdmFyIGcgPSA1MDtcclxuICAgICAgICAvLyB2YXIgYiA9IDUwO1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCJyZ2IoNjYsIDY2LCA2NilcIjtcclxuICAgICAgICAvL2RhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMjtcclxuICAgICAgICBkYXRhLmNvbnRhaW5lciA9IHdpbmRvdy5nYW1lLnBhcnRpY2xlcztcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5saWZlVGltZSA9IDEwO1xyXG4gICAgICAgIC8vdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgLy90aGlzLnNwZWVkID0gODA7XHJcblxyXG4gICAgICAgIC8vdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XHJcbiAgICAgICAgLy90aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5CdWxsZXRIb2xlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XHJcbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAvLyBpZiAodGhpcy5kaXN0YW5jZU1vdmVkIDwgdGhpcy5tb3ZlRGlzdGFuY2UpIHtcclxuICAgIC8vICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcbiAgICAvLyAgICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAvLyAgICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAvLyAgICAgdGhpcy5kaXN0YW5jZU1vdmVkICs9IGRpc3RhbmNlO1xyXG4gICAgLy9cclxuICAgIC8vICAgICBpZiAodGhpcy5kaXN0YW5jZU1vdmVkID49IHRoaXMubW92ZURpc3RhbmNlKSB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmJnQ3R4OyAvLyBtb3ZlIHRvIGJhY2tncm91bmQgY3R4XHJcbiAgICAvLyB9XHJcblxyXG59O1xyXG5cclxuLy8gQmxvb2RTcGxhc2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuLy8gICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbi8vICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbi8vIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXRIb2xlO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIEZsYXNoIGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIC8vdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICAvLyB2YXIgciA9IDE1MDtcclxuICAgICAgICAvLyB2YXIgZyA9IDUwO1xyXG4gICAgICAgIC8vIHZhciBiID0gNTA7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcIiNmZmU2MDBcIjtcclxuICAgICAgICBkYXRhLmxpZmVUaW1lID0gMC4wNTtcclxuICAgICAgICBkYXRhLmNvbnRhaW5lciA9IHdpbmRvdy5nYW1lLnBhcnRpY2xlcztcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgLy90aGlzLmxpZmVUaW1lID0gMC4wNTtcclxuXHJcbiAgICAgICAgLy90aGlzLmRpcmVjdGlvbiA9IGhlbHBlcnMudG9SYWRpYW5zKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxKTtcclxuICAgIH1cclxufVxyXG5cclxuRmxhc2gucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4gICAgdGhpcy5saWZlVGltZSAtPSBkdDtcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lIDwgMCkgdGhpcy5kZXN0cm95KGluZGV4KTtcclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmxhc2g7XHJcbiIsImZ1bmN0aW9uIFJlY3RhbmdsZSAoeCwgeSwgdywgaCwgY29sb3IpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy53ID0gdztcclxuICAgIHRoaXMuaCA9IGg7XHJcbiAgICB0aGlzLnJlY3QgPSB7eDp4LCB5OnksIHc6dywgaDpofTtcclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxufVxyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5yZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLncsIHRoaXMuaCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZTtcclxuIiwiZnVuY3Rpb24gUmVjdGFuZ2xlIChkYXRhKSB7XHJcbiAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICB0aGlzLmNvbG9yID0gZGF0YS5jb2xvcjtcclxuICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcclxuICAgIHRoaXMuZm9udFNpemUgPSBkYXRhLmZvbnRTaXplO1xyXG59XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSB0aGlzLmZvbnRTaXplICsgXCJweCBPcGVuIFNhbnNcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNkN2Q3ZDdcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh0aGlzLnRleHQsIHRoaXMueCwgdGhpcy55KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlO1xyXG4iLCIvL3ZhciB0aWxlcyA9IHJlcXVpcmUoXCIuL2xldmVsXCIpLnRpbGVzO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLy4uL2hlbHBlcnMuanNcIik7XHJcbnZhciBjb2xsaXNpb25EZXRlY3Rpb24gPSByZXF1aXJlKFwiLi9jb2xsaXNpb25EZXRlY3Rpb25cIik7XHJcblxyXG5mdW5jdGlvbiBibGluZSh4MCwgeTAsIHgxLCB5MSkge1xyXG5cclxuICB2YXIgZHggPSBNYXRoLmFicyh4MSAtIHgwKSwgc3ggPSB4MCA8IHgxID8gMSA6IC0xO1xyXG4gIHZhciBkeSA9IE1hdGguYWJzKHkxIC0geTApLCBzeSA9IHkwIDwgeTEgPyAxIDogLTE7XHJcbiAgdmFyIGVyciA9IChkeD5keSA/IGR4IDogLWR5KS8yO1xyXG5cclxuICB3aGlsZSAodHJ1ZSkge1xyXG5cclxuICAgIGlmICh4MCA9PT0geDEgJiYgeTAgPT09IHkxKSBicmVhaztcclxuICAgIHZhciBlMiA9IGVycjtcclxuICAgIGlmIChlMiA+IC1keCkgeyBlcnIgLT0gZHk7IHgwICs9IHN4OyB9XHJcbiAgICBpZiAoZTIgPCBkeSkgeyBlcnIgKz0gZHg7IHkwICs9IHN5OyB9XHJcblxyXG5cclxuXHJcbiAgICAvLyBjaGVjayBpZiBvdXRzaWRlIG1hcFxyXG4gICAgaWYgKCFoZWxwZXJzLmlzSW5zaWRlR2FtZSh4MCwgeTApKSByZXR1cm47XHJcblxyXG5cclxuICAgIC8vIGhpdCBjaGVjayBhZ2FpbnN0IHBsYXllcnNcclxuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcclxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIGhpdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5wb2ludENpcmNsZSh7eDogeDAsIHk6IHkwfSwge3g6IHBsYXllci54LCB5OiBwbGF5ZXIueSwgcmFkaXVzOiBwbGF5ZXIucmFkaXVzfSk7XHJcbiAgICAgICAgaWYgKGhpdCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge3R5cGU6IFwicGxheWVyXCIsIHBsYXllcjogcGxheWVyfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0aWxlWCA9IE1hdGguZmxvb3IoeDAgLyAzMik7XHJcbiAgICB2YXIgdGlsZVkgPSBNYXRoLmZsb29yKHkwIC8gMzIpO1xyXG4gICAgLy8gY2hlY2sgYWdhaW5zdCB0aWxlc1xyXG4gICAgaWYgKGhlbHBlcnMuZ2V0VGlsZSh0aWxlWCx0aWxlWSkgPT09IDEpIHJldHVybiB7dHlwZTogXCJ0aWxlXCIsIHg6IHRpbGVYLCB5OiB0aWxlWX07XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJsaW5lO1xyXG4iLCJ2YXIgaW50ZXJzZWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gbGluZVJlY3RJbnRlcnNlY3QobGluZSwgcmVjdCkge1xyXG5cclxuICAgICAgICAvL2lmIChwb2ludCBpcyBpbnNpZGUgcmVjdClcclxuICAgICAgICAvLyBpbnRlcnNlY3QgPSBwb2ludDtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgbGVmdFxyXG4gICAgICAgIHZhciBsZWZ0ID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgICAgICB2YXIgbGVmdEludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSxsZWZ0KTtcclxuICAgICAgICBpZiAobGVmdEludGVyc2VjdC55ID49IGxlZnQuc3RhcnQueSAmJiBsZWZ0SW50ZXJzZWN0LnkgPD0gbGVmdC5lbmQueSAmJiBsaW5lLnN0YXJ0LnggPD0gbGVmdC5zdGFydC54ICkge1xyXG4gICAgICAgICAgICBsZWZ0SW50ZXJzZWN0LnggKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIGxlZnRJbnRlcnNlY3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayB0b3BcclxuICAgICAgICB2YXIgdG9wID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0Lnl9fTtcclxuICAgICAgICB2YXIgdG9wSW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCB0b3ApO1xyXG4gICAgICAgIGlmICh0b3BJbnRlcnNlY3QueCA+PSB0b3Auc3RhcnQueCAmJiB0b3BJbnRlcnNlY3QueCA8PSB0b3AuZW5kLnggJiYgbGluZS5zdGFydC55IDw9IHRvcC5zdGFydC55KSB7XHJcbiAgICAgICAgICAgIHRvcEludGVyc2VjdC55ICs9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3BJbnRlcnNlY3Q7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hlY2sgcmlnaHRcclxuICAgICAgICB2YXIgcmlnaHQgPSB7c3RhcnQ6e3g6IHJlY3QueCArIHJlY3QudyAseTogcmVjdC55IH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgICAgICB2YXIgcmlnaHRJbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHJpZ2h0KTtcclxuICAgICAgICBpZiAocmlnaHRJbnRlcnNlY3QueSA+PSByaWdodC5zdGFydC55ICYmIHJpZ2h0SW50ZXJzZWN0LnkgPCByaWdodC5lbmQueSkge1xyXG4gICAgICAgICAgICByaWdodEludGVyc2VjdC54IC09IDE7XHJcbiAgICAgICAgICAgIHJldHVybiByaWdodEludGVyc2VjdDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayBkb3duXHJcbiAgICAgICAgdmFyIGRvd24gPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciBkb3duSW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCBkb3duKTtcclxuICAgICAgICB0b3BJbnRlcnNlY3QueSAtPSAxO1xyXG4gICAgICAgIHJldHVybiBkb3duSW50ZXJzZWN0O1xyXG59XHJcblxyXG4vLyBmaW5kIHRoZSBwb2ludCB3aGVyZSBhIGxpbmUgaW50ZXJzZWN0cyBhIHJlY3RhbmdsZS4gdGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoZSBsaW5lIGFuZCByZWN0IGludGVyc2VjdHNcclxuZnVuY3Rpb24gbGluZVJlY3RJbnRlcnNlY3QyKGxpbmUsIHJlY3QpIHtcclxuICAgIC8vaWYgKHBvaW50IGlzIGluc2lkZSByZWN0KVxyXG4gICAgLy8gaW50ZXJzZWN0ID0gcG9pbnQ7XHJcblxyXG4gICAgLy8gY2hlY2sgbGVmdFxyXG4gICAgdmFyIGxlZnRMaW5lID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgIHZhciBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSxsZWZ0TGluZSk7XHJcbiAgICBpZiAoaW50ZXJzZWN0aW9uUG9pbnQueSA+PSBsZWZ0TGluZS5zdGFydC55ICYmIGludGVyc2VjdGlvblBvaW50LnkgPD0gbGVmdExpbmUuZW5kLnkgJiYgbGluZS5zdGFydC54IDw9IGxlZnRMaW5lLnN0YXJ0LnggKSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIHRvcFxyXG4gICAgdmFyIHRvcExpbmUgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueX19O1xyXG4gICAgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHRvcExpbmUpO1xyXG4gICAgaWYgKGludGVyc2VjdGlvblBvaW50LnggPj0gdG9wTGluZS5zdGFydC54ICYmIGludGVyc2VjdGlvblBvaW50LnggPD0gdG9wTGluZS5lbmQueCAmJiBsaW5lLnN0YXJ0LnkgPD0gdG9wTGluZS5zdGFydC55KSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIHJpZ2h0XHJcbiAgICB2YXIgcmlnaHRMaW5lID0ge3N0YXJ0Ont4OiByZWN0LnggKyByZWN0LncgLHk6IHJlY3QueSB9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgcmlnaHRMaW5lKTtcclxuICAgIGlmIChpbnRlcnNlY3Rpb25Qb2ludC55ID49IHJpZ2h0TGluZS5zdGFydC55ICYmIGludGVyc2VjdGlvblBvaW50LnkgPCByaWdodExpbmUuZW5kLnkgJiYgbGluZS5zdGFydC54ID49IHJpZ2h0TGluZS5zdGFydC54KSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGRvd25cclxuICAgIHZhciBkb3duID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCBkb3duKTtcclxuICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxufVxyXG5cclxuXHJcbi8vIENoZWNrcyBpZiBhIHBvaW50IGlzIGluc2lkZSBhIGNpcmNsZVxyXG5mdW5jdGlvbiBwb2ludENpcmNsZShwb2ludCwgY2lyY2xlKSB7XHJcbiAgICAgICAgdmFyIGEgPSBwb2ludC54IC0gY2lyY2xlLng7XHJcbiAgICAgICAgdmFyIGIgPSBwb2ludC55IC0gY2lyY2xlLnk7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBhKmEgKyBiKmIgKTtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBjaXJjbGUucmFkaXVzKSB7IC8vIHBvaW50IGlzIGluc2lkZSBjaXJjbGVcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG4vLyBDaGVja3MgaWYgYSBwb2ludCBpcyBpbnNpZGUgYSByZWN0YW5nbGVcclxuZnVuY3Rpb24gcG9pbnRSZWN0KHBvaW50LCByZWN0KSB7XHJcbiAgICByZXR1cm4gKHBvaW50LnggPj0gcmVjdC54ICYmIHBvaW50LnggPD0gcmVjdC54ICsgcmVjdC53ICYmIHBvaW50LnkgPj0gcmVjdC55ICYmIHBvaW50LnkgPD0gcmVjdC55ICsgcmVjdC5oKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBsaW5lUmVjdEludGVyc2VjdDogbGluZVJlY3RJbnRlcnNlY3QsXHJcbiAgICBwb2ludENpcmNsZTogcG9pbnRDaXJjbGUsXHJcbiAgICBwb2ludFJlY3Q6IHBvaW50UmVjdCxcclxuICAgIGxpbmVSZWN0SW50ZXJzZWN0MjogbGluZVJlY3RJbnRlcnNlY3QyXHJcbn07XHJcbiIsInZhciBpbnRlcnNlY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2ZWN0b3IgPSB7fTtcclxuICAgIHZlY3Rvci5vQSA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm4gc2VnbWVudC5zdGFydDtcclxuICAgIH07XHJcbiAgICB2ZWN0b3IuQUIgPSBmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gc2VnbWVudC5zdGFydDtcclxuICAgICAgICB2YXIgZW5kID0gc2VnbWVudC5lbmQ7XHJcbiAgICAgICAgcmV0dXJuIHt4OmVuZC54IC0gc3RhcnQueCwgeTogZW5kLnkgLSBzdGFydC55fTtcclxuICAgIH07XHJcbiAgICB2ZWN0b3IuYWRkID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4ge3g6IHYxLnggKyB2Mi54LCB5OiB2MS55ICsgdjIueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3Iuc3ViID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4ge3g6djEueCAtIHYyLngsIHk6IHYxLnkgLSB2Mi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5zY2FsYXJNdWx0ID0gZnVuY3Rpb24ocywgdikge1xyXG4gICAgICAgIHJldHVybiB7eDogcyAqIHYueCwgeTogcyAqIHYueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3IuY3Jvc3NQcm9kdWN0ID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4gKHYxLnggKiB2Mi55KSAtICh2Mi54ICogdjEueSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIHNlbGYgPSB7fTtcclxuICAgIHNlbGYudmVjdG9yID0gZnVuY3Rpb24oc2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybiB2ZWN0b3IuQUIoc2VnbWVudCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pbnRlcnNlY3RTZWdtZW50cyA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIHR1cm4gYSA9IHAgKyB0KnIgd2hlcmUgMDw9dDw9MSAocGFyYW1ldGVyKVxyXG4gICAgICAgIC8vIGIgPSBxICsgdSpzIHdoZXJlIDA8PXU8PTEgKHBhcmFtZXRlcilcclxuICAgICAgICB2YXIgcCA9IHZlY3Rvci5vQShhKTtcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuXHJcbiAgICAgICAgdmFyIHEgPSB2ZWN0b3Iub0EoYik7XHJcbiAgICAgICAgdmFyIHMgPSB2ZWN0b3IuQUIoYik7XHJcblxyXG4gICAgICAgIHZhciBjcm9zcyA9IHZlY3Rvci5jcm9zc1Byb2R1Y3QocixzKTtcclxuICAgICAgICB2YXIgcW1wID0gdmVjdG9yLnN1YihxLHApO1xyXG4gICAgICAgIHZhciBudW1lcmF0b3IgPSB2ZWN0b3IuY3Jvc3NQcm9kdWN0KHFtcCwgcyk7XHJcbiAgICAgICAgdmFyIHQgPSBudW1lcmF0b3IgLyBjcm9zcztcclxuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gdmVjdG9yLmFkZChwLHZlY3Rvci5zY2FsYXJNdWx0KHQscikpO1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb247XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pc1BhcmFsbGVsID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gYSBhbmQgYiBhcmUgbGluZSBzZWdtZW50cy5cclxuICAgICAgICAvLyByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBhcmUgcGFyYWxsZWwgKG9yIGNvLWxpbmVhcilcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuICAgICAgICByZXR1cm4gKHZlY3Rvci5jcm9zc1Byb2R1Y3QocixzKSA9PT0gMCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pc0NvbGxpbmVhciA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIGEgYW5kIGIgYXJlIGxpbmUgc2VnbWVudHMuXHJcbiAgICAgICAgLy8gcmV0dXJucyB0cnVlIGlmIGEgYW5kIGIgYXJlIGNvLWxpbmVhclxyXG4gICAgICAgIHZhciBwID0gdmVjdG9yLm9BKGEpO1xyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG5cclxuICAgICAgICB2YXIgcSA9IHZlY3Rvci5vQShiKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuICAgICAgICByZXR1cm4gKHZlY3Rvci5jcm9zc1Byb2R1Y3QodmVjdG9yLnN1YihwLHEpLCByKSA9PT0gMCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5zYWZlSW50ZXJzZWN0ID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuaXNQYXJhbGxlbChhLGIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcnNlY3RTZWdtZW50cyhhLGIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbn07XHJcbmludGVyc2VjdGlvbi5pbnRlcnNlY3RTZWdtZW50cyA9IGludGVyc2VjdGlvbigpLmludGVyc2VjdFNlZ21lbnRzO1xyXG5pbnRlcnNlY3Rpb24uaW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uKCkuc2FmZUludGVyc2VjdDtcclxuaW50ZXJzZWN0aW9uLmlzUGFyYWxsZWwgPSBpbnRlcnNlY3Rpb24oKS5pc1BhcmFsbGVsO1xyXG5pbnRlcnNlY3Rpb24uaXNDb2xsaW5lYXIgPSBpbnRlcnNlY3Rpb24oKS5pc0NvbGxpbmVhcjtcclxuaW50ZXJzZWN0aW9uLmRlc2NyaWJlID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICB2YXIgaXNDb2xsaW5lYXIgPSBpbnRlcnNlY3Rpb24oKS5pc0NvbGxpbmVhcihhLGIpO1xyXG4gICAgdmFyIGlzUGFyYWxsZWwgPSBpbnRlcnNlY3Rpb24oKS5pc1BhcmFsbGVsKGEsYik7XHJcbiAgICB2YXIgcG9pbnRPZkludGVyc2VjdGlvbiA9IHVuZGVmaW5lZDtcclxuICAgIGlmIChpc1BhcmFsbGVsID09PSBmYWxzZSkge1xyXG4gICAgICAgIHBvaW50T2ZJbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb24oKS5pbnRlcnNlY3RTZWdtZW50cyhhLGIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtjb2xsaW5lYXI6IGlzQ29sbGluZWFyLHBhcmFsbGVsOiBpc1BhcmFsbGVsLGludGVyc2VjdGlvbjpwb2ludE9mSW50ZXJzZWN0aW9ufTtcclxufTtcclxuXHJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdGlvbjtcclxuIiwidmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL1dlYXBvblwiKTtcclxudmFyIHdlYXBvbkRhdGEgPSByZXF1aXJlKFwiLi4vZGF0YS93ZWFwb25zXCIpLkFrNDc7XHJcblxyXG5jbGFzcyBBazQ3IGV4dGVuZHMgV2VhcG9ue1xyXG4gICAgY29uc3RydWN0b3Iob3duZXIsIGV4aXN0aW5nV2VhcG9uRGF0YSkge1xyXG4gICAgICAgIHdlYXBvbkRhdGEgPSBleGlzdGluZ1dlYXBvbkRhdGEgfHwgd2VhcG9uRGF0YTtcclxuICAgICAgICBzdXBlcihvd25lciwgd2VhcG9uRGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWs0NztcclxuIiwidmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL1dlYXBvblwiKTtcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5zaG90Z3VuO1xudmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldDJcIik7XG5cbmNsYXNzIFNob3RndW4gZXh0ZW5kcyBXZWFwb257XG4gICAgY29uc3RydWN0b3Iob3duZXIsIGV4aXN0aW5nV2VhcG9uRGF0YSkge1xuICAgICAgICB3ZWFwb25EYXRhID0gZXhpc3RpbmdXZWFwb25EYXRhIHx8IHdlYXBvbkRhdGE7XG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcbiAgICB9XG59XG5cblNob3RndW4ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcblxuICAgIC8vIHBsYXkgZW1wdHkgY2xpcCBzb3VuZCBpZiBvdXQgb2YgYnVsbGV0c1xuICAgIGlmICggdGhpcy5idWxsZXRzIDwgMSAmJiAhdGhpcy5yZWxvYWRpbmcpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXApIHtcbiAgICAgICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCA9IGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcC5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSB8fCB0aGlzLnJlbG9hZGluZyB8fCB0aGlzLmJ1bGxldHMgPCAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLmJ1bGxldHMgLT0gMTtcbiAgICB0aGlzLmZpcmVUaW1lciA9IDA7XG5cbiAgICB2YXIgZGlyZWN0aW9ucyA9IFtdO1xuICAgIHZhciBkaXJlY3Rpb247XG5cbiAgICAvL3ZhciB0YXJnZXRMb2NhdGlvbnMgPSBbXTtcbiAgICAvL3ZhciB0YXJnZXRMb2NhdGlvbnM7XG5cbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KHRoaXMuc291bmQpO1xuICAgIC8vIHNob290IDQgYnVsbGV0c1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5idWxsZXRzUGVyU2hvdDsgaSArPSAxKSB7XG5cbiAgICAgICAgaWYgKCFhY3Rpb24uZGF0YS5kaXJlY3Rpb25zKSB7XG4gICAgICAgICAgICAvLyByYW5kb21pemUgZGlyZWN0aW9ucyBteXNlbGZcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IHRoaXMub3duZXIuZGlyZWN0aW9uICsgTWF0aC5yYW5kb20oKSAqIDAuMjUgLSAwLjEyNTtcbiAgICAgICAgICAgIGRpcmVjdGlvbnMucHVzaChkaXJlY3Rpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gYWN0aW9uLmRhdGEuZGlyZWN0aW9uc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBidWxsZXQgPSBuZXcgQnVsbGV0KHtcbiAgICAgICAgICAgIHg6IHRoaXMub3duZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMub3duZXIueSxcbiAgICAgICAgICAgIHRhcmdldFg6IHRoaXMub3duZXIubW91c2VYLFxuICAgICAgICAgICAgdGFyZ2V0WTogdGhpcy5vd25lci5tb3VzZVksXG4gICAgICAgICAgICBkaXJlY3Rpb246ZGlyZWN0aW9uLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBCdWxsZXQoe1xuICAgICAgICAvLyAgICAgeDogdGhpcy5vd25lci54LFxuICAgICAgICAvLyAgICAgeTogdGhpcy5vd25lci55LFxuICAgICAgICAvLyAgICAgdGFyZ2V0WDogdGhpcy5vd25lci5tb3VzZVgsXG4gICAgICAgIC8vICAgICB0YXJnZXRZOiB0aGlzLm93bmVyLm1vdXNlWSxcbiAgICAgICAgLy8gICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uLFxuICAgICAgICAvLyAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIC8vICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgICAgIC8vIH0pKTtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKFwiRklSRVwiLCBhY3Rpb24sIGRpcmVjdGlvbnMpO1xuICAgIGFjdGlvbi5kYXRhLmRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zO1xuXG5cbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG90Z3VuO1xuIiwidmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuLi8uL0J1bGxldDJcIik7XG5cbmNsYXNzIFdlYXBvbntcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZGF0YSkge1xuICAgICAgICB0aGlzLm93bmVyID0gb3duZXI7XG4gICAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZTtcbiAgICAgICAgdGhpcy5tYWdhemluZVNpemUgPSBkYXRhLm1hZ2F6aW5lU2l6ZTtcbiAgICAgICAgdGhpcy5idWxsZXRzID0gZGF0YS5idWxsZXRzO1xuICAgICAgICB0aGlzLmZpcmVSYXRlID0gZGF0YS5maXJlUmF0ZTtcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcbiAgICAgICAgdGhpcy5yZWxvYWRUaW1lID0gZGF0YS5yZWxvYWRUaW1lO1xuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcbiAgICAgICAgdGhpcy5idWxsZXRzUGVyU2hvdCA9IGRhdGEuYnVsbGV0c1BlclNob3Q7XG4gICAgICAgIHRoaXMuc3ggPSBkYXRhLnN4O1xuICAgICAgICB0aGlzLnN5ID0gZGF0YS5zeTtcblxuICAgICAgICB0aGlzLmljb25TeCA9IGRhdGEuaWNvblN4O1xuICAgICAgICB0aGlzLmljb25TeSA9IGRhdGEuaWNvblN5O1xuICAgICAgICB0aGlzLmljb25XID0gZGF0YS5pY29uVztcbiAgICAgICAgdGhpcy5pY29uSCA9IGRhdGEuaWNvbkg7XG5cbiAgICAgICAgdGhpcy5zb3VuZCA9IGRhdGEuc291bmQ7XG4gICAgICAgIHRoaXMucmVsb2FkU291bmQgPSBkYXRhLnJlbG9hZFNvdW5kO1xuXG4gICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc291bmRJbnN0YW5jZVJlbG9hZCA9IGNyZWF0ZWpzLlNvdW5kLmNyZWF0ZUluc3RhbmNlKHRoaXMucmVsb2FkU291bmQpO1xuXG4gICAgICAgIHRoaXMuZmlyZVRpbWVyID0gdGhpcy5maXJlUmF0ZTtcblxuICAgICAgICB0aGlzLnJlbG9hZGluZyA9IGRhdGEucmVsb2FkaW5nIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyID0gZGF0YS5yZWxvYWRUaW1lciB8fCAwO1xuICAgIH1cbn1cblxuV2VhcG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUpIHRoaXMuZmlyZVRpbWVyICs9IGR0O1xuXG4gICAgaWYgKHRoaXMucmVsb2FkaW5nKSB7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgKz0gZHQ7XG4gICAgICAgIGlmICh0aGlzLnJlbG9hZFRpbWVyID4gdGhpcy5yZWxvYWRUaW1lKXtcbiAgICAgICAgICAgIHRoaXMuZmlsbE1hZ2F6aW5lKCk7XG4gICAgICAgICAgICB0aGlzLnN0b3BSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuXG4gICAgLy8gcGxheSBlbXB0eSBjbGlwIHNvdW5kIGlmIG91dCBvZiBidWxsZXRzXG4gICAgaWYgKCB0aGlzLmJ1bGxldHMgPCAxICYmICF0aGlzLnJlbG9hZGluZykge1xuICAgICAgICBpZiAoIXRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCkge1xuICAgICAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwID0gY3JlYXRlanMuU291bmQucGxheShcImVtcHR5XCIpO1xuICAgICAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwLm9uKFwiY29tcGxldGVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwID0gbnVsbDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nIHx8IHRoaXMuYnVsbGV0cyA8IDEpIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuYnVsbGV0cyAtPSB0aGlzLmJ1bGxldHNQZXJTaG90O1xuICAgIHRoaXMuZmlyZVRpbWVyID0gMDtcblxuICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkodGhpcy5zb3VuZCk7XG5cbiAgICAvL3dpbmRvdy5nYW1lLnNvdW5kc1t0aGlzLnNvdW5kXS5wbGF5KCk7XG4gICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoe1xuICAgICAgICB4OiB0aGlzLm93bmVyLngsXG4gICAgICAgIHk6IHRoaXMub3duZXIueSxcbiAgICAgICAgdGFyZ2V0WDogdGhpcy5vd25lci5tb3VzZVgsXG4gICAgICAgIHRhcmdldFk6IHRoaXMub3duZXIubW91c2VZLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgY29uc29sZS5sb2coXCJyZWxvYWRcIik7XG4gICAgdGhpcy5zb3VuZEluc3RhbmNlUmVsb2FkLnBsYXkoKTtcbiAgICB0aGlzLnJlbG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZmlsbE1hZ2F6aW5lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5idWxsZXRzID0gdGhpcy5tYWdhemluZVNpemU7XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLnN0b3BSZWxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNvdW5kSW5zdGFuY2VSZWxvYWQuc3RvcCgpO1xuICAgIHRoaXMucmVsb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICBidWxsZXRzOiB0aGlzLmJ1bGxldHMsXG4gICAgICAgIGZpcmVUaW1lcjogdGhpcy5maXJlUmF0ZSxcbiAgICAgICAgcmVsb2FkaW5nOiB0aGlzLnJlbG9hZGluZyxcbiAgICAgICAgcmVsb2FkVGltZXI6IHRoaXMucmVsb2FkVGltZXJcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gV2VhcG9uO1xuIiwidmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL1Nob3RndW5cIik7XHJcbnZhciBBazQ3ID0gcmVxdWlyZShcIi4uLy4vd2VhcG9ucy9BazQ3XCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIik7XHJcblxyXG5mdW5jdGlvbiB3ZWFwb25DcmVhdG9yKG93bmVyLCBkYXRhKSB7XHJcblxyXG4gICAgdmFyIHdlcERhdGEgPSB3ZWFwb25EYXRhW2RhdGEubmFtZV07XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkgeyB3ZXBEYXRhW2tleV0gPSBkYXRhW2tleV07IH1cclxuXHJcbiAgICBzd2l0Y2ggKGRhdGEubmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJBazQ3XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWs0Nyhvd25lciwgd2VwRGF0YSk7XHJcbiAgICAgICAgY2FzZSBcInNob3RndW5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTaG90Z3VuKG93bmVyLCB3ZXBEYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3ZWFwb25DcmVhdG9yO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XG5cbmZ1bmN0aW9uIENsaWVudChJRCl7XG4gICAgLy90aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKElELCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLCBwb3J0OiB3aW5kb3cubG9jYXRpb24ucG9ydCwgcGF0aDogXCIvcGVlclwifSk7XG5cbiAgICAvLyBTdHJlc3MgdGVzdFxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XG5cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgYWN0aW9ucyBmcm9tIHRoZSBob3N0XG4gICAgdGhpcy5jaGFuZ2VzID0gW107IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcblxuICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGdhbWVJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pbiB0aGUgaG9zdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJteSBjbGllbnQgcGVlcklEIGlzIFwiLCBpZCk7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuZ2FtZS5zdGFydGVkKSB3aW5kb3cuZ2FtZS5zdGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG5cbiAgICAgICAgLy8gY2xvc2Ugb3V0IGFueSBvbGQgY29ubmVjdGlvbnNcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcbiAgICAgICAgICAgICAgICBpZiAoY29ublBlZXIgIT09IGNvbm4ucGVlcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXVswXS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBvbGQgaG9zdHMgcGxheWVyIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZGVsZXRlIG9sZCBwbGF5ZXJcIiwgY29ublBlZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgaXRcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG5cbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJKb2luZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgXCJwbGF5ZXJMZWZ0XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVVcGRhdGVcIjpcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLmdhbWVTdGF0ZS5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW25ld1N0YXRlLmlkXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0cyBteSBvd24gc3RhdGUsIHdlIGlnbm9yZSBrZXlzdGF0ZSBhbmQgb3RoZXIgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBwbGF5ZXIueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogcGxheWVyLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhwOiBuZXdTdGF0ZS5ocCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpdmU6IG5ld1N0YXRlLmFsaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci51cGRhdGVTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGFuZ2VzXCI6IC8vIGNoYW5nZXMgYW5kIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzLmNvbmNhdChkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zLmNvbmNhdChkYXRhLmFjdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAgICAgICAgICAgICAgICBkYXRhLnBpbmdzLmZvckVhY2goZnVuY3Rpb24ocGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twaW5nLmlkXS5waW5nID0gcGluZy5waW5nO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXS5waW5nO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3Qod2luZG93LmdhbWUucGxheWVycyk7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWxjdWxhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG59XG5cbkNsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuICAgIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHZhciBsYXN0Q2xpZW50U3RhdGUgPSBwbGF5ZXIubGFzdENsaWVudFN0YXRlO1xuICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RDbGllbnRTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuXG4gICAgLy8gYWRkIGFueSBwZXJmb3JtZWQgYWN0aW9ucyB0byBjaGFuZ2UgcGFja2FnZVxuICAgIGlmIChwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgIH1cblxuICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXMsIHNlbmQgZW0gdG8gaG9zdFxuICAgICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgICAgICAgICBldmVudDogXCJuZXR3b3JrVXBkYXRlXCIsXG4gICAgICAgICAgICB1cGRhdGVzOiBjaGFuZ2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBsYXllci5sYXN0Q2xpZW50U3RhdGUgPSBjdXJyZW50U3RhdGU7XG5cblxuXG5cbiAgICAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXTtcblxuICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZS5pZCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5pZF0ubmV0d29ya1VwZGF0ZShjaGFuZ2UpO1xuICAgICAgICAgICAgfWNhdGNoIChlcnIpIHtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoYW5nZXMgPSBbXTtcbiAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuXG5cblxuICAgIC8vIC8vIGNoZWNrIGlmIG15IGtleXN0YXRlIGhhcyBjaGFuZ2VkXG4gICAgLy8gdmFyIG15UGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIC8vIGlmICghbXlQbGF5ZXIpIHJldHVybjtcbiAgICAvL1xuICAgIC8vICBpZiAoIV8uaXNFcXVhbChteVBsYXllci5rZXlzLCBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUpKSB7XG4gICAgLy8gICAgIC8vIHNlbmQga2V5c3RhdGUgdG8gaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJrZXlzXCIsXG4gICAgLy8gICAgICAgICBrZXlzOiBteVBsYXllci5rZXlzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICB9XG4gICAgLy8gbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlID0gXy5jbG9uZShteVBsYXllci5rZXlzKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuICAgIC8vXG4gICAgLy8gdmFyIGN1cnJlbnRQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICAvLyB2YXIgY2hhbmdlcyA9IFtdO1xuICAgIC8vIHZhciBsYXN0U3RhdGUgPSBteVBsYXllci5sYXN0U3RhdGU7XG4gICAgLy8gdmFyIG5ld1N0YXRlID0gbXlQbGF5ZXIuZ2V0U3RhdGUoKTtcbiAgICAvL1xuICAgIC8vIC8vIGNvbXBhcmUgcGxheWVycyBuZXcgc3RhdGUgd2l0aCBpdCdzIGxhc3Qgc3RhdGVcbiAgICAvLyB2YXIgY2hhbmdlID0gXy5vbWl0KG5ld1N0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIGxhc3RTdGF0ZVtrXSA9PT0gdjsgfSk7XG4gICAgLy8gaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgIC8vICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlc1xuICAgIC8vICAgICBjaGFuZ2UucGxheWVySUQgPSBteVBsYXllci5pZDtcbiAgICAvLyAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gbXlQbGF5ZXIubGFzdFN0YXRlID0gbmV3U3RhdGU7XG4gICAgLy8gLy8gaWYgdGhlcmUgYXJlIGNoYW5nZXNcbiAgICAvLyBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgIC8vICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBpZiAodGhpcy5hY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAvLyAgICAgLy8gc2VuZCBhbGwgcGVyZm9ybWVkIGFjdGlvbnMgdG8gdGhlIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwiYWN0aW9uc1wiLFxuICAgIC8vICAgICAgICAgZGF0YTogdGhpcy5hY3Rpb25zXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gY2xlYXIgYWN0aW9ucyBxdWV1ZVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmNoYW5nZXNbaV0ubGVuZ3RoOyBqICs9IDEpICB7XG4gICAgLy8gICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV1bal07XG4gICAgLy9cbiAgICAvLyAgICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgIC8vICAgICAgICAgaWYgKGNoYW5nZS5wbGF5ZXJJRCAhPT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UucGxheWVySURdLmNoYW5nZShjaGFuZ2UpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gdGhpcy5jaGFuZ2VzID0gW107XG5cbn07XG5cbiAgICAvL1xuICAgIC8vIHRoaXMucGVlci5vbihcImNvbm5lY3Rpb25cIiwgZnVuY3Rpb24oY29ubikge1xuICAgIC8vICAgICAvLyB0aGUgaG9zdCBoYXMgc3RhcnRlZCB0aGUgY29ubmVjdGlvblxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIGZyb20gc2VydmVyXCIsIHRoaXMucGVlciwgY29ubik7XG4gICAgLy9cbiAgICAvLyAgICAgLy9jcmVhdGUgdGhlIHBsYXllclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnBsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcihjb25uLnBlZXIpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy9MaXN0ZW4gZm9yIGRhdGEgZXZlbnRzIGZyb20gdGhlIGhvc3RcbiAgICAvLyAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAgICAgaWYgKGRhdGEuZXZlbnQgPT09IFwicGluZ1wiKXsgLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgLy8gICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICBpZihkYXRhLmV2ZW50ID09PSBcInBvbmdcIikgeyAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAvLyAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAvLyAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSBwaW5nO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vIHBpbmcgdGVzdFxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5waW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgLy8gICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfSwgMjAwMCk7XG4gICAgLy9cbiAgICAvLyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhvc3QoKXtcbiAgICB0aGlzLmNvbm5zID0ge307XG4gICAgdGhpcy5hY3Rpb25zID0ge307IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSBhbGwgdGhlIGFjdGlvbnMgcmVjZWl2ZWQgZnJvbSBjbGllbnRzXG4gICAgdGhpcy5sYXN0UGxheWVyc1N0YXRlID0gW107XG4gICAgdGhpcy5kaWZmID0gbnVsbDtcblxuICAgIHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAvL3RoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG4gICAgICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKGRhdGEuaG9zdElELCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLCBwb3J0OiB3aW5kb3cubG9jYXRpb24ucG9ydCwgcGF0aDogXCIvcGVlclwifSk7XG5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBob3N0cyBwbGF5ZXIgb2JqZWN0IGlmIGl0IGRvZXNudCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCEod2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2VuZCBhIHBpbmcgZXZlcnkgMiBzZWNvbmRzLCB0byB0cmFjayBwaW5nIHRpbWVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBwaW5nczogd2luZG93LmdhbWUubmV0d29yay5ob3N0LmdldFBpbmdzKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG5cbiAgICAgICAgICAgIC8vIHNlbmQgZnVsbCBnYW1lIHN0YXRlIG9uY2UgaW4gYSB3aGlsZVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IFwiZ2FtZVN0YXRlVXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sMTAwMCk7XG5cbiAgICAgICAgICAgIGRhdGEucGVlcnMuZm9yRWFjaChmdW5jdGlvbihwZWVySUQpIHtcbiAgICAgICAgICAgICAgICAvL2Nvbm5lY3Qgd2l0aCBlYWNoIHJlbW90ZSBwZWVyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm4gPSAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuY29ubmVjdChwZWVySUQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaG9zdElEOlwiLCB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5pZCwgXCIgY29ubmVjdCB3aXRoXCIsIHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlcnNbcGVlcklEXSA9IHBlZXI7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW3BlZXJJRF0gPSBjb25uO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCBuZXcgcGxheWVyIGRhdGEgdG8gZXZlcnlvbmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckpvaW5lZFwiLCBwbGF5ZXJEYXRhOiBuZXdQbGF5ZXIuZ2V0RnVsbFN0YXRlKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBuZXcgcGxheWVyIHRoZSBmdWxsIGdhbWUgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5lbWl0KCB7Y2xpZW50SUQ6IGNvbm4ucGVlciwgZXZlbnQ6IFwiZ2FtZVN0YXRlXCIsIGdhbWVTdGF0ZTogd2luZG93LmdhbWUuZ2V0R2FtZVN0YXRlKCl9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1tjb25uLnBlZXJdO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJlcnJvclwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJFUlJPUiBFVkVOVFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pOyAvLyBhbnN3ZXIgdGhlIHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwb25nXCI6IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBjbGllbnQsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGluZyA9IERhdGUubm93KCkgLSBkYXRhLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmV0d29ya1VwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBmcm9tIGEgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLm5ldHdvcmtVcGRhdGUoZGF0YS51cGRhdGVzKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YS5hY3Rpb25zKTsgLy8gVE9ETyB2ZXJpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImFjdGlvbnNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJhY3Rpb25zIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5hY3Rpb25zLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiY2hhbmdlc1wiOlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJIZXkgdGhlcmUgaGFzIGJlZW4gY2hhbmdlcyFcIiwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uY2hhbmdlKGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImtleXNcIjogLy8gcmVjZWl2aW5nIGFjdGlvbnMgZnJvbSBhIHBsYXllclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2coXCJrZXlzIHJlY2VpdmVkIGZyb21cIiwgY29ubi5wZWVyLCBkYXRhLmtleXMsICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMgPSBfLmNsb25lKGRhdGEua2V5cyk7IC8vVE9ETzogdmVyaWZ5IGlucHV0IChjaGVjayB0aGF0IGl0IGlzIHRoZSBrZXkgb2JqZWN0IHdpdGggdHJ1ZS9mYWxzZSB2YWx1ZXMpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZm9yICh2YXIgY29ubiBpbiB0aGlzLmNvbm5zKXtcbiAgICAgICAgICAgIHRoaXMuY29ubnNbY29ubl0uc2VuZChkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBqdXN0IHNlbmQgZGF0YSB0byBhIHNwZWNpZmljIGNsaWVudFxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFTUlUIVwiLCBkYXRhKTtcbiAgICAgICAgdGhpcy5jb25uc1tkYXRhLmNsaWVudElEXS5zZW5kKGRhdGEpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcblxuICAgICAgICB2YXIgY2hhbmdlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRGdWxsU3RhdGUgPSBwbGF5ZXIuZ2V0RnVsbFN0YXRlKCk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRGdWxsU3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gcGxheWVyLmxhc3RGdWxsU3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcbiAgICAgICAgICAgIGlmICghXy5pc0VtcHR5KGNoYW5nZSkgfHwgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMubGVuZ3RoID4gMCkgeyAvL3RoZXJlJ3MgYmVlbiBjaGFuZ2VzIG9yIGFjdGlvbnNcbiAgICAgICAgICAgICAgICBjaGFuZ2UuaWQgPSBwbGF5ZXIuaWQ7XG4gICAgICAgICAgICAgICAgY2hhbmdlLmFjdGlvbnMgPSBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucztcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIubGFzdEZ1bGxTdGF0ZSA9IGN1cnJlbnRGdWxsU3RhdGU7XG4gICAgICAgICAgICAgICAgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgLy8gc2VuZCBjaGFuZ2VzXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgZXZlbnQ6IFwiY2hhbmdlc1wiLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICB0aGlzLmdldFBpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwaW5ncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHBpbmdzLnB1c2goe2lkOiBwbGF5ZXIuaWQsIHBpbmc6IHBsYXllci5waW5nIHx8IFwiaG9zdFwifSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGluZ3M7XG4gICAgfTtcbn07XG4iLCJ2YXIgQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xyXG52YXIgSG9zdCA9IHJlcXVpcmUoXCIuL0hvc3RcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlJUQygpe1xyXG4gICAgdGhpcy5waW5nID0gXCItXCI7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvKCk7XHJcblxyXG4gICAgLy8gcmVjZWl2aW5nIG15IGNsaWVudCBJRFxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJJRFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQgPSBuZXcgQ2xpZW50KGRhdGEuSUQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJ5b3VBcmVIb3N0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImltIHRoZSBob3N0XCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdCA9IG5ldyBIb3N0KCk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3Qoe2hvc3RJRDogZGF0YS5ob3N0SUQsIHBlZXJzOiBkYXRhLnBlZXJzfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckpvaW5lZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgam9pbmVkXCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KHtob3N0SUQ6IGRhdGEuaG9zdElELCBwZWVyczpbZGF0YS5wZWVySURdfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUExBWUVSIExFRlRcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5wbGF5ZXJJRH0pO1xyXG4gICAgfSk7XHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcInBsYXllckxlZnRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2RhdGEuaWRdO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIHRoaXMucGVlcnMgPSB7fTtcclxuICAgIC8vIHRoaXMuY29ubnMgPSB7fTtcclxuICAgIC8vIHRoaXMuc29ja2V0LmVtaXQoXCJob3N0U3RhcnRcIiwge2dhbWVJRDogdGhpcy5nYW1lSUR9KTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnNvY2tldC5vbihcImpvaW5cIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy8gICAgIC8vIGEgcGVlciB3YW50cyB0byBqb2luLiBDcmVhdGUgYSBuZXcgUGVlciBhbmQgY29ubmVjdCB0aGVtXHJcbiAgICAvLyAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcclxuICAgIC8vICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubiA9IHRoaXMucGVlci5jb25uZWN0KGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coaWQsIGRhdGEucGVlcklEKTtcclxuICAgIC8vICAgICAgICAgdGhpcy5wZWVyc1tpZF0gPSB0aGlzLnBlZXI7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubnNbZGF0YS5wZWVySURdID0gdGhpcy5jb25uO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBlZXJzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgLy8gYSBwZWVyIGhhcyBkaXNjb25uZWN0ZWRcclxuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY29ubmVjdGVkIVwiLCB0aGlzLmNvbm4sIFwiUEVFUlwiLCB0aGlzLnBlZXIpO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMucGVlcnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29ubnNbdGhpcy5jb25uLnBlZXJdO1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QoKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyB9KTtcclxufTtcclxuIl19
