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

    if (this.fireTimer < this.fireRate || this.reloading || this.bullets < 1) return false;

    this.bullets -= 1;
    this.fireTimer = 0;

    var directions = [];
    var direction;

    //var targetLocations = [];
    //var targetLocations;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0Mi5qcyIsInNyYy9qcy9CdXR0b24uanMiLCJzcmMvanMvQ2FtZXJhLmpzIiwic3JjL2pzL0dhbWUuanMiLCJzcmMvanMvS2V5Ym9hcmQuanMiLCJzcmMvanMvTGV2ZWwuanMiLCJzcmMvanMvTW91c2UuanMiLCJzcmMvanMvTmV0d29ya0NvbnRyb2xzLmpzIiwic3JjL2pzL1BhcnRpY2xlL0Jsb29kLmpzIiwic3JjL2pzL1BhcnRpY2xlL0Jsb29kMi5qcyIsInNyYy9qcy9QYXJ0aWNsZS9FbWl0dGVyLmpzIiwic3JjL2pzL1BhcnRpY2xlL1BhcnRpY2xlLmpzIiwic3JjL2pzL1BhcnRpY2xlL1JpY29jaGV0LmpzIiwic3JjL2pzL1BsYXllci5qcyIsInNyYy9qcy9VaS5qcyIsInNyYy9qcy9kYXRhL2xldmVsMS5qcyIsInNyYy9qcy9kYXRhL3dlYXBvbnMuanMiLCJzcmMvanMvaGVscGVycy5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3BhcnRpY2xlL0J1bGxldEhvbGUuanMiLCJzcmMvanMvcGFydGljbGUvRmxhc2guanMiLCJzcmMvanMvdWlFbGVtZW50cy9SZWN0YW5nbGUuanMiLCJzcmMvanMvdWlFbGVtZW50cy9UZXh0LmpzIiwic3JjL2pzL3V0aWwvYnJlc2VuaGFtLmpzIiwic3JjL2pzL3V0aWwvY29sbGlzaW9uRGV0ZWN0aW9uLmpzIiwic3JjL2pzL3V0aWwvaW50ZXJzZWN0aW9uLmpzIiwic3JjL2pzL3dlYXBvbnMvQWs0Ny5qcyIsInNyYy9qcy93ZWFwb25zL1Nob3RndW4uanMiLCJzcmMvanMvd2VhcG9ucy9XZWFwb24uanMiLCJzcmMvanMvd2VhcG9ucy93ZWFwb25DcmVhdG9yLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuLy92YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XHJcbnZhciBicmVzZW5oYW0gPSByZXF1aXJlKFwiLi91dGlsL2JyZXNlbmhhbVwiKTtcclxuLy92YXIgbGluZVJlY3RJbnRlcnNlY3QgPSByZXF1aXJlKFwiLi91dGlsL2xpbmVSZWN0SW50ZXJzZWN0XCIpO1xyXG52YXIgQnVsbGV0SG9sZSA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0J1bGxldEhvbGVcIik7XHJcbnZhciBGbGFzaCA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0ZsYXNoXCIpO1xyXG52YXIgY29sbGlzaW9uRGV0ZWN0aW9uID0gcmVxdWlyZShcIi4vdXRpbC9jb2xsaXNpb25EZXRlY3Rpb25cIik7XHJcblxyXG4vLyBpbnN0YW50IGJ1bGxldFxyXG5mdW5jdGlvbiBCdWxsZXQoZGF0YSkge1xyXG4gICAgLy8gY3JlYXRlIHRoZSBidWxsZXQgNSBwaXhlbHMgdG8gdGhlIHJpZ2h0IGFuZCAzMCBwaXhlbHMgZm9yd2FyZC4gc28gaXQgYWxpZ25zIHdpdGggdGhlIGd1biBiYXJyZWxcclxuICAgIHZhciBzdGFydFggPSBkYXRhLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xyXG4gICAgdmFyIHN0YXJ0WSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcbiAgICBzdGFydFggPSBzdGFydFggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIHN0YXJ0WT0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcblxyXG4gICAgLy8gY3JlYXRlIG11enpsZSBmbGFzaGVzXHJcbiAgICB2YXIgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMztcclxuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc3RhcnRYLCB5OiBzdGFydFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xyXG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMjtcclxuICAgIHZhciBzbWFsbEZsYXNoWCA9IHN0YXJ0WCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcclxuICAgIHZhciBzbWFsbEZsYXNoWT0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDMpO1xyXG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEZsYXNoKHt4OiBzbWFsbEZsYXNoWCwgeTogc21hbGxGbGFzaFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xyXG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMjtcclxuICAgIHNtYWxsRmxhc2hYID0gc3RhcnRYICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24pICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDUpO1xyXG4gICAgc21hbGxGbGFzaFk9IHN0YXJ0WSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyA1KTtcclxuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc21hbGxGbGFzaFgsIHk6IHNtYWxsRmxhc2hZLCBzaXplOiBzaXplLCBjb250YWluZXI6IHdpbmRvdy5nYW1lLnBhcnRpY2xlc30pKTtcclxuICAgIHNpemUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDI7XHJcbiAgICBzbWFsbEZsYXNoWCA9IHN0YXJ0WCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcclxuICAgIHNtYWxsRmxhc2hZID0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDMpO1xyXG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEZsYXNoKHt4OiBzbWFsbEZsYXNoWCwgeTogc21hbGxGbGFzaFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xyXG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMjtcclxuICAgIHNtYWxsRmxhc2hYID0gc3RhcnRYICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogLSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcclxuICAgIHNtYWxsRmxhc2hZID0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogLSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcclxuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc21hbGxGbGFzaFgsIHk6IHNtYWxsRmxhc2hZLCBzaXplOiBzaXplLCBjb250YWluZXI6IHdpbmRvdy5nYW1lLnBhcnRpY2xlc30pKTtcclxuXHJcbiAgICAvLyBjaGVjayB0aGF0IHRoZSBidWxsZXQgc3Bhd24gbG9jYXRpb24gaXMgaW5zaWRlIHRoZSBnYW1lXHJcbiAgICBpZiAoIWhlbHBlcnMuaXNJbnNpZGVHYW1lKHN0YXJ0WCwgc3RhcnRZKSkgcmV0dXJuO1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIGJ1bGxldCBzdGFydGluZyBsb2NhdGlvbiBpcyBpbnNpZGUgYSB0aWxlXHJcbiAgICB2YXIgdGlsZVggPSBNYXRoLmZsb29yKHN0YXJ0WCAvIDMyKTtcclxuICAgIHZhciB0aWxlWSA9IE1hdGguZmxvb3Ioc3RhcnRZIC8gMzIpO1xyXG4gICAgaWYgKGhlbHBlcnMuZ2V0VGlsZSh0aWxlWCx0aWxlWSkgPT09IDEpIHJldHVybjtcclxuXHJcbiAgICAvL3RoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XHJcbiAgICAvL3RoaXMuc3BlZWQgPSBkYXRhLmJ1bGxldFNwZWVkO1xyXG4gICAgLy90aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xyXG4gICAgLy9cclxuICAgIHZhciBsaW5lID0ge1xyXG4gICAgICAgIHN0YXJ0OiB7eDogc3RhcnRYLCB5OiBzdGFydFl9LFxyXG4gICAgICAgIGVuZDoge3g6IGRhdGEudGFyZ2V0WCwgeTogZGF0YS50YXJnZXRZfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgaW50ZXJzZWN0ID0gbnVsbDtcclxuXHJcbiAgICB2YXIgY29sbGlzaW9uID0gYnJlc2VuaGFtKHN0YXJ0WCwgc3RhcnRZLCBkYXRhLnRhcmdldFgsIGRhdGEudGFyZ2V0WSk7IC8vIGZpbmQgY29sbGlkaW5nIHJlY3RhbmdsZXNcclxuICAgIGlmIChjb2xsaXNpb24pIHtcclxuICAgICAgICBzd2l0Y2goY29sbGlzaW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInRpbGVcIjpcclxuICAgICAgICAgICAgICAgIGludGVyc2VjdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5saW5lUmVjdEludGVyc2VjdDIobGluZSwge3g6IGNvbGxpc2lvbi54ICogMzIsIHk6IGNvbGxpc2lvbi55ICogMzIsIHc6IDMyLCBoOiAzMn0pO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJ1bGxldEhvbGUoaW50ZXJzZWN0KSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInBsYXllclwiOlxyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uLnBsYXllci50YWtlRGFtYWdlKGRhdGEuZGFtYWdlLCBkYXRhLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgLy8gdmFyIGN4ID0gdGhpcy54OyAvLyBCZWdpbi9jdXJyZW50IGNlbGwgY29vcmRzXHJcbiAgICAvLyB2YXIgY3kgPSB0aGlzLnk7XHJcbiAgICAvLyB2YXIgZXggPSBFbmRYOyAvLyBFbmQgY2VsbCBjb29yZHNcclxuICAgIC8vIHZhciBleSA9IEVuZFk7XHJcbiAgICAvL1xyXG4gICAgLy8gLy8gRGVsdGEgb3IgZGlyZWN0aW9uXHJcbiAgICAvLyBkb3VibGUgZHggPSBFbmRYLUJlZ2luWDtcclxuICAgIC8vIGRvdWJsZSBkeSA9IEVuZFktQmVnaW5ZO1xyXG4gICAgLy9cclxuICAgIC8vIHdoaWxlIChjeCA8IGV4ICYmIGN5IDwgZXkpXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIC8vIGZpbmQgaW50ZXJzZWN0aW9uIFwidGltZVwiIGluIHggZGlyXHJcbiAgICAvLyAgIGZsb2F0IHQwID0gKGNlaWwoQmVnaW5YKS1CZWdpblgpL2R4O1xyXG4gICAgLy8gICBmbG9hdCB0MSA9IChjZWlsKEJlZ2luWSktQmVnaW5ZKS9keTtcclxuICAgIC8vXHJcbiAgICAvLyAgIHZpc2l0X2NlbGwoY3gsIGN5KTtcclxuICAgIC8vXHJcbiAgICAvLyAgIGlmICh0MCA8IHQxKSAvLyBjcm9zcyB4IGJvdW5kYXJ5IGZpcnN0PT9cclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgICsrY3g7XHJcbiAgICAvLyAgICAgQmVnaW5YICs9IHQwKmR4O1xyXG4gICAgLy8gICAgIEJlZ2luWSArPSB0MCpkeTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gICBlbHNlXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICArK2N5O1xyXG4gICAgLy8gICAgIEJlZ2luWCArPSB0MSpkeDtcclxuICAgIC8vICAgICBCZWdpblkgKz0gdDEqZHk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH1cclxuXHJcbn1cclxuXHJcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgIC8vIC8vXHJcbiAgICAvLyB2YXIgeCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gdmFyIHkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBoaXQgY2hlY2sgYWdhaW5zdCBwbGF5ZXJzXHJcbiAgICAvLyB0aGlzLmhpdERldGVjdGlvbihpbmRleCk7XHJcbiAgICAvL1xyXG4gICAgLy8gLy8gY29sbGlzaW9uIGRldGVjdGlvbiBhZ2FpbnN0IHRpbGVzIGFuZCBvdXRzaWRlIG9mIG1hcFxyXG4gICAgLy8gdmFyIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KTtcclxuICAgIC8vIGlmICghY29sbGlzaW9uKSB7XHJcbiAgICAvLyAgICAgdGhpcy54ID0geDtcclxuICAgIC8vICAgICB0aGlzLnkgPSB5O1xyXG4gICAgLy8gfSBlbHNlIHtcclxuICAgIC8vICAgICAvLyBhZGQgcmljaG9jZXQgcGFydGljbGUgZWZmZWN0XHJcbiAgICAvLyAgICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XHJcbiAgICAvLyAgICAgICAgIHR5cGU6IFwiUmljb2NoZXRcIixcclxuICAgIC8vICAgICAgICAgZW1pdENvdW50OiAxLFxyXG4gICAgLy8gICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxyXG4gICAgLy8gICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAvLyAgICAgICAgIHk6IHRoaXMueVxyXG4gICAgLy8gICAgIH0pKTtcclxuICAgIC8vICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIC8vIGlmIG9mZiBzY3JlZW4sIHJlbW92ZSBpdFxyXG4gICAgLy8gaWYgKHRoaXMueCA8IDAgfHwgdGhpcy54ID4gd2luZG93LmdhbWUubGV2ZWwud2lkdGggfHwgdGhpcy55IDwgMCB8fCB0aGlzLnkgPiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpIHtcclxuICAgIC8vICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gICAgIHJldHVybjtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcblxyXG5cclxufTtcclxuXHJcbi8vIEJ1bGxldC5wcm90b3R5cGUuaGl0RGV0ZWN0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuLy8gICAgIC8vIHRlc3QgYnVsbGV0IGFnYWluc3QgYWxsIHBsYXllcnNcclxuLy8gICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcbi8vXHJcbi8vICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcclxuLy9cclxuLy8gICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XHJcbi8vXHJcbi8vICAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcclxuLy8gICAgICAgICB2YXIgYiA9IHRoaXMueSAtIHBsYXllci55O1xyXG4vLyAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggYSphICsgYipiICk7XHJcbi8vXHJcbi8vICAgICAgICAgaWYgKGRpc3RhbmNlIDwgcGxheWVyLnJhZGl1cykge1xyXG4vLyAgICAgICAgICAgICAvLyBoaXRcclxuLy8gICAgICAgICAgICAgcGxheWVyLnRha2VEYW1hZ2UodGhpcy5kYW1hZ2UsIHRoaXMuZGlyZWN0aW9uKTtcclxuLy8gICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vXHJcbi8vIH07XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgLy8gdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIC8vIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbiAtIDAuNzg1Mzk4MTYzNCk7IC8vIHJvdGF0ZVxyXG4gICAgLy9cclxuICAgIC8vIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXHJcbiAgICAvLyB2YXIgZ3JhZD0gdGhpcy5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2JhKDI1NSwxNjUsMCwwLjQpXCIpO1xyXG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJ5ZWxsb3dcIik7XHJcbiAgICAvLyB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyAgIHRoaXMuY3R4Lm1vdmVUbygwLCAwKTtcclxuICAgIC8vICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAvLyBjdHgubGluZVdpZHRoID0gMTtcclxuICAgIC8vXHJcbiAgICAvLyAvL1xyXG4gICAgLy8gLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAvLyB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgsIDEsIDEgKTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4gICAgLy9cclxuICAgIC8vIC8vXHJcbiAgICAvLyAvL1xyXG4gICAgLy8gLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAvLyAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxyXG4gICAgLy8gLy8gdmFyIGdyYWQ9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcclxuICAgIC8vIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwiZ3JlZW5cIik7XHJcbiAgICAvLyAvLyBjdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG4gICAgLy8gLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gLy8gY3R4LmxpbmVUbygwLGxlbmd0aCk7XHJcbiAgICAvLyAvLyBjdHguc3Ryb2tlKCk7XHJcbiAgICAvL1xyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcclxuIiwiZnVuY3Rpb24gQnV0dG9uKGRhdGEpIHtcclxuICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcclxuICAgIHRoaXMuZm9udFNpemUgPSBkYXRhLmZvbnRTaXplO1xyXG4gICAgLy8gdGhpcy54ID0gZGF0YS54O1xyXG4gICAgLy8gdGhpcy55ID0gZGF0YS55O1xyXG4gICAgLy8gdGhpcy53ID0gZGF0YS53O1xyXG4gICAgLy8gdGhpcy5oID0gZGF0YS5oO1xyXG5cclxuICAgIHRoaXMucmVjdCA9IHsgeDogZGF0YS54LCB5OiBkYXRhLnksIHc6IGRhdGEudywgaDogZGF0YS5oIH07XHJcblxyXG4gICAgdGhpcy5jb250ZXh0ID0gZGF0YS5jb250ZXh0O1xyXG4gICAgdGhpcy5jbGlja0Z1bmN0aW9uID0gZGF0YS5jbGlja0Z1bmN0aW9uO1xyXG59XHJcblxyXG5CdXR0b24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHdpbmRvdy5nYW1lLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5yZWN0KHRoaXMucmVjdC54LCB0aGlzLnJlY3QueSwgdGhpcy5yZWN0LncsIHRoaXMucmVjdC5oKTtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKVwiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGwoKTtcclxuXHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IHRoaXMuZm9udFNpemUgKyBcInB4IE9wZW4gU2Fuc1wiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy5yZWN0LnggKyA5LCB0aGlzLnJlY3QueSArIDI4KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uO1xyXG4iLCJmdW5jdGlvbiBDYW1lcmEoKSB7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuICAgIC8vIHRoaXMud2lkdGggPSA7XHJcbiAgICAvLyB0aGlzLmhlaWdodCA9IHdpbmRvdy5nYW1lLmhlaWdodDtcclxuICAgIHRoaXMuZm9sbG93aW5nID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmZvbGxvdyA9IGZ1bmN0aW9uKHBsYXllcil7XHJcbiAgICAgICAgdGhpcy5mb2xsb3dpbmcgPSBwbGF5ZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZvbGxvd2luZykgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnggPSB0aGlzLmZvbGxvd2luZy54IC0gd2luZG93LmdhbWUud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMuZm9sbG93aW5nLnkgLSB3aW5kb3cuZ2FtZS5oZWlnaHQgLyAyO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7XHJcbiIsInZhciBVaSA9IHJlcXVpcmUoXCIuL1VpXCIpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoXCIuL3dlYlJUQy9XZWJSVENcIik7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi9QbGF5ZXJcIik7XHJcbnZhciBDYW1lcmEgPSByZXF1aXJlKFwiLi9DYW1lcmFcIik7XHJcbnZhciBMZXZlbCA9IHJlcXVpcmUoXCIuL0xldmVsXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpIHtcclxuXHJcbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLndpZHRoID0gNjQwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSA0ODA7XHJcblxyXG5cclxuICAgIHRoaXMuc3ByaXRlc2hlZXQgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRoaXMuc3ByaXRlc2hlZXQuc3JjID0gXCIuLi9pbWcvc3ByaXRlc2hlZXQucG5nXCI7XHJcblxyXG4gICAgdGhpcy50aWxlc2hlZXQgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRoaXMudGlsZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3RpbGVzLnBuZ1wiO1xyXG5cclxuICAgIHRoaXMubGV2ZWwgPSBuZXcgTGV2ZWwodGhpcy50aWxlc2hlZXQpO1xyXG5cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuYmdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmJnQ2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzZXNcIikuYXBwZW5kQ2hpbGQodGhpcy5iZ0NhbnZhcyk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIHRoaXMuYmdDdHggPSB0aGlzLmJnQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICB0aGlzLmN0eC5mb250ID0gXCIyNHB4IE9wZW4gU2Fuc1wiO1xyXG5cclxuICAgIHRoaXMuZ2FtZUlEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KFwiL1wiKVsyXTtcclxuXHJcbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xyXG4gICAgdGhpcy5uZXR3b3JrID0gbmV3IE5ldHdvcmsoKTtcclxuXHJcbiAgICB0aGlzLmVudGl0aWVzID0gW107IC8vIGdhbWUgZW50aXRpZXNcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICB0aGlzLnBsYXllcnMgPSB7fTtcclxuICAgIHRoaXMudWlFbGVtZW50cyA9IFtdOyAvLyBob2xkcyBidXR0b25zIGV0Y1xyXG5cclxuICAgIHRoaXMubWF4UGFydGljbGVzID0gMzA7IC8vIG51bWJlciBvZiBwYXJ0aWNsZXMgYWxsb3dlZCBvbiBzY3JlZW4gYmVmb3JlIHRoZXkgc3RhcnQgdG8gYmUgcmVtb3ZlZFxyXG5cclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSgpO1xyXG5cclxuICAgIHZhciBsYXN0ID0gMDsgLy8gdGltZSB2YXJpYWJsZVxyXG4gICAgdmFyIGR0OyAvL2RlbHRhIHRpbWVcclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubG9vcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdhbWUgbG9vcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmxvb3AgPSBmdW5jdGlvbih0aW1lc3RhbXApe1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxyXG5cclxuICAgICAgICBkdCA9IHRpbWVzdGFtcCAtIGxhc3Q7IC8vIHRpbWUgZWxhcHNlZCBpbiBtcyBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgYW5kIHJlbmRlciBnYW1lXHJcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xyXG4gICAgICAgIHZhciBkdHMgPSBkdCAvIDEwMDA7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGZwc1xyXG4gICAgICAgIHRoaXMuZnBzID0gTWF0aC5yb3VuZCgxMDAwIC8gZHQpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5LCBpbmRleCkge1xyXG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKGR0cywgaW5kZXgpOyAvL2RlbHRhdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIC8vIGNhcCBudW1iZXIgb2YgcGFydGljbGVzXHJcbiAgICAgICAgLy8gaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA+IHRoaXMubWF4UGFydGljbGVzKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFydGljbGVzID0gdGhpcy5wYXJ0aWNsZXMuc2xpY2UodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIC0gdGhpcy5tYXhQYXJ0aWNsZXMsIHRoaXMucGFydGljbGVzLmxlbmd0aCk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcGFydGljbGVzXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoZHRzLCBpKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmFcclxuICAgICAgICAvL3RoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcmluZ1xyXG4gICAgICovXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vYmcgY29sb3JcclxuICAgICAgICB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuYmdDdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzViNTg1MFwiO1xyXG4gICAgICAgIHRoaXMuYmdDdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAvLyBkcmF3IHRlc3QgYmFja2dyb3VuZFxyXG4gICAgICAgIC8vIHRoaXMuYmdDdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5yZWN0KDAgLSB0aGlzLmNhbWVyYS54LCAwIC0gdGhpcy5jYW1lcmEueSwgdGhpcy5sZXZlbC53aWR0aCwgdGhpcy5sZXZlbC5oZWlnaHQpO1xyXG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjODU4MjdkXCI7XHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIHRoaXMubGV2ZWwucmVuZGVyKHRoaXMuYmdDdHgpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYWxsIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlbmRlciBwYXJ0aWNsZXNcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51aS5yZW5kZXJVSSgpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYnV0dG9ucyBldGNcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgd2luZG93LmdhbWUudWlFbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS51aUVsZW1lbnRzW2ldLnJlbmRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMudWkucmVuZGVyRGVidWcoKTtcclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNBTUVSQTogWDpcIiArIHRoaXMuY2FtZXJhLngsIFwiXFxuWTpcIiArIHRoaXMuY2FtZXJhLnkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5wbGF5ZXJzW3RoaXMubmV0d29yay5jbGllbnQucGVlci5pZF0pO1xyXG4gICAgfTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkUGxheWVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAgaWYoZGF0YS5pZCBpbiB0aGlzLnBsYXllcnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG5cclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVtb3ZpbmcgcGxheWVyXCIsIGRhdGEpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XHJcbiAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudGl0eSk7XHJcbiAgICAgICAgLy8gfSksXHJcbiAgICAgICAgLy9lbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgLy8gICAgcmV0dXJuIGVudGl0eS5nZXRGdWxsU3RhdGUoKTsgICAgICAgIH0pLFxyXG4gICAgICAgIC8vcGxheWVyczogT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XSk7IH0pXHJcbiAgICAgICAgcGxheWVyczogdGhpcy5nZXRQbGF5ZXJzU3RhdGUoKVxyXG4gICAgfTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdldFBsYXllcnNTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uZ2V0RnVsbFN0YXRlKCk7IH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xyXG4iLCJmdW5jdGlvbiBLZXlib2FyZChwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIC8vdGhpcy5sYXN0U3RhdGUgPSBfLmNsb25lKHBsYXllci5rZXlzKTtcbiAgICB0aGlzLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCAhPT0gdHJ1ZSkgIHBsYXllci5rVXA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biAhPT0gdHJ1ZSkgIHBsYXllci5rRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgIT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDk6IC8vIDFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXggPT09IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImNoYW5nZVdlYXBvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiAwLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUwOiAvLyAyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAxKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MjogLy8gUlxuICAgICAgICAgICAgICAgIC8vIHJlbG9hZCBvbmx5IGlmIHBsYXllciBpcyBhbGl2ZSBhbmQgd2VhcG9uIG1hZ2F6aW5lIGlzbnQgZnVsbFxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuYWxpdmUgJiYgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLmJ1bGxldHMgPCBwbGF5ZXIud2VhcG9uc1twbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleF0ubWFnYXppbmVTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZWxvYWRcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCA9PT0gdHJ1ZSkgcGxheWVyLmtVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biA9PT0gdHJ1ZSkgcGxheWVyLmtEb3duID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgPT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgPT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJ2YXIgbGV2ZWwxID0gcmVxdWlyZShcIi4vZGF0YS9sZXZlbDFcIik7XHJcbi8vdmFyIFRpbGUgPSByZXF1aXJlKFwiLi9UaWxlXCIpO1xyXG5cclxuZnVuY3Rpb24gTGV2ZWwodGlsZXNoZWV0KXtcclxuICAgIHRoaXMudGlsZXNoZWV0ID0gdGlsZXNoZWV0O1xyXG4gICAgdGhpcy50aWxlU2l6ZSA9IDMyO1xyXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsMTtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmxldmVsLnRpbGVzWzBdLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMubGV2ZWwudGlsZXMubGVuZ3RoICogdGhpcy50aWxlU2l6ZTtcclxuICAgIHRoaXMuY29sVGlsZUNvdW50ID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGg7XHJcbiAgICB0aGlzLnJvd1RpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXMubGVuZ3RoO1xyXG4gICAgdGhpcy5pbWFnZU51bVRpbGVzID0gMzg0IC8gdGhpcy50aWxlU2l6ZTsgIC8vIFRoZSBudW1iZXIgb2YgdGlsZXMgcGVyIHJvdyBpbiB0aGUgdGlsZXNldCBpbWFnZVxyXG5cclxuICAgIC8vIGdlbmVyYXRlIFRpbGVzXHJcblxyXG5cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY3R4KSB7XHJcblxyXG4gICAgICAgIC8vZHJhdyBhbGwgdGlsZXNcclxuICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMucm93VGlsZUNvdW50OyByb3cgKz0gMSkge1xyXG4gICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuY29sVGlsZUNvdW50OyBjb2wgKz0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5sZXZlbC50aWxlc1tyb3ddW2NvbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZVJvdyA9ICh0aWxlIC8gdGhpcy5pbWFnZU51bVRpbGVzKSB8IDA7IC8vIEJpdHdpc2UgT1Igb3BlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZUNvbCA9ICh0aWxlICUgdGhpcy5pbWFnZU51bVRpbGVzKSB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLnRpbGVzaGVldCxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZUNvbCAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgICh0aWxlUm93ICogdGhpcy50aWxlU2l6ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoKGNvbCAqIHRoaXMudGlsZVNpemUpIC0gd2luZG93LmdhbWUuY2FtZXJhLngpLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoKHJvdyAqIHRoaXMudGlsZVNpemUpIC0gd2luZG93LmdhbWUuY2FtZXJhLnkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XHJcbiIsInZhciBjb2xsaXNpb25DaGVjayA9IHJlcXVpcmUoXCIuL3V0aWwvY29sbGlzaW9uRGV0ZWN0aW9uXCIpIDtcblxuZnVuY3Rpb24gTW91c2UocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcblxuICAgIHRoaXMuY2xpY2sgPSBmdW5jdGlvbihlKXtcblxuXG4gICAgICAgIHRoaXMucGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcInNob290XCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LmdhbWUuY2FtZXJhLnkgKyBlLm9mZnNldFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5wdXNoKGFjdGlvbik7IC8vIHRlbGwgdGhlIGhvc3Qgb2YgdGhlIGFjdGlvblxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VYID0gd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFg7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWSA9IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZO1xuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgY2xpY2tzIG9uIHVpIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aW5kb3cuZ2FtZS51aUVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gd2luZG93LmdhbWUudWlFbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50LmNsaWNrRnVuY3Rpb24pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlzaW9uQ2hlY2sucG9pbnRSZWN0KHt4OiBlLm9mZnNldFgsIHk6IGUub2Zmc2V0WX0sIGVsZW1lbnQucmVjdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xpY2tGdW5jdGlvbi5iaW5kKGVsZW1lbnQuY29udGV4dCkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLm1vdXNlTGVmdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ID09PSB0cnVlKSBwbGF5ZXIubW91c2VMZWZ0ICA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZCBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB2YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIHZhciByID0gMTUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBnID0gNTAgLSBybmQ7XHJcbiAgICAgICAgdmFyIGIgPSA1MCAtIHJuZDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwicmdiKFwiICsgciArIFwiLFwiICsgZyArIFwiLFwiICsgYiArIFwiKVwiO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMztcclxuICAgICAgICBkYXRhLmNvbnRhaW5lciA9IHdpbmRvdy5nYW1lLnBhcnRpY2xlcztcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDQwO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuQmxvb2QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuXHJcbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG5cclxuICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJsb29kO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIEJsb29kMiBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICAvL3ZhciBybmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCk7XHJcbiAgICAgICAgLy8gdmFyIHIgPSAxNTA7XHJcbiAgICAgICAgLy8gdmFyIGcgPSA1MDtcclxuICAgICAgICAvLyB2YXIgYiA9IDUwO1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCIjODAyOTI5XCI7XHJcbiAgICAgICAgLy9kYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDM7XHJcbiAgICAgICAgZGF0YS5jb250YWluZXIgPSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXM7XHJcbiAgICAgICAgZGF0YS5saWZlVGltZSA9IDEwO1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGhlbHBlcnMudG9SYWRpYW5zKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxKTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gODA7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZURpc3RhbmNlID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE1KSArIDEpO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbkJsb29kMi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XHJcbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHRoaXMuZGVzdHJveShpbmRleCk7XHJcblxyXG59O1xyXG5cclxuLy8gQmxvb2RTcGxhc2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuLy8gICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbi8vICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbi8vIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9vZDI7XHJcbiIsIi8vdmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBCbG9vZCA9IHJlcXVpcmUoXCIuL0Jsb29kXCIpO1xyXG52YXIgQmxvb2QyID0gcmVxdWlyZShcIi4vQmxvb2QyXCIpO1xyXG52YXIgUmljb2NoZXQgPSByZXF1aXJlKFwiLi9SaWNvY2hldFwiKTtcclxuXHJcbmZ1bmN0aW9uIEVtaXR0ZXIoZGF0YSkge1xyXG4gICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgdGhpcy50eXBlID0gZGF0YS50eXBlO1xyXG4gICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgIHRoaXMuZW1pdFNwZWVkID0gZGF0YS5lbWl0U3BlZWQ7IC8vIHNcclxuICAgIHRoaXMuZW1pdFRpbWVyID0gMDtcclxuICAgIHRoaXMuZW1pdENvdW50ID0gZGF0YS5lbWl0Q291bnQ7XHJcbiAgICB0aGlzLmxpZmVUaW1lID0gZGF0YS5saWZlVGltZTtcclxuICAgIHRoaXMubGlmZVRpbWVyID0gMDtcclxuICAgIHRoaXMuZW1pdCgpO1xyXG59XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgIGVtaXR0ZXI6IHRoaXNcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHRoaXMudHlwZSA9PT0gXCJCbG9vZFwiKSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQmxvb2QoZGF0YSkpO1xyXG4gICAgZWxzZSBpZiAodGhpcy50eXBlID09PSBcIkJsb29kMlwiKSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQmxvb2QyKGRhdGEpKTtcclxuICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gXCJSaWNvY2hldFwiKSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgUmljb2NoZXQoZGF0YSkpO1xyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbiAgICAvLyAvLyB1cGRhdGUgYWxsIHBhcnRpY2xlc1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgLy8gICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZShkdCk7XHJcbiAgICAvLyB9XHJcblxyXG5cclxuICAgIC8vIFNFVCBFTUlUVEVSIC0gdGhpcyBpcyBhbiBlbWl0dGVyIHRoYXQgc2hvdWxkIGVtaXQgYSBzZXQgbnVtYmVyIG9mIHBhcnRpY2xlc1xyXG4gICAgaWYgKHRoaXMuZW1pdENvdW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW1pdFNwZWVkKSB7IC8vIEVtaXQgYXQgYSBpbnRlcnZhbFxyXG4gICAgICAgICAgICB0aGlzLmVtaXRUaW1lciArPSBkdDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW1pdFRpbWVyID4gdGhpcy5lbWl0U3BlZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgIHRoaXMuZW1pdENvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZW1pdENvdW50IDwgMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVzdHJveVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgeyAvLyBFbWl0IGFsbCBhdCBvbmNlXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwO2kgPCB0aGlzLmVtaXRDb3VudDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVElNRUQgRU1JVFRFUlxyXG4gICAgLy8gdXBkYXRlIGVtaXR0ZXIgbGlmZXRpbWUgKGlmIGl0IGhhcyBhIGxpZmV0aW1lKSByZW1vdmUgZW1pdHRlciBpZiBpdHMgdGltZSBoYXMgcnVuIG91dCBhbmQgaXQgaGFzIG5vIHJlbWFpbmluZyBwYXJ0aWNsZXNcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZXIgKz0gZHQ7XHJcbiAgICAgICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ09OVElOVU9VUyBFTUlUVEVSXHJcbiAgICAvLyBlbWl0IG5ldyBwYXJ0aWNsZXMgZm9yZXZlclxyXG4gICAgdGhpcy5lbWl0VGltZXIgKz0gZHQ7XHJcbiAgICBpZiAodGhpcy5lbWl0VGltZXIgPiB0aGlzLmVtaXRTcGVlZCkge1xyXG4gICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgIHRoaXMuZW1pdFRpbWVyID0gMDtcclxuICAgIH1cclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIC8vIHJlbmRlciBhbGwgcGFydGljbGVzXHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAvLyAgICAgdGhpcy5wYXJ0aWNsZXNbaV0ucmVuZGVyKCk7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XHJcbiIsIi8vdmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuLi8uL0VudGl0eVwiKTtcclxuXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmN0eDtcclxuICAgICAgICB0aGlzLmNvbG9yID0gZGF0YS5jb2xvcjtcclxuICAgICAgICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XHJcbiAgICAgICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lID0gZGF0YS5saWZlVGltZTtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lciA9IDA7XHJcbiAgICAgICAgdGhpcy5lbWl0dGVyID0gZGF0YS5lbWl0dGVyO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZGF0YS5jb250YWluZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFBhcnRpY2xlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuLy8gICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4vLyAgICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4vLyAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbi8vICAgICB9XHJcbi8vIH07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIC8vdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uKTsgLy8gcm90YXRlXHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoLSh0aGlzLnNpemUgLyAyKSwgLSh0aGlzLnNpemUgLyAyKSwgdGhpcy5zaXplLCB0aGlzLnNpemUpO1xyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgdGhpcy5jb250YWluZXIuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7fTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGU7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgUmljb2NoZXQgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcIiM0ZDRkNGRcIjtcclxuICAgICAgICBkYXRhLnNpemUgPSAxO1xyXG5cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5SaWNvY2hldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmljb2NoZXQ7XHJcbiIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbnZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xudmFyIEtleWJvYXJkID0gcmVxdWlyZShcIi4vS2V5Ym9hcmRcIik7XG52YXIgTmV0d29ya0NvbnRyb2xzID0gcmVxdWlyZShcIi4vTmV0d29ya0NvbnRyb2xzXCIpO1xuLy92YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4vQnVsbGV0XCIpO1xuLy92YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcbi8vdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xudmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi93ZWFwb25zL1Nob3RndW5cIik7XG52YXIgQWs0NyA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvQWs0N1wiKTtcbi8vdmFyIEFuaW1hdGlvbiA9IHJlcXVpcmUoXCIuL0FuaW1hdGlvblwiKTtcbi8vdmFyIEVudGl0eSA9IHJlcXVpcmUoXCIuL0VudGl0eVwiKTtcbnZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vcGFydGljbGUvRW1pdHRlclwiKTtcbnZhciB3ZWFwb25DcmVhdG9yID0gcmVxdWlyZShcIi4vd2VhcG9ucy93ZWFwb25DcmVhdG9yXCIpO1xudmFyIFVpQnV0dG9uID0gcmVxdWlyZShcIi4vQnV0dG9uXCIpO1xudmFyIFVpUmVjdCA9IHJlcXVpcmUoXCIuL3VpRWxlbWVudHMvUmVjdGFuZ2xlXCIpO1xudmFyIFVpVGV4dCA9IHJlcXVpcmUoXCIuL3VpRWxlbWVudHMvVGV4dFwiKTtcblxuXG5cbmZ1bmN0aW9uIFBsYXllcihwbGF5ZXJEYXRhKSB7XG4gICAgdGhpcy5pZCA9IHBsYXllckRhdGEuaWQ7XG4gICAgdGhpcy5yYWRpdXMgPSBwbGF5ZXJEYXRhLnJhZGl1cyB8fCAyMDsgLy8gY2lyY2xlIHJhZGl1c1xuXG4gICAgaWYgKCFwbGF5ZXJEYXRhLnggfHwgIXBsYXllckRhdGEueSkge1xuICAgICAgICB2YXIgc3Bhd25Mb2NhdGlvbiA9IGhlbHBlcnMuZmluZFNwYXduTG9jYXRpb24oKTtcbiAgICAgICAgdGhpcy54ID0gc3Bhd25Mb2NhdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBzcGF3bkxvY2F0aW9uLnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy54ID0gcGxheWVyRGF0YS54O1xuICAgICAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnk7XG4gICAgfVxuICAgIC8vIHRoaXMueCA9IHBsYXllckRhdGEueCB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XG4gICAgLy8gdGhpcy55ID0gcGxheWVyRGF0YS55IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XG5cbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gcGxheWVyRGF0YS52aWV3aW5nQW5nbGUgfHwgNDU7XG4gICAgdGhpcy5zcGVlZCA9IHBsYXllckRhdGEuc3BlZWQgfHwgMTAwOyAvL3BpeGVscyBwZXIgc2Vjb25kXG4gICAgdGhpcy5ocCA9IHBsYXllckRhdGEuaHAgfHwgMTAwO1xuICAgIHRoaXMuYWxpdmUgPSBwbGF5ZXJEYXRhLmFsaXZlIHx8IHRydWU7XG5cbiAgICB0aGlzLnN4ID0gMDtcbiAgICB0aGlzLnN5ID0gMDtcbiAgICB0aGlzLnN3ID0gNjA7XG4gICAgdGhpcy5zaCA9IDYwO1xuICAgIHRoaXMuZHcgPSA2MDtcbiAgICB0aGlzLmRoID0gNjA7XG5cbiAgICB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmN0eDtcblxuICAgIC8vIGtleXNcbiAgICB0aGlzLmtVcCA9IGZhbHNlO1xuICAgIHRoaXMua0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmtMZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5rUmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIG1vdXNlXG4gICAgdGhpcy5tb3VzZVggPSB0aGlzLng7XG4gICAgdGhpcy5tb3VzZVkgPSB0aGlzLnk7XG4gICAgdGhpcy5tb3VzZUxlZnQgPSBmYWxzZTtcblxuICAgIC8vIHBvc2l0aW9uIG9uIGxldmVsXG4gICAgdGhpcy50aWxlUm93ID0gMDtcbiAgICB0aGlzLnRpbGVDb2wgPSAwO1xuXG4gICAgdGhpcy53ZWFwb25zID0gW107XG4gICAgLy8gcmVjcmVhdGUgd2VhcG9ucyBpZiB0aGUgcGxheWVyIGhhcyBhbnkgZWxzZSBjcmVhdGUgbmV3IHdlYXBvbnNcbiAgICBpZiAocGxheWVyRGF0YS53ZWFwb25TdGF0ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllckRhdGEud2VhcG9uU3RhdGUubGVuZ3RoOyBpKz0gMSkge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zLnB1c2god2VhcG9uQ3JlYXRvcih0aGlzLCBwbGF5ZXJEYXRhLndlYXBvblN0YXRlW2ldKSk7XG4gICAgICAgIH1cbiAgICB9ZWxzZSB7XG4gICAgICAgIHRoaXMud2VhcG9ucyA9IFtuZXcgQWs0Nyh0aGlzKSwgbmV3IFNob3RndW4odGhpcyldO1xuICAgIH1cblxuICAgIC8vdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG5cbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBwbGF5ZXJEYXRhLnNlbGVjdGVkV2VhcG9uSW5kZXggfHwgMDtcblxuICAgIHRoaXMubGFzdENsaWVudFN0YXRlID0gdGhpcy5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHRoaXMubGFzdEZ1bGxTdGF0ZSA9IHRoaXMuZ2V0RnVsbFN0YXRlKCk7XG5cbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gYWN0aW9ucyB0byBiZSBwZXJmb3JtZWRcbiAgICB0aGlzLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTsgLy8gc3VjY2VzZnVsbHkgcGVyZm9ybWVkIGFjdGlvbnNcblxuICAgIC8vIHRoaXMuYW5pbWF0aW9ucyA9IHtcbiAgICAvLyAgICAgXCJpZGxlXCI6IG5ldyBBbmltYXRpb24oe25hbWU6IFwiaWRsZVwiLCBzeDogMCwgc3k6IDAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogZmFsc2V9KSxcbiAgICAvLyAgICAgXCJmaXJlXCI6IG5ldyBBbmltYXRpb24oe25hbWU6IFwiZmlyZVwiLCBzeDogMCwgc3k6IDYwLCB3OiA2MCwgaDogNjAsIGZyYW1lczogMSwgcGxheU9uY2U6IHRydWV9KVxuICAgIC8vIH07XG4gICAgLy9cbiAgICAvLyB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLmFuaW1hdGlvbnMuaWRsZTtcblxuICAgIC8vaXMgdGhpcyBtZSBvciBhbm90aGVyIHBsYXllclxuICAgIGlmIChwbGF5ZXJEYXRhLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgIHRoaXMuY29udHJvbHMgPSB7bW91c2U6IG5ldyBNb3VzZSh0aGlzKSwga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZCh0aGlzKX07XG4gICAgICAgIHdpbmRvdy5nYW1lLmNhbWVyYS5mb2xsb3codGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBOZXR3b3JrQ29udHJvbHMoKTtcbiAgICB9XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xuXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIHF1ZXVlZCB1cCBhY3Rpb25zIGFuZCBwZXJmb3JtIHRoZW1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aW9ucy5sZW5ndGg7IGkgKz0gMSl7XG5cbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnBlcmZvcm1BY3Rpb24odGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucy5wdXNoKHRoaXMuYWN0aW9uc1tpXSk7XG4gICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTtcblxuICAgIGlmICghdGhpcy5hbGl2ZSkgcmV0dXJuO1xuXG5cbiAgICB0aGlzLm1vdmUoZHQpO1xuICAgIC8vY2hlY2sgaWYgb2ZmIHNjcmVlblxuICAgIC8vIGlmICh0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCkgdGhpcy54ID0gd2luZG93LmdhbWUubGV2ZWwud2lkdGg7XG4gICAgLy8gaWYgKHRoaXMueCA8IDApIHRoaXMueCA9IDA7XG4gICAgLy8gaWYgKHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkgdGhpcy55ID0gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0O1xuICAgIC8vIGlmICh0aGlzLnkgPCAwKSB0aGlzLnkgPSAwO1xuXG4gICAgLy8gdXBkYXRlIGN1cnJlbnQgd2VhcG9uO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnVwZGF0ZShkdCk7XG5cbiAgICAvL3RoaXMuY3VycmVudEFuaW1hdGlvbi51cGRhdGUoZHQpO1xuXG4gICAgaWYgKHRoaXMubW91c2VMZWZ0KSB7IC8vIGlmIGZpcmluZ1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcImZpcmVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdXNlWCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLm1vdXNlWVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnR1cm5Ub3dhcmRzKHRoaXMubW91c2VYLCB0aGlzLm1vdXNlWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkdCkge1xuXG4gICAgLy8gVXBkYXRlIG1vdmVtZW50XG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIHZhciBtb3ZlWDtcbiAgICB2YXIgbW92ZVk7XG5cbiAgICBpZiAodGhpcy5rVXAgJiYgdGhpcy5rTGVmdCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSAtZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXAgJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24gJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCkge1xuICAgICAgICBtb3ZlWSA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24pIHtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0xlZnQpIHtcbiAgICAgICAgbW92ZVggPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtSaWdodCkge1xuICAgICAgICBtb3ZlWCA9IGRpc3RhbmNlO1xuICAgIH1cblxuICAgIHZhciBjb2xsaXNpb247XG4gICAgaWYgKG1vdmVYKSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHRoaXMueCArIG1vdmVYLCB5OiB0aGlzLnl9KTtcbiAgICAgICAgaWYgKCFjb2xsaXNpb24pIHtcbiAgICAgICAgICAgIHRoaXMueCArPSBtb3ZlWDtcbiAgICAgICAgICAgIHRoaXMubW91c2VYICs9IG1vdmVYO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtb3ZlWSkge1xuICAgICAgICBjb2xsaXNpb24gPSBoZWxwZXJzLmNvbGxpc2lvbkNoZWNrKHt4OiB0aGlzLngsIHk6IHRoaXMueSArIG1vdmVZfSk7XG4gICAgICAgIGlmICghY29sbGlzaW9uKSB7XG4gICAgICAgICAgICB0aGlzLnkgKz0gbW92ZVk7XG4gICAgICAgICAgICB0aGlzLm1vdXNlWSArPSBtb3ZlWTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIC8vIENvbGxpc2lvbiBjaGVjayBhZ2FpbnN0IHN1cnJvdW5kaW5nIHRpbGVzXG4vLyBQbGF5ZXIucHJvdG90eXBlLmNvbGxpc2lvbkNoZWNrID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgdmFyIHN0YXJ0aW5nUm93ID0gdGhpcy50aWxlUm93IC0gMTtcbi8vICAgICBpZiAoc3RhcnRpbmdSb3cgPCAwKSBzdGFydGluZ1JvdyAgPSAwO1xuLy8gICAgIHZhciBlbmRSb3cgPSB0aGlzLnRpbGVSb3cgKzE7XG4vLyAgICAgaWYgKGVuZFJvdyA+IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudCkgZW5kUm93ID0gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50O1xuLy8gICAgIHZhciBzdGFydGluZ0NvbCA9IHRoaXMudGlsZUNvbCAtMTtcbi8vICAgICBpZiAoc3RhcnRpbmdDb2wgPCAwKSBzdGFydGluZ0NvbCA9IDA7XG4vLyAgICAgdmFyIGVuZENvbCA9IHRoaXMudGlsZUNvbCArMTtcbi8vICAgICBpZiAoZW5kQ29sID4gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50KSBlbmRDb2wgPSB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQ7XG4vL1xuLy8gICAgIGZvciAodmFyIHJvdyA9IHN0YXJ0aW5nUm93OyByb3cgPCBlbmRSb3c7IHJvdyArPSAxKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGNvbCA9IHN0YXJ0aW5nQ29sOyBjb2wgPCBlbmRDb2w7IGNvbCArPSAxKSB7XG4vLyAgICAgICAgICAgICBpZiAod2luZG93LmdhbWUubGV2ZWwubGV2ZWwudGlsZXNbcm93XVtjb2xdID09PSAwKSBjb250aW51ZTsgLy8gZXZlcnkgdGlsZSBvdGhlciB0aGFuIDAgYXJlIG5vbiB3YWxrYWJsZVxuLy8gICAgICAgICAgICAgLy8gY29sbGlzaW9uXG4vLyAgICAgICAgICAgICBpZiAodGhpcy50aWxlUm93ID09PSByb3cgJiYgdGhpcy50aWxlQ29sID09PSBjb2wpIHtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHRydWU7XG4vLyB9O1xuXG5QbGF5ZXIucHJvdG90eXBlLm5ldHdvcmtVcGRhdGUgPSBmdW5jdGlvbih1cGRhdGUpe1xuICAgIGRlbGV0ZSB1cGRhdGUuaWQ7XG4gICAgLy8gbmV0d29ya1VwZGF0ZVxuICAgIGZvciAodmFyIGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJhY3Rpb25zXCIpIHRoaXNba2V5XSA9IHRoaXNba2V5XS5jb25jYXQodXBkYXRlW2tleV0pO1xuICAgICAgICBlbHNlIHRoaXNba2V5XSA9IHVwZGF0ZVtrZXldO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGVyZm9ybUFjdGlvbiA9IGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgc3dpdGNoKGFjdGlvbi5hY3Rpb24pe1xuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcbiAgICAgICAgICAgIHRoaXMudHVyblRvd2FyZHMoYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImZpcmVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5maXJlKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJkaWVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpZShhY3Rpb24pO1xuICAgICAgICAgICAgLy9icmVhaztcbiAgICAgICAgY2FzZSBcInJlc3Bhd25cIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc3Bhd24oYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcImNoYW5nZVdlYXBvblwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlV2VhcG9uKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJyZWxvYWRcIjpcbiAgICB9ICAgICAgIHJldHVybiB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5yZWxvYWQoYWN0aW9uKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICBpZighdGhpcy5hbGl2ZSkgcmV0dXJuO1xuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcblxuICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3gsIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcblxufTtcblxuUGxheWVyLnByb3RvdHlwZS50dXJuVG93YXJkcyA9IGZ1bmN0aW9uKHgseSkge1xuICAgIHZhciB4RGlmZiA9IHggLSB0aGlzLng7XG4gICAgdmFyIHlEaWZmID0geSAtIHRoaXMueTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKTsvLyAqICgxODAgLyBNYXRoLlBJKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudGFrZURhbWFnZSA9IGZ1bmN0aW9uKGRhbWFnZSwgZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5ocCAtPSBkYW1hZ2U7XG4gICAgaWYgKHRoaXMuaHAgPD0gMCkge1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwiZGllXCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gYWRkIGJsb29kIHNwbGFzaCBlbWl0dGVyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy5hbGl2ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN0b3BSZWxvYWQoKTtcblxuXG4gICAgLy8gLy8gY3JlYXRlIGEgY29ycHNlXG4gICAgLy8gdmFyIGNvcnBzZSA9IG5ldyBFbnRpdHkoe1xuICAgIC8vICAgICB4OiB0aGlzLnggKyBNYXRoLmNvcyhhY3Rpb24uZGF0YS5kaXJlY3Rpb24pICogMTAsXG4gICAgLy8gICAgIHk6IHRoaXMueSArIE1hdGguc2luKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAvLyAgICAgc3g6IDYwICsoIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICogNjApLFxuICAgIC8vICAgICBzeTogMTIwLFxuICAgIC8vICAgICBzdzogNjAsXG4gICAgLy8gICAgIHNoOiA2MCxcbiAgICAvLyAgICAgZHc6IDYwLFxuICAgIC8vICAgICBkaDogNjAsXG4gICAgLy8gICAgIGRpcmVjdGlvbjogYWN0aW9uLmRhdGEuZGlyZWN0aW9uLFxuICAgIC8vICAgICBjdHg6IHdpbmRvdy5nYW1lLmJnQ3R4XG4gICAgLy8gfSk7XG4gICAgLy93aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKGNvcnBzZSk7XG5cbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAgICAgdHlwZTogXCJCbG9vZDJcIixcbiAgICAgICAgZW1pdENvdW50OiAzMCxcbiAgICAgICAgZW1pdFNwZWVkOiBudWxsLCAvLyBudWxsIG1lYW5zIGluc3RhbnRcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICB9KSk7XG5cbiAgICBpZiAodGhpcy5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZCkgeyAvLyBpZiBpdHMgbXkgcGxheWVyLCBzaG93IHJlc3Bhd24gYnV0dG9uXG4gICAgICAgIC8vIGNyZWF0ZSByZXNwYXduIEJ1dHRvbiBhbmQgZGltIHRoZSBiYWNrZ3JvdW5kXG4gICAgICAgIHZhciBiZyA9IG5ldyBVaVJlY3QoMCwwLHdpbmRvdy5nYW1lLmNhbnZhcy53aWR0aCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCwgXCJyZ2JhKDAsMCwwLDAuOClcIik7XG4gICAgICAgIHZhciB0ZXh0ID0gbmV3IFVpVGV4dCh7dGV4dDogXCJZT1UgSEFWRSBESUVEIVwiLCBmb250U2l6ZTogMTgsIHg6IDI1MCwgeTogd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAvIDIgLSAyMH0pO1xuICAgICAgICB2YXIgYnV0dG9uID0gbmV3IFVpQnV0dG9uKHt0ZXh0OiBcIlJFU1BBV05cIiwgZm9udFNpemU6IDI0LCB4OiB3aW5kb3cuZ2FtZS5jYW52YXMud2lkdGggLyAyIC0gNjMsIHk6IHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLyAyLCB3OiAxMzAsIGg6IDQwLCBjbGlja0Z1bmN0aW9uOiB0aGlzLndhbnRUb1Jlc3Bhd24sIGNvbnRleHQ6IHRoaXN9KTtcbiAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50cy5wdXNoKGJnKTtcbiAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50cy5wdXNoKHRleHQpO1xuICAgICAgICB3aW5kb3cuZ2FtZS51aUVsZW1lbnRzLnB1c2goYnV0dG9uKTtcbiAgICB9XG5cblxufTtcblxuUGxheWVyLnByb3RvdHlwZS53YW50VG9SZXNwYXduID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmFsaXZlKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgICAgICAgICAgZGF0YTogaGVscGVycy5maW5kU3Bhd25Mb2NhdGlvbigpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNsZWFyIHVpIG9mIGJ1dHRvbnNcbiAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50cyA9IFtdO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucmVzcGF3biA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMueCA9IGFjdGlvbi5kYXRhLng7XG4gICAgdGhpcy55ID0gYWN0aW9uLmRhdGEueTtcbiAgICB0aGlzLmhwID0gMTAwO1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuXG4gICAgLy8gcmVmaWxsIGFsbCB3ZWFwb25zXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlYXBvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW2ldLmZpbGxNYWdhemluZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoYW5nZVdlYXBvbiA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN0b3BSZWxvYWQoKTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBhY3Rpb24uZGF0YS5zZWxlY3RlZFdlYXBvbkluZGV4O1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55LFxuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgaHA6IHRoaXMuaHAsXG4gICAgICAgIGFsaXZlOiB0aGlzLmFsaXZlLFxuICAgICAgICByYWRpdXM6IHRoaXMucmFkaXVzLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxuICAgICAgICBzcGVlZDogdGhpcy5zcGVlZCxcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZLFxuICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXgsXG4gICAgICAgIHdlYXBvblN0YXRlOiB0aGlzLmdldFdlYXBvblN0YXRlKClcbiAgICB9O1xufTtcblxuLy8gVGhlIHN0YXRlIHRoZSBjbGllbnQgc2VuZHMgdG8gdGhlIGhvc3RcblBsYXllci5wcm90b3R5cGUuZ2V0Q2xpZW50U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZXG4gICAgfTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlU3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgIHRoaXMueCA9IG5ld1N0YXRlLnggfHwgdGhpcy54O1xuICAgIHRoaXMueSA9IG5ld1N0YXRlLnkgfHwgdGhpcy55O1xuICAgIC8vaWQ6IHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmhwID0gbmV3U3RhdGUuaHAgfHwgdGhpcy5ocDtcbiAgICAvL3RoaXMuYWxpdmUgPSBuZXdTdGF0ZS5hbGl2ZTtcbiAgICB0aGlzLmFsaXZlID0gdHlwZW9mIG5ld1N0YXRlLmFsaXZlICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUuYWxpdmUgOiB0aGlzLmFsaXZlO1xuICAgIHRoaXMucmFkaXVzID0gbmV3U3RhdGUucmFkaXVzIHx8IHRoaXMucmFkaXVzO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3U3RhdGUuZGlyZWN0aW9uIHx8IHRoaXMuZGlyZWN0aW9uO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gbmV3U3RhdGUudmlld2luZ0FuZ2xlIHx8IHRoaXMudmlld2luZ0FuZ2xlO1xuICAgIHRoaXMuc3BlZWQgPSBuZXdTdGF0ZS5zcGVlZCB8fCB0aGlzLnNwZWVkO1xuICAgIHRoaXMua1VwID0gdHlwZW9mIG5ld1N0YXRlLmtVcCAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLmtVcCA6IHRoaXMua1VwO1xuICAgIHRoaXMua1VwID0gdHlwZW9mIG5ld1N0YXRlLmtVcCAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLmtVcCA6IHRoaXMua1VwO1xuICAgIHRoaXMua0xlZnQgPSB0eXBlb2YgbmV3U3RhdGUua0xlZnQgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5rTGVmdCA6IHRoaXMua0xlZnQ7XG4gICAgdGhpcy5rUmlnaHQgPSB0eXBlb2YgbmV3U3RhdGUua1JpZ2h0ICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUua1JpZ2h0IDogdGhpcy5rUmlnaHQ7XG4gICAgdGhpcy5tb3VzZVggPSB0eXBlb2YgbmV3U3RhdGUubW91c2VYICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUubW91c2VYIDogdGhpcy5tb3VzZVg7XG4gICAgdGhpcy5tb3VzZVkgPSB0eXBlb2YgbmV3U3RhdGUubW91c2VZICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUubW91c2VZIDogdGhpcy5tb3VzZVk7XG4gICAgdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4ID0gbmV3U3RhdGUuc2VsZWN0ZWRXZWFwb25JbmRleCB8fCB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXg7XG59O1xuXG4vLyBnZXQgdGhlIHN0YXRlIG9mIGVhY2ggd2VhcG9uXG5QbGF5ZXIucHJvdG90eXBlLmdldFdlYXBvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlYXBvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3RhdGUucHVzaCh0aGlzLndlYXBvbnNbaV0uZ2V0U3RhdGUoKSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCIvLyB2YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcbi8vIHZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbi8vXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVWkoZ2FtZSl7XG4gICAgdGhpcy5jbGllbnRMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJzXCIpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG5cbiAgICB0aGlzLnVwZGF0ZUNsaWVudExpc3QgPSBmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgIHZhciBteUlEID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZDtcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIGlkIGluIHBsYXllcnMpe1xuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpZCArIFwiIFwiICsgcGxheWVyc1tpZF0ucGluZyk7XG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50TGlzdC5hcHBlbmRDaGlsZChsaSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJEZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IFwiMTJweCBPcGVuIFNhbnNcIjtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNkN2Q3ZDdcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiRlBTOiAgXCIgKyB3aW5kb3cuZ2FtZS5mcHMsIDUsIDIwKTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcsIDUsIDM0KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiQ0FNRVJBOiBcIiArIE1hdGguZmxvb3Iod2luZG93LmdhbWUuY2FtZXJhLngpICsgXCIsIFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueSksIDUsIDQ4KTtcbiAgICAgICAgaWYgKHBsYXllcikge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUExBWUVSOiAgXCIgKyBNYXRoLmZsb29yKHBsYXllci54KSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLnkpLCA1LCA2Mik7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJNT1VTRTogXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVgpICsgXCIsIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIubW91c2VZKSwgNSwgNzYpO1xuICAgICAgICAgICAgaWYocGxheWVyKSB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJESVI6IFwiICsgcGxheWVyLmRpcmVjdGlvbi50b0ZpeGVkKDIpLCA1LCA5MCk7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUEFSVElDTEVTOiBcIiArIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5sZW5ndGgsIDUsIDEwNCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gXCIyNHB4IE9wZW4gU2Fuc1wiO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlclVJICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgaWYgKCFwbGF5ZXIpIHJldHVybjtcblxuXG4gICAgICAgIC8vZ3VpIGJnIGNvbG9yXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LnJlY3QoMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDM1LCAxNDAsIDM1KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjM1KVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbCgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBncmFkaWVudFxuICAgICAgICB2YXIgZ3JkPSB3aW5kb3cuZ2FtZS5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMTQwLDAsMTkwLDApO1xuICAgICAgICBncmQuYWRkQ29sb3JTdG9wKDAsXCJyZ2JhKDAsMCwwLDAuMzUpXCIpO1xuICAgICAgICBncmQuYWRkQ29sb3JTdG9wKDEsXCJyZ2JhKDAsMCwwLDApXCIpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlPWdyZDtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxSZWN0KDE0MCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDM1LDUwLDM1KTtcblxuXG5cbiAgICAgICAgdmFyIHdlYXBvbiA9ICBwbGF5ZXIud2VhcG9uc1twbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleF07XG4gICAgICAgIC8vIGRyYXcgd2VhcG9uIGljb25cbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgd2VhcG9uLmljb25TeCwgd2VhcG9uLmljb25TeSwgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgsIDkwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzMsIHdlYXBvbi5pY29uVywgd2VhcG9uLmljb25IKTtcbiAgICAgICAgLy8gZHJhdyBtYWdhemluZSBjb3VudCdcbiAgICAgICAgaWYgKHdlYXBvbi5yZWxvYWRpbmcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIDg1LCAyMTQsIDIxLCAyMiwgMTI1LCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzAsIDIxLCAyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMjUpXCI7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsIDEyMiwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDkpO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHdlYXBvbi5idWxsZXRzLCAgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZHJhdyBoZWFydFxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCAwLCAyMjgsIDEzLCAxMiwgMTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAyMywgMTMsIDEyKTtcbiAgICAgICAgLy8gZHJhdyBIUFxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMjUpXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNlN2QyOWVcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHBsYXllci5ocCwgMzAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAxMCk7XG4gICAgfTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzcGF3bkJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSB7XG5cbiAgICAgICAgICAgIC8vIHZhciBzcGF3bkxvY2F0aW9uRm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHZhciB4O1xuICAgICAgICAgICAgLy8gdmFyIHk7XG4gICAgICAgICAgICAvLyB3aGlsZSAoIXNwYXduTG9jYXRpb25Gb3VuZCkge1xuICAgICAgICAgICAgLy8gICAgIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAgICAgLy8gICAgIHkgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICAgaWYgKGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KSkgc3Bhd25Mb2NhdGlvbkZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIH1cblxuXG4gICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBoZWxwZXJzLmZpbmRTcGF3bkxvY2F0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JlbG9hZEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICBpZiAocGxheWVyLmFsaXZlKSB7XG4gICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInJlbG9hZFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgKCFwbGF5ZXIuYWxpdmUpIHtcbiAgICAgICAgLy8gICAgIHZhciB4ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAgICAgLy8gICAgIHZhciB5ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgIC8vICAgICAgICAgYWN0aW9uOiBcInJlc3Bhd25cIixcbiAgICAgICAgLy8gICAgICAgICBkYXRhOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgIC8vICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfVxuICAgIH0pO1xuXG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNlbWl0dGVyQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJCbG9vZDJcIixcbiAgICAgICAgICAgICAgICBlbWl0Q291bnQ6IDEwLFxuICAgICAgICAgICAgICAgIGVtaXRTcGVlZDogbnVsbCxcbiAgICAgICAgICAgICAgICB4OiBwbGF5ZXIueCxcbiAgICAgICAgICAgICAgICB5OiBwbGF5ZXIueVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbn07XG4iLCJ2YXIgbGV2ZWwgPSB7XHJcbiAgICBuYW1lOiBcImxldmVsMVwiLFxyXG4gICAgdGlsZXM6IFtcclxuICAgICAgICBbMSwxLDEsMSwxLDEsMSwxLDEsMSwwLDAsMCwwLDAsMCwwLDAsMCwwXSxcclxuICAgICAgICBbMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwxLDEsMSwxLDAsMCwwXSxcclxuICAgICAgICBbMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMiwyLDIsMiwyLDEsMCwwXSxcclxuICAgICAgICBbMSwwLDAsMCwxLDEsMSwxLDAsMCwxLDIsMiwxLDIsMSwyLDIsMSwwXSxcclxuICAgICAgICBbMSwwLDAsMCwxLDEsMSwxLDAsMCwxLDIsMiwyLDIsMiwyLDIsMSwwXSxcclxuICAgICAgICBbMSwwLDAsMCwxLDEsMSwxLDAsMCwxLDIsMSwyLDIsMiwxLDIsMSwwXSxcclxuICAgICAgICBbMSwwLDAsMCwxLDEsMSwxLDAsMCwxLDIsMiwxLDEsMSwyLDIsMSwwXSxcclxuICAgICAgICBbMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMiwyLDIsMiwyLDEsMCwwXSxcclxuICAgICAgICBbMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwxLDEsMSwxLDAsMCwwXSxcclxuICAgICAgICBbMSwxLDEsMSwxLDEsMSwxLDEsMSwwLDAsMCwwLDAsMCwwLDAsMCwwXSxdXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxldmVsO1xyXG4iLCJ2YXIgQWs0NyA9IHtcclxuICAgIFwibmFtZVwiOiBcIkFrNDdcIixcclxuICAgIFwibWFnYXppbmVTaXplXCI6IDMwLCAvLyBidWxsZXRzXHJcbiAgICBcImJ1bGxldHNcIjogMzAsXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuMSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiAxLCAvLyBzaG9vdCAxIGJ1bGxldCBhdCBhIHRpbWVcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDIsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMTcwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiAwLCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbiAgICBcImljb25TeFwiOiAyMSxcclxuICAgIFwiaWNvblN5XCI6IDIxMCxcclxuICAgIFwiaWNvbldcIjogMzAsXHJcbiAgICBcImljb25IXCI6IDMwXHJcbn07XHJcblxyXG52YXIgc2hvdGd1biA9IHtcclxuICAgIFwibmFtZVwiOiBcInNob3RndW5cIixcclxuICAgIFwibWFnYXppbmVTaXplXCI6IDEyLCAvLyBidWxsZXRzXHJcbiAgICBcImJ1bGxldHNcIjogMTIsXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuNSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiA0LCAvLyA0IHNob3RndW4gc2x1Z3MgcGVyIHNob3RcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDIsIC8vIHNcclxuICAgIFwiYnVsbGV0U3BlZWRcIjogMjUwMCwgLy8gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIFwic3hcIjogMCwgLy8gc3ByaXRlc2hlZXQgeCBwb3NpdGlvblxyXG4gICAgXCJzeVwiOiA2MCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogNTEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBazQ3OiBBazQ3LFxyXG4gICAgc2hvdGd1bjogc2hvdGd1blxyXG59O1xyXG4iLCIvLyBkZWdyZWVzIHRvIHJhZGlhbnNcbmZ1bmN0aW9uIHRvUmFkaWFucyhkZWcpIHtcbiAgICByZXR1cm4gZGVnICogKE1hdGguUEkgLyAxODApO1xufVxuXG4vLyByYWRpYW5zIHRvIGRlZ3JlZXNcbmZ1bmN0aW9uIHRvRGVncmVlcyhyYWQpIHtcbiAgICByZXR1cm4gcmFkICogKDE4MCAvIE1hdGguUEkpO1xufVxuXG4vLyBjaGVjayBpZiB0aGlzIHBvaW50IGlzIGluc2lkZSBhIG5vbiB3YWxrYWJsZSB0aWxlLiByZXR1cm5zIHRydWUgaWYgbm90IHdhbGthYmxlXG5mdW5jdGlvbiBjb2xsaXNpb25DaGVjayhwb2ludCkge1xuICAgIHZhciB0aWxlUm93ID0gTWF0aC5mbG9vcihwb2ludC55IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpO1xuICAgIHZhciB0aWxlQ29sID0gTWF0aC5mbG9vcihwb2ludC54IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpO1xuICAgIGlmICh0aWxlUm93IDwgMCB8fCB0aWxlUm93ID49IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudCB8fCB0aWxlQ29sIDwgMCB8fCB0aWxlQ29sID49IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudCApIHJldHVybiB0cnVlOyAvLyBvdXRzaWRlIG1hcFxuICAgIHJldHVybiAod2luZG93LmdhbWUubGV2ZWwubGV2ZWwudGlsZXNbdGlsZVJvd11bdGlsZUNvbF0gPiAwKTtcbn1cblxuLy8gdGFrZXMgYSBwb2ludCBhbmQgcmV0dW5zIHRpbGUgeHl3aCB0aGF0IGlzIHVuZGVyIHRoYXQgcG9pbnRcbmZ1bmN0aW9uIGdldFJlY3RGcm9tUG9pbnQocG9pbnQpIHtcbiAgICB2YXIgeSA9IE1hdGguZmxvb3IocG9pbnQueSAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKSAqIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplO1xuICAgIHZhciB4ID0gTWF0aC5mbG9vcihwb2ludC54IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpICogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemU7XG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5LCB3OiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSwgaDogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemV9O1xufVxuXG4vLyByZXR1cm5zIHRpbGVcbmZ1bmN0aW9uIGdldFRpbGUoeCwgeSkge1xuICAgIGlmKHggPj0gMCAmJiB4IDwgd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50ICYmIHkgPj0gMCAmJiB5IDwgd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50KVxuICAgICAgICByZXR1cm4gd2luZG93LmdhbWUubGV2ZWwubGV2ZWwudGlsZXNbeV1beF07XG59XG5cbi8vIGZpbmRzIGEgcmFuZG9tIHdhbGthYmxlIHRpbGUgb24gdGhlIG1hcFxuZnVuY3Rpb24gZmluZFNwYXduTG9jYXRpb24oKSB7XG4gICAgdmFyIHg7XG4gICAgdmFyIHk7XG4gICAgZG8ge1xuICAgICAgICB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2luZG93LmdhbWUubGV2ZWwud2lkdGgpO1xuICAgICAgICB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KTtcbiAgICB9XG4gICAgd2hpbGUgKGNvbGxpc2lvbkNoZWNrKHt4OiB4LCB5OiB5fSkpO1xuXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcbn1cblxuLy8gY2hlY2tzIHRoYXQgYSB4eSBwb2ludCBpcyBpbnNpZGUgdGhlIGdhbWUgd29ybGRcbmZ1bmN0aW9uIGlzSW5zaWRlR2FtZSh4LCB5KSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJ4OlwiLHgsIFwieTpcIix5LCBcIndpZHRoOlwiLHdpbmRvdy5nYW1lLmxldmVsLndpZHRoLCBcImhlaWdodDpcIix3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIC8vIGNvbnNvbGUubG9nKHggPj0gMCwgeCA8IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoLCAgeSA+PSAwLCB5IDwgd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KTtcbiAgICBpZiAoeCA+PSAwICYmIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAmJiB5ID49IDAgJiYgeSA8IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkgcmV0dXJuIHRydWU7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdG9SYWRpYW5zOiB0b1JhZGlhbnMsXG4gICAgdG9EZWdyZWVzOiB0b0RlZ3JlZXMsXG4gICAgY29sbGlzaW9uQ2hlY2s6IGNvbGxpc2lvbkNoZWNrLFxuICAgIGZpbmRTcGF3bkxvY2F0aW9uOiBmaW5kU3Bhd25Mb2NhdGlvbixcbiAgICBnZXRSZWN0RnJvbVBvaW50OiBnZXRSZWN0RnJvbVBvaW50LFxuICAgIGdldFRpbGU6IGdldFRpbGUsXG4gICAgaXNJbnNpZGVHYW1lOiBpc0luc2lkZUdhbWVcbn07XG4iLCJ2YXIgR2FtZSA9IHJlcXVpcmUoXCIuL0dhbWUuanNcIik7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKTtcclxufSk7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG4vL3ZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCdWxsZXRIb2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIC8vdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICAvLyB2YXIgciA9IDE1MDtcclxuICAgICAgICAvLyB2YXIgZyA9IDUwO1xyXG4gICAgICAgIC8vIHZhciBiID0gNTA7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcInJnYig2NiwgNjYsIDY2KVwiO1xyXG4gICAgICAgIC8vZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAyO1xyXG4gICAgICAgIGRhdGEuY29udGFpbmVyID0gd2luZG93LmdhbWUucGFydGljbGVzO1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmxpZmVUaW1lID0gMTA7XHJcbiAgICAgICAgLy90aGlzLmRpcmVjdGlvbiA9IGhlbHBlcnMudG9SYWRpYW5zKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxKTtcclxuICAgICAgICAvL3RoaXMuc3BlZWQgPSA4MDtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICAvL3RoaXMuZGlzdGFuY2VNb3ZlZCA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbkJ1bGxldEhvbGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4gICAgdGhpcy5saWZlVGltZSAtPSBkdDtcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lIDwgMCkgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgIC8vIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgLy8gICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgIC8vICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIC8vICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIC8vICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIC8vIH1cclxuXHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldEhvbGU7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgRmxhc2ggZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwiI2ZmZTYwMFwiO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAwLjA1O1xyXG4gICAgICAgIGRhdGEuY29udGFpbmVyID0gd2luZG93LmdhbWUucGFydGljbGVzO1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICAvL3RoaXMubGlmZVRpbWUgPSAwLjA1O1xyXG5cclxuICAgICAgICAvL3RoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5GbGFzaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG59O1xyXG5cclxuLy8gQmxvb2RTcGxhc2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuLy8gICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbi8vICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbi8vIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbGFzaDtcclxuIiwiZnVuY3Rpb24gUmVjdGFuZ2xlICh4LCB5LCB3LCBoLCBjb2xvcikge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLncgPSB3O1xyXG4gICAgdGhpcy5oID0gaDtcclxuICAgIHRoaXMucmVjdCA9IHt4OngsIHk6eSwgdzp3LCBoOmh9O1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG59XHJcblxyXG5SZWN0YW5nbGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LnJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMudywgdGhpcy5oKTtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGwoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlO1xyXG4iLCJmdW5jdGlvbiBSZWN0YW5nbGUgKGRhdGEpIHtcclxuICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xyXG4gICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xyXG4gICAgdGhpcy5mb250U2l6ZSA9IGRhdGEuZm9udFNpemU7XHJcbn1cclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IHRoaXMuZm9udFNpemUgKyBcInB4IE9wZW4gU2Fuc1wiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy54LCB0aGlzLnkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWN0YW5nbGU7XHJcbiIsIi8vdmFyIHRpbGVzID0gcmVxdWlyZShcIi4vbGV2ZWxcIikudGlsZXM7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vLi4vaGVscGVycy5qc1wiKTtcclxudmFyIGNvbGxpc2lvbkRldGVjdGlvbiA9IHJlcXVpcmUoXCIuL2NvbGxpc2lvbkRldGVjdGlvblwiKTtcclxuXHJcbmZ1bmN0aW9uIGJsaW5lKHgwLCB5MCwgeDEsIHkxKSB7XHJcblxyXG4gIHZhciBkeCA9IE1hdGguYWJzKHgxIC0geDApLCBzeCA9IHgwIDwgeDEgPyAxIDogLTE7XHJcbiAgdmFyIGR5ID0gTWF0aC5hYnMoeTEgLSB5MCksIHN5ID0geTAgPCB5MSA/IDEgOiAtMTtcclxuICB2YXIgZXJyID0gKGR4PmR5ID8gZHggOiAtZHkpLzI7XHJcblxyXG4gIHdoaWxlICh0cnVlKSB7XHJcblxyXG4gICAgaWYgKHgwID09PSB4MSAmJiB5MCA9PT0geTEpIGJyZWFrO1xyXG4gICAgdmFyIGUyID0gZXJyO1xyXG4gICAgaWYgKGUyID4gLWR4KSB7IGVyciAtPSBkeTsgeDAgKz0gc3g7IH1cclxuICAgIGlmIChlMiA8IGR5KSB7IGVyciArPSBkeDsgeTAgKz0gc3k7IH1cclxuXHJcblxyXG5cclxuICAgIC8vIGNoZWNrIGlmIG91dHNpZGUgbWFwXHJcbiAgICBpZiAoIWhlbHBlcnMuaXNJbnNpZGVHYW1lKHgwLCB5MCkpIHJldHVybjtcclxuXHJcblxyXG4gICAgLy8gaGl0IGNoZWNrIGFnYWluc3QgcGxheWVyc1xyXG4gICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xyXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSBjb250aW51ZTtcclxuICAgICAgICB2YXIgaGl0ID0gY29sbGlzaW9uRGV0ZWN0aW9uLnBvaW50Q2lyY2xlKHt4OiB4MCwgeTogeTB9LCB7eDogcGxheWVyLngsIHk6IHBsYXllci55LCByYWRpdXM6IHBsYXllci5yYWRpdXN9KTtcclxuICAgICAgICBpZiAoaGl0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7dHlwZTogXCJwbGF5ZXJcIiwgcGxheWVyOiBwbGF5ZXJ9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRpbGVYID0gTWF0aC5mbG9vcih4MCAvIDMyKTtcclxuICAgIHZhciB0aWxlWSA9IE1hdGguZmxvb3IoeTAgLyAzMik7XHJcbiAgICAvLyBjaGVjayBhZ2FpbnN0IHRpbGVzXHJcbiAgICBpZiAoaGVscGVycy5nZXRUaWxlKHRpbGVYLHRpbGVZKSA9PT0gMSkgcmV0dXJuIHt0eXBlOiBcInRpbGVcIiwgeDogdGlsZVgsIHk6IHRpbGVZfTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxpbmU7XHJcbiIsInZhciBpbnRlcnNlY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XHJcblxyXG5mdW5jdGlvbiBsaW5lUmVjdEludGVyc2VjdChsaW5lLCByZWN0KSB7XHJcblxyXG4gICAgICAgIC8vaWYgKHBvaW50IGlzIGluc2lkZSByZWN0KVxyXG4gICAgICAgIC8vIGludGVyc2VjdCA9IHBvaW50O1xyXG5cclxuICAgICAgICAvLyBjaGVjayBsZWZ0XHJcbiAgICAgICAgdmFyIGxlZnQgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciBsZWZ0SW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLGxlZnQpO1xyXG4gICAgICAgIGlmIChsZWZ0SW50ZXJzZWN0LnkgPj0gbGVmdC5zdGFydC55ICYmIGxlZnRJbnRlcnNlY3QueSA8PSBsZWZ0LmVuZC55ICYmIGxpbmUuc3RhcnQueCA8PSBsZWZ0LnN0YXJ0LnggKSB7XHJcbiAgICAgICAgICAgIGxlZnRJbnRlcnNlY3QueCArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gbGVmdEludGVyc2VjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIHRvcFxyXG4gICAgICAgIHZhciB0b3AgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueX19O1xyXG4gICAgICAgIHZhciB0b3BJbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHRvcCk7XHJcbiAgICAgICAgaWYgKHRvcEludGVyc2VjdC54ID49IHRvcC5zdGFydC54ICYmIHRvcEludGVyc2VjdC54IDw9IHRvcC5lbmQueCAmJiBsaW5lLnN0YXJ0LnkgPD0gdG9wLnN0YXJ0LnkpIHtcclxuICAgICAgICAgICAgdG9wSW50ZXJzZWN0LnkgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvcEludGVyc2VjdDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayByaWdodFxyXG4gICAgICAgIHZhciByaWdodCA9IHtzdGFydDp7eDogcmVjdC54ICsgcmVjdC53ICx5OiByZWN0LnkgfSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciByaWdodEludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgcmlnaHQpO1xyXG4gICAgICAgIGlmIChyaWdodEludGVyc2VjdC55ID49IHJpZ2h0LnN0YXJ0LnkgJiYgcmlnaHRJbnRlcnNlY3QueSA8IHJpZ2h0LmVuZC55KSB7XHJcbiAgICAgICAgICAgIHJpZ2h0SW50ZXJzZWN0LnggLT0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHJpZ2h0SW50ZXJzZWN0O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGRvd25cclxuICAgICAgICB2YXIgZG93biA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICAgICAgdmFyIGRvd25JbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIGRvd24pO1xyXG4gICAgICAgIHRvcEludGVyc2VjdC55IC09IDE7XHJcbiAgICAgICAgcmV0dXJuIGRvd25JbnRlcnNlY3Q7XHJcbn1cclxuXHJcbi8vIGZpbmQgdGhlIHBvaW50IHdoZXJlIGEgbGluZSBpbnRlcnNlY3RzIGEgcmVjdGFuZ2xlLiB0aGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhlIGxpbmUgYW5kIHJlY3QgaW50ZXJzZWN0c1xyXG5mdW5jdGlvbiBsaW5lUmVjdEludGVyc2VjdDIobGluZSwgcmVjdCkge1xyXG4gICAgLy9pZiAocG9pbnQgaXMgaW5zaWRlIHJlY3QpXHJcbiAgICAvLyBpbnRlcnNlY3QgPSBwb2ludDtcclxuXHJcbiAgICAvLyBjaGVjayBsZWZ0XHJcbiAgICB2YXIgbGVmdExpbmUgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgdmFyIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLGxlZnRMaW5lKTtcclxuICAgIGlmIChpbnRlcnNlY3Rpb25Qb2ludC55ID49IGxlZnRMaW5lLnN0YXJ0LnkgJiYgaW50ZXJzZWN0aW9uUG9pbnQueSA8PSBsZWZ0TGluZS5lbmQueSAmJiBsaW5lLnN0YXJ0LnggPD0gbGVmdExpbmUuc3RhcnQueCApIHtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgdG9wXHJcbiAgICB2YXIgdG9wTGluZSA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0Lnl9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55fX07XHJcbiAgICBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgdG9wTGluZSk7XHJcbiAgICBpZiAoaW50ZXJzZWN0aW9uUG9pbnQueCA+PSB0b3BMaW5lLnN0YXJ0LnggJiYgaW50ZXJzZWN0aW9uUG9pbnQueCA8PSB0b3BMaW5lLmVuZC54ICYmIGxpbmUuc3RhcnQueSA8PSB0b3BMaW5lLnN0YXJ0LnkpIHtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgcmlnaHRcclxuICAgIHZhciByaWdodExpbmUgPSB7c3RhcnQ6e3g6IHJlY3QueCArIHJlY3QudyAseTogcmVjdC55IH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCByaWdodExpbmUpO1xyXG4gICAgaWYgKGludGVyc2VjdGlvblBvaW50LnkgPj0gcmlnaHRMaW5lLnN0YXJ0LnkgJiYgaW50ZXJzZWN0aW9uUG9pbnQueSA8IHJpZ2h0TGluZS5lbmQueSAmJiBsaW5lLnN0YXJ0LnggPj0gcmlnaHRMaW5lLnN0YXJ0LngpIHtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgZG93blxyXG4gICAgdmFyIGRvd24gPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIGRvd24pO1xyXG4gICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG59XHJcblxyXG5cclxuLy8gQ2hlY2tzIGlmIGEgcG9pbnQgaXMgaW5zaWRlIGEgY2lyY2xlXHJcbmZ1bmN0aW9uIHBvaW50Q2lyY2xlKHBvaW50LCBjaXJjbGUpIHtcclxuICAgICAgICB2YXIgYSA9IHBvaW50LnggLSBjaXJjbGUueDtcclxuICAgICAgICB2YXIgYiA9IHBvaW50LnkgLSBjaXJjbGUueTtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IGNpcmNsZS5yYWRpdXMpIHsgLy8gcG9pbnQgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIENoZWNrcyBpZiBhIHBvaW50IGlzIGluc2lkZSBhIHJlY3RhbmdsZVxyXG5mdW5jdGlvbiBwb2ludFJlY3QocG9pbnQsIHJlY3QpIHtcclxuICAgIHJldHVybiAocG9pbnQueCA+PSByZWN0LnggJiYgcG9pbnQueCA8PSByZWN0LnggKyByZWN0LncgJiYgcG9pbnQueSA+PSByZWN0LnkgJiYgcG9pbnQueSA8PSByZWN0LnkgKyByZWN0LmgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGxpbmVSZWN0SW50ZXJzZWN0OiBsaW5lUmVjdEludGVyc2VjdCxcclxuICAgIHBvaW50Q2lyY2xlOiBwb2ludENpcmNsZSxcclxuICAgIHBvaW50UmVjdDogcG9pbnRSZWN0LFxyXG4gICAgbGluZVJlY3RJbnRlcnNlY3QyOiBsaW5lUmVjdEludGVyc2VjdDJcclxufTtcclxuIiwidmFyIGludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZlY3RvciA9IHt9O1xyXG4gICAgdmVjdG9yLm9BID0gZnVuY3Rpb24oc2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybiBzZWdtZW50LnN0YXJ0O1xyXG4gICAgfTtcclxuICAgIHZlY3Rvci5BQiA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICB2YXIgc3RhcnQgPSBzZWdtZW50LnN0YXJ0O1xyXG4gICAgICAgIHZhciBlbmQgPSBzZWdtZW50LmVuZDtcclxuICAgICAgICByZXR1cm4ge3g6ZW5kLnggLSBzdGFydC54LCB5OiBlbmQueSAtIHN0YXJ0Lnl9O1xyXG4gICAgfTtcclxuICAgIHZlY3Rvci5hZGQgPSBmdW5jdGlvbih2MSx2Mikge1xyXG4gICAgICAgIHJldHVybiB7eDogdjEueCArIHYyLngsIHk6IHYxLnkgKyB2Mi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5zdWIgPSBmdW5jdGlvbih2MSx2Mikge1xyXG4gICAgICAgIHJldHVybiB7eDp2MS54IC0gdjIueCwgeTogdjEueSAtIHYyLnl9O1xyXG4gICAgfVxyXG4gICAgdmVjdG9yLnNjYWxhck11bHQgPSBmdW5jdGlvbihzLCB2KSB7XHJcbiAgICAgICAgcmV0dXJuIHt4OiBzICogdi54LCB5OiBzICogdi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5jcm9zc1Byb2R1Y3QgPSBmdW5jdGlvbih2MSx2Mikge1xyXG4gICAgICAgIHJldHVybiAodjEueCAqIHYyLnkpIC0gKHYyLnggKiB2MS55KTtcclxuICAgIH07XHJcbiAgICB2YXIgc2VsZiA9IHt9O1xyXG4gICAgc2VsZi52ZWN0b3IgPSBmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5BQihzZWdtZW50KTtcclxuICAgIH07XHJcbiAgICBzZWxmLmludGVyc2VjdFNlZ21lbnRzID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gdHVybiBhID0gcCArIHQqciB3aGVyZSAwPD10PD0xIChwYXJhbWV0ZXIpXHJcbiAgICAgICAgLy8gYiA9IHEgKyB1KnMgd2hlcmUgMDw9dTw9MSAocGFyYW1ldGVyKVxyXG4gICAgICAgIHZhciBwID0gdmVjdG9yLm9BKGEpO1xyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG5cclxuICAgICAgICB2YXIgcSA9IHZlY3Rvci5vQShiKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzID0gdmVjdG9yLmNyb3NzUHJvZHVjdChyLHMpO1xyXG4gICAgICAgIHZhciBxbXAgPSB2ZWN0b3Iuc3ViKHEscCk7XHJcbiAgICAgICAgdmFyIG51bWVyYXRvciA9IHZlY3Rvci5jcm9zc1Byb2R1Y3QocW1wLCBzKTtcclxuICAgICAgICB2YXIgdCA9IG51bWVyYXRvciAvIGNyb3NzO1xyXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSB2ZWN0b3IuYWRkKHAsdmVjdG9yLnNjYWxhck11bHQodCxyKSk7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbjtcclxuICAgIH07XHJcbiAgICBzZWxmLmlzUGFyYWxsZWwgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgICAgICAvLyBhIGFuZCBiIGFyZSBsaW5lIHNlZ21lbnRzLlxyXG4gICAgICAgIC8vIHJldHVybnMgdHJ1ZSBpZiBhIGFuZCBiIGFyZSBwYXJhbGxlbCAob3IgY28tbGluZWFyKVxyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG4gICAgICAgIHZhciBzID0gdmVjdG9yLkFCKGIpO1xyXG4gICAgICAgIHJldHVybiAodmVjdG9yLmNyb3NzUHJvZHVjdChyLHMpID09PSAwKTtcclxuICAgIH07XHJcbiAgICBzZWxmLmlzQ29sbGluZWFyID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gYSBhbmQgYiBhcmUgbGluZSBzZWdtZW50cy5cclxuICAgICAgICAvLyByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBhcmUgY28tbGluZWFyXHJcbiAgICAgICAgdmFyIHAgPSB2ZWN0b3Iub0EoYSk7XHJcbiAgICAgICAgdmFyIHIgPSB2ZWN0b3IuQUIoYSk7XHJcblxyXG4gICAgICAgIHZhciBxID0gdmVjdG9yLm9BKGIpO1xyXG4gICAgICAgIHZhciBzID0gdmVjdG9yLkFCKGIpO1xyXG4gICAgICAgIHJldHVybiAodmVjdG9yLmNyb3NzUHJvZHVjdCh2ZWN0b3Iuc3ViKHAscSksIHIpID09PSAwKTtcclxuICAgIH07XHJcbiAgICBzZWxmLnNhZmVJbnRlcnNlY3QgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgICAgICBpZiAoc2VsZi5pc1BhcmFsbGVsKGEsYikgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVyc2VjdFNlZ21lbnRzKGEsYik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gc2VsZjtcclxufTtcclxuaW50ZXJzZWN0aW9uLmludGVyc2VjdFNlZ21lbnRzID0gaW50ZXJzZWN0aW9uKCkuaW50ZXJzZWN0U2VnbWVudHM7XHJcbmludGVyc2VjdGlvbi5pbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24oKS5zYWZlSW50ZXJzZWN0O1xyXG5pbnRlcnNlY3Rpb24uaXNQYXJhbGxlbCA9IGludGVyc2VjdGlvbigpLmlzUGFyYWxsZWw7XHJcbmludGVyc2VjdGlvbi5pc0NvbGxpbmVhciA9IGludGVyc2VjdGlvbigpLmlzQ29sbGluZWFyO1xyXG5pbnRlcnNlY3Rpb24uZGVzY3JpYmUgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgIHZhciBpc0NvbGxpbmVhciA9IGludGVyc2VjdGlvbigpLmlzQ29sbGluZWFyKGEsYik7XHJcbiAgICB2YXIgaXNQYXJhbGxlbCA9IGludGVyc2VjdGlvbigpLmlzUGFyYWxsZWwoYSxiKTtcclxuICAgIHZhciBwb2ludE9mSW50ZXJzZWN0aW9uID0gdW5kZWZpbmVkO1xyXG4gICAgaWYgKGlzUGFyYWxsZWwgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcG9pbnRPZkludGVyc2VjdGlvbiA9IGludGVyc2VjdGlvbigpLmludGVyc2VjdFNlZ21lbnRzKGEsYik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge2NvbGxpbmVhcjogaXNDb2xsaW5lYXIscGFyYWxsZWw6IGlzUGFyYWxsZWwsaW50ZXJzZWN0aW9uOnBvaW50T2ZJbnRlcnNlY3Rpb259O1xyXG59O1xyXG5cclxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0aW9uO1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuQWs0NztcclxuXHJcbmNsYXNzIEFrNDcgZXh0ZW5kcyBXZWFwb257XHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XHJcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xyXG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBazQ3O1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xudmFyIHdlYXBvbkRhdGEgPSByZXF1aXJlKFwiLi4vZGF0YS93ZWFwb25zXCIpLnNob3RndW47XG52YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0MlwiKTtcblxuY2xhc3MgU2hvdGd1biBleHRlbmRzIFdlYXBvbntcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XG4gICAgICAgIHdlYXBvbkRhdGEgPSBleGlzdGluZ1dlYXBvbkRhdGEgfHwgd2VhcG9uRGF0YTtcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xuICAgIH1cbn1cblxuU2hvdGd1bi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuXG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSB8fCB0aGlzLnJlbG9hZGluZyB8fCB0aGlzLmJ1bGxldHMgPCAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLmJ1bGxldHMgLT0gMTtcbiAgICB0aGlzLmZpcmVUaW1lciA9IDA7XG5cbiAgICB2YXIgZGlyZWN0aW9ucyA9IFtdO1xuICAgIHZhciBkaXJlY3Rpb247XG5cbiAgICAvL3ZhciB0YXJnZXRMb2NhdGlvbnMgPSBbXTtcbiAgICAvL3ZhciB0YXJnZXRMb2NhdGlvbnM7XG5cbiAgICAvLyBzaG9vdCA0IGJ1bGxldHNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0c1BlclNob3Q7IGkgKz0gMSkge1xuXG4gICAgICAgIGlmICghYWN0aW9uLmRhdGEuZGlyZWN0aW9ucykge1xuICAgICAgICAgICAgLy8gcmFuZG9taXplIGRpcmVjdGlvbnMgbXlzZWxmXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLm93bmVyLmRpcmVjdGlvbiArIE1hdGgucmFuZG9tKCkgKiAwLjI1IC0gMC4xMjU7XG4gICAgICAgICAgICBkaXJlY3Rpb25zLnB1c2goZGlyZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IGFjdGlvbi5kYXRhLmRpcmVjdGlvbnNbaV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnVsbGV0ID0gbmV3IEJ1bGxldCh7XG4gICAgICAgICAgICB4OiB0aGlzLm93bmVyLngsXG4gICAgICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgICAgICB0YXJnZXRYOiB0aGlzLm93bmVyLm1vdXNlWCxcbiAgICAgICAgICAgIHRhcmdldFk6IHRoaXMub3duZXIubW91c2VZLFxuICAgICAgICAgICAgZGlyZWN0aW9uOmRpcmVjdGlvbixcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgQnVsbGV0KHtcbiAgICAgICAgLy8gICAgIHg6IHRoaXMub3duZXIueCxcbiAgICAgICAgLy8gICAgIHk6IHRoaXMub3duZXIueSxcbiAgICAgICAgLy8gICAgIHRhcmdldFg6IHRoaXMub3duZXIubW91c2VYLFxuICAgICAgICAvLyAgICAgdGFyZ2V0WTogdGhpcy5vd25lci5tb3VzZVksXG4gICAgICAgIC8vICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgLy8gICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICAvLyAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgICAgICAvLyB9KSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyhcIkZJUkVcIiwgYWN0aW9uLCBkaXJlY3Rpb25zKTtcbiAgICBhY3Rpb24uZGF0YS5kaXJlY3Rpb25zID0gZGlyZWN0aW9ucztcblxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvdGd1bjtcbiIsInZhciBCdWxsZXQgPSByZXF1aXJlKFwiLi4vLi9CdWxsZXQyXCIpO1xuXG5jbGFzcyBXZWFwb257XG4gICAgY29uc3RydWN0b3Iob3duZXIsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5vd25lciA9IG93bmVyO1xuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgIHRoaXMubWFnYXppbmVTaXplID0gZGF0YS5tYWdhemluZVNpemU7XG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IGRhdGEuYnVsbGV0cztcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IGRhdGEuZmlyZVJhdGU7XG4gICAgICAgIHRoaXMuZGFtYWdlID0gZGF0YS5kYW1hZ2U7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZSA9IGRhdGEucmVsb2FkVGltZTtcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XG4gICAgICAgIHRoaXMuYnVsbGV0c1BlclNob3QgPSBkYXRhLmJ1bGxldHNQZXJTaG90O1xuICAgICAgICB0aGlzLnN4ID0gZGF0YS5zeDtcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XG5cbiAgICAgICAgdGhpcy5pY29uU3ggPSBkYXRhLmljb25TeDtcbiAgICAgICAgdGhpcy5pY29uU3kgPSBkYXRhLmljb25TeTtcbiAgICAgICAgdGhpcy5pY29uVyA9IGRhdGEuaWNvblc7XG4gICAgICAgIHRoaXMuaWNvbkggPSBkYXRhLmljb25IO1xuXG4gICAgICAgIHRoaXMuZmlyZVRpbWVyID0gdGhpcy5maXJlUmF0ZTtcblxuICAgICAgICB0aGlzLnJlbG9hZGluZyA9IGRhdGEucmVsb2FkaW5nIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyID0gZGF0YS5yZWxvYWRUaW1lciB8fCAwO1xuICAgIH1cbn1cblxuV2VhcG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUpIHRoaXMuZmlyZVRpbWVyICs9IGR0O1xuXG4gICAgaWYgKHRoaXMucmVsb2FkaW5nKSB7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZXIgKz0gZHQ7XG4gICAgICAgIGlmICh0aGlzLnJlbG9hZFRpbWVyID4gdGhpcy5yZWxvYWRUaW1lKXtcbiAgICAgICAgICAgIHRoaXMuZmlsbE1hZ2F6aW5lKCk7XG4gICAgICAgICAgICB0aGlzLnN0b3BSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5idWxsZXRzIC09IHRoaXMuYnVsbGV0c1BlclNob3Q7XG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xuXG4gICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoe1xuICAgICAgICB4OiB0aGlzLm93bmVyLngsXG4gICAgICAgIHk6IHRoaXMub3duZXIueSxcbiAgICAgICAgdGFyZ2V0WDogdGhpcy5vd25lci5tb3VzZVgsXG4gICAgICAgIHRhcmdldFk6IHRoaXMub3duZXIubW91c2VZLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMub3duZXIuZGlyZWN0aW9uLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy5yZWxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMucmVsb2FkVGltZXIgPSAwO1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmZpbGxNYWdhemluZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYnVsbGV0cyA9IHRoaXMubWFnYXppbmVTaXplO1xufTtcblxuV2VhcG9uLnByb3RvdHlwZS5zdG9wUmVsb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZWxvYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIGJ1bGxldHM6IHRoaXMuYnVsbGV0cyxcbiAgICAgICAgZmlyZVRpbWVyOiB0aGlzLmZpcmVSYXRlLFxuICAgICAgICByZWxvYWRpbmc6IHRoaXMucmVsb2FkaW5nLFxuICAgICAgICByZWxvYWRUaW1lcjogdGhpcy5yZWxvYWRUaW1lclxuICAgIH07XG59O1xubW9kdWxlLmV4cG9ydHMgPSBXZWFwb247XG4iLCJ2YXIgU2hvdGd1biA9IHJlcXVpcmUoXCIuLi8uL3dlYXBvbnMvU2hvdGd1blwiKTtcclxudmFyIEFrNDcgPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL0FrNDdcIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKTtcclxuXHJcbmZ1bmN0aW9uIHdlYXBvbkNyZWF0b3Iob3duZXIsIGRhdGEpIHtcclxuXHJcbiAgICB2YXIgd2VwRGF0YSA9IHdlYXBvbkRhdGFbZGF0YS5uYW1lXTtcclxuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7IHdlcERhdGFba2V5XSA9IGRhdGFba2V5XTsgfVxyXG5cclxuICAgIHN3aXRjaCAoZGF0YS5uYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIkFrNDdcIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBBazQ3KG93bmVyLCB3ZXBEYXRhKTtcclxuICAgICAgICBjYXNlIFwic2hvdGd1blwiOlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNob3RndW4ob3duZXIsIHdlcERhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdlYXBvbkNyZWF0b3I7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gdmFyIFBsYXllciA9IHJlcXVpcmUoXCIuLy4uL1BsYXllclwiKTtcblxuZnVuY3Rpb24gQ2xpZW50KElEKXtcbiAgICAvL3RoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XG4gICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoSUQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsIHBvcnQ6IHdpbmRvdy5sb2NhdGlvbi5wb3J0LCBwYXRoOiBcIi9wZWVyXCJ9KTtcblxuICAgIC8vIFN0cmVzcyB0ZXN0XG4gICAgdGhpcy50ZXN0c1JlY2VpdmVkID0gMDtcblxuICAgIHRoaXMuYWN0aW9ucyA9IFtdOy8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBhY3Rpb25zIGZyb20gdGhlIGhvc3RcbiAgICB0aGlzLmNoYW5nZXMgPSBbXTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGNoYW5nZXMgZnJvbSB0aGUgaG9zdFxuXG4gICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAvLyBpdmUgZ290IG15IHBlZXJJRCBhbmQgZ2FtZUlELCBsZXRzIHNlbmQgaXQgdG8gdGhlIHNlcnZlciB0byBqb2luIHRoZSBob3N0XG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuc29ja2V0LmVtaXQoXCJqb2luXCIsIHtwZWVySUQ6IGlkLCBnYW1lSUQ6IHdpbmRvdy5nYW1lLmdhbWVJRH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNsaWVudCBwZWVySUQgaXMgXCIsIGlkKTtcblxuICAgICAgICBpZiAoIXdpbmRvdy5nYW1lLnN0YXJ0ZWQpIHdpbmRvdy5nYW1lLnN0YXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cblxuICAgICAgICAvLyBjbG9zZSBvdXQgYW55IG9sZCBjb25uZWN0aW9uc1xuICAgICAgICBpZihPYmplY3Qua2V5cyh0aGlzLmNvbm5lY3Rpb25zKS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGNvbm5QZWVyIGluIHRoaXMuY29ubmVjdGlvbnMpe1xuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdWzBdLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVsZXRlIG9sZCBob3N0cyBwbGF5ZXIgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJkZWxldGUgb2xkIHBsYXllclwiLCBjb25uUGVlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBpdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcblxuICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckpvaW5lZFwiOlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSBcInBsYXllckxlZnRcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC8vd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLmlkfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5nYW1lU3RhdGUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImdhbWVTdGF0ZVVwZGF0ZVwiOlxuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbbmV3U3RhdGUuaWRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXRzIG15IG93biBzdGF0ZSwgd2UgaWdub3JlIGtleXN0YXRlIGFuZCBvdGhlciBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBsYXllci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBwbGF5ZXIueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHA6IG5ld1N0YXRlLmhwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGl2ZTogbmV3U3RhdGUuYWxpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLnVwZGF0ZVN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImNoYW5nZXNcIjogLy8gY2hhbmdlcyBhbmQgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcyA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMuY29uY2F0KGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucyA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMuY29uY2F0KGRhdGEuYWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjogLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgICAgICAgICAgICAgICAgIGRhdGEucGluZ3MuZm9yRWFjaChmdW5jdGlvbihwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3BpbmcuaWRdLnBpbmcgPSBwaW5nLnBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdLnBpbmc7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh3aW5kb3cuZ2FtZS5wbGF5ZXJzKTtcbiAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbGN1bGF0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9KTtcbn1cblxuQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIGlmICghcGxheWVyKSByZXR1cm47XG5cbiAgICB2YXIgY3VycmVudFN0YXRlID0gcGxheWVyLmdldENsaWVudFN0YXRlKCk7XG4gICAgdmFyIGxhc3RDbGllbnRTdGF0ZSA9IHBsYXllci5sYXN0Q2xpZW50U3RhdGU7XG4gICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdENsaWVudFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG5cbiAgICAvLyBhZGQgYW55IHBlcmZvcm1lZCBhY3Rpb25zIHRvIGNoYW5nZSBwYWNrYWdlXG4gICAgaWYgKHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlcywgc2VuZCBlbSB0byBob3N0XG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAgICAgICAgIGV2ZW50OiBcIm5ldHdvcmtVcGRhdGVcIixcbiAgICAgICAgICAgIHVwZGF0ZXM6IGNoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGxheWVyLmxhc3RDbGllbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZTtcblxuXG5cblxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldO1xuXG4gICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgICAgICBpZiAoY2hhbmdlLmlkICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLmlkXS5uZXR3b3JrVXBkYXRlKGNoYW5nZSk7XG4gICAgICAgICAgICB9Y2F0Y2ggKGVycikge1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hhbmdlcyA9IFtdO1xuICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG5cblxuXG4gICAgLy8gLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICAvLyB2YXIgbXlQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgLy8gaWYgKCFteVBsYXllcikgcmV0dXJuO1xuICAgIC8vXG4gICAgLy8gIGlmICghXy5pc0VxdWFsKG15UGxheWVyLmtleXMsIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSkpIHtcbiAgICAvLyAgICAgLy8gc2VuZCBrZXlzdGF0ZSB0byBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImtleXNcIixcbiAgICAvLyAgICAgICAgIGtleXM6IG15UGxheWVyLmtleXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gIH1cbiAgICAvLyBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUgPSBfLmNsb25lKG15UGxheWVyLmtleXMpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG4gICAgLy9cbiAgICAvLyB2YXIgY3VycmVudFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIC8vIHZhciBjaGFuZ2VzID0gW107XG4gICAgLy8gdmFyIGxhc3RTdGF0ZSA9IG15UGxheWVyLmxhc3RTdGF0ZTtcbiAgICAvLyB2YXIgbmV3U3RhdGUgPSBteVBsYXllci5nZXRTdGF0ZSgpO1xuICAgIC8vXG4gICAgLy8gLy8gY29tcGFyZSBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxuICAgIC8vIHZhciBjaGFuZ2UgPSBfLm9taXQobmV3U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdFN0YXRlW2tdID09PSB2OyB9KTtcbiAgICAvLyBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgLy8gICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgLy8gICAgIGNoYW5nZS5wbGF5ZXJJRCA9IG15UGxheWVyLmlkO1xuICAgIC8vICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBteVBsYXllci5sYXN0U3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAvLyAvLyBpZiB0aGVyZSBhcmUgY2hhbmdlc1xuICAgIC8vIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgLy8gICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAvLyBzZW5kIGFsbCBwZXJmb3JtZWQgYWN0aW9ucyB0byB0aGUgaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJhY3Rpb25zXCIsXG4gICAgLy8gICAgICAgICBkYXRhOiB0aGlzLmFjdGlvbnNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBjbGVhciBhY3Rpb25zIHF1ZXVlXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY2hhbmdlc1tpXS5sZW5ndGg7IGogKz0gMSkgIHtcbiAgICAvLyAgICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXVtqXTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgLy8gICAgICAgICBpZiAoY2hhbmdlLnBsYXllcklEICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5wbGF5ZXJJRF0uY2hhbmdlKGNoYW5nZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB0aGlzLmNoYW5nZXMgPSBbXTtcblxufTtcblxuICAgIC8vXG4gICAgLy8gdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgLy8gICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Rpb24gZnJvbSBzZXJ2ZXJcIiwgdGhpcy5wZWVyLCBjb25uKTtcbiAgICAvL1xuICAgIC8vICAgICAvL2NyZWF0ZSB0aGUgcGxheWVyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKGNvbm4ucGVlcik7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvL0xpc3RlbiBmb3IgZGF0YSBldmVudHMgZnJvbSB0aGUgaG9zdFxuICAgIC8vICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAvLyAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgIC8vICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgIC8vICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy8gcGluZyB0ZXN0XG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAvLyAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9LCAyMDAwKTtcbiAgICAvL1xuICAgIC8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSG9zdCgpe1xuICAgIHRoaXMuY29ubnMgPSB7fTtcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIGFsbCB0aGUgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGNsaWVudHNcbiAgICB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICB0aGlzLmRpZmYgPSBudWxsO1xuXG4gICAgdGhpcy5jb25uZWN0ID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIC8vdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcbiAgICAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoZGF0YS5ob3N0SUQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsIHBvcnQ6IHdpbmRvdy5sb2NhdGlvbi5wb3J0LCBwYXRoOiBcIi9wZWVyXCJ9KTtcblxuICAgICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGhvc3RzIHBsYXllciBvYmplY3QgaWYgaXQgZG9lc250IGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBpZiAoISh3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkIGluIHdpbmRvdy5nYW1lLnBsYXllcnMpKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZW5kIGEgcGluZyBldmVyeSAyIHNlY29uZHMsIHRvIHRyYWNrIHBpbmcgdGltZVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgIHBpbmdzOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZ2V0UGluZ3MoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwyMDAwKTtcblxuICAgICAgICAgICAgLy8gc2VuZCBmdWxsIGdhbWUgc3RhdGUgb25jZSBpbiBhIHdoaWxlXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgICAgICBldmVudDogXCJnYW1lU3RhdGVVcGRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwxMDAwKTtcblxuICAgICAgICAgICAgZGF0YS5wZWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBlZXJJRCkge1xuICAgICAgICAgICAgICAgIC8vY29ubmVjdCB3aXRoIGVhY2ggcmVtb3RlIHBlZXJcbiAgICAgICAgICAgICAgICB2YXIgY29ubiA9ICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5jb25uZWN0KHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJob3N0SUQ6XCIsIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmlkLCBcIiBjb25uZWN0IHdpdGhcIiwgcGVlcklEKTtcbiAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1twZWVySURdID0gcGVlcjtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbcGVlcklEXSA9IGNvbm47XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHBsYXllclxuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIG5ldyBwbGF5ZXIgZGF0YSB0byBldmVyeW9uZVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IG5ld1BsYXllci5nZXRGdWxsU3RhdGUoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgdGhlIG5ldyBwbGF5ZXIgdGhlIGZ1bGwgZ2FtZSBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmVtaXQoIHtjbGllbnRJRDogY29ubi5wZWVyLCBldmVudDogXCJnYW1lU3RhdGVcIiwgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKX0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW2Nvbm4ucGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImVycm9yXCIsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkVSUk9SIEVWRU5UXCIsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7IC8vIGFuc3dlciB0aGUgcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGNsaWVudCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJuZXR3b3JrVXBkYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGZyb20gYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ubmV0d29ya1VwZGF0ZShkYXRhLnVwZGF0ZXMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhLmFjdGlvbnMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiYWN0aW9uc1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImFjdGlvbnMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJjaGFuZ2VzXCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcIkhleSB0aGVyZSBoYXMgYmVlbiBjaGFuZ2VzIVwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5jaGFuZ2UoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwia2V5c1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImtleXMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEua2V5cywgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyA9IF8uY2xvbmUoZGF0YS5rZXlzKTsgLy9UT0RPOiB2ZXJpZnkgaW5wdXQgKGNoZWNrIHRoYXQgaXQgaXMgdGhlIGtleSBvYmplY3Qgd2l0aCB0cnVlL2ZhbHNlIHZhbHVlcylcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xuICAgICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGp1c3Qgc2VuZCBkYXRhIHRvIGEgc3BlY2lmaWMgY2xpZW50XG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVNSVQhXCIsIGRhdGEpO1xuICAgICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuXG4gICAgICAgIHZhciBjaGFuZ2VzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICB2YXIgY3VycmVudEZ1bGxTdGF0ZSA9IHBsYXllci5nZXRGdWxsU3RhdGUoKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudEZ1bGxTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBwbGF5ZXIubGFzdEZ1bGxTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSB8fCBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7IC8vdGhlcmUncyBiZWVuIGNoYW5nZXMgb3IgYWN0aW9uc1xuICAgICAgICAgICAgICAgIGNoYW5nZS5pZCA9IHBsYXllci5pZDtcbiAgICAgICAgICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIHBsYXllci5sYXN0RnVsbFN0YXRlID0gY3VycmVudEZ1bGxTdGF0ZTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAvLyBzZW5kIGNoYW5nZXNcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIHRoaXMuZ2V0UGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBpbmdzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgcGluZ3MucHVzaCh7aWQ6IHBsYXllci5pZCwgcGluZzogcGxheWVyLnBpbmcgfHwgXCJob3N0XCJ9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwaW5ncztcbiAgICB9O1xufTtcbiIsInZhciBDbGllbnQgPSByZXF1aXJlKFwiLi9DbGllbnRcIik7XHJcbnZhciBIb3N0ID0gcmVxdWlyZShcIi4vSG9zdFwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gV2ViUlRDKCl7XHJcbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8oKTtcclxuXHJcbiAgICAvLyByZWNlaXZpbmcgbXkgY2xpZW50IElEXHJcbiAgICB0aGlzLnNvY2tldC5vbihcIklEXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudCA9IG5ldyBDbGllbnQoZGF0YS5JRCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInlvdUFyZUhvc3RcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW0gdGhlIGhvc3RcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0ID0gbmV3IEhvc3QoKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdCh7aG9zdElEOiBkYXRhLmhvc3RJRCwgcGVlcnM6IGRhdGEucGVlcnN9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVySm9pbmVkXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInBsYXllciBqb2luZWRcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3Qoe2hvc3RJRDogZGF0YS5ob3N0SUQsIHBlZXJzOltkYXRhLnBlZXJJRF19KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQTEFZRVIgTEVGVFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLnBsYXllcklEfSk7XHJcbiAgICB9KTtcclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbZGF0YS5pZF07XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
