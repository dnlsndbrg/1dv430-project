(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var helpers = require("./helpers");
//var Emitter = require("./particle/Emitter");
var collisionDetection = require("./util/collisionDetection");
var BulletHole = require("./particle/BulletHole");
var bresenham = require("./util/bresenham");
var Flash = require("./particle/Flash");

function Bullet(data) {


    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    this.x = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    this.y = data.y + Math.sin(data.direction + 1.5707963268) * 5;

    this.x = this.x + Math.cos(data.direction) * 30;
    this.y = this.y + Math.sin(data.direction) * 30;

    this.originX = this.x; // remember the starting position
    this.originY = this.y;

    // create muzzle flashes
    var size = Math.floor(Math.random() * 3) + 3;
    window.game.particles.push(new Flash({x: this.x, y: this.y, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    var smallFlashX = this.x + Math.cos(data.direction) *  (Math.floor(Math.random() * 2) + 3);
    var smallFlashY= this.y + Math.sin(data.direction) *  (Math.floor(Math.random() * 2) + 3);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 1;
    smallFlashX = this.x + Math.cos(data.direction) *  (Math.floor(Math.random() * 2) + 8);
    smallFlashY= this.y + Math.sin(data.direction) *  (Math.floor(Math.random() * 2) + 8);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    smallFlashX = this.x + Math.cos(data.direction) *  (Math.floor(Math.random() * 2) + 5);
    smallFlashY= this.y + Math.sin(data.direction) *  (Math.floor(Math.random() * 2) + 5);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    smallFlashX = this.x + Math.cos(data.direction + 1.5707963268) *  (Math.floor(Math.random() * 2) + 3);
    smallFlashY = this.y + Math.sin(data.direction + 1.5707963268) *  (Math.floor(Math.random() * 2) + 3);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));
    size = Math.floor(Math.random() * 2) + 2;
    smallFlashX = this.x + Math.cos(data.direction + 1.5707963268) * - (Math.floor(Math.random() * 2) + 3);
    smallFlashY = this.y + Math.sin(data.direction + 1.5707963268) * - (Math.floor(Math.random() * 2) + 3);
    window.game.particles.push(new Flash({x: smallFlashX, y: smallFlashY, size: size, container: window.game.particles}));


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
    createjs.Sound.registerSound("./../audio/ak.ogg", "ak");
    createjs.Sound.registerSound("./../audio/ak-reload.ogg", "ak-reload");
    createjs.Sound.registerSound("./../audio/shotgun.ogg", "shotgun");
    createjs.Sound.registerSound("./../audio/shotgun-reload.ogg", "shotgun-reload");
    createjs.Sound.registerSound("./../audio/empty.ogg", "empty");
    createjs.Sound.registerSound("./../audio/hit1.ogg", "hit1");
    createjs.Sound.registerSound("./../audio/hit2.ogg", "hit2");
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


        //this.ui.renderDebug();
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


    Object.defineProperty(this, "alive",{
             "get": function() { return this.__alive; },
             "set": function(newValue) {
                 if (newValue === false && this.alive !== false && window.game.myPlayerID === this.id) {
                     // I just died. show death screen
                     var bg = new UiRect(0,0,window.game.canvas.width, window.game.canvas.height, "rgba(0,0,0,0.8)");
                     var text = new UiText({text: "YOU HAVE DIED!", fontSize: 18, x: 250, y: window.game.canvas.height / 2 - 20});
                     var button = new UiButton({text: "RESPAWN", fontSize: 24, x: window.game.canvas.width / 2 - 63, y: window.game.canvas.height / 2, w: 130, h: 40, clickFunction: this.wantToRespawn, context: this});
                     window.game.uiElements = [bg, text, button];
                 } else if ( newValue === true && !this.alive && window.game.myPlayerID === this.id) {
                     // clear ui of buttons
                     window.game.uiElements = [];
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

    // document.querySelector("#respawnBtn").addEventListener("click", function() {
    //     var player = window.game.players[window.game.network.client.peer.id];
    //
    //     if (!player.alive) {
    //
    //         // var spawnLocationFound = false;
    //         // var x;
    //         // var y;
    //         // while (!spawnLocationFound) {
    //         //     x = (Math.floor(Math.random() * (window.game.level.width - player.radius)) + player.radius / 2);
    //         //     y = (Math.floor(Math.random() * (window.game.level.height - player.radius)) + player.radius / 2);
    //         //
    //         //     if (helpers.collisionCheck({x: x, y: y})) spawnLocationFound = true;
    //         // }
    //
    //
    //         player.actions.push({ // add to the actions queue
    //             action: "respawn",
    //             data: helpers.findSpawnLocation()
    //         });
    //     }
    // });

    // document.querySelector("#reloadBtn").addEventListener("click", function() {
    //     var player = window.game.players[window.game.network.client.peer.id];
    //     if (player.alive) {
    //         player.actions.push({ // add to the actions queue
    //             action: "reload",
    //         });
    //     }
    //     // if (!player.alive) {
    //     //     var x = (Math.floor(Math.random() * (window.game.level.width - player.radius)) + player.radius / 2);
    //     //     var y = (Math.floor(Math.random() * (window.game.level.height - player.radius)) + player.radius / 2);
    //     //
    //     //     player.actions.push({ // add to the actions queue
    //     //         action: "respawn",
    //     //         data: {
    //     //             x: x,
    //     //             y: y
    //     //         }
    //     //     });
    //     // }
    // });
    //
    //
    //     document.querySelector("#emitterBtn").addEventListener("click", function() {
    //         var player = window.game.players[window.game.network.client.peer.id];
    //         window.game.entities.push(new Emitter({
    //             type: "Blood2",
    //             emitCount: 10,
    //             emitSpeed: null,
    //             x: player.x,
    //             y: player.y
    //         }));
    //     });
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

},{".././Bullet":1,"../data/weapons":17,"./Weapon":34}],34:[function(require,module,exports){
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

},{".././Bullet":1}],35:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0J1dHRvbi5qcyIsInNyYy9qcy9DYW1lcmEuanMiLCJzcmMvanMvR2FtZS5qcyIsInNyYy9qcy9LZXlib2FyZC5qcyIsInNyYy9qcy9MZXZlbC5qcyIsInNyYy9qcy9Nb3VzZS5qcyIsInNyYy9qcy9OZXR3b3JrQ29udHJvbHMuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QuanMiLCJzcmMvanMvUGFydGljbGUvQmxvb2QyLmpzIiwic3JjL2pzL1BhcnRpY2xlL0VtaXR0ZXIuanMiLCJzcmMvanMvUGFydGljbGUvUGFydGljbGUuanMiLCJzcmMvanMvUGFydGljbGUvUmljb2NoZXQuanMiLCJzcmMvanMvUGxheWVyLmpzIiwic3JjL2pzL1VpLmpzIiwic3JjL2pzL2RhdGEvbGV2ZWwxLmpzIiwic3JjL2pzL2RhdGEvd2VhcG9ucy5qcyIsInNyYy9qcy9oZWxwZXJzLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvcGFydGljbGUvQnVsbGV0SG9sZS5qcyIsInNyYy9qcy9wYXJ0aWNsZS9GbGFzaC5qcyIsInNyYy9qcy91aUVsZW1lbnRzL1JlY3RhbmdsZS5qcyIsInNyYy9qcy91aUVsZW1lbnRzL1RleHQuanMiLCJzcmMvanMvdXRpbC9icmVzZW5oYW0uanMiLCJzcmMvanMvdXRpbC9jb2xsaXNpb25EZXRlY3Rpb24uanMiLCJzcmMvanMvdXRpbC9pbnRlcnNlY3Rpb24uanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWFwb25zL3dlYXBvbkNyZWF0b3IuanMiLCJzcmMvanMvd2ViUlRDL0NsaWVudC5qcyIsInNyYy9qcy93ZWJSVEMvSG9zdC5qcyIsInNyYy9qcy93ZWJSVEMvV2ViUlRDLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuLy92YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgY29sbGlzaW9uRGV0ZWN0aW9uID0gcmVxdWlyZShcIi4vdXRpbC9jb2xsaXNpb25EZXRlY3Rpb25cIik7XG52YXIgQnVsbGV0SG9sZSA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0J1bGxldEhvbGVcIik7XG52YXIgYnJlc2VuaGFtID0gcmVxdWlyZShcIi4vdXRpbC9icmVzZW5oYW1cIik7XG52YXIgRmxhc2ggPSByZXF1aXJlKFwiLi9wYXJ0aWNsZS9GbGFzaFwiKTtcblxuZnVuY3Rpb24gQnVsbGV0KGRhdGEpIHtcblxuXG4gICAgLy8gY3JlYXRlIHRoZSBidWxsZXQgNSBwaXhlbHMgdG8gdGhlIHJpZ2h0IGFuZCAzMCBwaXhlbHMgZm9yd2FyZC4gc28gaXQgYWxpZ25zIHdpdGggdGhlIGd1biBiYXJyZWxcbiAgICB0aGlzLnggPSBkYXRhLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xuICAgIHRoaXMueSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XG5cbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAzMDtcblxuICAgIHRoaXMub3JpZ2luWCA9IHRoaXMueDsgLy8gcmVtZW1iZXIgdGhlIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgdGhpcy5vcmlnaW5ZID0gdGhpcy55O1xuXG4gICAgLy8gY3JlYXRlIG11enpsZSBmbGFzaGVzXG4gICAgdmFyIHNpemUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSArIDM7XG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEZsYXNoKHt4OiB0aGlzLngsIHk6IHRoaXMueSwgc2l6ZTogc2l6ZSwgY29udGFpbmVyOiB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXN9KSk7XG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMjtcbiAgICB2YXIgc21hbGxGbGFzaFggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMyk7XG4gICAgdmFyIHNtYWxsRmxhc2hZPSB0aGlzLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMyk7XG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEZsYXNoKHt4OiBzbWFsbEZsYXNoWCwgeTogc21hbGxGbGFzaFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xuICAgIHNpemUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDE7XG4gICAgc21hbGxGbGFzaFggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgOCk7XG4gICAgc21hbGxGbGFzaFk9IHRoaXMueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyA4KTtcbiAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgRmxhc2goe3g6IHNtYWxsRmxhc2hYLCB5OiBzbWFsbEZsYXNoWSwgc2l6ZTogc2l6ZSwgY29udGFpbmVyOiB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXN9KSk7XG4gICAgc2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMjtcbiAgICBzbWFsbEZsYXNoWCA9IHRoaXMueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uKSAqICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyA1KTtcbiAgICBzbWFsbEZsYXNoWT0gdGhpcy55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDUpO1xuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc21hbGxGbGFzaFgsIHk6IHNtYWxsRmxhc2hZLCBzaXplOiBzaXplLCBjb250YWluZXI6IHdpbmRvdy5nYW1lLnBhcnRpY2xlc30pKTtcbiAgICBzaXplID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAyO1xuICAgIHNtYWxsRmxhc2hYID0gdGhpcy54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDMpO1xuICAgIHNtYWxsRmxhc2hZID0gdGhpcy55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSArIDMpO1xuICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBGbGFzaCh7eDogc21hbGxGbGFzaFgsIHk6IHNtYWxsRmxhc2hZLCBzaXplOiBzaXplLCBjb250YWluZXI6IHdpbmRvdy5nYW1lLnBhcnRpY2xlc30pKTtcbiAgICBzaXplID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAyO1xuICAgIHNtYWxsRmxhc2hYID0gdGhpcy54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogLSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgKyAzKTtcbiAgICBzbWFsbEZsYXNoWSA9IHRoaXMueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIC0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpICsgMyk7XG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEZsYXNoKHt4OiBzbWFsbEZsYXNoWCwgeTogc21hbGxGbGFzaFksIHNpemU6IHNpemUsIGNvbnRhaW5lcjogd2luZG93LmdhbWUucGFydGljbGVzfSkpO1xuXG5cbiAgICAvLyBjaGVjayB0aGF0IHRoZSBidWxsZXQgc3Bhd24gbG9jYXRpb24gaXMgaW5zaWRlIHRoZSBnYW1lXG4gICAgaWYgKCFoZWxwZXJzLmlzSW5zaWRlR2FtZSh0aGlzLngsIHRoaXMueSkpIHJldHVybjtcblxuICAgIC8vIGNoZWNrIGlmIGJ1bGxldCBzdGFydGluZyBsb2NhdGlvbiBpcyBpbnNpZGUgYSB0aWxlXG4gICAgdmFyIHRpbGVYID0gTWF0aC5mbG9vcih0aGlzLnggLyAzMik7XG4gICAgdmFyIHRpbGVZID0gTWF0aC5mbG9vcih0aGlzLnkgLyAzMik7XG4gICAgaWYgKGhlbHBlcnMuZ2V0VGlsZSh0aWxlWCx0aWxlWSkgPT09IDEpIHJldHVybjtcblxuICAgIC8vdmFyIHRhcmdldFggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAxMDsgLy8gc2hvb3Qgc3RyYWlnaHQgYWhlYWQgZnJvbSB0aGUgYmFycmVsXG4gICAgLy92YXIgdGFyZ2V0WSA9IHRoaXMueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uKSAqIDEwOyAvLyBzaG9vdCBzdHJhaWdodCBhaGVhZCBmcm9tIHRoZSBiYXJyZWxcblxuICAgIC8vdGhpcy54ID0gZGF0YS54O1xuICAgIC8vdGhpcy55ID0gZGF0YS55O1xuICAgIC8vXG4gICAgLy8gdmFyIHhEaWZmID0gZGF0YS50YXJnZXRYIC0gdGhpcy54O1xuICAgIC8vIHZhciB5RGlmZiA9IGRhdGEudGFyZ2V0WSAtIHRoaXMueTtcbiAgICAvLyB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKTtcblxuICAgIHRoaXMubGVuZ3RoID0gMTA7IC8vIHRyYWlsIGxlbmd0aFxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XG4gICAgdGhpcy5zcGVlZCA9IGRhdGEuc3BlZWQ7XG4gICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaCh0aGlzKTtcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcblxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICAvL1xuICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xuXG4gICAgLy8gaGl0IGNoZWNrIGFnYWluc3QgcGxheWVyc1xuICAgIC8vdGhpcy5oaXREZXRlY3Rpb24oaW5kZXgpO1xuXG5cblxuICAgIHZhciBsaW5lID0ge1xuICAgICAgICBzdGFydDoge3g6IHRoaXMub3JpZ2luWCwgeTogdGhpcy5vcmlnaW5ZfSxcbiAgICAgICAgZW5kOiB7eDogdGhpcy54LCB5OiB0aGlzLnl9XG4gICAgfTtcblxuXG4gICAgLy9jb25zb2xlLmxvZyhsaW5lLnN0YXJ0LngsIGxpbmUuc3RhcnQueSwgbGluZS5lbmQueCwgbGluZS5lbmQueSk7XG4gICAgdmFyIGludGVyc2VjdCA9IG51bGw7XG5cbiAgICB2YXIgY29sbGlzaW9uID0gYnJlc2VuaGFtKHRoaXMub3JpZ2luWCwgdGhpcy5vcmlnaW5ZLCB0aGlzLngsIHRoaXMueSwgZmFsc2UpOyAvLyBmaW5kIGNvbGxpZGluZyByZWN0YW5nbGVzXG5cblxuICAgIGlmIChjb2xsaXNpb24pIHtcbiAgICAgICAgc3dpdGNoKGNvbGxpc2lvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidGlsZVwiOlxuICAgICAgICAgICAgICAgIGludGVyc2VjdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5saW5lUmVjdEludGVyc2VjdDIobGluZSwge3g6IGNvbGxpc2lvbi54ICogMzIsIHk6IGNvbGxpc2lvbi55ICogMzIsIHc6IDMyLCBoOiAzMn0pO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCdWxsZXRIb2xlKGludGVyc2VjdCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBcInBsYXllclwiOlxuICAgICAgICAgICAgICAgIGNvbGxpc2lvbi5wbGF5ZXIudGFrZURhbWFnZSh0aGlzLmRhbWFnZSwgdGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBcIm91dHNpZGVcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW5YID0gdGhpcy54O1xuICAgIHRoaXMub3JpZ2luWSA9IHRoaXMueTtcblxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uIGFnYWluc3QgdGlsZXMgYW5kIG91dHNpZGUgb2YgbWFwXG4gICAgLy8gdmFyIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KTtcbiAgICAvLyBpZiAoIWNvbGxpc2lvbikge1xuICAgIC8vICAgICB0aGlzLnggPSB4O1xuICAgIC8vICAgICB0aGlzLnkgPSB5O1xuICAgIC8vIH0gZWxzZSB7XG4gICAgLy8gICAgIC8vIGFkZCByaWNob2NldCBwYXJ0aWNsZSBlZmZlY3RcbiAgICAvLyAgICAgLy8gd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgLy8gICAgIC8vICAgICB0eXBlOiBcIlJpY29jaGV0XCIsXG4gICAgLy8gICAgIC8vICAgICBlbWl0Q291bnQ6IDEsXG4gICAgLy8gICAgIC8vICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgIC8vICAgICAvLyAgICAgeDogdGhpcy54LFxuICAgIC8vICAgICAvLyAgICAgeTogdGhpcy55XG4gICAgLy8gICAgIC8vIH0pKTtcbiAgICAvL1xuICAgIC8vICAgICAvLyBmaW5kIHdoZXJlIHRoZSBidWxsZXQgdHJhamVjdG9yeSBpbnRlcnNlY3RlZCB3aXRoIHRoZSBjb2xsaWRpbmcgcmVjdFxuICAgIC8vXG4gICAgLy8gICAgIHZhciBsaW5lID0ge3N0YXJ0OiB7eDogdGhpcy5vcmlnaW5YLCB5OiB0aGlzLm9yaWdpbll9LCBlbmQ6IHt4OiB4LCB5Onl9fTsgLy8gdGhlIGxpbmUgdGhhdCBnb2VzIGZyb20gdGhlIGJ1bGxldCBvcmlnaW4gcG9zaXRpb24gdG8gaXRzIGN1cnJlbnQgcG9zaXRpb25cbiAgICAvLyAgICAgdmFyIHJlY3QgPSBoZWxwZXJzLmdldFJlY3RGcm9tUG9pbnQoe3g6IHgsIHk6IHl9KTsgLy8gcmVjdCBvZiB0aGUgY29sbGlkaW5nIGJveFxuICAgIC8vICAgICB2YXIgcG9zID0gY29sbGlzaW9uRGV0ZWN0aW9uLmxpbmVSZWN0SW50ZXJzZWN0KGxpbmUsIHJlY3QpO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY29uc29sZS5sb2cocG9zKTtcbiAgICAvL1xuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQnVsbGV0SG9sZShwb3MpKTtcbiAgICAvL1xuICAgIC8vICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgIC8vIH1cbiAgICAvLyAvL1xuICAgIC8vIC8vIC8vIGlmIG9mZiBzY3JlZW4sIHJlbW92ZSBpdFxuICAgIC8vIC8vIGlmICh0aGlzLnggPCAwIHx8IHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIHx8IHRoaXMueSA8IDAgfHwgdGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB7XG4gICAgLy8gLy8gICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgLy8gLy8gICAgIHJldHVybjtcbiAgICAvLyAvLyB9XG4gICAgLy8gLy9cblxuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlLmhpdERldGVjdGlvbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgLy8gdGVzdCBidWxsZXQgYWdhaW5zdCBhbGwgcGxheWVyc1xuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG5cbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcblxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XG5cbiAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcbiAgICAgICAgdmFyIGIgPSB0aGlzLnkgLSBwbGF5ZXIueTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBhKmEgKyBiKmIgKTtcblxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBwbGF5ZXIucmFkaXVzKSB7XG4gICAgICAgICAgICAvLyBoaXRcbiAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKHRoaXMuZGFtYWdlLCB0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uIC0gMC43ODUzOTgxNjM0KTsgLy8gcm90YXRlXG5cbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxuICAgIHZhciBncmFkPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2JhKDI1NSwxNjUsMCwwLjQpXCIpO1xuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwieWVsbG93XCIpO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKDAsIDApO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcblxuXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgICAvL1xuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcbiAgICAvLyBjdHgubW92ZVRvKDAsMCk7XG4gICAgLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcblxuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCwgMSwgMSApO1xuXG5cbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcbiAgICAvLyB2YXIgZ3JhZD0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgxLCBcImdyZWVuXCIpO1xuICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5tb3ZlVG8oMCwwKTtcbiAgICAvLyBjdHgubGluZVRvKDAsbGVuZ3RoKTtcbiAgICAvLyBjdHguc3Ryb2tlKCk7XG5cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcbiIsImZ1bmN0aW9uIEJ1dHRvbihkYXRhKSB7XHJcbiAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XHJcbiAgICB0aGlzLmZvbnRTaXplID0gZGF0YS5mb250U2l6ZTtcclxuICAgIC8vIHRoaXMueCA9IGRhdGEueDtcclxuICAgIC8vIHRoaXMueSA9IGRhdGEueTtcclxuICAgIC8vIHRoaXMudyA9IGRhdGEudztcclxuICAgIC8vIHRoaXMuaCA9IGRhdGEuaDtcclxuXHJcbiAgICB0aGlzLnJlY3QgPSB7IHg6IGRhdGEueCwgeTogZGF0YS55LCB3OiBkYXRhLncsIGg6IGRhdGEuaCB9O1xyXG5cclxuICAgIHRoaXMuY29udGV4dCA9IGRhdGEuY29udGV4dDtcclxuICAgIHRoaXMuY2xpY2tGdW5jdGlvbiA9IGRhdGEuY2xpY2tGdW5jdGlvbjtcclxufVxyXG5cclxuQnV0dG9uLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCh0aGlzLnJlY3QueCwgdGhpcy5yZWN0LnksIHRoaXMucmVjdC53LCB0aGlzLnJlY3QuaCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSlcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XHJcblxyXG4gICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSB0aGlzLmZvbnRTaXplICsgXCJweCBPcGVuIFNhbnNcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNkN2Q3ZDdcIjtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh0aGlzLnRleHQsIHRoaXMucmVjdC54ICsgOSwgdGhpcy5yZWN0LnkgKyAyOCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcbnZhciBOZXR3b3JrID0gcmVxdWlyZShcIi4vd2ViUlRDL1dlYlJUQ1wiKTtcbnZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi9QbGF5ZXJcIik7XG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xudmFyIExldmVsID0gcmVxdWlyZShcIi4vTGV2ZWxcIik7XG5cblxuZnVuY3Rpb24gR2FtZSgpIHtcblxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcbiAgICB0aGlzLmhlaWdodCA9IDQ4MDtcblxuICAgIC8vIExvYWQgc291bmRzXG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vYWsub2dnXCIsIFwiYWtcIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vYWstcmVsb2FkLm9nZ1wiLCBcImFrLXJlbG9hZFwiKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiLi8uLi9hdWRpby9zaG90Z3VuLm9nZ1wiLCBcInNob3RndW5cIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vc2hvdGd1bi1yZWxvYWQub2dnXCIsIFwic2hvdGd1bi1yZWxvYWRcIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vZW1wdHkub2dnXCIsIFwiZW1wdHlcIik7XG4gICAgY3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcIi4vLi4vYXVkaW8vaGl0MS5vZ2dcIiwgXCJoaXQxXCIpO1xuICAgIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXCIuLy4uL2F1ZGlvL2hpdDIub2dnXCIsIFwiaGl0MlwiKTtcbiAgICBjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFwiLi8uLi9hdWRpby9kZWF0aDEub2dnXCIsIFwiZGVhdGgxXCIpO1xuICAgIGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXCIuLy4uL2F1ZGlvL2RlYXRoMi5vZ2dcIiwgXCJkZWF0aDJcIik7XG5cbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5zcHJpdGVzaGVldC5zcmMgPSBcIi4uL2ltZy9zcHJpdGVzaGVldC5wbmdcIjtcblxuICAgIHRoaXMudGlsZXNoZWV0ID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy50aWxlc2hlZXQuc3JjID0gXCIuLi9pbWcvdGlsZXMucG5nXCI7XG5cbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMudGlsZXNoZWV0KTtcblxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICB0aGlzLmJnQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICB0aGlzLmJnQ2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICB0aGlzLmJnQ2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmJnQ2FudmFzKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHRoaXMuYmdDdHggPSB0aGlzLmJnQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjI0cHggT3BlbiBTYW5zXCI7XG5cbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XG5cbiAgICB0aGlzLnVpID0gbmV3IFVpKHRoaXMpO1xuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XG5cbiAgICB0aGlzLmVudGl0aWVzID0gW107IC8vIGdhbWUgZW50aXRpZXNcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgIHRoaXMucGxheWVycyA9IHt9O1xuICAgIHRoaXMudWlFbGVtZW50cyA9IFtdOyAvLyBob2xkcyBidXR0b25zIGV0Y1xuXG4gICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAzMDsgLy8gbnVtYmVyIG9mIHBhcnRpY2xlcyBhbGxvd2VkIG9uIHNjcmVlbiBiZWZvcmUgdGhleSBzdGFydCB0byBiZSByZW1vdmVkXG5cbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcblxuICAgIHZhciBsYXN0ID0gMDsgLy8gdGltZSB2YXJpYWJsZVxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5sb29wKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdhbWUgbG9vcFxuICAgICAqL1xuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmxvb3AuYmluZCh0aGlzKSk7IC8vIHF1ZXVlIHVwIG5leHQgbG9vcFxuXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxuICAgICAgICBsYXN0ID0gdGltZXN0YW1wO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcbiAgICAgICAgdGhpcy51cGRhdGUoZHQpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG5cblxuICAgICAgICAvLyBuZXR3b3JraW5nIHVwZGF0ZVxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5ob3N0LnVwZGF0ZShkdCk7IC8vIGlmIGltIHRoZSBob3N0IGRvIGhvc3Qgc3R1ZmZcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXG4gICAgICAgIH1cblxuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZVxuICAgICAqL1xuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xuICAgICAgICB2YXIgZHRzID0gZHQgLyAxMDAwO1xuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXG4gICAgICAgIHRoaXMuZnBzID0gTWF0aC5yb3VuZCgxMDAwIC8gZHQpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5LCBpbmRleCkge1xuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShkdHMsIGluZGV4KTsgLy9kZWx0YXRpbWUgaW4gc2Vjb25kc1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyAvLyBjYXAgbnVtYmVyIG9mIHBhcnRpY2xlc1xuICAgICAgICAvLyBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcbiAgICAgICAgLy8gICAgIHRoaXMucGFydGljbGVzID0gdGhpcy5wYXJ0aWNsZXMuc2xpY2UodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIC0gdGhpcy5tYXhQYXJ0aWNsZXMsIHRoaXMucGFydGljbGVzLmxlbmd0aCk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBVcGRhdGUgcGFydGljbGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnVwZGF0ZShkdHMsIGkpO1xuICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmFcbiAgICAgICAgLy90aGlzLmNhbWVyYS51cGRhdGUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVuZGVyaW5nXG4gICAgICovXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBjbGVhciBzY3JlZW5cbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5iZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vYmcgY29sb3JcbiAgICAgICAgdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5iZ0N0eC5yZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzViNTg1MFwiO1xuICAgICAgICB0aGlzLmJnQ3R4LmZpbGwoKTtcblxuICAgICAgICAvLyBkcmF3IHRlc3QgYmFja2dyb3VuZFxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAvLyB0aGlzLmJnQ3R4LnJlY3QoMCAtIHRoaXMuY2FtZXJhLngsIDAgLSB0aGlzLmNhbWVyYS55LCB0aGlzLmxldmVsLndpZHRoLCB0aGlzLmxldmVsLmhlaWdodCk7XG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjODU4MjdkXCI7XG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbCgpO1xuXG4gICAgICAgIHRoaXMubGV2ZWwucmVuZGVyKHRoaXMuYmdDdHgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBhbGwgZW50aXRpZXNcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xuICAgICAgICAgICAgZW50aXR5LnJlbmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZW5kZXIgcGFydGljbGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51aS5yZW5kZXJVSSgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBidXR0b25zIGV0Y1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgd2luZG93LmdhbWUudWlFbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgd2luZG93LmdhbWUudWlFbGVtZW50c1tpXS5yZW5kZXIoKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy90aGlzLnVpLnJlbmRlckRlYnVnKCk7XG4gICAgICAgIC8vIHJlbmRlciBmcHMgYW5kIHBpbmdcblxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQ0FNRVJBOiBYOlwiICsgdGhpcy5jYW1lcmEueCwgXCJcXG5ZOlwiICsgdGhpcy5jYW1lcmEueSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5wbGF5ZXJzW3RoaXMubmV0d29yay5jbGllbnQucGVlci5pZF0pO1xuICAgIH07XG59XG5cbkdhbWUucHJvdG90eXBlLmFkZFBsYXllciA9IGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxuICAgIGlmKGRhdGEuaWQgaW4gdGhpcy5wbGF5ZXJzKSByZXR1cm47XG5cbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcbiAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3UGxheWVyKTtcbiAgICB0aGlzLnBsYXllcnNbZGF0YS5pZF0gPSBuZXdQbGF5ZXI7XG5cbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcblxuICAgIHJldHVybiBuZXdQbGF5ZXI7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJnYW1lIHJlbW92aW5nIHBsYXllclwiLCBkYXRhKTtcblxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XG4gICAgZGVsZXRlIHRoaXMucGxheWVyc1tkYXRhLmlkXTtcblxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMuZW50aXRpZXNbaV0uaWQgPT09IGRhdGEuaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBlbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcbiAgICAgICAgLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShlbnRpdHkpO1xuICAgICAgICAvLyB9KSxcbiAgICAgICAgLy9lbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XG4gICAgICAgIC8vICAgIHJldHVybiBlbnRpdHkuZ2V0RnVsbFN0YXRlKCk7ICAgICAgICB9KSxcbiAgICAgICAgLy9wbGF5ZXJzOiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkod2luZG93LmdhbWUucGxheWVyc1trZXldKTsgfSlcbiAgICAgICAgcGxheWVyczogdGhpcy5nZXRQbGF5ZXJzU3RhdGUoKVxuICAgIH07XG59O1xuXG5HYW1lLnByb3RvdHlwZS5nZXRQbGF5ZXJzU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XS5nZXRGdWxsU3RhdGUoKTsgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XG4iLCJmdW5jdGlvbiBLZXlib2FyZChwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIC8vdGhpcy5sYXN0U3RhdGUgPSBfLmNsb25lKHBsYXllci5rZXlzKTtcbiAgICB0aGlzLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCAhPT0gdHJ1ZSkgIHBsYXllci5rVXA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biAhPT0gdHJ1ZSkgIHBsYXllci5rRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgIT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDk6IC8vIDFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXggPT09IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImNoYW5nZVdlYXBvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiAwLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUwOiAvLyAyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAxKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MjogLy8gUlxuICAgICAgICAgICAgICAgIC8vIHJlbG9hZCBvbmx5IGlmIHBsYXllciBpcyBhbGl2ZSBhbmQgd2VhcG9uIG1hZ2F6aW5lIGlzbnQgZnVsbFxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuYWxpdmUgJiYgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLmJ1bGxldHMgPCBwbGF5ZXIud2VhcG9uc1twbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleF0ubWFnYXppbmVTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZWxvYWRcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCA9PT0gdHJ1ZSkgcGxheWVyLmtVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biA9PT0gdHJ1ZSkgcGxheWVyLmtEb3duID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgPT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgPT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJ2YXIgbGV2ZWwxID0gcmVxdWlyZShcIi4vZGF0YS9sZXZlbDFcIik7XHJcbi8vdmFyIFRpbGUgPSByZXF1aXJlKFwiLi9UaWxlXCIpO1xyXG5cclxuZnVuY3Rpb24gTGV2ZWwodGlsZXNoZWV0KXtcclxuICAgIHRoaXMudGlsZXNoZWV0ID0gdGlsZXNoZWV0O1xyXG4gICAgdGhpcy50aWxlU2l6ZSA9IDMyO1xyXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsMTtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmxldmVsLnRpbGVzWzBdLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMubGV2ZWwudGlsZXMubGVuZ3RoICogdGhpcy50aWxlU2l6ZTtcclxuICAgIHRoaXMuY29sVGlsZUNvdW50ID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGg7XHJcbiAgICB0aGlzLnJvd1RpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXMubGVuZ3RoO1xyXG4gICAgdGhpcy5pbWFnZU51bVRpbGVzID0gMzg0IC8gdGhpcy50aWxlU2l6ZTsgIC8vIFRoZSBudW1iZXIgb2YgdGlsZXMgcGVyIHJvdyBpbiB0aGUgdGlsZXNldCBpbWFnZVxyXG5cclxuICAgIC8vIGdlbmVyYXRlIFRpbGVzXHJcblxyXG5cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY3R4KSB7XHJcblxyXG4gICAgICAgIC8vZHJhdyBhbGwgdGlsZXNcclxuICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMucm93VGlsZUNvdW50OyByb3cgKz0gMSkge1xyXG4gICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuY29sVGlsZUNvdW50OyBjb2wgKz0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5sZXZlbC50aWxlc1tyb3ddW2NvbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZVJvdyA9ICh0aWxlIC8gdGhpcy5pbWFnZU51bVRpbGVzKSB8IDA7IC8vIEJpdHdpc2UgT1Igb3BlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZUNvbCA9ICh0aWxlICUgdGhpcy5pbWFnZU51bVRpbGVzKSB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLnRpbGVzaGVldCxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZUNvbCAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgICh0aWxlUm93ICogdGhpcy50aWxlU2l6ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoKGNvbCAqIHRoaXMudGlsZVNpemUpIC0gd2luZG93LmdhbWUuY2FtZXJhLngpLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoKHJvdyAqIHRoaXMudGlsZVNpemUpIC0gd2luZG93LmdhbWUuY2FtZXJhLnkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XHJcbiIsInZhciBjb2xsaXNpb25DaGVjayA9IHJlcXVpcmUoXCIuL3V0aWwvY29sbGlzaW9uRGV0ZWN0aW9uXCIpIDtcblxuZnVuY3Rpb24gTW91c2UocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcblxuICAgIHRoaXMuY2xpY2sgPSBmdW5jdGlvbihlKXtcblxuXG4gICAgICAgIHRoaXMucGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcInNob290XCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LmdhbWUuY2FtZXJhLnkgKyBlLm9mZnNldFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5wdXNoKGFjdGlvbik7IC8vIHRlbGwgdGhlIGhvc3Qgb2YgdGhlIGFjdGlvblxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VYID0gd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFg7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWSA9IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZO1xuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG5cbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgY2xpY2tzIG9uIHVpIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aW5kb3cuZ2FtZS51aUVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gd2luZG93LmdhbWUudWlFbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50LmNsaWNrRnVuY3Rpb24pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlzaW9uQ2hlY2sucG9pbnRSZWN0KHt4OiBlLm9mZnNldFgsIHk6IGUub2Zmc2V0WX0sIGVsZW1lbnQucmVjdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xpY2tGdW5jdGlvbi5iaW5kKGVsZW1lbnQuY29udGV4dCkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLm1vdXNlTGVmdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ID09PSB0cnVlKSBwbGF5ZXIubW91c2VMZWZ0ICA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZCBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB2YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIHZhciByID0gMTUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBnID0gNTAgLSBybmQ7XHJcbiAgICAgICAgdmFyIGIgPSA1MCAtIHJuZDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwicmdiKFwiICsgciArIFwiLFwiICsgZyArIFwiLFwiICsgYiArIFwiKVwiO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMztcclxuICAgICAgICBkYXRhLmNvbnRhaW5lciA9IHdpbmRvdy5nYW1lLnBhcnRpY2xlcztcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDQwO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuQmxvb2QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuXHJcbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG5cclxuICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJsb29kO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbmNsYXNzIEJsb29kMiBleHRlbmRzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIC8vdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcbiAgICAgICAgLy8gdmFyIHIgPSAxNTA7XG4gICAgICAgIC8vIHZhciBnID0gNTA7XG4gICAgICAgIC8vIHZhciBiID0gNTA7XG5cbiAgICAgICAgZGF0YS5jb2xvciA9IFwiIzgwMjkyOVwiO1xuICAgICAgICAvL2RhdGEubGlmZVRpbWUgPSAwLjM7XG4gICAgICAgIGRhdGEuc2l6ZSA9IDM7XG4gICAgICAgIGRhdGEuY29udGFpbmVyID0gd2luZG93LmdhbWUucGFydGljbGVzO1xuICAgICAgICBkYXRhLmxpZmVUaW1lID0gMTA7XG4gICAgICAgIHN1cGVyKGRhdGEpO1xuXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xuICAgICAgICB0aGlzLnNwZWVkID0gODA7XG5cbiAgICAgICAgdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCA9IDA7XG4gICAgfVxufVxuXG5CbG9vZDIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xuXG4gICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxuICAgIH1cblxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuXG59O1xuXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG4vLyB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQmxvb2QyO1xuIiwiLy92YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIEJsb29kID0gcmVxdWlyZShcIi4vQmxvb2RcIik7XHJcbnZhciBCbG9vZDIgPSByZXF1aXJlKFwiLi9CbG9vZDJcIik7XHJcbnZhciBSaWNvY2hldCA9IHJlcXVpcmUoXCIuL1JpY29jaGV0XCIpO1xyXG5cclxuZnVuY3Rpb24gRW1pdHRlcihkYXRhKSB7XHJcbiAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGU7XHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5lbWl0U3BlZWQgPSBkYXRhLmVtaXRTcGVlZDsgLy8gc1xyXG4gICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgdGhpcy5lbWl0Q291bnQgPSBkYXRhLmVtaXRDb3VudDtcclxuICAgIHRoaXMubGlmZVRpbWUgPSBkYXRhLmxpZmVUaW1lO1xyXG4gICAgdGhpcy5saWZlVGltZXIgPSAwO1xyXG4gICAgdGhpcy5lbWl0KCk7XHJcbn1cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgZW1pdHRlcjogdGhpc1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodGhpcy50eXBlID09PSBcIkJsb29kXCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCbG9vZChkYXRhKSk7XHJcbiAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2QyXCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCbG9vZDIoZGF0YSkpO1xyXG4gICAgZWxzZSBpZiAodGhpcy50eXBlID09PSBcIlJpY29jaGV0XCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBSaWNvY2hldChkYXRhKSk7XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuICAgIC8vIC8vIHVwZGF0ZSBhbGwgcGFydGljbGVzXHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAvLyAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKGR0KTtcclxuICAgIC8vIH1cclxuXHJcblxyXG4gICAgLy8gU0VUIEVNSVRURVIgLSB0aGlzIGlzIGFuIGVtaXR0ZXIgdGhhdCBzaG91bGQgZW1pdCBhIHNldCBudW1iZXIgb2YgcGFydGljbGVzXHJcbiAgICBpZiAodGhpcy5lbWl0Q291bnQpIHtcclxuICAgICAgICBpZiAodGhpcy5lbWl0U3BlZWQpIHsgLy8gRW1pdCBhdCBhIGludGVydmFsXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdFRpbWVyICs9IGR0O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbWl0VGltZXIgPiB0aGlzLmVtaXRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5lbWl0Q291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbWl0Q291bnQgPCAxKXtcclxuICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZXN0cm95XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIEVtaXQgYWxsIGF0IG9uY2VcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7aSA8IHRoaXMuZW1pdENvdW50OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUSU1FRCBFTUlUVEVSXHJcbiAgICAvLyB1cGRhdGUgZW1pdHRlciBsaWZldGltZSAoaWYgaXQgaGFzIGEgbGlmZXRpbWUpIHJlbW92ZSBlbWl0dGVyIGlmIGl0cyB0aW1lIGhhcyBydW4gb3V0IGFuZCBpdCBoYXMgbm8gcmVtYWluaW5nIHBhcnRpY2xlc1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgICAgICBpZiAodGhpcy5saWZlVGltZXIgPiB0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDT05USU5VT1VTIEVNSVRURVJcclxuICAgIC8vIGVtaXQgbmV3IHBhcnRpY2xlcyBmb3JldmVyXHJcbiAgICB0aGlzLmVtaXRUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmVtaXRUaW1lciA+IHRoaXMuZW1pdFNwZWVkKSB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gLy8gcmVuZGVyIGFsbCBwYXJ0aWNsZXNcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIC8vICAgICB0aGlzLnBhcnRpY2xlc1tpXS5yZW5kZXIoKTtcclxuICAgIC8vIH1cclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcclxuIiwiLy92YXIgRW50aXR5ID0gcmVxdWlyZShcIi4uLy4vRW50aXR5XCIpO1xyXG5cclxuY2xhc3MgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcclxuICAgICAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICAgICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWUgPSBkYXRhLmxpZmVUaW1lO1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWVyID0gMDtcclxuICAgICAgICB0aGlzLmVtaXR0ZXIgPSBkYXRhLmVtaXR0ZXI7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkYXRhLmNvbnRhaW5lcjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gUGFydGljbGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4vLyAgICAgdGhpcy5saWZlVGltZXIgKz0gZHQ7XHJcbi8vICAgICBpZiAodGhpcy5saWZlVGltZXIgPiB0aGlzLmxpZmVUaW1lKSB7XHJcbi8vICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuLy8gICAgIH1cclxuLy8gfTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgLy90aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgtKHRoaXMuc2l6ZSAvIDIpLCAtKHRoaXMuc2l6ZSAvIDIpLCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XHJcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbn07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB0aGlzLmNvbnRhaW5lci5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHt9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZTtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBSaWNvY2hldCBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwiIzRkNGQ0ZFwiO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDE7XHJcblxyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGhlbHBlcnMudG9SYWRpYW5zKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxKTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gODA7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZURpc3RhbmNlID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE1KSArIDEpO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcblJpY29jaGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICBpZiAodGhpcy5kaXN0YW5jZU1vdmVkIDwgdGhpcy5tb3ZlRGlzdGFuY2UpIHtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZU1vdmVkICs9IGRpc3RhbmNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kaXN0YW5jZU1vdmVkID49IHRoaXMubW92ZURpc3RhbmNlKSB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmJnQ3R4OyAvLyBtb3ZlIHRvIGJhY2tncm91bmQgY3R4XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gQmxvb2RTcGxhc2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuLy8gICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbi8vICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbi8vIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSaWNvY2hldDtcclxuIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xudmFyIE1vdXNlID0gcmVxdWlyZShcIi4vTW91c2VcIik7XG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKFwiLi9LZXlib2FyZFwiKTtcbnZhciBOZXR3b3JrQ29udHJvbHMgPSByZXF1aXJlKFwiLi9OZXR3b3JrQ29udHJvbHNcIik7XG4vL3ZhciBCdWxsZXQgPSByZXF1aXJlKFwiLi9CdWxsZXRcIik7XG4vL3ZhciB3ZWFwb25zID0gcmVxdWlyZShcIi4vZGF0YS93ZWFwb25zXCIpO1xuLy92YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vd2VhcG9ucy9XZWFwb25cIik7XG52YXIgU2hvdGd1biA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvU2hvdGd1blwiKTtcbnZhciBBazQ3ID0gcmVxdWlyZShcIi4vd2VhcG9ucy9BazQ3XCIpO1xuLy92YXIgQW5pbWF0aW9uID0gcmVxdWlyZShcIi4vQW5pbWF0aW9uXCIpO1xuLy92YXIgRW50aXR5ID0gcmVxdWlyZShcIi4vRW50aXR5XCIpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKFwiLi9wYXJ0aWNsZS9FbWl0dGVyXCIpO1xudmFyIHdlYXBvbkNyZWF0b3IgPSByZXF1aXJlKFwiLi93ZWFwb25zL3dlYXBvbkNyZWF0b3JcIik7XG52YXIgVWlCdXR0b24gPSByZXF1aXJlKFwiLi9CdXR0b25cIik7XG52YXIgVWlSZWN0ID0gcmVxdWlyZShcIi4vdWlFbGVtZW50cy9SZWN0YW5nbGVcIik7XG52YXIgVWlUZXh0ID0gcmVxdWlyZShcIi4vdWlFbGVtZW50cy9UZXh0XCIpO1xuXG5cblxuZnVuY3Rpb24gUGxheWVyKHBsYXllckRhdGEpIHtcbiAgICB0aGlzLmlkID0gcGxheWVyRGF0YS5pZDtcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwOyAvLyBjaXJjbGUgcmFkaXVzXG5cbiAgICBpZiAoIXBsYXllckRhdGEueCB8fCAhcGxheWVyRGF0YS55KSB7XG4gICAgICAgIHZhciBzcGF3bkxvY2F0aW9uID0gaGVscGVycy5maW5kU3Bhd25Mb2NhdGlvbigpO1xuICAgICAgICB0aGlzLnggPSBzcGF3bkxvY2F0aW9uLng7XG4gICAgICAgIHRoaXMueSA9IHNwYXduTG9jYXRpb24ueTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLng7XG4gICAgICAgIHRoaXMueSA9IHBsYXllckRhdGEueTtcbiAgICB9XG4gICAgLy8gdGhpcy54ID0gcGxheWVyRGF0YS54IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICAvLyB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcblxuICAgIHRoaXMuZGlyZWN0aW9uID0gcGxheWVyRGF0YS5kaXJlY3Rpb24gfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDE7XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcbiAgICB0aGlzLnNwZWVkID0gcGxheWVyRGF0YS5zcGVlZCB8fCAxMDA7IC8vcGl4ZWxzIHBlciBzZWNvbmRcbiAgICB0aGlzLmhwID0gcGxheWVyRGF0YS5ocCB8fCAxMDA7XG5cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImFsaXZlXCIse1xuICAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fX2FsaXZlOyB9LFxuICAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSA9PT0gZmFsc2UgJiYgdGhpcy5hbGl2ZSAhPT0gZmFsc2UgJiYgd2luZG93LmdhbWUubXlQbGF5ZXJJRCA9PT0gdGhpcy5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgLy8gSSBqdXN0IGRpZWQuIHNob3cgZGVhdGggc2NyZWVuXG4gICAgICAgICAgICAgICAgICAgICB2YXIgYmcgPSBuZXcgVWlSZWN0KDAsMCx3aW5kb3cuZ2FtZS5jYW52YXMud2lkdGgsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQsIFwicmdiYSgwLDAsMCwwLjgpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgdmFyIHRleHQgPSBuZXcgVWlUZXh0KHt0ZXh0OiBcIllPVSBIQVZFIERJRUQhXCIsIGZvbnRTaXplOiAxOCwgeDogMjUwLCB5OiB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC8gMiAtIDIwfSk7XG4gICAgICAgICAgICAgICAgICAgICB2YXIgYnV0dG9uID0gbmV3IFVpQnV0dG9uKHt0ZXh0OiBcIlJFU1BBV05cIiwgZm9udFNpemU6IDI0LCB4OiB3aW5kb3cuZ2FtZS5jYW52YXMud2lkdGggLyAyIC0gNjMsIHk6IHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLyAyLCB3OiAxMzAsIGg6IDQwLCBjbGlja0Z1bmN0aW9uOiB0aGlzLndhbnRUb1Jlc3Bhd24sIGNvbnRleHQ6IHRoaXN9KTtcbiAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnVpRWxlbWVudHMgPSBbYmcsIHRleHQsIGJ1dHRvbl07XG4gICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5ld1ZhbHVlID09PSB0cnVlICYmICF0aGlzLmFsaXZlICYmIHdpbmRvdy5nYW1lLm15UGxheWVySUQgPT09IHRoaXMuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgIC8vIGNsZWFyIHVpIG9mIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnVpRWxlbWVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB0aGlzLl9fYWxpdmUgPSBuZXdWYWx1ZTsgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hbGl2ZSA9IHBsYXllckRhdGEuYWxpdmUgfHwgdHJ1ZTtcblxuICAgIHRoaXMuc3ggPSAwO1xuICAgIHRoaXMuc3kgPSAwO1xuICAgIHRoaXMuc3cgPSA2MDtcbiAgICB0aGlzLnNoID0gNjA7XG4gICAgdGhpcy5kdyA9IDYwO1xuICAgIHRoaXMuZGggPSA2MDtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb24gb24gbGV2ZWxcbiAgICB0aGlzLnRpbGVSb3cgPSAwO1xuICAgIHRoaXMudGlsZUNvbCA9IDA7XG5cbiAgICB0aGlzLndlYXBvbnMgPSBbXTtcbiAgICAvLyByZWNyZWF0ZSB3ZWFwb25zIGlmIHRoZSBwbGF5ZXIgaGFzIGFueSBlbHNlIGNyZWF0ZSBuZXcgd2VhcG9uc1xuICAgIGlmIChwbGF5ZXJEYXRhLndlYXBvblN0YXRlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVyRGF0YS53ZWFwb25TdGF0ZS5sZW5ndGg7IGkrPSAxKSB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnMucHVzaCh3ZWFwb25DcmVhdG9yKHRoaXMsIHBsYXllckRhdGEud2VhcG9uU3RhdGVbaV0pKTtcbiAgICAgICAgfVxuICAgIH1lbHNlIHtcbiAgICAgICAgdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG4gICAgfVxuXG4gICAgLy90aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcblxuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IHBsYXllckRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleCB8fCAwO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcblxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGVyZm9ybUFjdGlvbih0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zLnB1c2godGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmFsaXZlKSByZXR1cm47XG5cblxuICAgIHRoaXMubW92ZShkdCk7XG4gICAgLy9jaGVjayBpZiBvZmYgc2NyZWVuXG4gICAgLy8gaWYgKHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKSB0aGlzLnggPSB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aDtcbiAgICAvLyBpZiAodGhpcy54IDwgMCkgdGhpcy54ID0gMDtcbiAgICAvLyBpZiAodGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB0aGlzLnkgPSB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQ7XG4gICAgLy8gaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG5cbiAgICAvLyB1cGRhdGUgY3VycmVudCB3ZWFwb247XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0udXBkYXRlKGR0KTtcblxuICAgIC8vdGhpcy5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZShkdCk7XG5cbiAgICBpZiAodGhpcy5tb3VzZUxlZnQpIHsgLy8gaWYgZmlyaW5nXG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwiZmlyZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW91c2VYLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMubW91c2VZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR0KSB7XG5cbiAgICAvLyBVcGRhdGUgbW92ZW1lbnRcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XG4gICAgdmFyIG1vdmVYO1xuICAgIHZhciBtb3ZlWTtcblxuICAgIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gLWRpc3RhbmNlO1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwKSB7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93bikge1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rTGVmdCkge1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgdmFyIGNvbGxpc2lvbjtcbiAgICBpZiAobW92ZVgpIHtcbiAgICAgICAgY29sbGlzaW9uID0gaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogdGhpcy54ICsgbW92ZVgsIHk6IHRoaXMueX0pO1xuICAgICAgICBpZiAoIWNvbGxpc2lvbikge1xuICAgICAgICAgICAgdGhpcy54ICs9IG1vdmVYO1xuICAgICAgICAgICAgdGhpcy5tb3VzZVggKz0gbW92ZVg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1vdmVZKSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHRoaXMueCwgeTogdGhpcy55ICsgbW92ZVl9KTtcbiAgICAgICAgaWYgKCFjb2xsaXNpb24pIHtcbiAgICAgICAgICAgIHRoaXMueSArPSBtb3ZlWTtcbiAgICAgICAgICAgIHRoaXMubW91c2VZICs9IG1vdmVZO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gLy8gQ29sbGlzaW9uIGNoZWNrIGFnYWluc3Qgc3Vycm91bmRpbmcgdGlsZXNcbi8vIFBsYXllci5wcm90b3R5cGUuY29sbGlzaW9uQ2hlY2sgPSBmdW5jdGlvbigpIHtcbi8vICAgICB2YXIgc3RhcnRpbmdSb3cgPSB0aGlzLnRpbGVSb3cgLSAxO1xuLy8gICAgIGlmIChzdGFydGluZ1JvdyA8IDApIHN0YXJ0aW5nUm93ICA9IDA7XG4vLyAgICAgdmFyIGVuZFJvdyA9IHRoaXMudGlsZVJvdyArMTtcbi8vICAgICBpZiAoZW5kUm93ID4gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50KSBlbmRSb3cgPSB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQ7XG4vLyAgICAgdmFyIHN0YXJ0aW5nQ29sID0gdGhpcy50aWxlQ29sIC0xO1xuLy8gICAgIGlmIChzdGFydGluZ0NvbCA8IDApIHN0YXJ0aW5nQ29sID0gMDtcbi8vICAgICB2YXIgZW5kQ29sID0gdGhpcy50aWxlQ29sICsxO1xuLy8gICAgIGlmIChlbmRDb2wgPiB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQpIGVuZENvbCA9IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudDtcbi8vXG4vLyAgICAgZm9yICh2YXIgcm93ID0gc3RhcnRpbmdSb3c7IHJvdyA8IGVuZFJvdzsgcm93ICs9IDEpIHtcbi8vICAgICAgICAgZm9yICh2YXIgY29sID0gc3RhcnRpbmdDb2w7IGNvbCA8IGVuZENvbDsgY29sICs9IDEpIHtcbi8vICAgICAgICAgICAgIGlmICh3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1tyb3ddW2NvbF0gPT09IDApIGNvbnRpbnVlOyAvLyBldmVyeSB0aWxlIG90aGVyIHRoYW4gMCBhcmUgbm9uIHdhbGthYmxlXG4vLyAgICAgICAgICAgICAvLyBjb2xsaXNpb25cbi8vICAgICAgICAgICAgIGlmICh0aGlzLnRpbGVSb3cgPT09IHJvdyAmJiB0aGlzLnRpbGVDb2wgPT09IGNvbCkge1xuLy8gICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gdHJ1ZTtcbi8vIH07XG5cblBsYXllci5wcm90b3R5cGUubmV0d29ya1VwZGF0ZSA9IGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgZGVsZXRlIHVwZGF0ZS5pZDtcbiAgICAvLyBuZXR3b3JrVXBkYXRlXG4gICAgZm9yICh2YXIga2V5IGluIHVwZGF0ZSkge1xuICAgICAgICBpZiAoa2V5ID09PSBcImFjdGlvbnNcIikgdGhpc1trZXldID0gdGhpc1trZXldLmNvbmNhdCh1cGRhdGVba2V5XSk7XG4gICAgICAgIGVsc2UgdGhpc1trZXldID0gdXBkYXRlW2tleV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wZXJmb3JtQWN0aW9uID0gZnVuY3Rpb24oYWN0aW9uKXtcbiAgICBzd2l0Y2goYWN0aW9uLmFjdGlvbil7XG4gICAgICAgIGNhc2UgXCJ0dXJuVG93YXJkc1wiOlxuICAgICAgICAgICAgdGhpcy50dXJuVG93YXJkcyhhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZmlyZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLmZpcmUoYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcImRpZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGllKGFjdGlvbik7XG4gICAgICAgICAgICAvL2JyZWFrO1xuICAgICAgICBjYXNlIFwicmVzcGF3blwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzcGF3bihhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiY2hhbmdlV2VhcG9uXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VXZWFwb24oYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcInJlbG9hZFwiOlxuICAgIH0gICAgICAgcmV0dXJuIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnJlbG9hZChhY3Rpb24pO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIGlmKCF0aGlzLmFsaXZlKSByZXR1cm47XG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxuXG4gICAgdGhpcy5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zeCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnR1cm5Ub3dhcmRzID0gZnVuY3Rpb24oeCx5KSB7XG4gICAgdmFyIHhEaWZmID0geCAtIHRoaXMueDtcbiAgICB2YXIgeURpZmYgPSB5IC0gdGhpcy55O1xuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpOy8vICogKDE4MCAvIE1hdGguUEkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS50YWtlRGFtYWdlID0gZnVuY3Rpb24oZGFtYWdlLCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmhwIC09IGRhbWFnZTtcbiAgICBpZiAodGhpcy5ocCA8PSAwKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJkaWVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBwbGF5IHNvdW5kc1xuICAgIGlmICh0aGlzLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKVxuICAgICAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KFwiaGl0MlwiKTtcbiAgICBlbHNlXG4gICAgICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJoaXQxXCIpO1xuXG4gICAgLy8gYWRkIGJsb29kIHNwbGFzaCBlbWl0dGVyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy5hbGl2ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN0b3BSZWxvYWQoKTtcblxuXG4gICAgLy8gcGxheSBzb3VuZHNcbiAgICBpZiAodGhpcy5pZCA9PT0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZClcbiAgICAgICAgY3JlYXRlanMuU291bmQucGxheShcImRlYXRoMlwiKTtcbiAgICBlbHNlXG4gICAgICAgIGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJkZWF0aDFcIik7XG5cbiAgICAvLyAvLyBjcmVhdGUgYSBjb3Jwc2VcbiAgICAvLyB2YXIgY29ycHNlID0gbmV3IEVudGl0eSh7XG4gICAgLy8gICAgIHg6IHRoaXMueCArIE1hdGguY29zKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAvLyAgICAgeTogdGhpcy55ICsgTWF0aC5zaW4oYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgIC8vICAgICBzeDogNjAgKyggTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKiA2MCksXG4gICAgLy8gICAgIHN5OiAxMjAsXG4gICAgLy8gICAgIHN3OiA2MCxcbiAgICAvLyAgICAgc2g6IDYwLFxuICAgIC8vICAgICBkdzogNjAsXG4gICAgLy8gICAgIGRoOiA2MCxcbiAgICAvLyAgICAgZGlyZWN0aW9uOiBhY3Rpb24uZGF0YS5kaXJlY3Rpb24sXG4gICAgLy8gICAgIGN0eDogd2luZG93LmdhbWUuYmdDdHhcbiAgICAvLyB9KTtcbiAgICAvL3dpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2goY29ycHNlKTtcblxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICBlbWl0Q291bnQ6IDMwLFxuICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH0pKTtcblxuICAgIC8vIGlmICh0aGlzLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7IC8vIGlmIGl0cyBteSBwbGF5ZXIsIHNob3cgcmVzcGF3biBidXR0b25cbiAgICAvLyAgICAgLy8gY3JlYXRlIHJlc3Bhd24gQnV0dG9uIGFuZCBkaW0gdGhlIGJhY2tncm91bmRcbiAgICAvL1xuICAgIC8vIH1cblxuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLndhbnRUb1Jlc3Bhd24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuYWxpdmUpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgICAgICBkYXRhOiBoZWxwZXJzLmZpbmRTcGF3bkxvY2F0aW9uKClcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZXNwYXduID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy54ID0gYWN0aW9uLmRhdGEueDtcbiAgICB0aGlzLnkgPSBhY3Rpb24uZGF0YS55O1xuICAgIHRoaXMuaHAgPSAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG5cbiAgICAvLyByZWZpbGwgYWxsIHdlYXBvbnNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLndlYXBvbnNbaV0uZmlsbE1hZ2F6aW5lKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hhbmdlV2VhcG9uID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3RvcFJlbG9hZCgpO1xuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IGFjdGlvbi5kYXRhLnNlbGVjdGVkV2VhcG9uSW5kZXg7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnksXG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBocDogdGhpcy5ocCxcbiAgICAgICAgYWxpdmU6IHRoaXMuYWxpdmUsXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIHZpZXdpbmdBbmdsZTogdGhpcy52aWV3aW5nQW5nbGUsXG4gICAgICAgIHNwZWVkOiB0aGlzLnNwZWVkLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVksXG4gICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCxcbiAgICAgICAgd2VhcG9uU3RhdGU6IHRoaXMuZ2V0V2VhcG9uU3RhdGUoKVxuICAgIH07XG59O1xuXG4vLyBUaGUgc3RhdGUgdGhlIGNsaWVudCBzZW5kcyB0byB0aGUgaG9zdFxuUGxheWVyLnByb3RvdHlwZS5nZXRDbGllbnRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVlcbiAgICB9O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGVTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgdGhpcy54ID0gbmV3U3RhdGUueCB8fCB0aGlzLng7XG4gICAgdGhpcy55ID0gbmV3U3RhdGUueSB8fCB0aGlzLnk7XG4gICAgLy9pZDogdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaHAgPSBuZXdTdGF0ZS5ocCB8fCB0aGlzLmhwO1xuICAgIC8vdGhpcy5hbGl2ZSA9IG5ld1N0YXRlLmFsaXZlO1xuICAgIHRoaXMuYWxpdmUgPSB0eXBlb2YgbmV3U3RhdGUuYWxpdmUgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5hbGl2ZSA6IHRoaXMuYWxpdmU7XG4gICAgdGhpcy5yYWRpdXMgPSBuZXdTdGF0ZS5yYWRpdXMgfHwgdGhpcy5yYWRpdXM7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBuZXdTdGF0ZS5kaXJlY3Rpb24gfHwgdGhpcy5kaXJlY3Rpb247XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBuZXdTdGF0ZS52aWV3aW5nQW5nbGUgfHwgdGhpcy52aWV3aW5nQW5nbGU7XG4gICAgdGhpcy5zcGVlZCA9IG5ld1N0YXRlLnNwZWVkIHx8IHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5rVXAgPSB0eXBlb2YgbmV3U3RhdGUua1VwICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUua1VwIDogdGhpcy5rVXA7XG4gICAgdGhpcy5rVXAgPSB0eXBlb2YgbmV3U3RhdGUua1VwICE9PSBcInVuZGVmaW5lZFwiID8gbmV3U3RhdGUua1VwIDogdGhpcy5rVXA7XG4gICAgdGhpcy5rTGVmdCA9IHR5cGVvZiBuZXdTdGF0ZS5rTGVmdCAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ld1N0YXRlLmtMZWZ0IDogdGhpcy5rTGVmdDtcbiAgICB0aGlzLmtSaWdodCA9IHR5cGVvZiBuZXdTdGF0ZS5rUmlnaHQgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5rUmlnaHQgOiB0aGlzLmtSaWdodDtcbiAgICB0aGlzLm1vdXNlWCA9IHR5cGVvZiBuZXdTdGF0ZS5tb3VzZVggIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5tb3VzZVggOiB0aGlzLm1vdXNlWDtcbiAgICB0aGlzLm1vdXNlWSA9IHR5cGVvZiBuZXdTdGF0ZS5tb3VzZVkgIT09IFwidW5kZWZpbmVkXCIgPyBuZXdTdGF0ZS5tb3VzZVkgOiB0aGlzLm1vdXNlWTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBuZXdTdGF0ZS5zZWxlY3RlZFdlYXBvbkluZGV4IHx8IHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleDtcbn07XG5cbi8vIGdldCB0aGUgc3RhdGUgb2YgZWFjaCB3ZWFwb25cblBsYXllci5wcm90b3R5cGUuZ2V0V2VhcG9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdGF0ZS5wdXNoKHRoaXMud2VhcG9uc1tpXS5nZXRTdGF0ZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcbiIsIi8vIHZhciB3ZWFwb25zID0gcmVxdWlyZShcIi4vZGF0YS93ZWFwb25zXCIpO1xuLy8gdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xuLy9cbnZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vUGFydGljbGUvRW1pdHRlclwiKTtcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBVaShnYW1lKXtcbiAgICB0aGlzLmNsaWVudExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcblxuICAgIHRoaXMudXBkYXRlQ2xpZW50TGlzdCA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgdmFyIG15SUQgPSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkO1xuICAgICAgICB0aGlzLmNsaWVudExpc3QuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gcGxheWVycyl7XG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGlkICsgXCIgXCIgKyBwbGF5ZXJzW2lkXS5waW5nKTtcbiAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy5jbGllbnRMaXN0LmFwcGVuZENoaWxkKGxpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlckRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gXCIxMnB4IE9wZW4gU2Fuc1wiO1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2Q3ZDdkN1wiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJGUFM6ICBcIiArIHdpbmRvdy5nYW1lLmZwcywgNSwgMjApO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQSU5HOiBcIiArIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZywgNSwgMzQpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJDQU1FUkE6IFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS55KSwgNSwgNDgpO1xuICAgICAgICBpZiAocGxheWVyKSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQTEFZRVI6ICBcIiArIE1hdGguZmxvb3IocGxheWVyLngpICsgXCIsIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIueSksIDUsIDYyKTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIk1PVVNFOiBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVkpLCA1LCA3Nik7XG4gICAgICAgICAgICBpZihwbGF5ZXIpIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkRJUjogXCIgKyBwbGF5ZXIuZGlyZWN0aW9uLnRvRml4ZWQoMiksIDUsIDkwKTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJQQVJUSUNMRVM6IFwiICsgd2luZG93LmdhbWUucGFydGljbGVzLmxlbmd0aCwgNSwgMTA0KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSBcIjI0cHggT3BlbiBTYW5zXCI7XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyVUkgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICBpZiAoIXBsYXllcikgcmV0dXJuO1xuXG5cbiAgICAgICAgLy9ndWkgYmcgY29sb3JcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCgwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsIDE0MCwgMzUpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMzUpXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdyYWRpZW50XG4gICAgICAgIHZhciBncmQ9IHdpbmRvdy5nYW1lLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgxNDAsMCwxOTAsMCk7XG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMCxcInJnYmEoMCwwLDAsMC4zNSlcIik7XG4gICAgICAgIGdyZC5hZGRDb2xvclN0b3AoMSxcInJnYmEoMCwwLDAsMClcIik7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGU9Z3JkO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFJlY3QoMTQwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzUsNTAsMzUpO1xuXG5cblxuICAgICAgICB2YXIgd2VhcG9uID0gIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XTtcbiAgICAgICAgLy8gZHJhdyB3ZWFwb24gaWNvblxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB3ZWFwb24uaWNvblN4LCB3ZWFwb24uaWNvblN5LCB3ZWFwb24uaWNvblcsIHdlYXBvbi5pY29uSCwgOTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMywgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgpO1xuICAgICAgICAvLyBkcmF3IG1hZ2F6aW5lIGNvdW50J1xuICAgICAgICBpZiAod2VhcG9uLnJlbG9hZGluZykge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgODUsIDIxNCwgMjEsIDIyLCAxMjUsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzMCwgMjEsIDIyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh3ZWFwb24uYnVsbGV0cywgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZTdkMjllXCI7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsICAxMjIsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAxMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkcmF3IGhlYXJ0XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIDAsIDIyOCwgMTMsIDEyLCAxMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDIzLCAxMywgMTIpO1xuICAgICAgICAvLyBkcmF3IEhQXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHBsYXllci5ocCwgMzAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSA5KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQocGxheWVyLmhwLCAzMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDEwKTtcbiAgICB9O1xuXG4gICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXNwYXduQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgLy9cbiAgICAvLyAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgLy8gdmFyIHNwYXduTG9jYXRpb25Gb3VuZCA9IGZhbHNlO1xuICAgIC8vICAgICAgICAgLy8gdmFyIHg7XG4gICAgLy8gICAgICAgICAvLyB2YXIgeTtcbiAgICAvLyAgICAgICAgIC8vIHdoaWxlICghc3Bhd25Mb2NhdGlvbkZvdW5kKSB7XG4gICAgLy8gICAgICAgICAvLyAgICAgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgLy8gICAgICAgICAvLyAgICAgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgIC8vICAgICAgICAgLy9cbiAgICAvLyAgICAgICAgIC8vICAgICBpZiAoaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogeCwgeTogeX0pKSBzcGF3bkxvY2F0aW9uRm91bmQgPSB0cnVlO1xuICAgIC8vICAgICAgICAgLy8gfVxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAvLyAgICAgICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgIC8vICAgICAgICAgICAgIGRhdGE6IGhlbHBlcnMuZmluZFNwYXduTG9jYXRpb24oKVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9KTtcblxuICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVsb2FkQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgLy8gICAgIGlmIChwbGF5ZXIuYWxpdmUpIHtcbiAgICAvLyAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAvLyAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICAvLyBpZiAoIXBsYXllci5hbGl2ZSkge1xuICAgIC8vICAgICAvLyAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgIC8vICAgICAvLyAgICAgdmFyIHkgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAvLyAgICAgLy9cbiAgICAvLyAgICAgLy8gICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAvLyAgICAgLy8gICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgIC8vICAgICAvLyAgICAgICAgIGRhdGE6IHtcbiAgICAvLyAgICAgLy8gICAgICAgICAgICAgeDogeCxcbiAgICAvLyAgICAgLy8gICAgICAgICAgICAgeTogeVxuICAgIC8vICAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgLy8gICAgIH0pO1xuICAgIC8vICAgICAvLyB9XG4gICAgLy8gfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VtaXR0ZXJCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgLy8gICAgICAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAvLyAgICAgICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgIC8vICAgICAgICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgLy8gICAgICAgICAgICAgZW1pdFNwZWVkOiBudWxsLFxuICAgIC8vICAgICAgICAgICAgIHg6IHBsYXllci54LFxuICAgIC8vICAgICAgICAgICAgIHk6IHBsYXllci55XG4gICAgLy8gICAgICAgICB9KSk7XG4gICAgLy8gICAgIH0pO1xufTtcbiIsInZhciBsZXZlbCA9IHtcclxuICAgIG5hbWU6IFwibGV2ZWwxXCIsXHJcbiAgICB0aWxlczogW1xyXG4gICAgICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDEsMCwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDEsMiwxLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDIsMiwyLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwxLDIsMiwyLDEsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDEsMSwxLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDBdLFxyXG4gICAgICAgIFsxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDEsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDBdLF1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGV2ZWw7XHJcbiIsInZhciBBazQ3ID0ge1xyXG4gICAgXCJuYW1lXCI6IFwiQWs0N1wiLFxyXG4gICAgXCJtYWdhemluZVNpemVcIjogMzAsIC8vIGJ1bGxldHNcclxuICAgIFwiYnVsbGV0c1wiOiAzMCxcclxuICAgIFwiZmlyZVJhdGVcIjogMC4xLCAvLyBzaG90cyBwZXIgc2Vjb25kXHJcbiAgICBcImJ1bGxldHNQZXJTaG90XCI6IDEsIC8vIHNob290IDEgYnVsbGV0IGF0IGEgdGltZVxyXG4gICAgXCJkYW1hZ2VcIjogMTAsIC8vIGhwXHJcbiAgICBcInJlbG9hZFRpbWVcIjogMS42LCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDE3MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogMCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogMjEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMCxcclxuICAgIFwic291bmRcIjogXCJha1wiLFxyXG4gICAgXCJyZWxvYWRTb3VuZFwiOiBcImFrLXJlbG9hZFwiXHJcbn07XHJcblxyXG52YXIgc2hvdGd1biA9IHtcclxuICAgIFwibmFtZVwiOiBcInNob3RndW5cIixcclxuICAgIFwibWFnYXppbmVTaXplXCI6IDEyLCAvLyBidWxsZXRzXHJcbiAgICBcImJ1bGxldHNcIjogMTIsXHJcbiAgICBcImZpcmVSYXRlXCI6IDAuNSwgLy8gc2hvdHMgcGVyIHNlY29uZFxyXG4gICAgXCJidWxsZXRzUGVyU2hvdFwiOiA0LCAvLyA0IHNob3RndW4gc2x1Z3MgcGVyIHNob3RcclxuICAgIFwiZGFtYWdlXCI6IDEwLCAvLyBocFxyXG4gICAgXCJyZWxvYWRUaW1lXCI6IDEuNiwgLy8gc1xyXG4gICAgXCJidWxsZXRTcGVlZFwiOiAyNTAwLCAvLyBwaXhlbHMgcGVyIHNlY29uZFxyXG4gICAgXCJzeFwiOiAwLCAvLyBzcHJpdGVzaGVldCB4IHBvc2l0aW9uXHJcbiAgICBcInN5XCI6IDYwLCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbiAgICBcImljb25TeFwiOiA1MSxcclxuICAgIFwiaWNvblN5XCI6IDIxMCxcclxuICAgIFwiaWNvbldcIjogMzAsXHJcbiAgICBcImljb25IXCI6IDMwLFxyXG4gICAgXCJzb3VuZFwiOiBcInNob3RndW5cIixcclxuICAgIFwicmVsb2FkU291bmRcIjogXCJzaG90Z3VuLXJlbG9hZFwiXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFrNDc6IEFrNDcsXHJcbiAgICBzaG90Z3VuOiBzaG90Z3VuXHJcbn07XHJcbiIsIi8vIGRlZ3JlZXMgdG8gcmFkaWFuc1xuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xuICAgIHJldHVybiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG59XG5cbi8vIHJhZGlhbnMgdG8gZGVncmVlc1xuZnVuY3Rpb24gdG9EZWdyZWVzKHJhZCkge1xuICAgIHJldHVybiByYWQgKiAoMTgwIC8gTWF0aC5QSSk7XG59XG5cbi8vIGNoZWNrIGlmIHRoaXMgcG9pbnQgaXMgaW5zaWRlIGEgbm9uIHdhbGthYmxlIHRpbGUuIHJldHVybnMgdHJ1ZSBpZiBub3Qgd2Fsa2FibGVcbmZ1bmN0aW9uIGNvbGxpc2lvbkNoZWNrKHBvaW50KSB7XG4gICAgdmFyIHRpbGVSb3cgPSBNYXRoLmZsb29yKHBvaW50LnkgLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSk7XG4gICAgdmFyIHRpbGVDb2wgPSBNYXRoLmZsb29yKHBvaW50LnggLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSk7XG4gICAgaWYgKHRpbGVSb3cgPCAwIHx8IHRpbGVSb3cgPj0gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50IHx8IHRpbGVDb2wgPCAwIHx8IHRpbGVDb2wgPj0gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50ICkgcmV0dXJuIHRydWU7IC8vIG91dHNpZGUgbWFwXG4gICAgcmV0dXJuICh3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t0aWxlUm93XVt0aWxlQ29sXSA+IDApO1xufVxuXG4vLyB0YWtlcyBhIHBvaW50IGFuZCByZXR1bnMgdGlsZSB4eXdoIHRoYXQgaXMgdW5kZXIgdGhhdCBwb2ludFxuZnVuY3Rpb24gZ2V0UmVjdEZyb21Qb2ludChwb2ludCkge1xuICAgIHZhciB5ID0gTWF0aC5mbG9vcihwb2ludC55IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpICogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemU7XG4gICAgdmFyIHggPSBNYXRoLmZsb29yKHBvaW50LnggLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSkgKiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZTtcbiAgICByZXR1cm4ge3g6IHgsIHk6IHksIHc6IHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplLCBoOiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZX07XG59XG5cbi8vIHJldHVybnMgdGlsZVxuZnVuY3Rpb24gZ2V0VGlsZSh4LCB5KSB7XG4gICAgaWYoeCA+PSAwICYmIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgJiYgeSA+PSAwICYmIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpXG4gICAgICAgIHJldHVybiB3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t5XVt4XTtcbn1cblxuLy8gZmluZHMgYSByYW5kb20gd2Fsa2FibGUgdGlsZSBvbiB0aGUgbWFwXG5mdW5jdGlvbiBmaW5kU3Bhd25Mb2NhdGlvbigpIHtcbiAgICB2YXIgeDtcbiAgICB2YXIgeTtcbiAgICBkbyB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIH1cbiAgICB3aGlsZSAoY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KSk7XG5cbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xufVxuXG4vLyBjaGVja3MgdGhhdCBhIHh5IHBvaW50IGlzIGluc2lkZSB0aGUgZ2FtZSB3b3JsZFxuZnVuY3Rpb24gaXNJbnNpZGVHYW1lKHgsIHkpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIng6XCIseCwgXCJ5OlwiLHksIFwid2lkdGg6XCIsd2luZG93LmdhbWUubGV2ZWwud2lkdGgsIFwiaGVpZ2h0OlwiLHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCk7XG4gICAgLy8gY29uc29sZS5sb2coeCA+PSAwLCB4IDwgd2luZG93LmdhbWUubGV2ZWwud2lkdGgsICB5ID49IDAsIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIGlmICh4ID49IDAgJiYgeCA8IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoICYmIHkgPj0gMCAmJiB5IDwgd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSByZXR1cm4gdHJ1ZTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1JhZGlhbnM6IHRvUmFkaWFucyxcbiAgICB0b0RlZ3JlZXM6IHRvRGVncmVlcyxcbiAgICBjb2xsaXNpb25DaGVjazogY29sbGlzaW9uQ2hlY2ssXG4gICAgZmluZFNwYXduTG9jYXRpb246IGZpbmRTcGF3bkxvY2F0aW9uLFxuICAgIGdldFJlY3RGcm9tUG9pbnQ6IGdldFJlY3RGcm9tUG9pbnQsXG4gICAgZ2V0VGlsZTogZ2V0VGlsZSxcbiAgICBpc0luc2lkZUdhbWU6IGlzSW5zaWRlR2FtZVxufTtcbiIsInZhciBHYW1lID0gcmVxdWlyZShcIi4vR2FtZS5qc1wiKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmdhbWUgPSBuZXcgR2FtZSgpO1xyXG59KTtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbi8vdmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIEJ1bGxldEhvbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwicmdiKDY2LCA2NiwgNjYpXCI7XHJcbiAgICAgICAgLy9kYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDI7XHJcbiAgICAgICAgZGF0YS5jb250YWluZXIgPSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXM7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlmZVRpbWUgPSAxMDtcclxuICAgICAgICAvL3RoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIC8vdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICAvL3RoaXMubW92ZURpc3RhbmNlID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE1KSArIDEpO1xyXG4gICAgICAgIC8vdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuQnVsbGV0SG9sZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAvLyAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgLy8gICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgLy8gfVxyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0SG9sZTtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBGbGFzaCBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICAvL3ZhciBybmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCk7XHJcbiAgICAgICAgLy8gdmFyIHIgPSAxNTA7XHJcbiAgICAgICAgLy8gdmFyIGcgPSA1MDtcclxuICAgICAgICAvLyB2YXIgYiA9IDUwO1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCIjZmZlNjAwXCI7XHJcbiAgICAgICAgZGF0YS5saWZlVGltZSA9IDAuMDU7XHJcbiAgICAgICAgZGF0YS5jb250YWluZXIgPSB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXM7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5saWZlVGltZSA9IDAuMDU7XHJcblxyXG4gICAgICAgIC8vdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkZsYXNoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XHJcbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZsYXNoO1xyXG4iLCJmdW5jdGlvbiBSZWN0YW5nbGUgKHgsIHksIHcsIGgsIGNvbG9yKSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMudyA9IHc7XHJcbiAgICB0aGlzLmggPSBoO1xyXG4gICAgdGhpcy5yZWN0ID0ge3g6eCwgeTp5LCB3OncsIGg6aH07XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbn1cclxuXHJcblJlY3RhbmdsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHgucmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53LCB0aGlzLmgpO1xyXG4gICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWN0YW5nbGU7XHJcbiIsImZ1bmN0aW9uIFJlY3RhbmdsZSAoZGF0YSkge1xyXG4gICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgdGhpcy5jb2xvciA9IGRhdGEuY29sb3I7XHJcbiAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XHJcbiAgICB0aGlzLmZvbnRTaXplID0gZGF0YS5mb250U2l6ZTtcclxufVxyXG5cclxuUmVjdGFuZ2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gdGhpcy5mb250U2l6ZSArIFwicHggT3BlbiBTYW5zXCI7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZDdkN2Q3XCI7XHJcbiAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQodGhpcy50ZXh0LCB0aGlzLngsIHRoaXMueSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZTtcclxuIiwiLy92YXIgdGlsZXMgPSByZXF1aXJlKFwiLi9sZXZlbFwiKS50aWxlcztcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi8uLi9oZWxwZXJzLmpzXCIpO1xyXG52YXIgY29sbGlzaW9uRGV0ZWN0aW9uID0gcmVxdWlyZShcIi4vY29sbGlzaW9uRGV0ZWN0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gYmxpbmUoeDAsIHkwLCB4MSwgeTEpIHtcclxuXHJcbiAgICB4MCA9IE1hdGguZmxvb3IoeDApO1xyXG4gICAgeTAgPSBNYXRoLmZsb29yKHkwKTtcclxuICAgIHgxID0gTWF0aC5mbG9vcih4MSk7XHJcbiAgICB5MSA9IE1hdGguZmxvb3IoeTEpO1xyXG5cclxuICB2YXIgZHggPSBNYXRoLmFicyh4MSAtIHgwKSwgc3ggPSB4MCA8IHgxID8gMSA6IC0xO1xyXG4gIHZhciBkeSA9IE1hdGguYWJzKHkxIC0geTApLCBzeSA9IHkwIDwgeTEgPyAxIDogLTE7XHJcbiAgdmFyIGVyciA9IChkeD5keSA/IGR4IDogLWR5KS8yO1xyXG5cclxuXHJcbiAgd2hpbGUgKHRydWUpIHtcclxuXHJcblxyXG4gICAgaWYgKHgwID09PSB4MSAmJiB5MCA9PT0geTEpIHtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHZhciBlMiA9IGVycjtcclxuICAgIGlmIChlMiA+IC1keCkgeyBlcnIgLT0gZHk7IHgwICs9IHN4OyB9XHJcbiAgICBpZiAoZTIgPCBkeSkgeyBlcnIgKz0gZHg7IHkwICs9IHN5OyB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgb3V0c2lkZSBtYXBcclxuICAgIGlmICghaGVscGVycy5pc0luc2lkZUdhbWUoeDAsIHkwKSkgcmV0dXJuIHt0eXBlOiBcIm91dHNpZGVcIn07XHJcblxyXG4gICAgLy8gaGl0IGNoZWNrIGFnYWluc3QgcGxheWVyc1xyXG4gICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xyXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSBjb250aW51ZTtcclxuICAgICAgICB2YXIgaGl0ID0gY29sbGlzaW9uRGV0ZWN0aW9uLnBvaW50Q2lyY2xlKHt4OiB4MCwgeTogeTB9LCB7eDogcGxheWVyLngsIHk6IHBsYXllci55LCByYWRpdXM6IHBsYXllci5yYWRpdXN9KTtcclxuICAgICAgICBpZiAoaGl0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7dHlwZTogXCJwbGF5ZXJcIiwgcGxheWVyOiBwbGF5ZXJ9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRpbGVYID0gTWF0aC5mbG9vcih4MCAvIDMyKTtcclxuICAgIHZhciB0aWxlWSA9IE1hdGguZmxvb3IoeTAgLyAzMik7XHJcbiAgICAvLyBjaGVjayBhZ2FpbnN0IHRpbGVzXHJcbiAgICBpZiAoaGVscGVycy5nZXRUaWxlKHRpbGVYLHRpbGVZKSA9PT0gMSkgcmV0dXJuIHt0eXBlOiBcInRpbGVcIiwgeDogdGlsZVgsIHk6IHRpbGVZfTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxpbmU7XHJcbiIsInZhciBpbnRlcnNlY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XHJcblxyXG5mdW5jdGlvbiBsaW5lUmVjdEludGVyc2VjdChsaW5lLCByZWN0KSB7XHJcblxyXG4gICAgICAgIC8vaWYgKHBvaW50IGlzIGluc2lkZSByZWN0KVxyXG4gICAgICAgIC8vIGludGVyc2VjdCA9IHBvaW50O1xyXG5cclxuICAgICAgICAvLyBjaGVjayBsZWZ0XHJcbiAgICAgICAgdmFyIGxlZnQgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciBsZWZ0SW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLGxlZnQpO1xyXG4gICAgICAgIGlmIChsZWZ0SW50ZXJzZWN0LnkgPj0gbGVmdC5zdGFydC55ICYmIGxlZnRJbnRlcnNlY3QueSA8PSBsZWZ0LmVuZC55ICYmIGxpbmUuc3RhcnQueCA8PSBsZWZ0LnN0YXJ0LnggKSB7XHJcbiAgICAgICAgICAgIGxlZnRJbnRlcnNlY3QueCArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gbGVmdEludGVyc2VjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIHRvcFxyXG4gICAgICAgIHZhciB0b3AgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueX19O1xyXG4gICAgICAgIHZhciB0b3BJbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHRvcCk7XHJcbiAgICAgICAgaWYgKHRvcEludGVyc2VjdC54ID49IHRvcC5zdGFydC54ICYmIHRvcEludGVyc2VjdC54IDw9IHRvcC5lbmQueCAmJiBsaW5lLnN0YXJ0LnkgPD0gdG9wLnN0YXJ0LnkpIHtcclxuICAgICAgICAgICAgdG9wSW50ZXJzZWN0LnkgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvcEludGVyc2VjdDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayByaWdodFxyXG4gICAgICAgIHZhciByaWdodCA9IHtzdGFydDp7eDogcmVjdC54ICsgcmVjdC53ICx5OiByZWN0LnkgfSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciByaWdodEludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgcmlnaHQpO1xyXG4gICAgICAgIGlmIChyaWdodEludGVyc2VjdC55ID49IHJpZ2h0LnN0YXJ0LnkgJiYgcmlnaHRJbnRlcnNlY3QueSA8IHJpZ2h0LmVuZC55KSB7XHJcbiAgICAgICAgICAgIHJpZ2h0SW50ZXJzZWN0LnggLT0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHJpZ2h0SW50ZXJzZWN0O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGRvd25cclxuICAgICAgICB2YXIgZG93biA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICAgICAgdmFyIGRvd25JbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIGRvd24pO1xyXG4gICAgICAgIHRvcEludGVyc2VjdC55IC09IDE7XHJcbiAgICAgICAgcmV0dXJuIGRvd25JbnRlcnNlY3Q7XHJcbn1cclxuXHJcbi8vIGZpbmQgdGhlIHBvaW50IHdoZXJlIGEgbGluZSBpbnRlcnNlY3RzIGEgcmVjdGFuZ2xlLiB0aGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhlIGxpbmUgYW5kIHJlY3QgaW50ZXJzZWN0c1xyXG5mdW5jdGlvbiBsaW5lUmVjdEludGVyc2VjdDIobGluZSwgcmVjdCkge1xyXG4gICAgLy9pZiAocG9pbnQgaXMgaW5zaWRlIHJlY3QpXHJcbiAgICAvLyBpbnRlcnNlY3QgPSBwb2ludDtcclxuXHJcbiAgICAvLyBjaGVjayBsZWZ0XHJcbiAgICB2YXIgbGVmdExpbmUgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgdmFyIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLGxlZnRMaW5lKTtcclxuICAgIGlmIChpbnRlcnNlY3Rpb25Qb2ludC55ID49IGxlZnRMaW5lLnN0YXJ0LnkgJiYgaW50ZXJzZWN0aW9uUG9pbnQueSA8PSBsZWZ0TGluZS5lbmQueSAmJiBsaW5lLnN0YXJ0LnggPD0gbGVmdExpbmUuc3RhcnQueCApIHtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgdG9wXHJcbiAgICB2YXIgdG9wTGluZSA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0Lnl9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55fX07XHJcbiAgICBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgdG9wTGluZSk7XHJcbiAgICBpZiAoaW50ZXJzZWN0aW9uUG9pbnQueCA+PSB0b3BMaW5lLnN0YXJ0LnggJiYgaW50ZXJzZWN0aW9uUG9pbnQueCA8PSB0b3BMaW5lLmVuZC54ICYmIGxpbmUuc3RhcnQueSA8PSB0b3BMaW5lLnN0YXJ0LnkpIHtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgcmlnaHRcclxuICAgIHZhciByaWdodExpbmUgPSB7c3RhcnQ6e3g6IHJlY3QueCArIHJlY3QudyAseTogcmVjdC55IH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCByaWdodExpbmUpO1xyXG4gICAgaWYgKGludGVyc2VjdGlvblBvaW50LnkgPj0gcmlnaHRMaW5lLnN0YXJ0LnkgJiYgaW50ZXJzZWN0aW9uUG9pbnQueSA8IHJpZ2h0TGluZS5lbmQueSAmJiBsaW5lLnN0YXJ0LnggPj0gcmlnaHRMaW5lLnN0YXJ0LngpIHtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgZG93blxyXG4gICAgdmFyIGRvd24gPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIGRvd24pO1xyXG4gICAgcmV0dXJuIGludGVyc2VjdGlvblBvaW50O1xyXG59XHJcblxyXG5cclxuLy8gQ2hlY2tzIGlmIGEgcG9pbnQgaXMgaW5zaWRlIGEgY2lyY2xlXHJcbmZ1bmN0aW9uIHBvaW50Q2lyY2xlKHBvaW50LCBjaXJjbGUpIHtcclxuICAgICAgICB2YXIgYSA9IHBvaW50LnggLSBjaXJjbGUueDtcclxuICAgICAgICB2YXIgYiA9IHBvaW50LnkgLSBjaXJjbGUueTtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IGNpcmNsZS5yYWRpdXMpIHsgLy8gcG9pbnQgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIENoZWNrcyBpZiBhIHBvaW50IGlzIGluc2lkZSBhIHJlY3RhbmdsZVxyXG5mdW5jdGlvbiBwb2ludFJlY3QocG9pbnQsIHJlY3QpIHtcclxuICAgIHJldHVybiAocG9pbnQueCA+PSByZWN0LnggJiYgcG9pbnQueCA8PSByZWN0LnggKyByZWN0LncgJiYgcG9pbnQueSA+PSByZWN0LnkgJiYgcG9pbnQueSA8PSByZWN0LnkgKyByZWN0LmgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGxpbmVSZWN0SW50ZXJzZWN0OiBsaW5lUmVjdEludGVyc2VjdCxcclxuICAgIHBvaW50Q2lyY2xlOiBwb2ludENpcmNsZSxcclxuICAgIHBvaW50UmVjdDogcG9pbnRSZWN0LFxyXG4gICAgbGluZVJlY3RJbnRlcnNlY3QyOiBsaW5lUmVjdEludGVyc2VjdDJcclxufTtcclxuIiwidmFyIGludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZlY3RvciA9IHt9O1xyXG4gICAgdmVjdG9yLm9BID0gZnVuY3Rpb24oc2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybiBzZWdtZW50LnN0YXJ0O1xyXG4gICAgfTtcclxuICAgIHZlY3Rvci5BQiA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICB2YXIgc3RhcnQgPSBzZWdtZW50LnN0YXJ0O1xyXG4gICAgICAgIHZhciBlbmQgPSBzZWdtZW50LmVuZDtcclxuICAgICAgICByZXR1cm4ge3g6ZW5kLnggLSBzdGFydC54LCB5OiBlbmQueSAtIHN0YXJ0Lnl9O1xyXG4gICAgfTtcclxuICAgIHZlY3Rvci5hZGQgPSBmdW5jdGlvbih2MSx2Mikge1xyXG4gICAgICAgIHJldHVybiB7eDogdjEueCArIHYyLngsIHk6IHYxLnkgKyB2Mi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5zdWIgPSBmdW5jdGlvbih2MSx2Mikge1xyXG4gICAgICAgIHJldHVybiB7eDp2MS54IC0gdjIueCwgeTogdjEueSAtIHYyLnl9O1xyXG4gICAgfVxyXG4gICAgdmVjdG9yLnNjYWxhck11bHQgPSBmdW5jdGlvbihzLCB2KSB7XHJcbiAgICAgICAgcmV0dXJuIHt4OiBzICogdi54LCB5OiBzICogdi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5jcm9zc1Byb2R1Y3QgPSBmdW5jdGlvbih2MSx2Mikge1xyXG4gICAgICAgIHJldHVybiAodjEueCAqIHYyLnkpIC0gKHYyLnggKiB2MS55KTtcclxuICAgIH07XHJcbiAgICB2YXIgc2VsZiA9IHt9O1xyXG4gICAgc2VsZi52ZWN0b3IgPSBmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5BQihzZWdtZW50KTtcclxuICAgIH07XHJcbiAgICBzZWxmLmludGVyc2VjdFNlZ21lbnRzID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gdHVybiBhID0gcCArIHQqciB3aGVyZSAwPD10PD0xIChwYXJhbWV0ZXIpXHJcbiAgICAgICAgLy8gYiA9IHEgKyB1KnMgd2hlcmUgMDw9dTw9MSAocGFyYW1ldGVyKVxyXG4gICAgICAgIHZhciBwID0gdmVjdG9yLm9BKGEpO1xyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG5cclxuICAgICAgICB2YXIgcSA9IHZlY3Rvci5vQShiKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzID0gdmVjdG9yLmNyb3NzUHJvZHVjdChyLHMpO1xyXG4gICAgICAgIHZhciBxbXAgPSB2ZWN0b3Iuc3ViKHEscCk7XHJcbiAgICAgICAgdmFyIG51bWVyYXRvciA9IHZlY3Rvci5jcm9zc1Byb2R1Y3QocW1wLCBzKTtcclxuICAgICAgICB2YXIgdCA9IG51bWVyYXRvciAvIGNyb3NzO1xyXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSB2ZWN0b3IuYWRkKHAsdmVjdG9yLnNjYWxhck11bHQodCxyKSk7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbjtcclxuICAgIH07XHJcbiAgICBzZWxmLmlzUGFyYWxsZWwgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgICAgICAvLyBhIGFuZCBiIGFyZSBsaW5lIHNlZ21lbnRzLlxyXG4gICAgICAgIC8vIHJldHVybnMgdHJ1ZSBpZiBhIGFuZCBiIGFyZSBwYXJhbGxlbCAob3IgY28tbGluZWFyKVxyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG4gICAgICAgIHZhciBzID0gdmVjdG9yLkFCKGIpO1xyXG4gICAgICAgIHJldHVybiAodmVjdG9yLmNyb3NzUHJvZHVjdChyLHMpID09PSAwKTtcclxuICAgIH07XHJcbiAgICBzZWxmLmlzQ29sbGluZWFyID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gYSBhbmQgYiBhcmUgbGluZSBzZWdtZW50cy5cclxuICAgICAgICAvLyByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBhcmUgY28tbGluZWFyXHJcbiAgICAgICAgdmFyIHAgPSB2ZWN0b3Iub0EoYSk7XHJcbiAgICAgICAgdmFyIHIgPSB2ZWN0b3IuQUIoYSk7XHJcblxyXG4gICAgICAgIHZhciBxID0gdmVjdG9yLm9BKGIpO1xyXG4gICAgICAgIHZhciBzID0gdmVjdG9yLkFCKGIpO1xyXG4gICAgICAgIHJldHVybiAodmVjdG9yLmNyb3NzUHJvZHVjdCh2ZWN0b3Iuc3ViKHAscSksIHIpID09PSAwKTtcclxuICAgIH07XHJcbiAgICBzZWxmLnNhZmVJbnRlcnNlY3QgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgICAgICBpZiAoc2VsZi5pc1BhcmFsbGVsKGEsYikgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmludGVyc2VjdFNlZ21lbnRzKGEsYik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gc2VsZjtcclxufTtcclxuaW50ZXJzZWN0aW9uLmludGVyc2VjdFNlZ21lbnRzID0gaW50ZXJzZWN0aW9uKCkuaW50ZXJzZWN0U2VnbWVudHM7XHJcbmludGVyc2VjdGlvbi5pbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24oKS5zYWZlSW50ZXJzZWN0O1xyXG5pbnRlcnNlY3Rpb24uaXNQYXJhbGxlbCA9IGludGVyc2VjdGlvbigpLmlzUGFyYWxsZWw7XHJcbmludGVyc2VjdGlvbi5pc0NvbGxpbmVhciA9IGludGVyc2VjdGlvbigpLmlzQ29sbGluZWFyO1xyXG5pbnRlcnNlY3Rpb24uZGVzY3JpYmUgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgIHZhciBpc0NvbGxpbmVhciA9IGludGVyc2VjdGlvbigpLmlzQ29sbGluZWFyKGEsYik7XHJcbiAgICB2YXIgaXNQYXJhbGxlbCA9IGludGVyc2VjdGlvbigpLmlzUGFyYWxsZWwoYSxiKTtcclxuICAgIHZhciBwb2ludE9mSW50ZXJzZWN0aW9uID0gdW5kZWZpbmVkO1xyXG4gICAgaWYgKGlzUGFyYWxsZWwgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcG9pbnRPZkludGVyc2VjdGlvbiA9IGludGVyc2VjdGlvbigpLmludGVyc2VjdFNlZ21lbnRzKGEsYik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge2NvbGxpbmVhcjogaXNDb2xsaW5lYXIscGFyYWxsZWw6IGlzUGFyYWxsZWwsaW50ZXJzZWN0aW9uOnBvaW50T2ZJbnRlcnNlY3Rpb259O1xyXG59O1xyXG5cclxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0aW9uO1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuQWs0NztcclxuXHJcbmNsYXNzIEFrNDcgZXh0ZW5kcyBXZWFwb257XHJcbiAgICBjb25zdHJ1Y3Rvcihvd25lciwgZXhpc3RpbmdXZWFwb25EYXRhKSB7XHJcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xyXG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBazQ3O1xyXG4iLCJ2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vV2VhcG9uXCIpO1xudmFyIHdlYXBvbkRhdGEgPSByZXF1aXJlKFwiLi4vZGF0YS93ZWFwb25zXCIpLnNob3RndW47XG52YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0XCIpO1xuXG5jbGFzcyBTaG90Z3VuIGV4dGVuZHMgV2VhcG9ue1xuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBleGlzdGluZ1dlYXBvbkRhdGEpIHtcbiAgICAgICAgd2VhcG9uRGF0YSA9IGV4aXN0aW5nV2VhcG9uRGF0YSB8fCB3ZWFwb25EYXRhO1xuICAgICAgICBzdXBlcihvd25lciwgd2VhcG9uRGF0YSk7XG4gICAgfVxufVxuXG5TaG90Z3VuLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oYWN0aW9uKSB7XG5cbiAgICAvLyBwbGF5IGVtcHR5IGNsaXAgc291bmQgaWYgb3V0IG9mIGJ1bGxldHNcbiAgICBpZiAoIHRoaXMuYnVsbGV0cyA8IDEgJiYgIXRoaXMucmVsb2FkaW5nKSB7XG4gICAgICAgIGlmICghdGhpcy5zb3VuZEluc3RhbmNlRW1wdHlDbGlwKSB7XG4gICAgICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAgPSBjcmVhdGVqcy5Tb3VuZC5wbGF5KFwiZW1wdHlcIik7XG4gICAgICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAub24oXCJjb21wbGV0ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5idWxsZXRzIC09IDE7XG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xuXG4gICAgdmFyIGRpcmVjdGlvbnMgPSBbXTtcbiAgICB2YXIgZGlyZWN0aW9uO1xuXG4gICAgLy92YXIgdGFyZ2V0TG9jYXRpb25zID0gW107XG4gICAgLy92YXIgdGFyZ2V0TG9jYXRpb25zO1xuXG4gICAgY3JlYXRlanMuU291bmQucGxheSh0aGlzLnNvdW5kKTtcbiAgICAvLyBzaG9vdCA0IGJ1bGxldHNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYnVsbGV0c1BlclNob3Q7IGkgKz0gMSkge1xuXG4gICAgICAgIGlmICghYWN0aW9uLmRhdGEuZGlyZWN0aW9ucykge1xuICAgICAgICAgICAgLy8gcmFuZG9taXplIGRpcmVjdGlvbnMgbXlzZWxmXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLm93bmVyLmRpcmVjdGlvbiArIE1hdGgucmFuZG9tKCkgKiAwLjI1IC0gMC4xMjU7XG4gICAgICAgICAgICBkaXJlY3Rpb25zLnB1c2goZGlyZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IGFjdGlvbi5kYXRhLmRpcmVjdGlvbnNbaV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYnVsbGV0ID0gbmV3IEJ1bGxldCh7XG4gICAgICAgICAgICB4OiB0aGlzLm93bmVyLngsXG4gICAgICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgICAgICBkaXJlY3Rpb246ZGlyZWN0aW9uLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZSxcbiAgICAgICAgICAgIHNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coXCJGSVJFXCIsIGFjdGlvbiwgZGlyZWN0aW9ucyk7XG4gICAgYWN0aW9uLmRhdGEuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnM7XG5cblxuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3RndW47XG4iLCJ2YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0XCIpO1xuXG5jbGFzcyBXZWFwb257XG4gICAgY29uc3RydWN0b3Iob3duZXIsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5vd25lciA9IG93bmVyO1xuICAgICAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgIHRoaXMubWFnYXppbmVTaXplID0gZGF0YS5tYWdhemluZVNpemU7XG4gICAgICAgIHRoaXMuYnVsbGV0cyA9IGRhdGEuYnVsbGV0cztcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IGRhdGEuZmlyZVJhdGU7XG4gICAgICAgIHRoaXMuZGFtYWdlID0gZGF0YS5kYW1hZ2U7XG4gICAgICAgIHRoaXMucmVsb2FkVGltZSA9IGRhdGEucmVsb2FkVGltZTtcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XG4gICAgICAgIHRoaXMuYnVsbGV0c1BlclNob3QgPSBkYXRhLmJ1bGxldHNQZXJTaG90O1xuICAgICAgICB0aGlzLnN4ID0gZGF0YS5zeDtcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XG5cbiAgICAgICAgdGhpcy5pY29uU3ggPSBkYXRhLmljb25TeDtcbiAgICAgICAgdGhpcy5pY29uU3kgPSBkYXRhLmljb25TeTtcbiAgICAgICAgdGhpcy5pY29uVyA9IGRhdGEuaWNvblc7XG4gICAgICAgIHRoaXMuaWNvbkggPSBkYXRhLmljb25IO1xuXG4gICAgICAgIHRoaXMuc291bmQgPSBkYXRhLnNvdW5kO1xuICAgICAgICB0aGlzLnJlbG9hZFNvdW5kID0gZGF0YS5yZWxvYWRTb3VuZDtcblxuICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXAgPSBudWxsO1xuICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VSZWxvYWQgPSBjcmVhdGVqcy5Tb3VuZC5jcmVhdGVJbnN0YW5jZSh0aGlzLnJlbG9hZFNvdW5kKTtcblxuICAgICAgICB0aGlzLmZpcmVUaW1lciA9IHRoaXMuZmlyZVJhdGU7XG5cbiAgICAgICAgdGhpcy5yZWxvYWRpbmcgPSBkYXRhLnJlbG9hZGluZyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5yZWxvYWRUaW1lciA9IGRhdGEucmVsb2FkVGltZXIgfHwgMDtcbiAgICB9XG59XG5cbldlYXBvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlKSB0aGlzLmZpcmVUaW1lciArPSBkdDtcblxuICAgIGlmICh0aGlzLnJlbG9hZGluZykge1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyICs9IGR0O1xuICAgICAgICBpZiAodGhpcy5yZWxvYWRUaW1lciA+IHRoaXMucmVsb2FkVGltZSl7XG4gICAgICAgICAgICB0aGlzLmZpbGxNYWdhemluZSgpO1xuICAgICAgICAgICAgdGhpcy5zdG9wUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcblxuICAgIC8vIHBsYXkgZW1wdHkgY2xpcCBzb3VuZCBpZiBvdXQgb2YgYnVsbGV0c1xuICAgIGlmICggdGhpcy5idWxsZXRzIDwgMSAmJiAhdGhpcy5yZWxvYWRpbmcpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNvdW5kSW5zdGFuY2VFbXB0eUNsaXApIHtcbiAgICAgICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCA9IGNyZWF0ZWpzLlNvdW5kLnBsYXkoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcC5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc291bmRJbnN0YW5jZUVtcHR5Q2xpcCA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlyZVRpbWVyIDwgdGhpcy5maXJlUmF0ZSB8fCB0aGlzLnJlbG9hZGluZyB8fCB0aGlzLmJ1bGxldHMgPCAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLmJ1bGxldHMgLT0gdGhpcy5idWxsZXRzUGVyU2hvdDtcbiAgICB0aGlzLmZpcmVUaW1lciA9IDA7XG5cbiAgICBjcmVhdGVqcy5Tb3VuZC5wbGF5KHRoaXMuc291bmQpO1xuXG4gICAgLy93aW5kb3cuZ2FtZS5zb3VuZHNbdGhpcy5zb3VuZF0ucGxheSgpO1xuICAgIHZhciBidWxsZXQgPSBuZXcgQnVsbGV0KHtcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxuICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5vd25lci5kaXJlY3Rpb24sXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2UsXG4gICAgICAgIHNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkXG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKHRoaXMub3duZXIuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIC8vIGlmIHRoaXMgaXMgbXkgcGxheWVyLiBwbGF5IHJlbG9hZCBzb3VuZFxuICAgICAgICB0aGlzLnNvdW5kSW5zdGFuY2VSZWxvYWQucGxheSgpO1xuICAgIHRoaXMucmVsb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuV2VhcG9uLnByb3RvdHlwZS5maWxsTWFnYXppbmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJ1bGxldHMgPSB0aGlzLm1hZ2F6aW5lU2l6ZTtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuc3RvcFJlbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLm93bmVyLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSAvLyBpZiB0aGlzIGlzIG15IHBsYXllci4gc3RvcCByZWxvYWQgc291bmRcbiAgICAgICAgdGhpcy5zb3VuZEluc3RhbmNlUmVsb2FkLnN0b3AoKTtcbiAgICB0aGlzLnJlbG9hZGluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVsb2FkVGltZXIgPSAwO1xufTtcblxuV2VhcG9uLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgYnVsbGV0czogdGhpcy5idWxsZXRzLFxuICAgICAgICBmaXJlVGltZXI6IHRoaXMuZmlyZVJhdGUsXG4gICAgICAgIHJlbG9hZGluZzogdGhpcy5yZWxvYWRpbmcsXG4gICAgICAgIHJlbG9hZFRpbWVyOiB0aGlzLnJlbG9hZFRpbWVyXG4gICAgfTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFdlYXBvbjtcbiIsInZhciBTaG90Z3VuID0gcmVxdWlyZShcIi4uLy4vd2VhcG9ucy9TaG90Z3VuXCIpO1xyXG52YXIgQWs0NyA9IHJlcXVpcmUoXCIuLi8uL3dlYXBvbnMvQWs0N1wiKTtcclxudmFyIHdlYXBvbkRhdGEgPSByZXF1aXJlKFwiLi4vZGF0YS93ZWFwb25zXCIpO1xyXG5cclxuZnVuY3Rpb24gd2VhcG9uQ3JlYXRvcihvd25lciwgZGF0YSkge1xyXG5cclxuICAgIHZhciB3ZXBEYXRhID0gd2VhcG9uRGF0YVtkYXRhLm5hbWVdO1xyXG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHsgd2VwRGF0YVtrZXldID0gZGF0YVtrZXldOyB9XHJcblxyXG4gICAgc3dpdGNoIChkYXRhLm5hbWUpIHtcclxuICAgICAgICBjYXNlIFwiQWs0N1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEFrNDcob3duZXIsIHdlcERhdGEpO1xyXG4gICAgICAgIGNhc2UgXCJzaG90Z3VuXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2hvdGd1bihvd25lciwgd2VwRGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gd2VhcG9uQ3JlYXRvcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyB2YXIgUGxheWVyID0gcmVxdWlyZShcIi4vLi4vUGxheWVyXCIpO1xuXG5mdW5jdGlvbiBDbGllbnQoSUQpe1xuICAgIC8vdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcbiAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcihJRCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSwgcG9ydDogd2luZG93LmxvY2F0aW9uLnBvcnQsIHBhdGg6IFwiL3BlZXJcIn0pO1xuXG4gICAgLy8gU3RyZXNzIHRlc3RcbiAgICB0aGlzLnRlc3RzUmVjZWl2ZWQgPSAwO1xuXG4gICAgdGhpcy5hY3Rpb25zID0gW107Ly8gaGVyZSB3ZSB3aWxsIHN0b3JlIHJlY2VpdmVkIGFjdGlvbnMgZnJvbSB0aGUgaG9zdFxuICAgIHRoaXMuY2hhbmdlcyA9IFtdOyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgY2hhbmdlcyBmcm9tIHRoZSBob3N0XG5cbiAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIC8vIGl2ZSBnb3QgbXkgcGVlcklEIGFuZCBnYW1lSUQsIGxldHMgc2VuZCBpdCB0byB0aGUgc2VydmVyIHRvIGpvaW4gdGhlIGhvc3RcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5zb2NrZXQuZW1pdChcImpvaW5cIiwge3BlZXJJRDogaWQsIGdhbWVJRDogd2luZG93LmdhbWUuZ2FtZUlEfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibXkgY2xpZW50IHBlZXJJRCBpcyBcIiwgaWQpO1xuXG4gICAgICAgIHdpbmRvdy5nYW1lLm15UGxheWVySUQgPSBpZDtcblxuICAgICAgICBpZiAoIXdpbmRvdy5nYW1lLnN0YXJ0ZWQpIHdpbmRvdy5nYW1lLnN0YXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cblxuICAgICAgICAvLyBjbG9zZSBvdXQgYW55IG9sZCBjb25uZWN0aW9uc1xuICAgICAgICBpZihPYmplY3Qua2V5cyh0aGlzLmNvbm5lY3Rpb25zKS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGNvbm5QZWVyIGluIHRoaXMuY29ubmVjdGlvbnMpe1xuICAgICAgICAgICAgICAgIGlmIChjb25uUGVlciAhPT0gY29ubi5wZWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnNbY29ublBlZXJdWzBdLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVsZXRlIG9sZCBob3N0cyBwbGF5ZXIgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJkZWxldGUgb2xkIHBsYXllclwiLCBjb25uUGVlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ublBlZXJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9yZSBpdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uID0gY29ubjtcblxuICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2goZGF0YS5ldmVudCl7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBsYXllckpvaW5lZFwiOlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoZGF0YS5wbGF5ZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2FzZSBcInBsYXllckxlZnRcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC8vd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLmlkfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5nYW1lU3RhdGUucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImdhbWVTdGF0ZVVwZGF0ZVwiOlxuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbbmV3U3RhdGUuaWRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXRzIG15IG93biBzdGF0ZSwgd2UgaWdub3JlIGtleXN0YXRlIGFuZCBvdGhlciBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBsYXllci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBwbGF5ZXIueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHA6IG5ld1N0YXRlLmhwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGl2ZTogbmV3U3RhdGUuYWxpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLnVwZGF0ZVN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcImNoYW5nZXNcIjogLy8gY2hhbmdlcyBhbmQgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcyA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNoYW5nZXMuY29uY2F0KGRhdGEuY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucyA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMuY29uY2F0KGRhdGEuYWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjogLy8gaG9zdCBzZW50IGEgcGluZywgYW5zd2VyIGl0XG4gICAgICAgICAgICAgICAgICAgY29ubi5zZW5kKHsgZXZlbnQ6IFwicG9uZ1wiLCB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wIH0pO1xuICAgICAgICAgICAgICAgICAgIGRhdGEucGluZ3MuZm9yRWFjaChmdW5jdGlvbihwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3BpbmcuaWRdLnBpbmcgPSBwaW5nLnBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdLnBpbmc7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCh3aW5kb3cuZ2FtZS5wbGF5ZXJzKTtcbiAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbGN1bGF0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9KTtcbn1cblxuQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t0aGlzLnBlZXIuaWRdO1xuICAgIGlmICghcGxheWVyKSByZXR1cm47XG5cbiAgICB2YXIgY3VycmVudFN0YXRlID0gcGxheWVyLmdldENsaWVudFN0YXRlKCk7XG4gICAgdmFyIGxhc3RDbGllbnRTdGF0ZSA9IHBsYXllci5sYXN0Q2xpZW50U3RhdGU7XG4gICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdENsaWVudFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG5cbiAgICAvLyBhZGQgYW55IHBlcmZvcm1lZCBhY3Rpb25zIHRvIGNoYW5nZSBwYWNrYWdlXG4gICAgaWYgKHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSkge1xuICAgICAgICAvLyB0aGVyZSdzIGJlZW4gY2hhbmdlcywgc2VuZCBlbSB0byBob3N0XG4gICAgICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAgICAgICAgIGV2ZW50OiBcIm5ldHdvcmtVcGRhdGVcIixcbiAgICAgICAgICAgIHVwZGF0ZXM6IGNoYW5nZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGxheWVyLmxhc3RDbGllbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZTtcblxuXG5cblxuICAgIC8vIHVwZGF0ZSB3aXRoIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSBob3N0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldO1xuXG4gICAgICAgIC8vIGZvciBub3csIGlnbm9yZSBteSBvd24gY2hhbmdlc1xuICAgICAgICBpZiAoY2hhbmdlLmlkICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLmlkXS5uZXR3b3JrVXBkYXRlKGNoYW5nZSk7XG4gICAgICAgICAgICB9Y2F0Y2ggKGVycikge1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hhbmdlcyA9IFtdO1xuICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG5cblxuXG4gICAgLy8gLy8gY2hlY2sgaWYgbXkga2V5c3RhdGUgaGFzIGNoYW5nZWRcbiAgICAvLyB2YXIgbXlQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgLy8gaWYgKCFteVBsYXllcikgcmV0dXJuO1xuICAgIC8vXG4gICAgLy8gIGlmICghXy5pc0VxdWFsKG15UGxheWVyLmtleXMsIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSkpIHtcbiAgICAvLyAgICAgLy8gc2VuZCBrZXlzdGF0ZSB0byBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImtleXNcIixcbiAgICAvLyAgICAgICAgIGtleXM6IG15UGxheWVyLmtleXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gIH1cbiAgICAvLyBteVBsYXllci5jb250cm9scy5rZXlib2FyZC5sYXN0U3RhdGUgPSBfLmNsb25lKG15UGxheWVyLmtleXMpO1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG4gICAgLy9cbiAgICAvLyB2YXIgY3VycmVudFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIC8vIHZhciBjaGFuZ2VzID0gW107XG4gICAgLy8gdmFyIGxhc3RTdGF0ZSA9IG15UGxheWVyLmxhc3RTdGF0ZTtcbiAgICAvLyB2YXIgbmV3U3RhdGUgPSBteVBsYXllci5nZXRTdGF0ZSgpO1xuICAgIC8vXG4gICAgLy8gLy8gY29tcGFyZSBwbGF5ZXJzIG5ldyBzdGF0ZSB3aXRoIGl0J3MgbGFzdCBzdGF0ZVxuICAgIC8vIHZhciBjaGFuZ2UgPSBfLm9taXQobmV3U3RhdGUsIGZ1bmN0aW9uKHYsaykgeyByZXR1cm4gbGFzdFN0YXRlW2tdID09PSB2OyB9KTtcbiAgICAvLyBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgLy8gICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzXG4gICAgLy8gICAgIGNoYW5nZS5wbGF5ZXJJRCA9IG15UGxheWVyLmlkO1xuICAgIC8vICAgICBjaGFuZ2VzLnB1c2goY2hhbmdlKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBteVBsYXllci5sYXN0U3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAvLyAvLyBpZiB0aGVyZSBhcmUgY2hhbmdlc1xuICAgIC8vIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApe1xuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgLy8gICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmICh0aGlzLmFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAvLyBzZW5kIGFsbCBwZXJmb3JtZWQgYWN0aW9ucyB0byB0aGUgaG9zdFxuICAgIC8vICAgICB0aGlzLmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICBldmVudDogXCJhY3Rpb25zXCIsXG4gICAgLy8gICAgICAgICBkYXRhOiB0aGlzLmFjdGlvbnNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBjbGVhciBhY3Rpb25zIHF1ZXVlXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY2hhbmdlc1tpXS5sZW5ndGg7IGogKz0gMSkgIHtcbiAgICAvLyAgICAgICAgIGNoYW5nZSA9IHRoaXMuY2hhbmdlc1tpXVtqXTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgLy8gICAgICAgICBpZiAoY2hhbmdlLnBsYXllcklEICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2NoYW5nZS5wbGF5ZXJJRF0uY2hhbmdlKGNoYW5nZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyB0aGlzLmNoYW5nZXMgPSBbXTtcblxufTtcblxuICAgIC8vXG4gICAgLy8gdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgLy8gICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4gPSBjb25uO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNvbm5lY3Rpb24gZnJvbSBzZXJ2ZXJcIiwgdGhpcy5wZWVyLCBjb25uKTtcbiAgICAvL1xuICAgIC8vICAgICAvL2NyZWF0ZSB0aGUgcGxheWVyXG4gICAgLy8gICAgIC8vd2luZG93LmdhbWUucGxheWVyID0gd2luZG93LmdhbWUuYWRkUGxheWVyKGNvbm4ucGVlcik7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvL0xpc3RlbiBmb3IgZGF0YSBldmVudHMgZnJvbSB0aGUgaG9zdFxuICAgIC8vICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICAgICAgICBpZiAoZGF0YS5ldmVudCA9PT0gXCJwaW5nXCIpeyAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAvLyAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgIGlmKGRhdGEuZXZlbnQgPT09IFwicG9uZ1wiKSB7IC8vIHdlJ3ZlIHJlY2VpdmVkIGEgcG9uZyBmcm9tIHRoZSBob3N0LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgIC8vICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgIC8vICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHBpbmc7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvLyAgICAgLy8gcGluZyB0ZXN0XG4gICAgLy8gICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgICAgIGV2ZW50OiBcInBpbmdcIixcbiAgICAvLyAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9LCAyMDAwKTtcbiAgICAvL1xuICAgIC8vIH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gSG9zdCgpe1xuICAgIHRoaXMuY29ubnMgPSB7fTtcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTsgLy8gaGVyZSB3ZSB3aWxsIHN0b3JlIGFsbCB0aGUgYWN0aW9ucyByZWNlaXZlZCBmcm9tIGNsaWVudHNcbiAgICB0aGlzLmxhc3RQbGF5ZXJzU3RhdGUgPSBbXTtcbiAgICB0aGlzLmRpZmYgPSBudWxsO1xuXG4gICAgdGhpcy5jb25uZWN0ID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIC8vdGhpcy5wZWVyID0gbmV3IFBlZXIoe2tleTogXCJncHk1aTRoanlqcjRmZ3ZpXCJ9KTtcbiAgICAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoZGF0YS5ob3N0SUQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsIHBvcnQ6IHdpbmRvdy5sb2NhdGlvbi5wb3J0LCBwYXRoOiBcIi9wZWVyXCJ9KTtcblxuICAgICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGhvc3RzIHBsYXllciBvYmplY3QgaWYgaXQgZG9lc250IGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBpZiAoISh3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkIGluIHdpbmRvdy5nYW1lLnBsYXllcnMpKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHtpZDogd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZW5kIGEgcGluZyBldmVyeSAyIHNlY29uZHMsIHRvIHRyYWNrIHBpbmcgdGltZVxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgIHBpbmdzOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZ2V0UGluZ3MoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwyMDAwKTtcblxuICAgICAgICAgICAgLy8gc2VuZCBmdWxsIGdhbWUgc3RhdGUgb25jZSBpbiBhIHdoaWxlXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgICAgICBldmVudDogXCJnYW1lU3RhdGVVcGRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwxMDAwKTtcblxuICAgICAgICAgICAgZGF0YS5wZWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBlZXJJRCkge1xuICAgICAgICAgICAgICAgIC8vY29ubmVjdCB3aXRoIGVhY2ggcmVtb3RlIHBlZXJcbiAgICAgICAgICAgICAgICB2YXIgY29ubiA9ICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QucGVlci5jb25uZWN0KHBlZXJJRCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJob3N0SUQ6XCIsIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmlkLCBcIiBjb25uZWN0IHdpdGhcIiwgcGVlcklEKTtcbiAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyc1twZWVySURdID0gcGVlcjtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbcGVlcklEXSA9IGNvbm47XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHBsYXllclxuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIG5ldyBwbGF5ZXIgZGF0YSB0byBldmVyeW9uZVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVySm9pbmVkXCIsIHBsYXllckRhdGE6IG5ld1BsYXllci5nZXRGdWxsU3RhdGUoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgdGhlIG5ldyBwbGF5ZXIgdGhlIGZ1bGwgZ2FtZSBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmVtaXQoIHtjbGllbnRJRDogY29ubi5wZWVyLCBldmVudDogXCJnYW1lU3RhdGVcIiwgZ2FtZVN0YXRlOiB3aW5kb3cuZ2FtZS5nZXRHYW1lU3RhdGUoKX0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImNsb3NlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5zW2Nvbm4ucGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7IGV2ZW50OiBcInBsYXllckxlZnRcIiwgaWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcImVycm9yXCIsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkVSUk9SIEVWRU5UXCIsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZGF0YVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChkYXRhLmV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwaW5nXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7IC8vIGFuc3dlciB0aGUgcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBvbmdcIjogLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGNsaWVudCwgY2FsdWNhdGUgcGluZ3RpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaW5nID0gRGF0ZS5ub3coKSAtIGRhdGEudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLnBpbmcgPSBwaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJuZXR3b3JrVXBkYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGZyb20gYSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ubmV0d29ya1VwZGF0ZShkYXRhLnVwZGF0ZXMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhLmFjdGlvbnMpOyAvLyBUT0RPIHZlcmlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwiYWN0aW9uc1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImFjdGlvbnMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmFjdGlvbnMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJjaGFuZ2VzXCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcIkhleSB0aGVyZSBoYXMgYmVlbiBjaGFuZ2VzIVwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5jaGFuZ2UoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBjYXNlIFwia2V5c1wiOiAvLyByZWNlaXZpbmcgYWN0aW9ucyBmcm9tIGEgcGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb25zb2xlLmxvZyhcImtleXMgcmVjZWl2ZWQgZnJvbVwiLCBjb25uLnBlZXIsIGRhdGEua2V5cywgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ua2V5cyA9IF8uY2xvbmUoZGF0YS5rZXlzKTsgLy9UT0RPOiB2ZXJpZnkgaW5wdXQgKGNoZWNrIHRoYXQgaXQgaXMgdGhlIGtleSBvYmplY3Qgd2l0aCB0cnVlL2ZhbHNlIHZhbHVlcylcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBmb3IgKHZhciBjb25uIGluIHRoaXMuY29ubnMpe1xuICAgICAgICAgICAgdGhpcy5jb25uc1tjb25uXS5zZW5kKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGp1c3Qgc2VuZCBkYXRhIHRvIGEgc3BlY2lmaWMgY2xpZW50XG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVNSVQhXCIsIGRhdGEpO1xuICAgICAgICB0aGlzLmNvbm5zW2RhdGEuY2xpZW50SURdLnNlbmQoZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlIHNpbmNlIGxhc3QgdGltZVxuXG4gICAgICAgIHZhciBjaGFuZ2VzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICB2YXIgY3VycmVudEZ1bGxTdGF0ZSA9IHBsYXllci5nZXRGdWxsU3RhdGUoKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBfLm9taXQoY3VycmVudEZ1bGxTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBwbGF5ZXIubGFzdEZ1bGxTdGF0ZVtrXSA9PT0gdjsgfSk7IC8vIGNvbXBhcmUgbmV3IGFuZCBvbGQgc3RhdGUgYW5kIGdldCB0aGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgaWYgKCFfLmlzRW1wdHkoY2hhbmdlKSB8fCBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucy5sZW5ndGggPiAwKSB7IC8vdGhlcmUncyBiZWVuIGNoYW5nZXMgb3IgYWN0aW9uc1xuICAgICAgICAgICAgICAgIGNoYW5nZS5pZCA9IHBsYXllci5pZDtcbiAgICAgICAgICAgICAgICBjaGFuZ2UuYWN0aW9ucyA9IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zO1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgICAgICAgICAgIHBsYXllci5sYXN0RnVsbFN0YXRlID0gY3VycmVudEZ1bGxTdGF0ZTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAvLyBzZW5kIGNoYW5nZXNcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KHtcbiAgICAgICAgICAgICAgICBldmVudDogXCJjaGFuZ2VzXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlczogY2hhbmdlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIHRoaXMuZ2V0UGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBpbmdzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuICAgICAgICAgICAgcGluZ3MucHVzaCh7aWQ6IHBsYXllci5pZCwgcGluZzogcGxheWVyLnBpbmcgfHwgXCJob3N0XCJ9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwaW5ncztcbiAgICB9O1xufTtcbiIsInZhciBDbGllbnQgPSByZXF1aXJlKFwiLi9DbGllbnRcIik7XHJcbnZhciBIb3N0ID0gcmVxdWlyZShcIi4vSG9zdFwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gV2ViUlRDKCl7XHJcbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcclxuICAgIHRoaXMuc29ja2V0ID0gaW8oKTtcclxuXHJcbiAgICAvLyByZWNlaXZpbmcgbXkgY2xpZW50IElEXHJcbiAgICB0aGlzLnNvY2tldC5vbihcIklEXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudCA9IG5ldyBDbGllbnQoZGF0YS5JRCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbihcInlvdUFyZUhvc3RcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW0gdGhlIGhvc3RcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0ID0gbmV3IEhvc3QoKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdCh7aG9zdElEOiBkYXRhLmhvc3RJRCwgcGVlcnM6IGRhdGEucGVlcnN9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVySm9pbmVkXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInBsYXllciBqb2luZWRcIiwgZGF0YSk7XHJcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmNvbm5lY3Qoe2hvc3RJRDogZGF0YS5ob3N0SUQsIHBlZXJzOltkYXRhLnBlZXJJRF19KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQTEFZRVIgTEVGVFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBkYXRhLnBsYXllcklEfSk7XHJcbiAgICB9KTtcclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XHJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5yZW1vdmVQbGF5ZXIoe2lkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwicGxheWVyTGVmdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgZGVsZXRlIHdpbmRvdy5nYW1lLnBsYXllcnNbZGF0YS5pZF07XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5wZWVycyA9IHt9O1xyXG4gICAgLy8gdGhpcy5jb25ucyA9IHt9O1xyXG4gICAgLy8gdGhpcy5zb2NrZXQuZW1pdChcImhvc3RTdGFydFwiLCB7Z2FtZUlEOiB0aGlzLmdhbWVJRH0pO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuc29ja2V0Lm9uKFwiam9pblwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvLyAgICAgLy8gYSBwZWVyIHdhbnRzIHRvIGpvaW4uIENyZWF0ZSBhIG5ldyBQZWVyIGFuZCBjb25uZWN0IHRoZW1cclxuICAgIC8vICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xyXG4gICAgLy8gICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCwgZGF0YS5wZWVySUQpO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnBlZXJzW2lkXSA9IHRoaXMucGVlcjtcclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uc1tkYXRhLnBlZXJJRF0gPSB0aGlzLmNvbm47XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGVlcnMpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5jb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAvLyBhIHBlZXIgaGFzIGRpc2Nvbm5lY3RlZFxyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaXNjb25uZWN0ZWQhXCIsIHRoaXMuY29ubiwgXCJQRUVSXCIsIHRoaXMucGVlcik7XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5wZWVyc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uc1t0aGlzLmNvbm4ucGVlcl07XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmdhbWUudWkudXBkYXRlQ2xpZW50TGlzdCgpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH0pO1xyXG59O1xyXG4iXX0=
