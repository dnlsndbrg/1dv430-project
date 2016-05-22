(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var helpers = require("./helpers");
//var Emitter = require("./particle/Emitter");
var collisionDetection = require("./util/collisionDetection");
var BulletHole = require("./particle/BulletHole");

function Bullet(data) {


    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    this.x = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    this.y = data.y + Math.sin(data.direction + 1.5707963268) * 5;

    this.x = this.x + Math.cos(data.direction) * 30;
    this.y = this.y + Math.sin(data.direction) * 30;

    this.originX = this.x; // remember the starting position
    this.originY = this.y;

    //this.x = data.x;
    //this.y = data.y;
    //
    // var xDiff = data.targetX - this.x;
    // var yDiff = data.targetY - this.y;
    // this.direction = Math.atan2(yDiff, xDiff);

    this.length = 10; // trail length
    this.direction = data.direction;
    this.speed = data.bulletSpeed;
    this.damage = data.damage;



    this.ctx = window.game.ctx;
}

Bullet.prototype.update = function(dt, index) {

    var distance = this.speed * dt;
    //
    var x = this.x + Math.cos(this.direction) * distance;
    var y = this.y + Math.sin(this.direction) * distance;

    // hit check against players
    this.hitDetection(index);

    // collision detection against tiles and outside of map
    var collision = helpers.collisionCheck({x: x, y: y});
    if (!collision) {
        this.x = x;
        this.y = y;
    } else {
        // add richocet particle effect
        // window.game.entities.push(new Emitter({
        //     type: "Ricochet",
        //     emitCount: 1,
        //     emitSpeed: null, // null means instant
        //     x: this.x,
        //     y: this.y
        // }));

        // find where the bullet trajectory intersected with the colliding rect

        var line = {start: {x: this.originX, y: this.originY}, end: {x: x, y:y}}; // the line that goes from the bullet origin position to its current position
        var rect = helpers.getRectFromPoint({x: x, y: y}); // rect of the colliding box
        var pos = collisionDetection.lineRectIntersect(line, rect);

        //console.log(pos);

        window.game.particles.push(new BulletHole(pos));

        this.destroy(index);
    }
    //
    // // if off screen, remove it
    // if (this.x < 0 || this.x > window.game.level.width || this.y < 0 || this.y > window.game.level.height) {
    //     this.destroy(index);
    //     return;
    // }
    //


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

},{"./helpers":19,"./particle/BulletHole":23,"./util/collisionDetection":28}],2:[function(require,module,exports){
//var helpers = require("./helpers");
//var Emitter = require("./particle/Emitter");
var bresenham = require("./util/bresenham");
var lineRectIntersect = require("./util/lineRectIntersect");
var BulletHole = require("./particle/BulletHole");

// instant bullet
function Bullet(data) {
    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    var startX = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    var startY = data.y + Math.sin(data.direction + 1.5707963268) * 5;

    startX = startX + Math.cos(data.direction) * 30;
    startY= startY + Math.sin(data.direction) * 30;

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
                intersect = lineRectIntersect(line, {x: collision.x * 32, y: collision.y * 32, w: 32, h: 32});
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

},{"./particle/BulletHole":23,"./util/bresenham":27,"./util/lineRectIntersect":30}],3:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./Camera":3,"./Level":7,"./Player":15,"./Ui":16,"./webRTC/WebRTC":37}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./data/level1":17}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
function Controls() {

}

module.exports = Controls;

},{}],10:[function(require,module,exports){
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

},{"../helpers":19,"./Particle":13}],11:[function(require,module,exports){
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

},{"../helpers":19,"./Particle":13}],12:[function(require,module,exports){
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

},{"./Blood":10,"./Blood2":11,"./Ricochet":14}],13:[function(require,module,exports){
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
    window.game.particles.splice(index, 1);
};

Particle.prototype.getFullState = function() {
    return {};
};

module.exports = Particle;

},{}],14:[function(require,module,exports){
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

},{"../helpers":19,"./Particle":13}],15:[function(require,module,exports){
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
var Entity = require("./Entity");
var Emitter = require("./particle/Emitter");
var weaponCreator = require("./weapons/weaponCreator");

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

},{"./Entity":4,"./Keyboard":6,"./Mouse":8,"./NetworkControls":9,"./helpers":19,"./particle/Emitter":24,"./weapons/Ak47":31,"./weapons/Shotgun":32,"./weapons/weaponCreator":34}],16:[function(require,module,exports){
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

},{"./Particle/Emitter":12,"./helpers":19}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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


module.exports = {
    toRadians: toRadians,
    toDegrees: toDegrees,
    collisionCheck: collisionCheck,
    findSpawnLocation: findSpawnLocation,
    getRectFromPoint: getRectFromPoint,
    getTile: getTile
};

},{}],20:[function(require,module,exports){
var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
});

},{"./Game.js":5}],21:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"../helpers":19,"./Particle":25,"dup":10}],22:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"../helpers":19,"./Particle":25,"dup":11}],23:[function(require,module,exports){
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

},{"./Particle":25}],24:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"./Blood":21,"./Blood2":22,"./Ricochet":26,"dup":12}],25:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],26:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"../helpers":19,"./Particle":25,"dup":14}],27:[function(require,module,exports){
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

    var tileX = Math.floor(x0 / 32);
    var tileY = Math.floor(y0 / 32);

    // check if outside map
    if (tileX > window.game.level.colTileCount || tileY > window.game.level.rowTileCount) return;

    // hit check against players
    for (var key in window.game.players) {
        var player = window.game.players[key];
        if (!player.alive) continue;
        var hit = collisionDetection.pointCircle({x: x0, y: y0}, {x: player.x, y: player.y, radius: player.radius});
        if (hit) {
            return {type: "player", player: player};
        }

    }

    // check against tiles
    if (helpers.getTile(tileX,tileY) === 1) return {type: "tile", x: tileX, y: tileY};
  }
}

module.exports = bline;

},{"./../helpers.js":19,"./collisionDetection":28}],28:[function(require,module,exports){
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

function pointCircle(point, circle) {
        var a = point.x - circle.x;
        var b = point.y - circle.y;
        var distance = Math.sqrt( a*a + b*b );
        if (distance < circle.radius) { // point is inside circle
            return true;
        }
}

module.exports = {
    lineRectIntersect: lineRectIntersect,
    pointCircle: pointCircle
};

},{"./intersection":29}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
var intersection = require("./intersection");

// find the point where a line intersects a rectangle. this function assumes the line and rect intersects
function lineRectIntersect(line, rect) {
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

module.exports = lineRectIntersect;

},{"./intersection":29}],31:[function(require,module,exports){
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").Ak47;

class Ak47 extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
        super(owner, weaponData);
    }
}

module.exports = Ak47;

},{"../data/weapons":18,"./Weapon":33}],32:[function(require,module,exports){
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
            targetX: this.owner.mouseX,
            targetY: this.owner.mouseY,
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

},{".././Bullet":1,"../data/weapons":18,"./Weapon":33}],33:[function(require,module,exports){
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

},{".././Bullet2":2}],34:[function(require,module,exports){
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

},{".././weapons/Ak47":31,".././weapons/Shotgun":32,"../data/weapons":18}],35:[function(require,module,exports){
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
                        data.gameState.players.forEach(function(player) {
                            if (player.id !== window.game.network.client.peer.id) // ignore my own state for now
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

},{"./Client":35,"./Host":36}]},{},[20])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0J1bGxldDIuanMiLCJzcmMvanMvQ2FtZXJhLmpzIiwic3JjL2pzL0VudGl0eS5qcyIsInNyYy9qcy9HYW1lLmpzIiwic3JjL2pzL0tleWJvYXJkLmpzIiwic3JjL2pzL0xldmVsLmpzIiwic3JjL2pzL01vdXNlLmpzIiwic3JjL2pzL05ldHdvcmtDb250cm9scy5qcyIsInNyYy9qcy9QYXJ0aWNsZS9CbG9vZC5qcyIsInNyYy9qcy9QYXJ0aWNsZS9CbG9vZDIuanMiLCJzcmMvanMvUGFydGljbGUvRW1pdHRlci5qcyIsInNyYy9qcy9QYXJ0aWNsZS9QYXJ0aWNsZS5qcyIsInNyYy9qcy9QYXJ0aWNsZS9SaWNvY2hldC5qcyIsInNyYy9qcy9QbGF5ZXIuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvZGF0YS9sZXZlbDEuanMiLCJzcmMvanMvZGF0YS93ZWFwb25zLmpzIiwic3JjL2pzL2hlbHBlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYXJ0aWNsZS9CdWxsZXRIb2xlLmpzIiwic3JjL2pzL3V0aWwvYnJlc2VuaGFtLmpzIiwic3JjL2pzL3V0aWwvY29sbGlzaW9uRGV0ZWN0aW9uLmpzIiwic3JjL2pzL3V0aWwvaW50ZXJzZWN0aW9uLmpzIiwic3JjL2pzL3V0aWwvbGluZVJlY3RJbnRlcnNlY3QuanMiLCJzcmMvanMvd2VhcG9ucy9BazQ3LmpzIiwic3JjL2pzL3dlYXBvbnMvU2hvdGd1bi5qcyIsInNyYy9qcy93ZWFwb25zL1dlYXBvbi5qcyIsInNyYy9qcy93ZWFwb25zL3dlYXBvbkNyZWF0b3IuanMiLCJzcmMvanMvd2ViUlRDL0NsaWVudC5qcyIsInNyYy9qcy93ZWJSVEMvSG9zdC5qcyIsInNyYy9qcy93ZWJSVEMvV2ViUlRDLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG4vL3ZhciBFbWl0dGVyID0gcmVxdWlyZShcIi4vcGFydGljbGUvRW1pdHRlclwiKTtcbnZhciBjb2xsaXNpb25EZXRlY3Rpb24gPSByZXF1aXJlKFwiLi91dGlsL2NvbGxpc2lvbkRldGVjdGlvblwiKTtcbnZhciBCdWxsZXRIb2xlID0gcmVxdWlyZShcIi4vcGFydGljbGUvQnVsbGV0SG9sZVwiKTtcblxuZnVuY3Rpb24gQnVsbGV0KGRhdGEpIHtcblxuXG4gICAgLy8gY3JlYXRlIHRoZSBidWxsZXQgNSBwaXhlbHMgdG8gdGhlIHJpZ2h0IGFuZCAzMCBwaXhlbHMgZm9yd2FyZC4gc28gaXQgYWxpZ25zIHdpdGggdGhlIGd1biBiYXJyZWxcbiAgICB0aGlzLnggPSBkYXRhLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xuICAgIHRoaXMueSA9IGRhdGEueSArIE1hdGguc2luKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XG5cbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbikgKiAzMDtcblxuICAgIHRoaXMub3JpZ2luWCA9IHRoaXMueDsgLy8gcmVtZW1iZXIgdGhlIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgdGhpcy5vcmlnaW5ZID0gdGhpcy55O1xuXG4gICAgLy90aGlzLnggPSBkYXRhLng7XG4gICAgLy90aGlzLnkgPSBkYXRhLnk7XG4gICAgLy9cbiAgICAvLyB2YXIgeERpZmYgPSBkYXRhLnRhcmdldFggLSB0aGlzLng7XG4gICAgLy8gdmFyIHlEaWZmID0gZGF0YS50YXJnZXRZIC0gdGhpcy55O1xuICAgIC8vIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpO1xuXG4gICAgdGhpcy5sZW5ndGggPSAxMDsgLy8gdHJhaWwgbGVuZ3RoXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkYXRhLmRpcmVjdGlvbjtcbiAgICB0aGlzLnNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcbiAgICB0aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xuXG5cblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xuXG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIC8vXG4gICAgdmFyIHggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcbiAgICB2YXIgeSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xuXG4gICAgLy8gaGl0IGNoZWNrIGFnYWluc3QgcGxheWVyc1xuICAgIHRoaXMuaGl0RGV0ZWN0aW9uKGluZGV4KTtcblxuICAgIC8vIGNvbGxpc2lvbiBkZXRlY3Rpb24gYWdhaW5zdCB0aWxlcyBhbmQgb3V0c2lkZSBvZiBtYXBcbiAgICB2YXIgY29sbGlzaW9uID0gaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogeCwgeTogeX0pO1xuICAgIGlmICghY29sbGlzaW9uKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWRkIHJpY2hvY2V0IHBhcnRpY2xlIGVmZmVjdFxuICAgICAgICAvLyB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAgICAgLy8gICAgIHR5cGU6IFwiUmljb2NoZXRcIixcbiAgICAgICAgLy8gICAgIGVtaXRDb3VudDogMSxcbiAgICAgICAgLy8gICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIC8vICAgICB4OiB0aGlzLngsXG4gICAgICAgIC8vICAgICB5OiB0aGlzLnlcbiAgICAgICAgLy8gfSkpO1xuXG4gICAgICAgIC8vIGZpbmQgd2hlcmUgdGhlIGJ1bGxldCB0cmFqZWN0b3J5IGludGVyc2VjdGVkIHdpdGggdGhlIGNvbGxpZGluZyByZWN0XG5cbiAgICAgICAgdmFyIGxpbmUgPSB7c3RhcnQ6IHt4OiB0aGlzLm9yaWdpblgsIHk6IHRoaXMub3JpZ2luWX0sIGVuZDoge3g6IHgsIHk6eX19OyAvLyB0aGUgbGluZSB0aGF0IGdvZXMgZnJvbSB0aGUgYnVsbGV0IG9yaWdpbiBwb3NpdGlvbiB0byBpdHMgY3VycmVudCBwb3NpdGlvblxuICAgICAgICB2YXIgcmVjdCA9IGhlbHBlcnMuZ2V0UmVjdEZyb21Qb2ludCh7eDogeCwgeTogeX0pOyAvLyByZWN0IG9mIHRoZSBjb2xsaWRpbmcgYm94XG4gICAgICAgIHZhciBwb3MgPSBjb2xsaXNpb25EZXRlY3Rpb24ubGluZVJlY3RJbnRlcnNlY3QobGluZSwgcmVjdCk7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhwb3MpO1xuXG4gICAgICAgIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCdWxsZXRIb2xlKHBvcykpO1xuXG4gICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gLy8gaWYgb2ZmIHNjcmVlbiwgcmVtb3ZlIGl0XG4gICAgLy8gaWYgKHRoaXMueCA8IDAgfHwgdGhpcy54ID4gd2luZG93LmdhbWUubGV2ZWwud2lkdGggfHwgdGhpcy55IDwgMCB8fCB0aGlzLnkgPiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpIHtcbiAgICAvLyAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcbiAgICAvLyAgICAgcmV0dXJuO1xuICAgIC8vIH1cbiAgICAvL1xuXG5cbn07XG5cbkJ1bGxldC5wcm90b3R5cGUuaGl0RGV0ZWN0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAvLyB0ZXN0IGJ1bGxldCBhZ2FpbnN0IGFsbCBwbGF5ZXJzXG4gICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcblxuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xuXG4gICAgICAgIGlmICghcGxheWVyLmFsaXZlKSBjb250aW51ZTtcblxuICAgICAgICB2YXIgYSA9IHRoaXMueCAtIHBsYXllci54O1xuICAgICAgICB2YXIgYiA9IHRoaXMueSAtIHBsYXllci55O1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xuXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IHBsYXllci5yYWRpdXMpIHtcbiAgICAgICAgICAgIC8vIGhpdFxuICAgICAgICAgICAgcGxheWVyLnRha2VEYW1hZ2UodGhpcy5kYW1hZ2UsIHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbkJ1bGxldC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24gLSAwLjc4NTM5ODE2MzQpOyAvLyByb3RhdGVcblxuICAgIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXG4gICAgdmFyIGdyYWQ9IHRoaXMuY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJnYmEoMjU1LDE2NSwwLDAuNClcIik7XG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJ5ZWxsb3dcIik7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgMCk7XG4gICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoKTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuXG5cbiAgICAvLyBjdHgubGluZVdpZHRoID0gMTtcblxuICAgIC8vXG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5tb3ZlVG8oMCwwKTtcbiAgICAvLyBjdHgubGluZVRvKDAsdGhpcy5sZW5ndGgpO1xuXG4gICAgdGhpcy5jdHguc3Ryb2tlKCk7XG5cbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XG4gICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoLCAxLCAxICk7XG5cblxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcblxuICAgIC8vXG4gICAgLy9cbiAgICAvLyBjdHgubGluZVdpZHRoID0gMTtcbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxuICAgIC8vIHZhciBncmFkPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgdGhpcy5sZW5ndGgpO1xuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDAsIFwicmVkXCIpO1xuICAgIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwiZ3JlZW5cIik7XG4gICAgLy8gY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcbiAgICAvLyBjdHguYmVnaW5QYXRoKCk7XG4gICAgLy8gY3R4Lm1vdmVUbygwLDApO1xuICAgIC8vIGN0eC5saW5lVG8oMCxsZW5ndGgpO1xuICAgIC8vIGN0eC5zdHJva2UoKTtcblxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0O1xuIiwiLy92YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XHJcbi8vdmFyIEVtaXR0ZXIgPSByZXF1aXJlKFwiLi9wYXJ0aWNsZS9FbWl0dGVyXCIpO1xyXG52YXIgYnJlc2VuaGFtID0gcmVxdWlyZShcIi4vdXRpbC9icmVzZW5oYW1cIik7XHJcbnZhciBsaW5lUmVjdEludGVyc2VjdCA9IHJlcXVpcmUoXCIuL3V0aWwvbGluZVJlY3RJbnRlcnNlY3RcIik7XHJcbnZhciBCdWxsZXRIb2xlID0gcmVxdWlyZShcIi4vcGFydGljbGUvQnVsbGV0SG9sZVwiKTtcclxuXHJcbi8vIGluc3RhbnQgYnVsbGV0XHJcbmZ1bmN0aW9uIEJ1bGxldChkYXRhKSB7XHJcbiAgICAvLyBjcmVhdGUgdGhlIGJ1bGxldCA1IHBpeGVscyB0byB0aGUgcmlnaHQgYW5kIDMwIHBpeGVscyBmb3J3YXJkLiBzbyBpdCBhbGlnbnMgd2l0aCB0aGUgZ3VuIGJhcnJlbFxyXG4gICAgdmFyIHN0YXJ0WCA9IGRhdGEueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcbiAgICB2YXIgc3RhcnRZID0gZGF0YS55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcclxuXHJcbiAgICBzdGFydFggPSBzdGFydFggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIHN0YXJ0WT0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcblxyXG4gICAgLy90aGlzLmRpcmVjdGlvbiA9IGRhdGEuZGlyZWN0aW9uO1xyXG4gICAgLy90aGlzLnNwZWVkID0gZGF0YS5idWxsZXRTcGVlZDtcclxuICAgIC8vdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcclxuICAgIC8vXHJcbiAgICB2YXIgbGluZSA9IHtcclxuICAgICAgICBzdGFydDoge3g6IHN0YXJ0WCwgeTogc3RhcnRZfSxcclxuICAgICAgICBlbmQ6IHt4OiBkYXRhLnRhcmdldFgsIHk6IGRhdGEudGFyZ2V0WX1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIGludGVyc2VjdCA9IG51bGw7XHJcblxyXG4gICAgdmFyIGNvbGxpc2lvbiA9IGJyZXNlbmhhbShzdGFydFgsIHN0YXJ0WSwgZGF0YS50YXJnZXRYLCBkYXRhLnRhcmdldFkpOyAvLyBmaW5kIGNvbGxpZGluZyByZWN0YW5nbGVzXHJcbiAgICBpZiAoY29sbGlzaW9uKSB7XHJcbiAgICAgICAgc3dpdGNoKGNvbGxpc2lvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0aWxlXCI6XHJcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3QgPSBsaW5lUmVjdEludGVyc2VjdChsaW5lLCB7eDogY29sbGlzaW9uLnggKiAzMiwgeTogY29sbGlzaW9uLnkgKiAzMiwgdzogMzIsIGg6IDMyfSk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQnVsbGV0SG9sZShpbnRlcnNlY3QpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwicGxheWVyXCI6XHJcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24ucGxheWVyLnRha2VEYW1hZ2UoZGF0YS5kYW1hZ2UsIGRhdGEuZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICAvLyB2YXIgY3ggPSB0aGlzLng7IC8vIEJlZ2luL2N1cnJlbnQgY2VsbCBjb29yZHNcclxuICAgIC8vIHZhciBjeSA9IHRoaXMueTtcclxuICAgIC8vIHZhciBleCA9IEVuZFg7IC8vIEVuZCBjZWxsIGNvb3Jkc1xyXG4gICAgLy8gdmFyIGV5ID0gRW5kWTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBEZWx0YSBvciBkaXJlY3Rpb25cclxuICAgIC8vIGRvdWJsZSBkeCA9IEVuZFgtQmVnaW5YO1xyXG4gICAgLy8gZG91YmxlIGR5ID0gRW5kWS1CZWdpblk7XHJcbiAgICAvL1xyXG4gICAgLy8gd2hpbGUgKGN4IDwgZXggJiYgY3kgPCBleSlcclxuICAgIC8vIHtcclxuICAgIC8vICAgLy8gZmluZCBpbnRlcnNlY3Rpb24gXCJ0aW1lXCIgaW4geCBkaXJcclxuICAgIC8vICAgZmxvYXQgdDAgPSAoY2VpbChCZWdpblgpLUJlZ2luWCkvZHg7XHJcbiAgICAvLyAgIGZsb2F0IHQxID0gKGNlaWwoQmVnaW5ZKS1CZWdpblkpL2R5O1xyXG4gICAgLy9cclxuICAgIC8vICAgdmlzaXRfY2VsbChjeCwgY3kpO1xyXG4gICAgLy9cclxuICAgIC8vICAgaWYgKHQwIDwgdDEpIC8vIGNyb3NzIHggYm91bmRhcnkgZmlyc3Q9P1xyXG4gICAgLy8gICB7XHJcbiAgICAvLyAgICAgKytjeDtcclxuICAgIC8vICAgICBCZWdpblggKz0gdDAqZHg7XHJcbiAgICAvLyAgICAgQmVnaW5ZICs9IHQwKmR5O1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyAgIGVsc2VcclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgICsrY3k7XHJcbiAgICAvLyAgICAgQmVnaW5YICs9IHQxKmR4O1xyXG4gICAgLy8gICAgIEJlZ2luWSArPSB0MSpkeTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfVxyXG5cclxufVxyXG5cclxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcblxyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgLy8gLy9cclxuICAgIC8vIHZhciB4ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAvLyB2YXIgeSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy9cclxuICAgIC8vIC8vIGhpdCBjaGVjayBhZ2FpbnN0IHBsYXllcnNcclxuICAgIC8vIHRoaXMuaGl0RGV0ZWN0aW9uKGluZGV4KTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uIGFnYWluc3QgdGlsZXMgYW5kIG91dHNpZGUgb2YgbWFwXHJcbiAgICAvLyB2YXIgY29sbGlzaW9uID0gaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogeCwgeTogeX0pO1xyXG4gICAgLy8gaWYgKCFjb2xsaXNpb24pIHtcclxuICAgIC8vICAgICB0aGlzLnggPSB4O1xyXG4gICAgLy8gICAgIHRoaXMueSA9IHk7XHJcbiAgICAvLyB9IGVsc2Uge1xyXG4gICAgLy8gICAgIC8vIGFkZCByaWNob2NldCBwYXJ0aWNsZSBlZmZlY3RcclxuICAgIC8vICAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcclxuICAgIC8vICAgICAgICAgdHlwZTogXCJSaWNvY2hldFwiLFxyXG4gICAgLy8gICAgICAgICBlbWl0Q291bnQ6IDEsXHJcbiAgICAvLyAgICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XHJcbiAgICAvLyAgICAgICAgIHg6IHRoaXMueCxcclxuICAgIC8vICAgICAgICAgeTogdGhpcy55XHJcbiAgICAvLyAgICAgfSkpO1xyXG4gICAgLy8gICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAvLyB9XHJcbiAgICAvL1xyXG4gICAgLy8gLy8gaWYgb2ZmIHNjcmVlbiwgcmVtb3ZlIGl0XHJcbiAgICAvLyBpZiAodGhpcy54IDwgMCB8fCB0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCB8fCB0aGlzLnkgPCAwIHx8IHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkge1xyXG4gICAgLy8gICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuXHJcblxyXG59O1xyXG5cclxuLy8gQnVsbGV0LnByb3RvdHlwZS5oaXREZXRlY3Rpb24gPSBmdW5jdGlvbihpbmRleCkge1xyXG4vLyAgICAgLy8gdGVzdCBidWxsZXQgYWdhaW5zdCBhbGwgcGxheWVyc1xyXG4vLyAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcclxuLy9cclxuLy8gICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1trZXldO1xyXG4vL1xyXG4vLyAgICAgICAgIGlmICghcGxheWVyLmFsaXZlKSBjb250aW51ZTtcclxuLy9cclxuLy8gICAgICAgICB2YXIgYSA9IHRoaXMueCAtIHBsYXllci54O1xyXG4vLyAgICAgICAgIHZhciBiID0gdGhpcy55IC0gcGxheWVyLnk7XHJcbi8vICAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBhKmEgKyBiKmIgKTtcclxuLy9cclxuLy8gICAgICAgICBpZiAoZGlzdGFuY2UgPCBwbGF5ZXIucmFkaXVzKSB7XHJcbi8vICAgICAgICAgICAgIC8vIGhpdFxyXG4vLyAgICAgICAgICAgICBwbGF5ZXIudGFrZURhbWFnZSh0aGlzLmRhbWFnZSwgdGhpcy5kaXJlY3Rpb24pO1xyXG4vLyAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy9cclxuLy8gfTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxuQnVsbGV0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbiAgICAvLyB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgLy8gdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uIC0gMC43ODUzOTgxNjM0KTsgLy8gcm90YXRlXHJcbiAgICAvL1xyXG4gICAgLy8gLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcclxuICAgIC8vIHZhciBncmFkPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJnYmEoMjU1LDE2NSwwLDAuNClcIik7XHJcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgxLCBcInllbGxvd1wiKTtcclxuICAgIC8vIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIC8vICAgdGhpcy5jdHgubW92ZVRvKDAsIDApO1xyXG4gICAgLy8gICB0aGlzLmN0eC5saW5lVG8odGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoKTtcclxuICAgIC8vICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vIC8vIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgLy9cclxuICAgIC8vIC8vXHJcbiAgICAvLyAvLyBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyAvLyBjdHgubW92ZVRvKDAsMCk7XHJcbiAgICAvLyAvLyBjdHgubGluZVRvKDAsdGhpcy5sZW5ndGgpO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIC8vIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCwgMSwgMSApO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbiAgICAvL1xyXG4gICAgLy8gLy9cclxuICAgIC8vIC8vXHJcbiAgICAvLyAvLyBjdHgubGluZVdpZHRoID0gMTtcclxuICAgIC8vIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXHJcbiAgICAvLyAvLyB2YXIgZ3JhZD0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcclxuICAgIC8vIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDAsIFwicmVkXCIpO1xyXG4gICAgLy8gLy8gZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJncmVlblwiKTtcclxuICAgIC8vIC8vIGN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcbiAgICAvLyAvLyBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyAvLyBjdHgubW92ZVRvKDAsMCk7XHJcbiAgICAvLyAvLyBjdHgubGluZVRvKDAsbGVuZ3RoKTtcclxuICAgIC8vIC8vIGN0eC5zdHJva2UoKTtcclxuICAgIC8vXHJcblxyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0O1xyXG4iLCJmdW5jdGlvbiBDYW1lcmEoKSB7XHJcbiAgICB0aGlzLnggPSAwO1xyXG4gICAgdGhpcy55ID0gMDtcclxuICAgIC8vIHRoaXMud2lkdGggPSA7XHJcbiAgICAvLyB0aGlzLmhlaWdodCA9IHdpbmRvdy5nYW1lLmhlaWdodDtcclxuICAgIHRoaXMuZm9sbG93aW5nID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmZvbGxvdyA9IGZ1bmN0aW9uKHBsYXllcil7XHJcbiAgICAgICAgdGhpcy5mb2xsb3dpbmcgPSBwbGF5ZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZvbGxvd2luZykgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnggPSB0aGlzLmZvbGxvd2luZy54IC0gd2luZG93LmdhbWUud2lkdGggLyAyO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMuZm9sbG93aW5nLnkgLSB3aW5kb3cuZ2FtZS5oZWlnaHQgLyAyO1xyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmE7XHJcbiIsImNsYXNzIEVudGl0eSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy54ID0gZGF0YS54O1xyXG4gICAgICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgICAgICB0aGlzLnN4ID0gZGF0YS5zeDtcclxuICAgICAgICB0aGlzLnN5ID0gZGF0YS5zeTtcclxuICAgICAgICB0aGlzLnN3ID0gZGF0YS5zdztcclxuICAgICAgICB0aGlzLnNoID0gZGF0YS5zaDtcclxuICAgICAgICB0aGlzLmR3ID0gZGF0YS5kdztcclxuICAgICAgICB0aGlzLmRoID0gZGF0YS5kaDtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRhdGEuZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gZGF0YS5jdHg7XHJcbiAgICB9XHJcbn1cclxuXHJcbkVudGl0eS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuXHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuXHJcbiAgICB0aGlzLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XHJcblxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBzeDogdGhpcy5zeCxcclxuICAgICAgICBzeTogdGhpcy5zeSxcclxuICAgICAgICBzdzogdGhpcy5zdyxcclxuICAgICAgICBzaDogdGhpcy5zaCxcclxuICAgICAgICBkaDogdGhpcy5kaCxcclxuICAgICAgICBkdzogdGhpcy5kdyxcclxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xyXG4iLCJ2YXIgVWkgPSByZXF1aXJlKFwiLi9VaVwiKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKFwiLi93ZWJSVEMvV2ViUlRDXCIpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZShcIi4vUGxheWVyXCIpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZShcIi4vQ2FtZXJhXCIpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKFwiLi9MZXZlbFwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKSB7XHJcblxyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IDY0MDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gNDgwO1xyXG5cclxuXHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnNwcml0ZXNoZWV0LnNyYyA9IFwiLi4vaW1nL3Nwcml0ZXNoZWV0LnBuZ1wiO1xyXG5cclxuICAgIHRoaXMudGlsZXNoZWV0ID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLnRpbGVzaGVldC5zcmMgPSBcIi4uL2ltZy90aWxlcy5wbmdcIjtcclxuXHJcbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMudGlsZXNoZWV0KTtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmJnQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIHRoaXMuYmdDYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5iZ0NhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhbnZhc2VzXCIpLmFwcGVuZENoaWxkKHRoaXMuYmdDYW52YXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB0aGlzLmJnQ3R4ID0gdGhpcy5iZ0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgdGhpcy5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcclxuXHJcbiAgICB0aGlzLmdhbWVJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIilbMl07XHJcblxyXG4gICAgdGhpcy51aSA9IG5ldyBVaSh0aGlzKTtcclxuICAgIHRoaXMubmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcblxyXG4gICAgdGhpcy5lbnRpdGllcyA9IFtdOyAvLyBnYW1lIGVudGl0aWVzXHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAxMDAwOyAvLyBudW1iZXIgb2YgcGFydGljbGVzIGFsbG93ZWQgb24gc2NyZWVuIGJlZm9yZSB0aGV5IHN0YXJ0IHRvIGJlIHJlbW92ZWRcclxuXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcclxuXHJcbiAgICB2YXIgbGFzdCA9IDA7IC8vIHRpbWUgdmFyaWFibGVcclxuICAgIHZhciBkdDsgLy9kZWx0YSB0aW1lXHJcblxyXG4gICAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmxvb3AoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHYW1lIGxvb3BcclxuICAgICAqL1xyXG4gICAgdGhpcy5sb29wID0gZnVuY3Rpb24odGltZXN0YW1wKXtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5sb29wLmJpbmQodGhpcykpOyAvLyBxdWV1ZSB1cCBuZXh0IGxvb3BcclxuXHJcbiAgICAgICAgZHQgPSB0aW1lc3RhbXAgLSBsYXN0OyAvLyB0aW1lIGVsYXBzZWQgaW4gbXMgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgICAgbGFzdCA9IHRpbWVzdGFtcDtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGFuZCByZW5kZXIgZ2FtZVxyXG4gICAgICAgIHRoaXMudXBkYXRlKGR0KTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG5cclxuICAgICAgICAvLyBuZXR3b3JraW5nIHVwZGF0ZVxyXG4gICAgICAgIGlmICh0aGlzLm5ldHdvcmsuaG9zdCkge1xyXG4gICAgICAgICAgICB0aGlzLm5ldHdvcmsuaG9zdC51cGRhdGUoZHQpOyAvLyBpZiBpbSB0aGUgaG9zdCBkbyBob3N0IHN0dWZmXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmNsaWVudC51cGRhdGUoZHQpOyAvLyBlbHNlIHVwZGF0ZSBjbGllbnQgc3R1ZmZcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVcclxuICAgICAqL1xyXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkdCl7XHJcbiAgICAgICAgdmFyIGR0cyA9IGR0IC8gMTAwMDtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgZnBzXHJcbiAgICAgICAgdGhpcy5mcHMgPSBNYXRoLnJvdW5kKDEwMDAgLyBkdCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHksIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUoZHRzLCBpbmRleCk7IC8vZGVsdGF0aW1lIGluIHNlY29uZHNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2FwIG51bWJlciBvZiBwYXJ0aWNsZXNcclxuICAgICAgICBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSB0aGlzLnBhcnRpY2xlcy5zbGljZSh0aGlzLnBhcnRpY2xlcy5sZW5ndGggLSB0aGlzLm1heFBhcnRpY2xlcywgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcGFydGljbGVzXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoZHRzLCBpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmFcclxuICAgICAgICAvL3RoaXMuY2FtZXJhLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcmluZ1xyXG4gICAgICovXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy8gY2xlYXIgc2NyZWVuXHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIC8vYmcgY29sb3JcclxuICAgICAgICB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuYmdDdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzViNTg1MFwiO1xyXG4gICAgICAgIHRoaXMuYmdDdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAvLyBkcmF3IHRlc3QgYmFja2dyb3VuZFxyXG4gICAgICAgIC8vIHRoaXMuYmdDdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5yZWN0KDAgLSB0aGlzLmNhbWVyYS54LCAwIC0gdGhpcy5jYW1lcmEueSwgdGhpcy5sZXZlbC53aWR0aCwgdGhpcy5sZXZlbC5oZWlnaHQpO1xyXG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbFN0eWxlID0gXCIjODU4MjdkXCI7XHJcbiAgICAgICAgLy8gdGhpcy5iZ0N0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIHRoaXMubGV2ZWwucmVuZGVyKHRoaXMuYmdDdHgpO1xyXG5cclxuICAgICAgICAvLyByZW5kZXIgYWxsIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlbmRlciBwYXJ0aWNsZXNcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51aS5yZW5kZXJVSSgpO1xyXG4gICAgICAgIHRoaXMudWkucmVuZGVyRGVidWcoKTtcclxuICAgICAgICAvLyByZW5kZXIgZnBzIGFuZCBwaW5nXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkNBTUVSQTogWDpcIiArIHRoaXMuY2FtZXJhLngsIFwiXFxuWTpcIiArIHRoaXMuY2FtZXJhLnkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5wbGF5ZXJzW3RoaXMubmV0d29yay5jbGllbnQucGVlci5pZF0pO1xyXG4gICAgfTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkUGxheWVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgcGxheWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAgaWYoZGF0YS5pZCBpbiB0aGlzLnBsYXllcnMpIHJldHVybjtcclxuXHJcbiAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihkYXRhKTtcclxuICAgIHRoaXMuZW50aXRpZXMucHVzaChuZXdQbGF5ZXIpO1xyXG4gICAgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdID0gbmV3UGxheWVyO1xyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG5cclxuICAgIHJldHVybiBuZXdQbGF5ZXI7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVQbGF5ZXIgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVtb3ZpbmcgcGxheWVyXCIsIGRhdGEpO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIHBsYXllcnMgb2JqZWN0XHJcbiAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2RhdGEuaWRdO1xyXG5cclxuICAgIC8vIHJlbW92ZSBmcm9tIGVudGl0aXRlcyBhcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLmVudGl0aWVzW2ldLmlkID09PSBkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgaGltICwgcmVtb3ZpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51aS51cGRhdGVDbGllbnRMaXN0KHRoaXMucGxheWVycyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRHYW1lU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImVudGl0eTpcIiwgZW50aXR5KTtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudGl0eSk7XHJcbiAgICAgICAgLy8gfSksXHJcbiAgICAgICAgLy9lbnRpdGllczogdGhpcy5lbnRpdGllcy5tYXAoZnVuY3Rpb24oZW50aXR5KSB7XHJcbiAgICAgICAgLy8gICAgcmV0dXJuIGVudGl0eS5nZXRGdWxsU3RhdGUoKTsgICAgICAgIH0pLFxyXG4gICAgICAgIC8vcGxheWVyczogT2JqZWN0LmtleXModGhpcy5wbGF5ZXJzKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XSk7IH0pXHJcbiAgICAgICAgcGxheWVyczogdGhpcy5nZXRQbGF5ZXJzU3RhdGUoKVxyXG4gICAgfTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdldFBsYXllcnNTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0uZ2V0RnVsbFN0YXRlKCk7IH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xyXG4iLCJmdW5jdGlvbiBLZXlib2FyZChwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIC8vdGhpcy5sYXN0U3RhdGUgPSBfLmNsb25lKHBsYXllci5rZXlzKTtcbiAgICB0aGlzLmtleURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCAhPT0gdHJ1ZSkgIHBsYXllci5rVXA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDgzOiAvLyBTXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biAhPT0gdHJ1ZSkgIHBsYXllci5rRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rTGVmdCAhPT0gdHJ1ZSkgIHBsYXllci5rTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiAvLyBBXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgIT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDk6IC8vIDFcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXggPT09IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImNoYW5nZVdlYXBvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiAwLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUwOiAvLyAyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAxKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MjogLy8gUlxuICAgICAgICAgICAgICAgIC8vIHJlbG9hZCBvbmx5IGlmIHBsYXllciBpcyBhbGl2ZSBhbmQgd2VhcG9uIG1hZ2F6aW5lIGlzbnQgZnVsbFxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuYWxpdmUgJiYgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLmJ1bGxldHMgPCBwbGF5ZXIud2VhcG9uc1twbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleF0ubWFnYXppbmVTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZWxvYWRcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgODc6IC8vIFdcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmtVcCA9PT0gdHJ1ZSkgcGxheWVyLmtVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgaWYgKHBsYXllci5rRG93biA9PT0gdHJ1ZSkgcGxheWVyLmtEb3duID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgPT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgaWYgKHBsYXllci5rUmlnaHQgPT09IHRydWUpICBwbGF5ZXIua1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMua2V5RG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMua2V5VXBIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJ2YXIgbGV2ZWwxID0gcmVxdWlyZShcIi4vZGF0YS9sZXZlbDFcIik7XHJcbi8vdmFyIFRpbGUgPSByZXF1aXJlKFwiLi9UaWxlXCIpO1xyXG5cclxuZnVuY3Rpb24gTGV2ZWwodGlsZXNoZWV0KXtcclxuICAgIHRoaXMudGlsZXNoZWV0ID0gdGlsZXNoZWV0O1xyXG4gICAgdGhpcy50aWxlU2l6ZSA9IDMyO1xyXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsMTtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmxldmVsLnRpbGVzWzBdLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMubGV2ZWwudGlsZXMubGVuZ3RoICogdGhpcy50aWxlU2l6ZTtcclxuICAgIHRoaXMuY29sVGlsZUNvdW50ID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGg7XHJcbiAgICB0aGlzLnJvd1RpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXMubGVuZ3RoO1xyXG4gICAgdGhpcy5pbWFnZU51bVRpbGVzID0gMzg0IC8gdGhpcy50aWxlU2l6ZTsgIC8vIFRoZSBudW1iZXIgb2YgdGlsZXMgcGVyIHJvdyBpbiB0aGUgdGlsZXNldCBpbWFnZVxyXG5cclxuICAgIC8vIGdlbmVyYXRlIFRpbGVzXHJcblxyXG5cclxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY3R4KSB7XHJcblxyXG4gICAgICAgIC8vZHJhdyBhbGwgdGlsZXNcclxuICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMucm93VGlsZUNvdW50OyByb3cgKz0gMSkge1xyXG4gICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuY29sVGlsZUNvdW50OyBjb2wgKz0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5sZXZlbC50aWxlc1tyb3ddW2NvbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZVJvdyA9ICh0aWxlIC8gdGhpcy5pbWFnZU51bVRpbGVzKSB8IDA7IC8vIEJpdHdpc2UgT1Igb3BlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZUNvbCA9ICh0aWxlICUgdGhpcy5pbWFnZU51bVRpbGVzKSB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLnRpbGVzaGVldCxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZUNvbCAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgICh0aWxlUm93ICogdGhpcy50aWxlU2l6ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoKGNvbCAqIHRoaXMudGlsZVNpemUpIC0gd2luZG93LmdhbWUuY2FtZXJhLngpLFxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoKHJvdyAqIHRoaXMudGlsZVNpemUpIC0gd2luZG93LmdhbWUuY2FtZXJhLnkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XHJcbiIsImZ1bmN0aW9uIE1vdXNlKHBsYXllcil7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICB0aGlzLmNsaWNrID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHRoaXMucGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcInNob290XCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFgsXG4gICAgICAgICAgICAgICAgeTogd2luZG93LmdhbWUuY2FtZXJhLnkgKyBlLm9mZnNldFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5wdXNoKGFjdGlvbik7IC8vIHRlbGwgdGhlIGhvc3Qgb2YgdGhlIGFjdGlvblxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW91c2VYID0gd2luZG93LmdhbWUuY2FtZXJhLnggKyBlLm9mZnNldFg7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWSA9IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZO1xuICAgIH07XG5cbiAgICB0aGlzLm1vdXNlZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5tb3VzZUxlZnQgIT09IHRydWUpICBwbGF5ZXIubW91c2VMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMubW91c2V1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc3dpdGNoKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIDA6IC8vIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5tb3VzZUxlZnQgPT09IHRydWUpIHBsYXllci5tb3VzZUxlZnQgID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuZ2FtZS5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIC8vd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xuIiwiZnVuY3Rpb24gQ29udHJvbHMoKSB7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIEJsb29kIGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHZhciBybmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCk7XHJcbiAgICAgICAgdmFyIHIgPSAxNTAgLSBybmQ7XHJcbiAgICAgICAgdmFyIGcgPSA1MCAtIHJuZDtcclxuICAgICAgICB2YXIgYiA9IDUwIC0gcm5kO1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCJyZ2IoXCIgKyByICsgXCIsXCIgKyBnICsgXCIsXCIgKyBiICsgXCIpXCI7XHJcbiAgICAgICAgZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAzO1xyXG5cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDQwO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuQmxvb2QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuXHJcbiAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG5cclxuICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJsb29kO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIEJsb29kMiBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICAvL3ZhciBybmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCk7XHJcbiAgICAgICAgLy8gdmFyIHIgPSAxNTA7XHJcbiAgICAgICAgLy8gdmFyIGcgPSA1MDtcclxuICAgICAgICAvLyB2YXIgYiA9IDUwO1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCIjODAyOTI5XCI7XHJcbiAgICAgICAgLy9kYXRhLmxpZmVUaW1lID0gMC4zO1xyXG4gICAgICAgIGRhdGEuc2l6ZSA9IDM7XHJcblxyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGhlbHBlcnMudG9SYWRpYW5zKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxKTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gODA7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZURpc3RhbmNlID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE1KSArIDEpO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbkJsb29kMi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvb2QyO1xyXG4iLCIvL3ZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgQmxvb2QgPSByZXF1aXJlKFwiLi9CbG9vZFwiKTtcclxudmFyIEJsb29kMiA9IHJlcXVpcmUoXCIuL0Jsb29kMlwiKTtcclxudmFyIFJpY29jaGV0ID0gcmVxdWlyZShcIi4vUmljb2NoZXRcIik7XHJcblxyXG5mdW5jdGlvbiBFbWl0dGVyKGRhdGEpIHtcclxuICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgIHRoaXMueSA9IGRhdGEueTtcclxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZTtcclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICB0aGlzLmVtaXRTcGVlZCA9IGRhdGEuZW1pdFNwZWVkOyAvLyBzXHJcbiAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXRDb3VudCA9IGRhdGEuZW1pdENvdW50O1xyXG4gICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICB0aGlzLmxpZmVUaW1lciA9IDA7XHJcbiAgICB0aGlzLmVtaXQoKTtcclxufVxyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICBlbWl0dGVyOiB0aGlzXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2RcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kKGRhdGEpKTtcclxuICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gXCJCbG9vZDJcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJsb29kMihkYXRhKSk7XHJcbiAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IFwiUmljb2NoZXRcIikgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IFJpY29jaGV0KGRhdGEpKTtcclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4gICAgLy8gLy8gdXBkYXRlIGFsbCBwYXJ0aWNsZXNcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIC8vICAgICB0aGlzLnBhcnRpY2xlc1tpXS51cGRhdGUoZHQpO1xyXG4gICAgLy8gfVxyXG5cclxuXHJcbiAgICAvLyBTRVQgRU1JVFRFUiAtIHRoaXMgaXMgYW4gZW1pdHRlciB0aGF0IHNob3VsZCBlbWl0IGEgc2V0IG51bWJlciBvZiBwYXJ0aWNsZXNcclxuICAgIGlmICh0aGlzLmVtaXRDb3VudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVtaXRTcGVlZCkgeyAvLyBFbWl0IGF0IGEgaW50ZXJ2YWxcclxuICAgICAgICAgICAgdGhpcy5lbWl0VGltZXIgKz0gZHQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVtaXRUaW1lciA+IHRoaXMuZW1pdFNwZWVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgICB0aGlzLmVtaXRDb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgIGlmICh0aGlzLmVtaXRDb3VudCA8IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gRW1pdCBhbGwgYXQgb25jZVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDtpIDwgdGhpcy5lbWl0Q291bnQ7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRJTUVEIEVNSVRURVJcclxuICAgIC8vIHVwZGF0ZSBlbWl0dGVyIGxpZmV0aW1lIChpZiBpdCBoYXMgYSBsaWZldGltZSkgcmVtb3ZlIGVtaXR0ZXIgaWYgaXRzIHRpbWUgaGFzIHJ1biBvdXQgYW5kIGl0IGhhcyBubyByZW1haW5pbmcgcGFydGljbGVzXHJcbiAgICBpZiAodGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4gICAgICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENPTlRJTlVPVVMgRU1JVFRFUlxyXG4gICAgLy8gZW1pdCBuZXcgcGFydGljbGVzIGZvcmV2ZXJcclxuICAgIHRoaXMuZW1pdFRpbWVyICs9IGR0O1xyXG4gICAgaWYgKHRoaXMuZW1pdFRpbWVyID4gdGhpcy5lbWl0U3BlZWQpIHtcclxuICAgICAgICB0aGlzLmVtaXQoKTtcclxuICAgICAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyAvLyByZW5kZXIgYWxsIHBhcnRpY2xlc1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgLy8gICAgIHRoaXMucGFydGljbGVzW2ldLnJlbmRlcigpO1xyXG4gICAgLy8gfVxyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xyXG4iLCIvL3ZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi4vLi9FbnRpdHlcIik7XHJcblxyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5jdHg7XHJcbiAgICAgICAgdGhpcy5jb2xvciA9IGRhdGEuY29sb3I7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xyXG4gICAgICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgICAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZSA9IGRhdGEubGlmZVRpbWU7XHJcbiAgICAgICAgdGhpcy5saWZlVGltZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuZW1pdHRlciA9IGRhdGEuZW1pdHRlcjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gUGFydGljbGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG4vLyAgICAgdGhpcy5saWZlVGltZXIgKz0gZHQ7XHJcbi8vICAgICBpZiAodGhpcy5saWZlVGltZXIgPiB0aGlzLmxpZmVUaW1lKSB7XHJcbi8vICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuLy8gICAgIH1cclxuLy8gfTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgLy90aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgICB0aGlzLmN0eC5maWxsUmVjdCgtKHRoaXMuc2l6ZSAvIDIpLCAtKHRoaXMuc2l6ZSAvIDIpLCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XHJcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbn07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblBhcnRpY2xlLnByb3RvdHlwZS5nZXRGdWxsU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7fTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFydGljbGU7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgUmljb2NoZXQgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcIiM0ZDRkNGRcIjtcclxuICAgICAgICBkYXRhLnNpemUgPSAxO1xyXG5cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5SaWNvY2hldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmljb2NoZXQ7XHJcbiIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbnZhciBNb3VzZSA9IHJlcXVpcmUoXCIuL01vdXNlXCIpO1xudmFyIEtleWJvYXJkID0gcmVxdWlyZShcIi4vS2V5Ym9hcmRcIik7XG52YXIgTmV0d29ya0NvbnRyb2xzID0gcmVxdWlyZShcIi4vTmV0d29ya0NvbnRyb2xzXCIpO1xuLy92YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4vQnVsbGV0XCIpO1xuLy92YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcbi8vdmFyIFdlYXBvbiA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvV2VhcG9uXCIpO1xudmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi93ZWFwb25zL1Nob3RndW5cIik7XG52YXIgQWs0NyA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvQWs0N1wiKTtcbi8vdmFyIEFuaW1hdGlvbiA9IHJlcXVpcmUoXCIuL0FuaW1hdGlvblwiKTtcbnZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9FbnRpdHlcIik7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgd2VhcG9uQ3JlYXRvciA9IHJlcXVpcmUoXCIuL3dlYXBvbnMvd2VhcG9uQ3JlYXRvclwiKTtcblxuZnVuY3Rpb24gUGxheWVyKHBsYXllckRhdGEpIHtcbiAgICB0aGlzLmlkID0gcGxheWVyRGF0YS5pZDtcbiAgICB0aGlzLnJhZGl1cyA9IHBsYXllckRhdGEucmFkaXVzIHx8IDIwOyAvLyBjaXJjbGUgcmFkaXVzXG5cbiAgICBpZiAoIXBsYXllckRhdGEueCB8fCAhcGxheWVyRGF0YS55KSB7XG4gICAgICAgIHZhciBzcGF3bkxvY2F0aW9uID0gaGVscGVycy5maW5kU3Bhd25Mb2NhdGlvbigpO1xuICAgICAgICB0aGlzLnggPSBzcGF3bkxvY2F0aW9uLng7XG4gICAgICAgIHRoaXMueSA9IHNwYXduTG9jYXRpb24ueTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnggPSBwbGF5ZXJEYXRhLng7XG4gICAgICAgIHRoaXMueSA9IHBsYXllckRhdGEueTtcbiAgICB9XG4gICAgLy8gdGhpcy54ID0gcGxheWVyRGF0YS54IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcbiAgICAvLyB0aGlzLnkgPSBwbGF5ZXJEYXRhLnkgfHwgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSB0aGlzLnJhZGl1cykpICsgdGhpcy5yYWRpdXMgLyAyKTtcblxuICAgIHRoaXMuZGlyZWN0aW9uID0gcGxheWVyRGF0YS5kaXJlY3Rpb24gfHwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDE7XG4gICAgdGhpcy52aWV3aW5nQW5nbGUgPSBwbGF5ZXJEYXRhLnZpZXdpbmdBbmdsZSB8fCA0NTtcbiAgICB0aGlzLnNwZWVkID0gcGxheWVyRGF0YS5zcGVlZCB8fCAxMDA7IC8vcGl4ZWxzIHBlciBzZWNvbmRcbiAgICB0aGlzLmhwID0gcGxheWVyRGF0YS5ocCB8fCAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHBsYXllckRhdGEuYWxpdmUgfHwgdHJ1ZTtcblxuICAgIHRoaXMuc3ggPSAwO1xuICAgIHRoaXMuc3kgPSAwO1xuICAgIHRoaXMuc3cgPSA2MDtcbiAgICB0aGlzLnNoID0gNjA7XG4gICAgdGhpcy5kdyA9IDYwO1xuICAgIHRoaXMuZGggPSA2MDtcblxuICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xuXG4gICAgLy8ga2V5c1xuICAgIHRoaXMua1VwID0gZmFsc2U7XG4gICAgdGhpcy5rRG93biA9IGZhbHNlO1xuICAgIHRoaXMua0xlZnQgPSBmYWxzZTtcbiAgICB0aGlzLmtSaWdodCA9IGZhbHNlO1xuXG4gICAgLy8gbW91c2VcbiAgICB0aGlzLm1vdXNlWCA9IHRoaXMueDtcbiAgICB0aGlzLm1vdXNlWSA9IHRoaXMueTtcbiAgICB0aGlzLm1vdXNlTGVmdCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb24gb24gbGV2ZWxcbiAgICB0aGlzLnRpbGVSb3cgPSAwO1xuICAgIHRoaXMudGlsZUNvbCA9IDA7XG5cbiAgICB0aGlzLndlYXBvbnMgPSBbXTtcbiAgICAvLyByZWNyZWF0ZSB3ZWFwb25zIGlmIHRoZSBwbGF5ZXIgaGFzIGFueSBlbHNlIGNyZWF0ZSBuZXcgd2VhcG9uc1xuICAgIGlmIChwbGF5ZXJEYXRhLndlYXBvblN0YXRlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVyRGF0YS53ZWFwb25TdGF0ZS5sZW5ndGg7IGkrPSAxKSB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnMucHVzaCh3ZWFwb25DcmVhdG9yKHRoaXMsIHBsYXllckRhdGEud2VhcG9uU3RhdGVbaV0pKTtcbiAgICAgICAgfVxuICAgIH1lbHNlIHtcbiAgICAgICAgdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG4gICAgfVxuXG4gICAgLy90aGlzLndlYXBvbnMgPSBbbmV3IEFrNDcodGhpcyksIG5ldyBTaG90Z3VuKHRoaXMpXTtcblxuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IHBsYXllckRhdGEuc2VsZWN0ZWRXZWFwb25JbmRleCB8fCAwO1xuXG4gICAgdGhpcy5sYXN0Q2xpZW50U3RhdGUgPSB0aGlzLmdldENsaWVudFN0YXRlKCk7XG4gICAgdGhpcy5sYXN0RnVsbFN0YXRlID0gdGhpcy5nZXRGdWxsU3RhdGUoKTtcblxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xuICAgIHRoaXMuYWN0aW9ucyA9IFtdOyAvLyBhY3Rpb25zIHRvIGJlIHBlcmZvcm1lZFxuICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucyA9IFtdOyAvLyBzdWNjZXNmdWxseSBwZXJmb3JtZWQgYWN0aW9uc1xuXG4gICAgLy8gdGhpcy5hbmltYXRpb25zID0ge1xuICAgIC8vICAgICBcImlkbGVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJpZGxlXCIsIHN4OiAwLCBzeTogMCwgdzogNjAsIGg6IDYwLCBmcmFtZXM6IDEsIHBsYXlPbmNlOiBmYWxzZX0pLFxuICAgIC8vICAgICBcImZpcmVcIjogbmV3IEFuaW1hdGlvbih7bmFtZTogXCJmaXJlXCIsIHN4OiAwLCBzeTogNjAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogdHJ1ZX0pXG4gICAgLy8gfTtcbiAgICAvL1xuICAgIC8vIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9ucy5pZGxlO1xuXG4gICAgLy9pcyB0aGlzIG1lIG9yIGFub3RoZXIgcGxheWVyXG4gICAgaWYgKHBsYXllckRhdGEuaWQgPT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IHttb3VzZTogbmV3IE1vdXNlKHRoaXMpLCBrZXlib2FyZDogbmV3IEtleWJvYXJkKHRoaXMpfTtcbiAgICAgICAgd2luZG93LmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE5ldHdvcmtDb250cm9scygpO1xuICAgIH1cbn1cblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCl7XG5cbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgcXVldWVkIHVwIGFjdGlvbnMgYW5kIHBlcmZvcm0gdGhlbVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25zLmxlbmd0aDsgaSArPSAxKXtcblxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGVyZm9ybUFjdGlvbih0aGlzLmFjdGlvbnNbaV0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtZWRBY3Rpb25zLnB1c2godGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aW9ucyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmFsaXZlKSByZXR1cm47XG5cblxuICAgIHRoaXMubW92ZShkdCk7XG4gICAgLy9jaGVjayBpZiBvZmYgc2NyZWVuXG4gICAgLy8gaWYgKHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoKSB0aGlzLnggPSB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aDtcbiAgICAvLyBpZiAodGhpcy54IDwgMCkgdGhpcy54ID0gMDtcbiAgICAvLyBpZiAodGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB0aGlzLnkgPSB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQ7XG4gICAgLy8gaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG5cbiAgICAvLyB1cGRhdGUgY3VycmVudCB3ZWFwb247XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0udXBkYXRlKGR0KTtcblxuICAgIC8vdGhpcy5jdXJyZW50QW5pbWF0aW9uLnVwZGF0ZShkdCk7XG5cbiAgICBpZiAodGhpcy5tb3VzZUxlZnQpIHsgLy8gaWYgZmlyaW5nXG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICBhY3Rpb246IFwiZmlyZVwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMubW91c2VYLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMubW91c2VZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudHVyblRvd2FyZHModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR0KSB7XG5cbiAgICAvLyBVcGRhdGUgbW92ZW1lbnRcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XG4gICAgdmFyIG1vdmVYO1xuICAgIHZhciBtb3ZlWTtcblxuICAgIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtEb3duICYmIHRoaXMua0xlZnQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gLWRpc3RhbmNlO1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtSaWdodCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSBkaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1VwKSB7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93bikge1xuICAgICAgICBtb3ZlWSA9IGRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rTGVmdCkge1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua1JpZ2h0KSB7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgdmFyIGNvbGxpc2lvbjtcbiAgICBpZiAobW92ZVgpIHtcbiAgICAgICAgY29sbGlzaW9uID0gaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogdGhpcy54ICsgbW92ZVgsIHk6IHRoaXMueX0pO1xuICAgICAgICBpZiAoIWNvbGxpc2lvbikge1xuICAgICAgICAgICAgdGhpcy54ICs9IG1vdmVYO1xuICAgICAgICAgICAgdGhpcy5tb3VzZVggKz0gbW92ZVg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1vdmVZKSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHRoaXMueCwgeTogdGhpcy55ICsgbW92ZVl9KTtcbiAgICAgICAgaWYgKCFjb2xsaXNpb24pIHtcbiAgICAgICAgICAgIHRoaXMueSArPSBtb3ZlWTtcbiAgICAgICAgICAgIHRoaXMubW91c2VZICs9IG1vdmVZO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gLy8gQ29sbGlzaW9uIGNoZWNrIGFnYWluc3Qgc3Vycm91bmRpbmcgdGlsZXNcbi8vIFBsYXllci5wcm90b3R5cGUuY29sbGlzaW9uQ2hlY2sgPSBmdW5jdGlvbigpIHtcbi8vICAgICB2YXIgc3RhcnRpbmdSb3cgPSB0aGlzLnRpbGVSb3cgLSAxO1xuLy8gICAgIGlmIChzdGFydGluZ1JvdyA8IDApIHN0YXJ0aW5nUm93ICA9IDA7XG4vLyAgICAgdmFyIGVuZFJvdyA9IHRoaXMudGlsZVJvdyArMTtcbi8vICAgICBpZiAoZW5kUm93ID4gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50KSBlbmRSb3cgPSB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQ7XG4vLyAgICAgdmFyIHN0YXJ0aW5nQ29sID0gdGhpcy50aWxlQ29sIC0xO1xuLy8gICAgIGlmIChzdGFydGluZ0NvbCA8IDApIHN0YXJ0aW5nQ29sID0gMDtcbi8vICAgICB2YXIgZW5kQ29sID0gdGhpcy50aWxlQ29sICsxO1xuLy8gICAgIGlmIChlbmRDb2wgPiB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQpIGVuZENvbCA9IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudDtcbi8vXG4vLyAgICAgZm9yICh2YXIgcm93ID0gc3RhcnRpbmdSb3c7IHJvdyA8IGVuZFJvdzsgcm93ICs9IDEpIHtcbi8vICAgICAgICAgZm9yICh2YXIgY29sID0gc3RhcnRpbmdDb2w7IGNvbCA8IGVuZENvbDsgY29sICs9IDEpIHtcbi8vICAgICAgICAgICAgIGlmICh3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1tyb3ddW2NvbF0gPT09IDApIGNvbnRpbnVlOyAvLyBldmVyeSB0aWxlIG90aGVyIHRoYW4gMCBhcmUgbm9uIHdhbGthYmxlXG4vLyAgICAgICAgICAgICAvLyBjb2xsaXNpb25cbi8vICAgICAgICAgICAgIGlmICh0aGlzLnRpbGVSb3cgPT09IHJvdyAmJiB0aGlzLnRpbGVDb2wgPT09IGNvbCkge1xuLy8gICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gdHJ1ZTtcbi8vIH07XG5cblBsYXllci5wcm90b3R5cGUubmV0d29ya1VwZGF0ZSA9IGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgZGVsZXRlIHVwZGF0ZS5pZDtcbiAgICAvLyBuZXR3b3JrVXBkYXRlXG4gICAgZm9yICh2YXIga2V5IGluIHVwZGF0ZSkge1xuICAgICAgICBpZiAoa2V5ID09PSBcImFjdGlvbnNcIikgdGhpc1trZXldID0gdGhpc1trZXldLmNvbmNhdCh1cGRhdGVba2V5XSk7XG4gICAgICAgIGVsc2UgdGhpc1trZXldID0gdXBkYXRlW2tleV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wZXJmb3JtQWN0aW9uID0gZnVuY3Rpb24oYWN0aW9uKXtcbiAgICBzd2l0Y2goYWN0aW9uLmFjdGlvbil7XG4gICAgICAgIGNhc2UgXCJ0dXJuVG93YXJkc1wiOlxuICAgICAgICAgICAgdGhpcy50dXJuVG93YXJkcyhhY3Rpb24uZGF0YS54LCBhY3Rpb24uZGF0YS55KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZmlyZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLmZpcmUoYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcImRpZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGllKGFjdGlvbik7XG4gICAgICAgICAgICAvL2JyZWFrO1xuICAgICAgICBjYXNlIFwicmVzcGF3blwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzcGF3bihhY3Rpb24pO1xuICAgICAgICBjYXNlIFwiY2hhbmdlV2VhcG9uXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VXZWFwb24oYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcInJlbG9hZFwiOlxuICAgIH0gICAgICAgcmV0dXJuIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnJlbG9hZChhY3Rpb24pO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIGlmKCF0aGlzLmFsaXZlKSByZXR1cm47XG4gICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxuICAgIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbik7IC8vIHJvdGF0ZVxuXG4gICAgdGhpcy5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zeCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3ksIHRoaXMuc3csIHRoaXMuc2gsIC0odGhpcy5zdyAvIDIpLCAtKHRoaXMuc2ggLyAyKSwgdGhpcy5kdywgdGhpcy5kaCk7XG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnR1cm5Ub3dhcmRzID0gZnVuY3Rpb24oeCx5KSB7XG4gICAgdmFyIHhEaWZmID0geCAtIHRoaXMueDtcbiAgICB2YXIgeURpZmYgPSB5IC0gdGhpcy55O1xuICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5hdGFuMih5RGlmZiwgeERpZmYpOy8vICogKDE4MCAvIE1hdGguUEkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS50YWtlRGFtYWdlID0gZnVuY3Rpb24oZGFtYWdlLCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLmhwIC09IGRhbWFnZTtcbiAgICBpZiAodGhpcy5ocCA8PSAwKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJkaWVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBhZGQgYmxvb2Qgc3BsYXNoIGVtaXR0ZXJcbiAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAgICAgdHlwZTogXCJCbG9vZDJcIixcbiAgICAgICAgZW1pdENvdW50OiAxMCxcbiAgICAgICAgZW1pdFNwZWVkOiBudWxsLCAvLyBudWxsIG1lYW5zIGluc3RhbnRcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICB9KSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgICB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5zdG9wUmVsb2FkKCk7XG5cblxuICAgIC8vIC8vIGNyZWF0ZSBhIGNvcnBzZVxuICAgIC8vIHZhciBjb3Jwc2UgPSBuZXcgRW50aXR5KHtcbiAgICAvLyAgICAgeDogdGhpcy54ICsgTWF0aC5jb3MoYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgIC8vICAgICB5OiB0aGlzLnkgKyBNYXRoLnNpbihhY3Rpb24uZGF0YS5kaXJlY3Rpb24pICogMTAsXG4gICAgLy8gICAgIHN4OiA2MCArKCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSAqIDYwKSxcbiAgICAvLyAgICAgc3k6IDEyMCxcbiAgICAvLyAgICAgc3c6IDYwLFxuICAgIC8vICAgICBzaDogNjAsXG4gICAgLy8gICAgIGR3OiA2MCxcbiAgICAvLyAgICAgZGg6IDYwLFxuICAgIC8vICAgICBkaXJlY3Rpb246IGFjdGlvbi5kYXRhLmRpcmVjdGlvbixcbiAgICAvLyAgICAgY3R4OiB3aW5kb3cuZ2FtZS5iZ0N0eFxuICAgIC8vIH0pO1xuICAgIC8vd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChjb3Jwc2UpO1xuXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMzAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xuXG5cblxufTtcblxuUGxheWVyLnByb3RvdHlwZS5yZXNwYXduID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy54ID0gYWN0aW9uLmRhdGEueDtcbiAgICB0aGlzLnkgPSBhY3Rpb24uZGF0YS55O1xuICAgIHRoaXMuaHAgPSAxMDA7XG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG5cbiAgICAvLyByZWZpbGwgYWxsIHdlYXBvbnNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLndlYXBvbnNbaV0uZmlsbE1hZ2F6aW5lKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hhbmdlV2VhcG9uID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3RvcFJlbG9hZCgpO1xuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IGFjdGlvbi5kYXRhLnNlbGVjdGVkV2VhcG9uSW5kZXg7XG4gICAgcmV0dXJuIGFjdGlvbjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnksXG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBocDogdGhpcy5ocCxcbiAgICAgICAgYWxpdmU6IHRoaXMuYWxpdmUsXG4gICAgICAgIHJhZGl1czogdGhpcy5yYWRpdXMsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXG4gICAgICAgIHZpZXdpbmdBbmdsZTogdGhpcy52aWV3aW5nQW5nbGUsXG4gICAgICAgIHNwZWVkOiB0aGlzLnNwZWVkLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVksXG4gICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCxcbiAgICAgICAgd2VhcG9uU3RhdGU6IHRoaXMuZ2V0V2VhcG9uU3RhdGUoKVxuICAgIH07XG59O1xuXG4vLyBUaGUgc3RhdGUgdGhlIGNsaWVudCBzZW5kcyB0byB0aGUgaG9zdFxuUGxheWVyLnByb3RvdHlwZS5nZXRDbGllbnRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICBrVXA6IHRoaXMua1VwLFxuICAgICAgICBrRG93bjogdGhpcy5rRG93bixcbiAgICAgICAga0xlZnQ6IHRoaXMua0xlZnQsXG4gICAgICAgIGtSaWdodDogdGhpcy5rUmlnaHQsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVlcbiAgICB9O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS51cGRhdGVTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgdGhpcy54ID0gbmV3U3RhdGUueDtcbiAgICB0aGlzLnkgPSBuZXdTdGF0ZS55O1xuICAgIC8vaWQ6IHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmhwID0gbmV3U3RhdGUuaHA7XG4gICAgdGhpcy5hbGl2ZSA9IG5ld1N0YXRlLmFsaXZlO1xuICAgIHRoaXMucmFkaXVzID0gbmV3U3RhdGUucmFkaXVzO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3U3RhdGUuZGlyZWN0aW9uO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gbmV3U3RhdGUudmlld2luZ0FuZ2xlO1xuICAgIHRoaXMuc3BlZWQgPSBuZXdTdGF0ZS5zcGVlZDtcbiAgICB0aGlzLmtVcCA9IG5ld1N0YXRlLmtVcDtcbiAgICB0aGlzLmtEb3duID0gbmV3U3RhdGUua0Rvd247XG4gICAgdGhpcy5rTGVmdCA9IG5ld1N0YXRlLmtMZWZ0O1xuICAgIHRoaXMua1JpZ2h0ID0gbmV3U3RhdGUua1JpZ2h0O1xuICAgIHRoaXMubW91c2VYID0gbmV3U3RhdGUubW91c2VYO1xuICAgIHRoaXMubW91c2VZID0gbmV3U3RhdGUubW91c2VZO1xuICAgIHRoaXMuc2VsZWN0ZWRXZWFwb25JbmRleCA9IG5ld1N0YXRlLnNlbGVjdGVkV2VhcG9uSW5kZXg7XG4gICAgLy93ZWFwb25TdGF0ZTogdGhpcy5nZXRXZWFwb25TdGF0ZSgpXG59O1xuXG4vLyBnZXQgdGhlIHN0YXRlIG9mIGVhY2ggd2VhcG9uXG5QbGF5ZXIucHJvdG90eXBlLmdldFdlYXBvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlYXBvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3RhdGUucHVzaCh0aGlzLndlYXBvbnNbaV0uZ2V0U3RhdGUoKSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCIvLyB2YXIgd2VhcG9ucyA9IHJlcXVpcmUoXCIuL2RhdGEvd2VhcG9uc1wiKTtcbi8vIHZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbi8vXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVWkoZ2FtZSl7XG4gICAgdGhpcy5jbGllbnRMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJzXCIpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG5cbiAgICB0aGlzLnVwZGF0ZUNsaWVudExpc3QgPSBmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgIHZhciBteUlEID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZDtcbiAgICAgICAgdGhpcy5jbGllbnRMaXN0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIGlkIGluIHBsYXllcnMpe1xuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpZCArIFwiIFwiICsgcGxheWVyc1tpZF0ucGluZyk7XG4gICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50TGlzdC5hcHBlbmRDaGlsZChsaSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJEZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IFwiMTJweCBPcGVuIFNhbnNcIjtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNkN2Q3ZDdcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiRlBTOiAgXCIgKyB3aW5kb3cuZ2FtZS5mcHMsIDUsIDIwKTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUElORzogXCIgKyB3aW5kb3cuZ2FtZS5uZXR3b3JrLnBpbmcsIDUsIDM0KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiQ0FNRVJBOiBcIiArIE1hdGguZmxvb3Iod2luZG93LmdhbWUuY2FtZXJhLngpICsgXCIsIFwiICsgTWF0aC5mbG9vcih3aW5kb3cuZ2FtZS5jYW1lcmEueSksIDUsIDQ4KTtcbiAgICAgICAgaWYgKHBsYXllcikge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUExBWUVSOiAgXCIgKyBNYXRoLmZsb29yKHBsYXllci54KSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLnkpLCA1LCA2Mik7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJNT1VTRTogXCIgKyBNYXRoLmZsb29yKHBsYXllci5tb3VzZVgpICsgXCIsIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIubW91c2VZKSwgNSwgNzYpO1xuICAgICAgICAgICAgaWYocGxheWVyKSB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQoXCJESVI6IFwiICsgcGxheWVyLmRpcmVjdGlvbi50b0ZpeGVkKDIpLCA1LCA5MCk7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiUEFSVElDTEVTOiBcIiArIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5sZW5ndGgsIDUsIDEwNCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5mb250ID0gXCIyNHB4IE9wZW4gU2Fuc1wiO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlclVJICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgaWYgKCFwbGF5ZXIpIHJldHVybjtcblxuXG4gICAgICAgIC8vZ3VpIGJnIGNvbG9yXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LnJlY3QoMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDM1LCAxNDAsIDM1KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjM1KVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbCgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBncmFkaWVudFxuICAgICAgICB2YXIgZ3JkPSB3aW5kb3cuZ2FtZS5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMTQwLDAsMTkwLDApO1xuICAgICAgICBncmQuYWRkQ29sb3JTdG9wKDAsXCJyZ2JhKDAsMCwwLDAuMzUpXCIpO1xuICAgICAgICBncmQuYWRkQ29sb3JTdG9wKDEsXCJyZ2JhKDAsMCwwLDApXCIpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlPWdyZDtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxSZWN0KDE0MCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDM1LDUwLDM1KTtcblxuXG5cbiAgICAgICAgdmFyIHdlYXBvbiA9ICBwbGF5ZXIud2VhcG9uc1twbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleF07XG4gICAgICAgIC8vIGRyYXcgd2VhcG9uIGljb25cbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgd2VhcG9uLmljb25TeCwgd2VhcG9uLmljb25TeSwgd2VhcG9uLmljb25XLCB3ZWFwb24uaWNvbkgsIDkwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzMsIHdlYXBvbi5pY29uVywgd2VhcG9uLmljb25IKTtcbiAgICAgICAgLy8gZHJhdyBtYWdhemluZSBjb3VudCdcbiAgICAgICAgaWYgKHdlYXBvbi5yZWxvYWRpbmcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIDg1LCAyMTQsIDIxLCAyMiwgMTI1LCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMzAsIDIxLCAyMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMjUpXCI7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQod2VhcG9uLmJ1bGxldHMsIDEyMiwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDkpO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHdlYXBvbi5idWxsZXRzLCAgMTIyLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gMTApO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBkcmF3IGhlYXJ0XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIDAsIDIyOCwgMTMsIDEyLCAxMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDIzLCAxMywgMTIpO1xuICAgICAgICAvLyBkcmF3IEhQXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yNSlcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHBsYXllci5ocCwgMzAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSA5KTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwiI2U3ZDI5ZVwiO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFRleHQocGxheWVyLmhwLCAzMCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDEwKTtcbiAgICB9O1xuXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3Bhd25CdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcblxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkge1xuXG4gICAgICAgICAgICAvLyB2YXIgc3Bhd25Mb2NhdGlvbkZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB2YXIgeDtcbiAgICAgICAgICAgIC8vIHZhciB5O1xuICAgICAgICAgICAgLy8gd2hpbGUgKCFzcGF3bkxvY2F0aW9uRm91bmQpIHtcbiAgICAgICAgICAgIC8vICAgICB4ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAgICAgICAgIC8vICAgICB5ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQgLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIGlmIChoZWxwZXJzLmNvbGxpc2lvbkNoZWNrKHt4OiB4LCB5OiB5fSkpIHNwYXduTG9jYXRpb25Gb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAvLyB9XG5cblxuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogaGVscGVycy5maW5kU3Bhd25Mb2NhdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZWxvYWRCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgaWYgKHBsYXllci5hbGl2ZSkge1xuICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJyZWxvYWRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmICghcGxheWVyLmFsaXZlKSB7XG4gICAgICAgIC8vICAgICB2YXIgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgIC8vICAgICB2YXIgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAvLyAgICAgICAgIGFjdGlvbjogXCJyZXNwYXduXCIsXG4gICAgICAgIC8vICAgICAgICAgZGF0YToge1xuICAgICAgICAvLyAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAvLyAgICAgICAgICAgICB5OiB5XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICB9KTtcblxuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZW1pdHRlckJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gd2luZG93LmdhbWUucGxheWVyc1t3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkXTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgICAgICAgICAgZW1pdENvdW50OiAxMCxcbiAgICAgICAgICAgICAgICBlbWl0U3BlZWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgeDogcGxheWVyLngsXG4gICAgICAgICAgICAgICAgeTogcGxheWVyLnlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG59O1xuIiwidmFyIGxldmVsID0ge1xyXG4gICAgbmFtZTogXCJsZXZlbDFcIixcclxuICAgIHRpbGVzOiBbXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwyLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMiwyLDIsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDEsMiwyLDIsMSwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMSwxLDEsMSwwLDAsMSwyLDIsMSwxLDEsMiwyLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDIsMiwyLDIsMiwxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwLDAsMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMSwwLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMF0sXVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsZXZlbDtcclxuIiwidmFyIEFrNDcgPSB7XHJcbiAgICBcIm5hbWVcIjogXCJBazQ3XCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAzMCwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDMwLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjEsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogMSwgLy8gc2hvb3QgMSBidWxsZXQgYXQgYSB0aW1lXHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDE3MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogMCwgLy8gc3ByaXRlc2hlZXQgeSBwb3NpdGlvblxyXG4gICAgXCJpY29uU3hcIjogMjEsXHJcbiAgICBcImljb25TeVwiOiAyMTAsXHJcbiAgICBcImljb25XXCI6IDMwLFxyXG4gICAgXCJpY29uSFwiOiAzMFxyXG59O1xyXG5cclxudmFyIHNob3RndW4gPSB7XHJcbiAgICBcIm5hbWVcIjogXCJzaG90Z3VuXCIsXHJcbiAgICBcIm1hZ2F6aW5lU2l6ZVwiOiAxMiwgLy8gYnVsbGV0c1xyXG4gICAgXCJidWxsZXRzXCI6IDEyLFxyXG4gICAgXCJmaXJlUmF0ZVwiOiAwLjUsIC8vIHNob3RzIHBlciBzZWNvbmRcclxuICAgIFwiYnVsbGV0c1BlclNob3RcIjogNCwgLy8gNCBzaG90Z3VuIHNsdWdzIHBlciBzaG90XHJcbiAgICBcImRhbWFnZVwiOiAxMCwgLy8gaHBcclxuICAgIFwicmVsb2FkVGltZVwiOiAyLCAvLyBzXHJcbiAgICBcImJ1bGxldFNwZWVkXCI6IDI1MDAsIC8vIHBpeGVscyBwZXIgc2Vjb25kXHJcbiAgICBcInN4XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHggcG9zaXRpb25cclxuICAgIFwic3lcIjogNjAsIC8vIHNwcml0ZXNoZWV0IHkgcG9zaXRpb25cclxuICAgIFwiaWNvblN4XCI6IDUxLFxyXG4gICAgXCJpY29uU3lcIjogMjEwLFxyXG4gICAgXCJpY29uV1wiOiAzMCxcclxuICAgIFwiaWNvbkhcIjogMzBcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQWs0NzogQWs0NyxcclxuICAgIHNob3RndW46IHNob3RndW5cclxufTtcclxuIiwiLy8gZGVncmVlcyB0byByYWRpYW5zXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVnKSB7XG4gICAgcmV0dXJuIGRlZyAqIChNYXRoLlBJIC8gMTgwKTtcbn1cblxuLy8gcmFkaWFucyB0byBkZWdyZWVzXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkKSB7XG4gICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKTtcbn1cblxuLy8gY2hlY2sgaWYgdGhpcyBwb2ludCBpcyBpbnNpZGUgYSBub24gd2Fsa2FibGUgdGlsZS4gcmV0dXJucyB0cnVlIGlmIG5vdCB3YWxrYWJsZVxuZnVuY3Rpb24gY29sbGlzaW9uQ2hlY2socG9pbnQpIHtcbiAgICB2YXIgdGlsZVJvdyA9IE1hdGguZmxvb3IocG9pbnQueSAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKTtcbiAgICB2YXIgdGlsZUNvbCA9IE1hdGguZmxvb3IocG9pbnQueCAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKTtcbiAgICBpZiAodGlsZVJvdyA8IDAgfHwgdGlsZVJvdyA+PSB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQgfHwgdGlsZUNvbCA8IDAgfHwgdGlsZUNvbCA+PSB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgKSByZXR1cm4gdHJ1ZTsgLy8gb3V0c2lkZSBtYXBcbiAgICByZXR1cm4gKHdpbmRvdy5nYW1lLmxldmVsLmxldmVsLnRpbGVzW3RpbGVSb3ddW3RpbGVDb2xdID4gMCk7XG59XG5cbi8vIHRha2VzIGEgcG9pbnQgYW5kIHJldHVucyB0aWxlIHh5d2ggdGhhdCBpcyB1bmRlciB0aGF0IHBvaW50XG5mdW5jdGlvbiBnZXRSZWN0RnJvbVBvaW50KHBvaW50KSB7XG4gICAgdmFyIHkgPSBNYXRoLmZsb29yKHBvaW50LnkgLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSkgKiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZTtcbiAgICB2YXIgeCA9IE1hdGguZmxvb3IocG9pbnQueCAvIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplKSAqIHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplO1xuICAgIHJldHVybiB7eDogeCwgeTogeSwgdzogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUsIGg6IHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplfTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlsZSh4LCB5KSB7XG4gICAgaWYoeCA+PSAwICYmIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgJiYgeSA+PSAwICYmIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpXG4gICAgICAgIHJldHVybiB3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t5XVt4XTtcbn1cblxuLy8gZmluZHMgYSByYW5kb20gd2Fsa2FibGUgdGlsZSBvbiB0aGUgbWFwXG5mdW5jdGlvbiBmaW5kU3Bhd25Mb2NhdGlvbigpIHtcbiAgICB2YXIgeDtcbiAgICB2YXIgeTtcbiAgICBkbyB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIH1cbiAgICB3aGlsZSAoY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KSk7XG5cbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRvUmFkaWFuczogdG9SYWRpYW5zLFxuICAgIHRvRGVncmVlczogdG9EZWdyZWVzLFxuICAgIGNvbGxpc2lvbkNoZWNrOiBjb2xsaXNpb25DaGVjayxcbiAgICBmaW5kU3Bhd25Mb2NhdGlvbjogZmluZFNwYXduTG9jYXRpb24sXG4gICAgZ2V0UmVjdEZyb21Qb2ludDogZ2V0UmVjdEZyb21Qb2ludCxcbiAgICBnZXRUaWxlOiBnZXRUaWxlXG59O1xuIiwidmFyIEdhbWUgPSByZXF1aXJlKFwiLi9HYW1lLmpzXCIpO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn0pO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxuLy92YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xyXG5cclxuY2xhc3MgQnVsbGV0SG9sZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICAvL3ZhciBybmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCk7XHJcbiAgICAgICAgLy8gdmFyIHIgPSAxNTA7XHJcbiAgICAgICAgLy8gdmFyIGcgPSA1MDtcclxuICAgICAgICAvLyB2YXIgYiA9IDUwO1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCJyZ2IoNjYsIDY2LCA2NilcIjtcclxuICAgICAgICAvL2RhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMjtcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlmZVRpbWUgPSAxMDtcclxuICAgICAgICAvL3RoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIC8vdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICAvL3RoaXMubW92ZURpc3RhbmNlID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE1KSArIDEpO1xyXG4gICAgICAgIC8vdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuQnVsbGV0SG9sZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA8IHRoaXMubW92ZURpc3RhbmNlKSB7XHJcbiAgICAvLyAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xyXG4gICAgLy8gICAgIHRoaXMueCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gICAgIHRoaXMueSA9IHRoaXMueSArIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gICAgIHRoaXMuZGlzdGFuY2VNb3ZlZCArPSBkaXN0YW5jZTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgaWYgKHRoaXMuZGlzdGFuY2VNb3ZlZCA+PSB0aGlzLm1vdmVEaXN0YW5jZSkgdGhpcy5jdHggPSB3aW5kb3cuZ2FtZS5iZ0N0eDsgLy8gbW92ZSB0byBiYWNrZ3JvdW5kIGN0eFxyXG4gICAgLy8gfVxyXG5cclxufTtcclxuXHJcbi8vIEJsb29kU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuLy8gICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbi8vICAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4vLyAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbi8vICAgICB0aGlzLmN0eC5hcmMoMCAtIHRoaXMuc2l6ZSAvIDIsIDAgLSB0aGlzLnNpemUgLyAyLCB0aGlzLnNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4vLyAgICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4vLyB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0SG9sZTtcclxuIiwiLy92YXIgdGlsZXMgPSByZXF1aXJlKFwiLi9sZXZlbFwiKS50aWxlcztcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi8uLi9oZWxwZXJzLmpzXCIpO1xyXG52YXIgY29sbGlzaW9uRGV0ZWN0aW9uID0gcmVxdWlyZShcIi4vY29sbGlzaW9uRGV0ZWN0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gYmxpbmUoeDAsIHkwLCB4MSwgeTEpIHtcclxuXHJcbiAgdmFyIGR4ID0gTWF0aC5hYnMoeDEgLSB4MCksIHN4ID0geDAgPCB4MSA/IDEgOiAtMTtcclxuICB2YXIgZHkgPSBNYXRoLmFicyh5MSAtIHkwKSwgc3kgPSB5MCA8IHkxID8gMSA6IC0xO1xyXG4gIHZhciBlcnIgPSAoZHg+ZHkgPyBkeCA6IC1keSkvMjtcclxuXHJcbiAgd2hpbGUgKHRydWUpIHtcclxuXHJcbiAgICBpZiAoeDAgPT09IHgxICYmIHkwID09PSB5MSkgYnJlYWs7XHJcbiAgICB2YXIgZTIgPSBlcnI7XHJcbiAgICBpZiAoZTIgPiAtZHgpIHsgZXJyIC09IGR5OyB4MCArPSBzeDsgfVxyXG4gICAgaWYgKGUyIDwgZHkpIHsgZXJyICs9IGR4OyB5MCArPSBzeTsgfVxyXG5cclxuICAgIHZhciB0aWxlWCA9IE1hdGguZmxvb3IoeDAgLyAzMik7XHJcbiAgICB2YXIgdGlsZVkgPSBNYXRoLmZsb29yKHkwIC8gMzIpO1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIG91dHNpZGUgbWFwXHJcbiAgICBpZiAodGlsZVggPiB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgfHwgdGlsZVkgPiB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpIHJldHVybjtcclxuXHJcbiAgICAvLyBoaXQgY2hlY2sgYWdhaW5zdCBwbGF5ZXJzXHJcbiAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xyXG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XHJcbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciBoaXQgPSBjb2xsaXNpb25EZXRlY3Rpb24ucG9pbnRDaXJjbGUoe3g6IHgwLCB5OiB5MH0sIHt4OiBwbGF5ZXIueCwgeTogcGxheWVyLnksIHJhZGl1czogcGxheWVyLnJhZGl1c30pO1xyXG4gICAgICAgIGlmIChoaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHt0eXBlOiBcInBsYXllclwiLCBwbGF5ZXI6IHBsYXllcn07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBhZ2FpbnN0IHRpbGVzXHJcbiAgICBpZiAoaGVscGVycy5nZXRUaWxlKHRpbGVYLHRpbGVZKSA9PT0gMSkgcmV0dXJuIHt0eXBlOiBcInRpbGVcIiwgeDogdGlsZVgsIHk6IHRpbGVZfTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmxpbmU7XHJcbiIsInZhciBpbnRlcnNlY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XHJcblxyXG5mdW5jdGlvbiBsaW5lUmVjdEludGVyc2VjdChsaW5lLCByZWN0KSB7XHJcblxyXG4gICAgICAgIC8vaWYgKHBvaW50IGlzIGluc2lkZSByZWN0KVxyXG4gICAgICAgIC8vIGludGVyc2VjdCA9IHBvaW50O1xyXG5cclxuICAgICAgICAvLyBjaGVjayBsZWZ0XHJcbiAgICAgICAgdmFyIGxlZnQgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciBsZWZ0SW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLGxlZnQpO1xyXG4gICAgICAgIGlmIChsZWZ0SW50ZXJzZWN0LnkgPj0gbGVmdC5zdGFydC55ICYmIGxlZnRJbnRlcnNlY3QueSA8PSBsZWZ0LmVuZC55ICYmIGxpbmUuc3RhcnQueCA8PSBsZWZ0LnN0YXJ0LnggKSB7XHJcbiAgICAgICAgICAgIGxlZnRJbnRlcnNlY3QueCArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gbGVmdEludGVyc2VjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIHRvcFxyXG4gICAgICAgIHZhciB0b3AgPSB7c3RhcnQ6e3g6IHJlY3QueCwgeTogcmVjdC55fSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueX19O1xyXG4gICAgICAgIHZhciB0b3BJbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHRvcCk7XHJcbiAgICAgICAgaWYgKHRvcEludGVyc2VjdC54ID49IHRvcC5zdGFydC54ICYmIHRvcEludGVyc2VjdC54IDw9IHRvcC5lbmQueCAmJiBsaW5lLnN0YXJ0LnkgPD0gdG9wLnN0YXJ0LnkpIHtcclxuICAgICAgICAgICAgdG9wSW50ZXJzZWN0LnkgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvcEludGVyc2VjdDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayByaWdodFxyXG4gICAgICAgIHZhciByaWdodCA9IHtzdGFydDp7eDogcmVjdC54ICsgcmVjdC53ICx5OiByZWN0LnkgfSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgICAgIHZhciByaWdodEludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgcmlnaHQpO1xyXG4gICAgICAgIGlmIChyaWdodEludGVyc2VjdC55ID49IHJpZ2h0LnN0YXJ0LnkgJiYgcmlnaHRJbnRlcnNlY3QueSA8IHJpZ2h0LmVuZC55KSB7XHJcbiAgICAgICAgICAgIHJpZ2h0SW50ZXJzZWN0LnggLT0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHJpZ2h0SW50ZXJzZWN0O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGRvd25cclxuICAgICAgICB2YXIgZG93biA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICAgICAgdmFyIGRvd25JbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIGRvd24pO1xyXG4gICAgICAgIHRvcEludGVyc2VjdC55IC09IDE7XHJcbiAgICAgICAgcmV0dXJuIGRvd25JbnRlcnNlY3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBvaW50Q2lyY2xlKHBvaW50LCBjaXJjbGUpIHtcclxuICAgICAgICB2YXIgYSA9IHBvaW50LnggLSBjaXJjbGUueDtcclxuICAgICAgICB2YXIgYiA9IHBvaW50LnkgLSBjaXJjbGUueTtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGEqYSArIGIqYiApO1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IGNpcmNsZS5yYWRpdXMpIHsgLy8gcG9pbnQgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbGluZVJlY3RJbnRlcnNlY3Q6IGxpbmVSZWN0SW50ZXJzZWN0LFxyXG4gICAgcG9pbnRDaXJjbGU6IHBvaW50Q2lyY2xlXHJcbn07XHJcbiIsInZhciBpbnRlcnNlY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2ZWN0b3IgPSB7fTtcclxuICAgIHZlY3Rvci5vQSA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm4gc2VnbWVudC5zdGFydDtcclxuICAgIH07XHJcbiAgICB2ZWN0b3IuQUIgPSBmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gc2VnbWVudC5zdGFydDtcclxuICAgICAgICB2YXIgZW5kID0gc2VnbWVudC5lbmQ7XHJcbiAgICAgICAgcmV0dXJuIHt4OmVuZC54IC0gc3RhcnQueCwgeTogZW5kLnkgLSBzdGFydC55fTtcclxuICAgIH07XHJcbiAgICB2ZWN0b3IuYWRkID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4ge3g6IHYxLnggKyB2Mi54LCB5OiB2MS55ICsgdjIueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3Iuc3ViID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4ge3g6djEueCAtIHYyLngsIHk6IHYxLnkgLSB2Mi55fTtcclxuICAgIH1cclxuICAgIHZlY3Rvci5zY2FsYXJNdWx0ID0gZnVuY3Rpb24ocywgdikge1xyXG4gICAgICAgIHJldHVybiB7eDogcyAqIHYueCwgeTogcyAqIHYueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3IuY3Jvc3NQcm9kdWN0ID0gZnVuY3Rpb24odjEsdjIpIHtcclxuICAgICAgICByZXR1cm4gKHYxLnggKiB2Mi55KSAtICh2Mi54ICogdjEueSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIHNlbGYgPSB7fTtcclxuICAgIHNlbGYudmVjdG9yID0gZnVuY3Rpb24oc2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybiB2ZWN0b3IuQUIoc2VnbWVudCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pbnRlcnNlY3RTZWdtZW50cyA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIHR1cm4gYSA9IHAgKyB0KnIgd2hlcmUgMDw9dDw9MSAocGFyYW1ldGVyKVxyXG4gICAgICAgIC8vIGIgPSBxICsgdSpzIHdoZXJlIDA8PXU8PTEgKHBhcmFtZXRlcilcclxuICAgICAgICB2YXIgcCA9IHZlY3Rvci5vQShhKTtcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuXHJcbiAgICAgICAgdmFyIHEgPSB2ZWN0b3Iub0EoYik7XHJcbiAgICAgICAgdmFyIHMgPSB2ZWN0b3IuQUIoYik7XHJcblxyXG4gICAgICAgIHZhciBjcm9zcyA9IHZlY3Rvci5jcm9zc1Byb2R1Y3QocixzKTtcclxuICAgICAgICB2YXIgcW1wID0gdmVjdG9yLnN1YihxLHApO1xyXG4gICAgICAgIHZhciBudW1lcmF0b3IgPSB2ZWN0b3IuY3Jvc3NQcm9kdWN0KHFtcCwgcyk7XHJcbiAgICAgICAgdmFyIHQgPSBudW1lcmF0b3IgLyBjcm9zcztcclxuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gdmVjdG9yLmFkZChwLHZlY3Rvci5zY2FsYXJNdWx0KHQscikpO1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb247XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pc1BhcmFsbGVsID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgLy8gYSBhbmQgYiBhcmUgbGluZSBzZWdtZW50cy5cclxuICAgICAgICAvLyByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBhcmUgcGFyYWxsZWwgKG9yIGNvLWxpbmVhcilcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuICAgICAgICByZXR1cm4gKHZlY3Rvci5jcm9zc1Byb2R1Y3QocixzKSA9PT0gMCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pc0NvbGxpbmVhciA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIGEgYW5kIGIgYXJlIGxpbmUgc2VnbWVudHMuXHJcbiAgICAgICAgLy8gcmV0dXJucyB0cnVlIGlmIGEgYW5kIGIgYXJlIGNvLWxpbmVhclxyXG4gICAgICAgIHZhciBwID0gdmVjdG9yLm9BKGEpO1xyXG4gICAgICAgIHZhciByID0gdmVjdG9yLkFCKGEpO1xyXG5cclxuICAgICAgICB2YXIgcSA9IHZlY3Rvci5vQShiKTtcclxuICAgICAgICB2YXIgcyA9IHZlY3Rvci5BQihiKTtcclxuICAgICAgICByZXR1cm4gKHZlY3Rvci5jcm9zc1Byb2R1Y3QodmVjdG9yLnN1YihwLHEpLCByKSA9PT0gMCk7XHJcbiAgICB9O1xyXG4gICAgc2VsZi5zYWZlSW50ZXJzZWN0ID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuaXNQYXJhbGxlbChhLGIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbnRlcnNlY3RTZWdtZW50cyhhLGIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbn07XHJcbmludGVyc2VjdGlvbi5pbnRlcnNlY3RTZWdtZW50cyA9IGludGVyc2VjdGlvbigpLmludGVyc2VjdFNlZ21lbnRzO1xyXG5pbnRlcnNlY3Rpb24uaW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uKCkuc2FmZUludGVyc2VjdDtcclxuaW50ZXJzZWN0aW9uLmlzUGFyYWxsZWwgPSBpbnRlcnNlY3Rpb24oKS5pc1BhcmFsbGVsO1xyXG5pbnRlcnNlY3Rpb24uaXNDb2xsaW5lYXIgPSBpbnRlcnNlY3Rpb24oKS5pc0NvbGxpbmVhcjtcclxuaW50ZXJzZWN0aW9uLmRlc2NyaWJlID0gZnVuY3Rpb24oYSxiKSB7XHJcbiAgICB2YXIgaXNDb2xsaW5lYXIgPSBpbnRlcnNlY3Rpb24oKS5pc0NvbGxpbmVhcihhLGIpO1xyXG4gICAgdmFyIGlzUGFyYWxsZWwgPSBpbnRlcnNlY3Rpb24oKS5pc1BhcmFsbGVsKGEsYik7XHJcbiAgICB2YXIgcG9pbnRPZkludGVyc2VjdGlvbiA9IHVuZGVmaW5lZDtcclxuICAgIGlmIChpc1BhcmFsbGVsID09PSBmYWxzZSkge1xyXG4gICAgICAgIHBvaW50T2ZJbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb24oKS5pbnRlcnNlY3RTZWdtZW50cyhhLGIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtjb2xsaW5lYXI6IGlzQ29sbGluZWFyLHBhcmFsbGVsOiBpc1BhcmFsbGVsLGludGVyc2VjdGlvbjpwb2ludE9mSW50ZXJzZWN0aW9ufTtcclxufTtcclxuXHJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdGlvbjtcclxuIiwidmFyIGludGVyc2VjdGlvbiA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdGlvblwiKTtcclxuXHJcbi8vIGZpbmQgdGhlIHBvaW50IHdoZXJlIGEgbGluZSBpbnRlcnNlY3RzIGEgcmVjdGFuZ2xlLiB0aGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhlIGxpbmUgYW5kIHJlY3QgaW50ZXJzZWN0c1xyXG5mdW5jdGlvbiBsaW5lUmVjdEludGVyc2VjdChsaW5lLCByZWN0KSB7XHJcbiAgICAvL2lmIChwb2ludCBpcyBpbnNpZGUgcmVjdClcclxuICAgIC8vIGludGVyc2VjdCA9IHBvaW50O1xyXG5cclxuICAgIC8vIGNoZWNrIGxlZnRcclxuICAgIHZhciBsZWZ0TGluZSA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0Lnl9LCBlbmQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICB2YXIgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsbGVmdExpbmUpO1xyXG4gICAgaWYgKGludGVyc2VjdGlvblBvaW50LnkgPj0gbGVmdExpbmUuc3RhcnQueSAmJiBpbnRlcnNlY3Rpb25Qb2ludC55IDw9IGxlZnRMaW5lLmVuZC55ICYmIGxpbmUuc3RhcnQueCA8PSBsZWZ0TGluZS5zdGFydC54ICkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayB0b3BcclxuICAgIHZhciB0b3BMaW5lID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0Lnl9fTtcclxuICAgIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCB0b3BMaW5lKTtcclxuICAgIGlmIChpbnRlcnNlY3Rpb25Qb2ludC54ID49IHRvcExpbmUuc3RhcnQueCAmJiBpbnRlcnNlY3Rpb25Qb2ludC54IDw9IHRvcExpbmUuZW5kLnggJiYgbGluZS5zdGFydC55IDw9IHRvcExpbmUuc3RhcnQueSkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayByaWdodFxyXG4gICAgdmFyIHJpZ2h0TGluZSA9IHtzdGFydDp7eDogcmVjdC54ICsgcmVjdC53ICx5OiByZWN0LnkgfSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHJpZ2h0TGluZSk7XHJcbiAgICBpZiAoaW50ZXJzZWN0aW9uUG9pbnQueSA+PSByaWdodExpbmUuc3RhcnQueSAmJiBpbnRlcnNlY3Rpb25Qb2ludC55IDwgcmlnaHRMaW5lLmVuZC55ICYmIGxpbmUuc3RhcnQueCA+PSByaWdodExpbmUuc3RhcnQueCkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBkb3duXHJcbiAgICB2YXIgZG93biA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgZG93bik7XHJcbiAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGluZVJlY3RJbnRlcnNlY3Q7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5BazQ3O1xyXG5cclxuY2xhc3MgQWs0NyBleHRlbmRzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBleGlzdGluZ1dlYXBvbkRhdGEpIHtcclxuICAgICAgICB3ZWFwb25EYXRhID0gZXhpc3RpbmdXZWFwb25EYXRhIHx8IHdlYXBvbkRhdGE7XHJcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFrNDc7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuc2hvdGd1bjtcbnZhciBCdWxsZXQgPSByZXF1aXJlKFwiLi4vLi9CdWxsZXRcIik7XG5cbmNsYXNzIFNob3RndW4gZXh0ZW5kcyBXZWFwb257XG4gICAgY29uc3RydWN0b3Iob3duZXIsIGV4aXN0aW5nV2VhcG9uRGF0YSkge1xuICAgICAgICB3ZWFwb25EYXRhID0gZXhpc3RpbmdXZWFwb25EYXRhIHx8IHdlYXBvbkRhdGE7XG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcbiAgICB9XG59XG5cblNob3RndW4ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcblxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5idWxsZXRzIC09IDE7XG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xuXG4gICAgdmFyIGRpcmVjdGlvbnMgPSBbXTtcbiAgICB2YXIgZGlyZWN0aW9uO1xuXG4gICAgLy8gc2hvb3QgNCBidWxsZXRzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHNQZXJTaG90OyBpICs9IDEpIHtcblxuICAgICAgICBpZiAoIWFjdGlvbi5kYXRhLmRpcmVjdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIHJhbmRvbWl6ZSBkaXJlY3Rpb25zIG15c2VsZlxuICAgICAgICAgICAgZGlyZWN0aW9uID0gdGhpcy5vd25lci5kaXJlY3Rpb24gKyBNYXRoLnJhbmRvbSgpICogMC4yNSAtIDAuMTI1O1xuICAgICAgICAgICAgZGlyZWN0aW9ucy5wdXNoKGRpcmVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBhY3Rpb24uZGF0YS5kaXJlY3Rpb25zW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgQnVsbGV0KHtcbiAgICAgICAgICAgIHg6IHRoaXMub3duZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMub3duZXIueSxcbiAgICAgICAgICAgIHRhcmdldFg6IHRoaXMub3duZXIubW91c2VYLFxuICAgICAgICAgICAgdGFyZ2V0WTogdGhpcy5vd25lci5tb3VzZVksXG4gICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJGSVJFXCIsIGFjdGlvbiwgZGlyZWN0aW9ucyk7XG4gICAgYWN0aW9uLmRhdGEuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnM7XG5cblxuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3RndW47XG4iLCJ2YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0MlwiKTtcblxuY2xhc3MgV2VhcG9ue1xuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBkYXRhKSB7XG4gICAgICAgIHRoaXMub3duZXIgPSBvd25lcjtcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xuICAgICAgICB0aGlzLm1hZ2F6aW5lU2l6ZSA9IGRhdGEubWFnYXppbmVTaXplO1xuICAgICAgICB0aGlzLmJ1bGxldHMgPSBkYXRhLmJ1bGxldHM7XG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSBkYXRhLmZpcmVSYXRlO1xuICAgICAgICB0aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSBkYXRhLmJ1bGxldFNwZWVkO1xuICAgICAgICB0aGlzLmJ1bGxldHNQZXJTaG90ID0gZGF0YS5idWxsZXRzUGVyU2hvdDtcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XG4gICAgICAgIHRoaXMuc3kgPSBkYXRhLnN5O1xuXG4gICAgICAgIHRoaXMuaWNvblN4ID0gZGF0YS5pY29uU3g7XG4gICAgICAgIHRoaXMuaWNvblN5ID0gZGF0YS5pY29uU3k7XG4gICAgICAgIHRoaXMuaWNvblcgPSBkYXRhLmljb25XO1xuICAgICAgICB0aGlzLmljb25IID0gZGF0YS5pY29uSDtcblxuICAgICAgICB0aGlzLmZpcmVUaW1lciA9IHRoaXMuZmlyZVJhdGU7XG5cbiAgICAgICAgdGhpcy5yZWxvYWRpbmcgPSBkYXRhLnJlbG9hZGluZyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5yZWxvYWRUaW1lciA9IGRhdGEucmVsb2FkVGltZXIgfHwgMDtcbiAgICB9XG59XG5cbldlYXBvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlKSB0aGlzLmZpcmVUaW1lciArPSBkdDtcblxuICAgIGlmICh0aGlzLnJlbG9hZGluZykge1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyICs9IGR0O1xuICAgICAgICBpZiAodGhpcy5yZWxvYWRUaW1lciA+IHRoaXMucmVsb2FkVGltZSl7XG4gICAgICAgICAgICB0aGlzLmZpbGxNYWdhemluZSgpO1xuICAgICAgICAgICAgdGhpcy5zdG9wUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nIHx8IHRoaXMuYnVsbGV0cyA8IDEpIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuYnVsbGV0cyAtPSB0aGlzLmJ1bGxldHNQZXJTaG90O1xuICAgIHRoaXMuZmlyZVRpbWVyID0gMDtcblxuICAgIHZhciBidWxsZXQgPSBuZXcgQnVsbGV0KHtcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxuICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgIHRhcmdldFg6IHRoaXMub3duZXIubW91c2VYLFxuICAgICAgICB0YXJnZXRZOiB0aGlzLm93bmVyLm1vdXNlWSxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLm93bmVyLmRpcmVjdGlvbixcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgIH0pO1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMucmVsb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuV2VhcG9uLnByb3RvdHlwZS5maWxsTWFnYXppbmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJ1bGxldHMgPSB0aGlzLm1hZ2F6aW5lU2l6ZTtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuc3RvcFJlbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVsb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICBidWxsZXRzOiB0aGlzLmJ1bGxldHMsXG4gICAgICAgIGZpcmVUaW1lcjogdGhpcy5maXJlUmF0ZSxcbiAgICAgICAgcmVsb2FkaW5nOiB0aGlzLnJlbG9hZGluZyxcbiAgICAgICAgcmVsb2FkVGltZXI6IHRoaXMucmVsb2FkVGltZXJcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gV2VhcG9uO1xuIiwidmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL1Nob3RndW5cIik7XHJcbnZhciBBazQ3ID0gcmVxdWlyZShcIi4uLy4vd2VhcG9ucy9BazQ3XCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIik7XHJcblxyXG5mdW5jdGlvbiB3ZWFwb25DcmVhdG9yKG93bmVyLCBkYXRhKSB7XHJcblxyXG4gICAgdmFyIHdlcERhdGEgPSB3ZWFwb25EYXRhW2RhdGEubmFtZV07XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkgeyB3ZXBEYXRhW2tleV0gPSBkYXRhW2tleV07IH1cclxuXHJcbiAgICBzd2l0Y2ggKGRhdGEubmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJBazQ3XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWs0Nyhvd25lciwgd2VwRGF0YSk7XHJcbiAgICAgICAgY2FzZSBcInNob3RndW5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTaG90Z3VuKG93bmVyLCB3ZXBEYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3ZWFwb25DcmVhdG9yO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XG5cbmZ1bmN0aW9uIENsaWVudChJRCl7XG4gICAgLy90aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKElELCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLCBwb3J0OiB3aW5kb3cubG9jYXRpb24ucG9ydCwgcGF0aDogXCIvcGVlclwifSk7XG5cbiAgICAvLyBTdHJlc3MgdGVzdFxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XG5cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgYWN0aW9ucyBmcm9tIHRoZSBob3N0XG4gICAgdGhpcy5jaGFuZ2VzID0gW107IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcblxuICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGdhbWVJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pbiB0aGUgaG9zdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJteSBjbGllbnQgcGVlcklEIGlzIFwiLCBpZCk7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuZ2FtZS5zdGFydGVkKSB3aW5kb3cuZ2FtZS5zdGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG5cbiAgICAgICAgLy8gY2xvc2Ugb3V0IGFueSBvbGQgY29ubmVjdGlvbnNcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcbiAgICAgICAgICAgICAgICBpZiAoY29ublBlZXIgIT09IGNvbm4ucGVlcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXVswXS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBvbGQgaG9zdHMgcGxheWVyIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZGVsZXRlIG9sZCBwbGF5ZXJcIiwgY29ublBlZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgaXRcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG5cbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJKb2luZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgXCJwbGF5ZXJMZWZ0XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSAvLyBpZ25vcmUgbXkgb3duIHN0YXRlIGZvciBub3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twbGF5ZXIuaWRdLnVwZGF0ZVN0YXRlKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiY2hhbmdlc1wiOiAvLyBjaGFuZ2VzIGFuZCBhY3Rpb25zIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5jb25jYXQoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5jb25jYXQoZGF0YS5hY3Rpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOiAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgICAgICAgICAgICAgICAgZGF0YS5waW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbcGluZy5pZF0ucGluZyA9IHBpbmcucGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF0ucGluZztcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHdpbmRvdy5nYW1lLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsY3VsYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH0pO1xufVxuXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbntcbiAgICAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgaWYgKCFwbGF5ZXIpIHJldHVybjtcblxuICAgIHZhciBjdXJyZW50U3RhdGUgPSBwbGF5ZXIuZ2V0Q2xpZW50U3RhdGUoKTtcbiAgICB2YXIgbGFzdENsaWVudFN0YXRlID0gcGxheWVyLmxhc3RDbGllbnRTdGF0ZTtcbiAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0Q2xpZW50U3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcblxuICAgIC8vIGFkZCBhbnkgcGVyZm9ybWVkIGFjdGlvbnMgdG8gY2hhbmdlIHBhY2thZ2VcbiAgICBpZiAocGxheWVyLnBlcmZvcm1lZEFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgY2hhbmdlLmFjdGlvbnMgPSBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucztcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzLCBzZW5kIGVtIHRvIGhvc3RcbiAgICAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgICAgICAgICAgZXZlbnQ6IFwibmV0d29ya1VwZGF0ZVwiLFxuICAgICAgICAgICAgdXBkYXRlczogY2hhbmdlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwbGF5ZXIubGFzdENsaWVudFN0YXRlID0gY3VycmVudFN0YXRlO1xuXG5cblxuXG4gICAgLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV07XG5cbiAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgICAgIGlmIChjaGFuZ2UuaWQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UuaWRdLm5ldHdvcmtVcGRhdGUoY2hhbmdlKTtcbiAgICAgICAgICAgIH1jYXRjaCAoZXJyKSB7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XG4gICAgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTtcblxuXG5cbiAgICAvLyAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIC8vIHZhciBteVBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICAvLyBpZiAoIW15UGxheWVyKSByZXR1cm47XG4gICAgLy9cbiAgICAvLyAgaWYgKCFfLmlzRXF1YWwobXlQbGF5ZXIua2V5cywgbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlKSkge1xuICAgIC8vICAgICAvLyBzZW5kIGtleXN0YXRlIHRvIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwia2V5c1wiLFxuICAgIC8vICAgICAgICAga2V5czogbXlQbGF5ZXIua2V5c1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgfVxuICAgIC8vIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSA9IF8uY2xvbmUobXlQbGF5ZXIua2V5cyk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcbiAgICAvL1xuICAgIC8vIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XG4gICAgLy8gdmFyIGNoYW5nZXMgPSBbXTtcbiAgICAvLyB2YXIgbGFzdFN0YXRlID0gbXlQbGF5ZXIubGFzdFN0YXRlO1xuICAgIC8vIHZhciBuZXdTdGF0ZSA9IG15UGxheWVyLmdldFN0YXRlKCk7XG4gICAgLy9cbiAgICAvLyAvLyBjb21wYXJlIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgLy8gdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgIC8vIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAvLyAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAvLyAgICAgY2hhbmdlLnBsYXllcklEID0gbXlQbGF5ZXIuaWQ7XG4gICAgLy8gICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIG15UGxheWVyLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xuICAgIC8vIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXG4gICAgLy8gaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAvLyAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYgKHRoaXMuYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgIC8vIHNlbmQgYWxsIHBlcmZvcm1lZCBhY3Rpb25zIHRvIHRoZSBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImFjdGlvbnNcIixcbiAgICAvLyAgICAgICAgIGRhdGE6IHRoaXMuYWN0aW9uc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107IC8vIGNsZWFyIGFjdGlvbnMgcXVldWVcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jaGFuZ2VzW2ldLmxlbmd0aDsgaiArPSAxKSAge1xuICAgIC8vICAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldW2pdO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAvLyAgICAgICAgIGlmIChjaGFuZ2UucGxheWVySUQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHRoaXMuY2hhbmdlcyA9IFtdO1xuXG59O1xuXG4gICAgLy9cbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAvLyAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XG4gICAgLy8gICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgLy8gICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgLy8gICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvLyBwaW5nIHRlc3RcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgIC8vICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH0sIDIwMDApO1xuICAgIC8vXG4gICAgLy8gfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XG4gICAgdGhpcy5jb25ucyA9IHt9O1xuICAgIHRoaXMuYWN0aW9ucyA9IHt9OyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgYWxsIHRoZSBhY3Rpb25zIHJlY2VpdmVkIGZyb20gY2xpZW50c1xuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIHRoaXMuZGlmZiA9IG51bGw7XG5cbiAgICB0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgLy90aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuICAgICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcihkYXRhLmhvc3RJRCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSwgcG9ydDogd2luZG93LmxvY2F0aW9uLnBvcnQsIHBhdGg6IFwiL3BlZXJcIn0pO1xuXG4gICAgICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgaG9zdHMgcGxheWVyIG9iamVjdCBpZiBpdCBkb2VzbnQgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGlmICghKHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQgaW4gd2luZG93LmdhbWUucGxheWVycykpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNlbmQgYSBwaW5nIGV2ZXJ5IDIgc2Vjb25kcywgdG8gdHJhY2sgcGluZyB0aW1lXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgcGluZ3M6IHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5nZXRQaW5ncygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LDIwMDApO1xuXG4gICAgICAgICAgICAvLyBzZW5kIGZ1bGwgZ2FtZSBzdGF0ZSBvbmNlIGluIGEgd2hpbGVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcImdhbWVTdGF0ZVVwZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LDEwMDApO1xuXG4gICAgICAgICAgICBkYXRhLnBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XG4gICAgICAgICAgICAgICAgLy9jb25uZWN0IHdpdGggZWFjaCByZW1vdGUgcGVlclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xuICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogbmV3UGxheWVyLmdldEZ1bGxTdGF0ZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZW1pdCgge2NsaWVudElEOiBjb25uLnBlZXIsIGV2ZW50OiBcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiRVJST1IgRVZFTlRcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTsgLy8gYW5zd2VyIHRoZSBwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgY2xpZW50LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5ldHdvcmtVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgZnJvbSBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5uZXR3b3JrVXBkYXRlKGRhdGEudXBkYXRlcyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEuYWN0aW9ucyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJhY3Rpb25zXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiYWN0aW9ucyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImNoYW5nZXNcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiSGV5IHRoZXJlIGhhcyBiZWVuIGNoYW5nZXMhXCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmNoYW5nZShkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJrZXlzXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwia2V5cyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YS5rZXlzLCAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzID0gXy5jbG9uZShkYXRhLmtleXMpOyAvL1RPRE86IHZlcmlmeSBpbnB1dCAoY2hlY2sgdGhhdCBpdCBpcyB0aGUga2V5IG9iamVjdCB3aXRoIHRydWUvZmFsc2UgdmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2cod2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGZvciAodmFyIGNvbm4gaW4gdGhpcy5jb25ucyl7XG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRU1JVCFcIiwgZGF0YSk7XG4gICAgICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG5cbiAgICAgICAgdmFyIGNoYW5nZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RnVsbFN0YXRlID0gcGxheWVyLmdldEZ1bGxTdGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50RnVsbFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIHBsYXllci5sYXN0RnVsbFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG4gICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpIHx8IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHsgLy90aGVyZSdzIGJlZW4gY2hhbmdlcyBvciBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY2hhbmdlLmlkID0gcGxheWVyLmlkO1xuICAgICAgICAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmxhc3RGdWxsU3RhdGUgPSBjdXJyZW50RnVsbFN0YXRlO1xuICAgICAgICAgICAgICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIC8vIHNlbmQgY2hhbmdlc1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgdGhpcy5nZXRQaW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGluZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICBwaW5ncy5wdXNoKHtpZDogcGxheWVyLmlkLCBwaW5nOiBwbGF5ZXIucGluZyB8fCBcImhvc3RcIn0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBpbmdzO1xuICAgIH07XG59O1xuIiwidmFyIENsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcclxudmFyIEhvc3QgPSByZXF1aXJlKFwiLi9Ib3N0XCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJSVEMoKXtcclxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG5cclxuICAgIC8vIHJlY2VpdmluZyBteSBjbGllbnQgSURcclxuICAgIHRoaXMuc29ja2V0Lm9uKFwiSURcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50ID0gbmV3IENsaWVudChkYXRhLklEKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwieW91QXJlSG9zdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJpbSB0aGUgaG9zdFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QgPSBuZXcgSG9zdCgpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KHtob3N0SUQ6IGRhdGEuaG9zdElELCBwZWVyczogZGF0YS5wZWVyc30pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJKb2luZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGpvaW5lZFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdCh7aG9zdElEOiBkYXRhLmhvc3RJRCwgcGVlcnM6W2RhdGEucGVlcklEXX0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBMQVlFUiBMRUZUXCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGRhdGEucGxheWVySUR9KTtcclxuICAgIH0pO1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICBkZWxldGUgd2luZG93LmdhbWUucGxheWVyc1tkYXRhLmlkXTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXJzID0ge307XHJcbiAgICAvLyB0aGlzLmNvbm5zID0ge307XHJcbiAgICAvLyB0aGlzLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcbiAgICAvLyAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4gPSB0aGlzLnBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGlkLCBkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gdGhpcy5wZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IHRoaXMuY29ubjtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGEgcGVlciBoYXMgZGlzY29ubmVjdGVkXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgdGhpcy5jb25uLCBcIlBFRVJcIiwgdGhpcy5wZWVyKTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlZXJzW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5zW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KCk7XHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gfSk7XHJcbn07XHJcbiJdfQ==
