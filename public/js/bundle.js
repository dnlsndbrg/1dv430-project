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
var helpers = require("./helpers");
//var Emitter = require("./particle/Emitter");
var bresenham = require("./util/bresenham");
//var lineRectIntersect = require("./util/lineRectIntersect");
var BulletHole = require("./particle/BulletHole");
var collisionDetection = require("./util/collisionDetection");

// instant bullet
function Bullet(data) {
    // create the bullet 5 pixels to the right and 30 pixels forward. so it aligns with the gun barrel
    var startX = data.x + Math.cos(data.direction + 1.5707963268) * 5;
    var startY = data.y + Math.sin(data.direction + 1.5707963268) * 5;

    startX = startX + Math.cos(data.direction) * 30;
    startY= startY + Math.sin(data.direction) * 30;

    // check that the bullet spawn location is inside the game
    if (!helpers.isInsideGame(startX, startY)) return;

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

},{"./helpers":19,"./particle/BulletHole":23,"./util/bresenham":27,"./util/collisionDetection":28}],3:[function(require,module,exports){
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

},{"./Camera":3,"./Level":7,"./Player":15,"./Ui":16,"./webRTC/WebRTC":36}],6:[function(require,module,exports){
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

},{"./Entity":4,"./Keyboard":6,"./Mouse":8,"./NetworkControls":9,"./helpers":19,"./particle/Emitter":24,"./weapons/Ak47":30,"./weapons/Shotgun":31,"./weapons/weaponCreator":33}],16:[function(require,module,exports){
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
var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").Ak47;

class Ak47 extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
        super(owner, weaponData);
    }
}

module.exports = Ak47;

},{"../data/weapons":18,"./Weapon":32}],31:[function(require,module,exports){
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

},{".././Bullet":1,"../data/weapons":18,"./Weapon":32}],32:[function(require,module,exports){
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

},{".././Bullet2":2}],33:[function(require,module,exports){
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

},{".././weapons/Ak47":30,".././weapons/Shotgun":31,"../data/weapons":18}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
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

},{"./Client":34,"./Host":35}]},{},[20])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvQnVsbGV0LmpzIiwic3JjL2pzL0J1bGxldDIuanMiLCJzcmMvanMvQ2FtZXJhLmpzIiwic3JjL2pzL0VudGl0eS5qcyIsInNyYy9qcy9HYW1lLmpzIiwic3JjL2pzL0tleWJvYXJkLmpzIiwic3JjL2pzL0xldmVsLmpzIiwic3JjL2pzL01vdXNlLmpzIiwic3JjL2pzL05ldHdvcmtDb250cm9scy5qcyIsInNyYy9qcy9QYXJ0aWNsZS9CbG9vZC5qcyIsInNyYy9qcy9QYXJ0aWNsZS9CbG9vZDIuanMiLCJzcmMvanMvUGFydGljbGUvRW1pdHRlci5qcyIsInNyYy9qcy9QYXJ0aWNsZS9QYXJ0aWNsZS5qcyIsInNyYy9qcy9QYXJ0aWNsZS9SaWNvY2hldC5qcyIsInNyYy9qcy9QbGF5ZXIuanMiLCJzcmMvanMvVWkuanMiLCJzcmMvanMvZGF0YS9sZXZlbDEuanMiLCJzcmMvanMvZGF0YS93ZWFwb25zLmpzIiwic3JjL2pzL2hlbHBlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYXJ0aWNsZS9CdWxsZXRIb2xlLmpzIiwic3JjL2pzL3V0aWwvYnJlc2VuaGFtLmpzIiwic3JjL2pzL3V0aWwvY29sbGlzaW9uRGV0ZWN0aW9uLmpzIiwic3JjL2pzL3V0aWwvaW50ZXJzZWN0aW9uLmpzIiwic3JjL2pzL3dlYXBvbnMvQWs0Ny5qcyIsInNyYy9qcy93ZWFwb25zL1Nob3RndW4uanMiLCJzcmMvanMvd2VhcG9ucy9XZWFwb24uanMiLCJzcmMvanMvd2VhcG9ucy93ZWFwb25DcmVhdG9yLmpzIiwic3JjL2pzL3dlYlJUQy9DbGllbnQuanMiLCJzcmMvanMvd2ViUlRDL0hvc3QuanMiLCJzcmMvanMvd2ViUlRDL1dlYlJUQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuLy92YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XG52YXIgY29sbGlzaW9uRGV0ZWN0aW9uID0gcmVxdWlyZShcIi4vdXRpbC9jb2xsaXNpb25EZXRlY3Rpb25cIik7XG52YXIgQnVsbGV0SG9sZSA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0J1bGxldEhvbGVcIik7XG5cbmZ1bmN0aW9uIEJ1bGxldChkYXRhKSB7XG5cblxuICAgIC8vIGNyZWF0ZSB0aGUgYnVsbGV0IDUgcGl4ZWxzIHRvIHRoZSByaWdodCBhbmQgMzAgcGl4ZWxzIGZvcndhcmQuIHNvIGl0IGFsaWducyB3aXRoIHRoZSBndW4gYmFycmVsXG4gICAgdGhpcy54ID0gZGF0YS54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcbiAgICB0aGlzLnkgPSBkYXRhLnkgKyBNYXRoLnNpbihkYXRhLmRpcmVjdGlvbiArIDEuNTcwNzk2MzI2OCkgKiA1O1xuXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3MoZGF0YS5kaXJlY3Rpb24pICogMzA7XG4gICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogMzA7XG5cbiAgICB0aGlzLm9yaWdpblggPSB0aGlzLng7IC8vIHJlbWVtYmVyIHRoZSBzdGFydGluZyBwb3NpdGlvblxuICAgIHRoaXMub3JpZ2luWSA9IHRoaXMueTtcblxuICAgIC8vdGhpcy54ID0gZGF0YS54O1xuICAgIC8vdGhpcy55ID0gZGF0YS55O1xuICAgIC8vXG4gICAgLy8gdmFyIHhEaWZmID0gZGF0YS50YXJnZXRYIC0gdGhpcy54O1xuICAgIC8vIHZhciB5RGlmZiA9IGRhdGEudGFyZ2V0WSAtIHRoaXMueTtcbiAgICAvLyB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKTtcblxuICAgIHRoaXMubGVuZ3RoID0gMTA7IC8vIHRyYWlsIGxlbmd0aFxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XG4gICAgdGhpcy5zcGVlZCA9IGRhdGEuYnVsbGV0U3BlZWQ7XG4gICAgdGhpcy5kYW1hZ2UgPSBkYXRhLmRhbWFnZTtcblxuXG5cbiAgICB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmN0eDtcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcblxuICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcbiAgICAvL1xuICAgIHZhciB4ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XG4gICAgdmFyIHkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcblxuICAgIC8vIGhpdCBjaGVjayBhZ2FpbnN0IHBsYXllcnNcbiAgICB0aGlzLmhpdERldGVjdGlvbihpbmRleCk7XG5cbiAgICAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uIGFnYWluc3QgdGlsZXMgYW5kIG91dHNpZGUgb2YgbWFwXG4gICAgdmFyIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KTtcbiAgICBpZiAoIWNvbGxpc2lvbikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCByaWNob2NldCBwYXJ0aWNsZSBlZmZlY3RcbiAgICAgICAgLy8gd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIC8vICAgICB0eXBlOiBcIlJpY29jaGV0XCIsXG4gICAgICAgIC8vICAgICBlbWl0Q291bnQ6IDEsXG4gICAgICAgIC8vICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICAvLyAgICAgeDogdGhpcy54LFxuICAgICAgICAvLyAgICAgeTogdGhpcy55XG4gICAgICAgIC8vIH0pKTtcblxuICAgICAgICAvLyBmaW5kIHdoZXJlIHRoZSBidWxsZXQgdHJhamVjdG9yeSBpbnRlcnNlY3RlZCB3aXRoIHRoZSBjb2xsaWRpbmcgcmVjdFxuXG4gICAgICAgIHZhciBsaW5lID0ge3N0YXJ0OiB7eDogdGhpcy5vcmlnaW5YLCB5OiB0aGlzLm9yaWdpbll9LCBlbmQ6IHt4OiB4LCB5Onl9fTsgLy8gdGhlIGxpbmUgdGhhdCBnb2VzIGZyb20gdGhlIGJ1bGxldCBvcmlnaW4gcG9zaXRpb24gdG8gaXRzIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgdmFyIHJlY3QgPSBoZWxwZXJzLmdldFJlY3RGcm9tUG9pbnQoe3g6IHgsIHk6IHl9KTsgLy8gcmVjdCBvZiB0aGUgY29sbGlkaW5nIGJveFxuICAgICAgICB2YXIgcG9zID0gY29sbGlzaW9uRGV0ZWN0aW9uLmxpbmVSZWN0SW50ZXJzZWN0KGxpbmUsIHJlY3QpO1xuXG4gICAgICAgIC8vY29uc29sZS5sb2cocG9zKTtcblxuICAgICAgICB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMucHVzaChuZXcgQnVsbGV0SG9sZShwb3MpKTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgIH1cbiAgICAvL1xuICAgIC8vIC8vIGlmIG9mZiBzY3JlZW4sIHJlbW92ZSBpdFxuICAgIC8vIGlmICh0aGlzLnggPCAwIHx8IHRoaXMueCA+IHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIHx8IHRoaXMueSA8IDAgfHwgdGhpcy55ID4gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0KSB7XG4gICAgLy8gICAgIHRoaXMuZGVzdHJveShpbmRleCk7XG4gICAgLy8gICAgIHJldHVybjtcbiAgICAvLyB9XG4gICAgLy9cblxuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlLmhpdERldGVjdGlvbiA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgLy8gdGVzdCBidWxsZXQgYWdhaW5zdCBhbGwgcGxheWVyc1xuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XG5cbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcblxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XG5cbiAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcbiAgICAgICAgdmFyIGIgPSB0aGlzLnkgLSBwbGF5ZXIueTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KCBhKmEgKyBiKmIgKTtcblxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBwbGF5ZXIucmFkaXVzKSB7XG4gICAgICAgICAgICAvLyBoaXRcbiAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKHRoaXMuZGFtYWdlLCB0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnNwbGljZShpbmRleCwgMSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG5cbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxuICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uIC0gMC43ODUzOTgxNjM0KTsgLy8gcm90YXRlXG5cbiAgICAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxuICAgIHZhciBncmFkPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2JhKDI1NSwxNjUsMCwwLjQpXCIpO1xuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwieWVsbG93XCIpO1xuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gZ3JhZDtcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKDAsIDApO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcblxuXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgICAvL1xuICAgIC8vIGN0eC5iZWdpblBhdGgoKTtcbiAgICAvLyBjdHgubW92ZVRvKDAsMCk7XG4gICAgLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcblxuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCwgMSwgMSApO1xuXG5cbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgLy8gLy8gbGluZWFyIGdyYWRpZW50IGZyb20gc3RhcnQgdG8gZW5kIG9mIGxpbmVcbiAgICAvLyB2YXIgZ3JhZD0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIHRoaXMubGVuZ3RoKTtcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcbiAgICAvLyBncmFkLmFkZENvbG9yU3RvcCgxLCBcImdyZWVuXCIpO1xuICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XG4gICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vIGN0eC5tb3ZlVG8oMCwwKTtcbiAgICAvLyBjdHgubGluZVRvKDAsbGVuZ3RoKTtcbiAgICAvLyBjdHguc3Ryb2tlKCk7XG5cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcbiIsInZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuLy92YXIgRW1pdHRlciA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0VtaXR0ZXJcIik7XHJcbnZhciBicmVzZW5oYW0gPSByZXF1aXJlKFwiLi91dGlsL2JyZXNlbmhhbVwiKTtcclxuLy92YXIgbGluZVJlY3RJbnRlcnNlY3QgPSByZXF1aXJlKFwiLi91dGlsL2xpbmVSZWN0SW50ZXJzZWN0XCIpO1xyXG52YXIgQnVsbGV0SG9sZSA9IHJlcXVpcmUoXCIuL3BhcnRpY2xlL0J1bGxldEhvbGVcIik7XHJcbnZhciBjb2xsaXNpb25EZXRlY3Rpb24gPSByZXF1aXJlKFwiLi91dGlsL2NvbGxpc2lvbkRldGVjdGlvblwiKTtcclxuXHJcbi8vIGluc3RhbnQgYnVsbGV0XHJcbmZ1bmN0aW9uIEJ1bGxldChkYXRhKSB7XHJcbiAgICAvLyBjcmVhdGUgdGhlIGJ1bGxldCA1IHBpeGVscyB0byB0aGUgcmlnaHQgYW5kIDMwIHBpeGVscyBmb3J3YXJkLiBzbyBpdCBhbGlnbnMgd2l0aCB0aGUgZ3VuIGJhcnJlbFxyXG4gICAgdmFyIHN0YXJ0WCA9IGRhdGEueCArIE1hdGguY29zKGRhdGEuZGlyZWN0aW9uICsgMS41NzA3OTYzMjY4KSAqIDU7XHJcbiAgICB2YXIgc3RhcnRZID0gZGF0YS55ICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24gKyAxLjU3MDc5NjMyNjgpICogNTtcclxuXHJcbiAgICBzdGFydFggPSBzdGFydFggKyBNYXRoLmNvcyhkYXRhLmRpcmVjdGlvbikgKiAzMDtcclxuICAgIHN0YXJ0WT0gc3RhcnRZICsgTWF0aC5zaW4oZGF0YS5kaXJlY3Rpb24pICogMzA7XHJcblxyXG4gICAgLy8gY2hlY2sgdGhhdCB0aGUgYnVsbGV0IHNwYXduIGxvY2F0aW9uIGlzIGluc2lkZSB0aGUgZ2FtZVxyXG4gICAgaWYgKCFoZWxwZXJzLmlzSW5zaWRlR2FtZShzdGFydFgsIHN0YXJ0WSkpIHJldHVybjtcclxuXHJcbiAgICAvL3RoaXMuZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb247XHJcbiAgICAvL3RoaXMuc3BlZWQgPSBkYXRhLmJ1bGxldFNwZWVkO1xyXG4gICAgLy90aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xyXG4gICAgLy9cclxuICAgIHZhciBsaW5lID0ge1xyXG4gICAgICAgIHN0YXJ0OiB7eDogc3RhcnRYLCB5OiBzdGFydFl9LFxyXG4gICAgICAgIGVuZDoge3g6IGRhdGEudGFyZ2V0WCwgeTogZGF0YS50YXJnZXRZfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgaW50ZXJzZWN0ID0gbnVsbDtcclxuXHJcbiAgICB2YXIgY29sbGlzaW9uID0gYnJlc2VuaGFtKHN0YXJ0WCwgc3RhcnRZLCBkYXRhLnRhcmdldFgsIGRhdGEudGFyZ2V0WSk7IC8vIGZpbmQgY29sbGlkaW5nIHJlY3RhbmdsZXNcclxuICAgIGlmIChjb2xsaXNpb24pIHtcclxuICAgICAgICBzd2l0Y2goY29sbGlzaW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInRpbGVcIjpcclxuICAgICAgICAgICAgICAgIGludGVyc2VjdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5saW5lUmVjdEludGVyc2VjdDIobGluZSwge3g6IGNvbGxpc2lvbi54ICogMzIsIHk6IGNvbGxpc2lvbi55ICogMzIsIHc6IDMyLCBoOiAzMn0pO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGFydGljbGVzLnB1c2gobmV3IEJ1bGxldEhvbGUoaW50ZXJzZWN0KSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInBsYXllclwiOlxyXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uLnBsYXllci50YWtlRGFtYWdlKGRhdGEuZGFtYWdlLCBkYXRhLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgLy8gdmFyIGN4ID0gdGhpcy54OyAvLyBCZWdpbi9jdXJyZW50IGNlbGwgY29vcmRzXHJcbiAgICAvLyB2YXIgY3kgPSB0aGlzLnk7XHJcbiAgICAvLyB2YXIgZXggPSBFbmRYOyAvLyBFbmQgY2VsbCBjb29yZHNcclxuICAgIC8vIHZhciBleSA9IEVuZFk7XHJcbiAgICAvL1xyXG4gICAgLy8gLy8gRGVsdGEgb3IgZGlyZWN0aW9uXHJcbiAgICAvLyBkb3VibGUgZHggPSBFbmRYLUJlZ2luWDtcclxuICAgIC8vIGRvdWJsZSBkeSA9IEVuZFktQmVnaW5ZO1xyXG4gICAgLy9cclxuICAgIC8vIHdoaWxlIChjeCA8IGV4ICYmIGN5IDwgZXkpXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIC8vIGZpbmQgaW50ZXJzZWN0aW9uIFwidGltZVwiIGluIHggZGlyXHJcbiAgICAvLyAgIGZsb2F0IHQwID0gKGNlaWwoQmVnaW5YKS1CZWdpblgpL2R4O1xyXG4gICAgLy8gICBmbG9hdCB0MSA9IChjZWlsKEJlZ2luWSktQmVnaW5ZKS9keTtcclxuICAgIC8vXHJcbiAgICAvLyAgIHZpc2l0X2NlbGwoY3gsIGN5KTtcclxuICAgIC8vXHJcbiAgICAvLyAgIGlmICh0MCA8IHQxKSAvLyBjcm9zcyB4IGJvdW5kYXJ5IGZpcnN0PT9cclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgICsrY3g7XHJcbiAgICAvLyAgICAgQmVnaW5YICs9IHQwKmR4O1xyXG4gICAgLy8gICAgIEJlZ2luWSArPSB0MCpkeTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gICBlbHNlXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICArK2N5O1xyXG4gICAgLy8gICAgIEJlZ2luWCArPSB0MSpkeDtcclxuICAgIC8vICAgICBCZWdpblkgKz0gdDEqZHk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH1cclxuXHJcbn1cclxuXHJcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQsIGluZGV4KSB7XHJcblxyXG5cclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgIC8vIC8vXHJcbiAgICAvLyB2YXIgeCA9IHRoaXMueCArIE1hdGguY29zKHRoaXMuZGlyZWN0aW9uKSAqIGRpc3RhbmNlO1xyXG4gICAgLy8gdmFyIHkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBoaXQgY2hlY2sgYWdhaW5zdCBwbGF5ZXJzXHJcbiAgICAvLyB0aGlzLmhpdERldGVjdGlvbihpbmRleCk7XHJcbiAgICAvL1xyXG4gICAgLy8gLy8gY29sbGlzaW9uIGRldGVjdGlvbiBhZ2FpbnN0IHRpbGVzIGFuZCBvdXRzaWRlIG9mIG1hcFxyXG4gICAgLy8gdmFyIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KTtcclxuICAgIC8vIGlmICghY29sbGlzaW9uKSB7XHJcbiAgICAvLyAgICAgdGhpcy54ID0geDtcclxuICAgIC8vICAgICB0aGlzLnkgPSB5O1xyXG4gICAgLy8gfSBlbHNlIHtcclxuICAgIC8vICAgICAvLyBhZGQgcmljaG9jZXQgcGFydGljbGUgZWZmZWN0XHJcbiAgICAvLyAgICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XHJcbiAgICAvLyAgICAgICAgIHR5cGU6IFwiUmljb2NoZXRcIixcclxuICAgIC8vICAgICAgICAgZW1pdENvdW50OiAxLFxyXG4gICAgLy8gICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxyXG4gICAgLy8gICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAvLyAgICAgICAgIHk6IHRoaXMueVxyXG4gICAgLy8gICAgIH0pKTtcclxuICAgIC8vICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gfVxyXG4gICAgLy9cclxuICAgIC8vIC8vIGlmIG9mZiBzY3JlZW4sIHJlbW92ZSBpdFxyXG4gICAgLy8gaWYgKHRoaXMueCA8IDAgfHwgdGhpcy54ID4gd2luZG93LmdhbWUubGV2ZWwud2lkdGggfHwgdGhpcy55IDwgMCB8fCB0aGlzLnkgPiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpIHtcclxuICAgIC8vICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgLy8gICAgIHJldHVybjtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcblxyXG5cclxufTtcclxuXHJcbi8vIEJ1bGxldC5wcm90b3R5cGUuaGl0RGV0ZWN0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuLy8gICAgIC8vIHRlc3QgYnVsbGV0IGFnYWluc3QgYWxsIHBsYXllcnNcclxuLy8gICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcbi8vXHJcbi8vICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcclxuLy9cclxuLy8gICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XHJcbi8vXHJcbi8vICAgICAgICAgdmFyIGEgPSB0aGlzLnggLSBwbGF5ZXIueDtcclxuLy8gICAgICAgICB2YXIgYiA9IHRoaXMueSAtIHBsYXllci55O1xyXG4vLyAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggYSphICsgYipiICk7XHJcbi8vXHJcbi8vICAgICAgICAgaWYgKGRpc3RhbmNlIDwgcGxheWVyLnJhZGl1cykge1xyXG4vLyAgICAgICAgICAgICAvLyBoaXRcclxuLy8gICAgICAgICAgICAgcGxheWVyLnRha2VEYW1hZ2UodGhpcy5kYW1hZ2UsIHRoaXMuZGlyZWN0aW9uKTtcclxuLy8gICAgICAgICAgICAgdGhpcy5kZXN0cm95KGluZGV4KTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vXHJcbi8vIH07XHJcblxyXG5CdWxsZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcbkJ1bGxldC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgLy8gdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIC8vIHRoaXMuY3R4LnJvdGF0ZSh0aGlzLmRpcmVjdGlvbiAtIDAuNzg1Mzk4MTYzNCk7IC8vIHJvdGF0ZVxyXG4gICAgLy9cclxuICAgIC8vIC8vIC8vIGxpbmVhciBncmFkaWVudCBmcm9tIHN0YXJ0IHRvIGVuZCBvZiBsaW5lXHJcbiAgICAvLyB2YXIgZ3JhZD0gdGhpcy5jdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2JhKDI1NSwxNjUsMCwwLjQpXCIpO1xyXG4gICAgLy8gZ3JhZC5hZGRDb2xvclN0b3AoMSwgXCJ5ZWxsb3dcIik7XHJcbiAgICAvLyB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGdyYWQ7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAvLyAgIHRoaXMuY3R4Lm1vdmVUbygwLCAwKTtcclxuICAgIC8vICAgdGhpcy5jdHgubGluZVRvKHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgLy9cclxuICAgIC8vXHJcbiAgICAvLyAvLyBjdHgubGluZVdpZHRoID0gMTtcclxuICAgIC8vXHJcbiAgICAvLyAvL1xyXG4gICAgLy8gLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gLy8gY3R4LmxpbmVUbygwLHRoaXMubGVuZ3RoKTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAvLyB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgsIDEsIDEgKTtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG4gICAgLy9cclxuICAgIC8vIC8vXHJcbiAgICAvLyAvL1xyXG4gICAgLy8gLy8gY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAvLyAvLyAvLyBsaW5lYXIgZ3JhZGllbnQgZnJvbSBzdGFydCB0byBlbmQgb2YgbGluZVxyXG4gICAgLy8gLy8gdmFyIGdyYWQ9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCAwLCB0aGlzLmxlbmd0aCk7XHJcbiAgICAvLyAvLyBncmFkLmFkZENvbG9yU3RvcCgwLCBcInJlZFwiKTtcclxuICAgIC8vIC8vIGdyYWQuYWRkQ29sb3JTdG9wKDEsIFwiZ3JlZW5cIik7XHJcbiAgICAvLyAvLyBjdHguc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG4gICAgLy8gLy8gY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgLy8gLy8gY3R4Lm1vdmVUbygwLDApO1xyXG4gICAgLy8gLy8gY3R4LmxpbmVUbygwLGxlbmd0aCk7XHJcbiAgICAvLyAvLyBjdHguc3Ryb2tlKCk7XHJcbiAgICAvL1xyXG5cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcclxuIiwiZnVuY3Rpb24gQ2FtZXJhKCkge1xyXG4gICAgdGhpcy54ID0gMDtcclxuICAgIHRoaXMueSA9IDA7XHJcbiAgICAvLyB0aGlzLndpZHRoID0gO1xyXG4gICAgLy8gdGhpcy5oZWlnaHQgPSB3aW5kb3cuZ2FtZS5oZWlnaHQ7XHJcbiAgICB0aGlzLmZvbGxvd2luZyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5mb2xsb3cgPSBmdW5jdGlvbihwbGF5ZXIpe1xyXG4gICAgICAgIHRoaXMuZm9sbG93aW5nID0gcGxheWVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb2xsb3dpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy5mb2xsb3dpbmcueCAtIHdpbmRvdy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLmZvbGxvd2luZy55IC0gd2luZG93LmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhO1xyXG4iLCJjbGFzcyBFbnRpdHkge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMueCA9IGRhdGEueDtcclxuICAgICAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XHJcbiAgICAgICAgdGhpcy5zeSA9IGRhdGEuc3k7XHJcbiAgICAgICAgdGhpcy5zdyA9IGRhdGEuc3c7XHJcbiAgICAgICAgdGhpcy5zaCA9IGRhdGEuc2g7XHJcbiAgICAgICAgdGhpcy5kdyA9IGRhdGEuZHc7XHJcbiAgICAgICAgdGhpcy5kaCA9IGRhdGEuZGg7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkYXRhLmRpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLmN0eCA9IGRhdGEuY3R4O1xyXG4gICAgfVxyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcblxyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXHJcbiAgICB0aGlzLmN0eC50cmFuc2xhdGUodGhpcy54IC0gd2luZG93LmdhbWUuY2FtZXJhLngsIHRoaXMueSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KTsgLy8gY2hhbmdlIG9yaWdpblxyXG4gICAgdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uKTsgLy8gcm90YXRlXHJcblxyXG4gICAgdGhpcy5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCB0aGlzLnN4LCB0aGlzLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xyXG5cclxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxufTtcclxuXHJcbkVudGl0eS5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgc3g6IHRoaXMuc3gsXHJcbiAgICAgICAgc3k6IHRoaXMuc3ksXHJcbiAgICAgICAgc3c6IHRoaXMuc3csXHJcbiAgICAgICAgc2g6IHRoaXMuc2gsXHJcbiAgICAgICAgZGg6IHRoaXMuZGgsXHJcbiAgICAgICAgZHc6IHRoaXMuZHcsXHJcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eTtcclxuIiwidmFyIFVpID0gcmVxdWlyZShcIi4vVWlcIik7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZShcIi4vd2ViUlRDL1dlYlJUQ1wiKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoXCIuL1BsYXllclwiKTtcclxudmFyIENhbWVyYSA9IHJlcXVpcmUoXCIuL0NhbWVyYVwiKTtcclxudmFyIExldmVsID0gcmVxdWlyZShcIi4vTGV2ZWxcIik7XHJcblxyXG5mdW5jdGlvbiBHYW1lKCkge1xyXG5cclxuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMud2lkdGggPSA2NDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDQ4MDtcclxuXHJcblxyXG4gICAgdGhpcy5zcHJpdGVzaGVldCA9IG5ldyBJbWFnZSgpO1xyXG4gICAgdGhpcy5zcHJpdGVzaGVldC5zcmMgPSBcIi4uL2ltZy9zcHJpdGVzaGVldC5wbmdcIjtcclxuXHJcbiAgICB0aGlzLnRpbGVzaGVldCA9IG5ldyBJbWFnZSgpO1xyXG4gICAgdGhpcy50aWxlc2hlZXQuc3JjID0gXCIuLi9pbWcvdGlsZXMucG5nXCI7XHJcblxyXG4gICAgdGhpcy5sZXZlbCA9IG5ldyBMZXZlbCh0aGlzLnRpbGVzaGVldCk7XHJcblxyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG4gICAgdGhpcy5iZ0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICB0aGlzLmJnQ2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMuYmdDYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYW52YXNlc1wiKS5hcHBlbmRDaGlsZCh0aGlzLmJnQ2FudmFzKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzZXNcIikuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG5cclxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgdGhpcy5iZ0N0eCA9IHRoaXMuYmdDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgIHRoaXMuY3R4LmZvbnQgPSBcIjI0cHggT3BlbiBTYW5zXCI7XHJcblxyXG4gICAgdGhpcy5nYW1lSUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpWzJdO1xyXG5cclxuICAgIHRoaXMudWkgPSBuZXcgVWkodGhpcyk7XHJcbiAgICB0aGlzLm5ldHdvcmsgPSBuZXcgTmV0d29yaygpO1xyXG5cclxuICAgIHRoaXMuZW50aXRpZXMgPSBbXTsgLy8gZ2FtZSBlbnRpdGllc1xyXG4gICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuICAgIHRoaXMucGxheWVycyA9IHt9O1xyXG5cclxuICAgIHRoaXMubWF4UGFydGljbGVzID0gMTAwMDsgLy8gbnVtYmVyIG9mIHBhcnRpY2xlcyBhbGxvd2VkIG9uIHNjcmVlbiBiZWZvcmUgdGhleSBzdGFydCB0byBiZSByZW1vdmVkXHJcblxyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcblxyXG4gICAgdmFyIGxhc3QgPSAwOyAvLyB0aW1lIHZhcmlhYmxlXHJcbiAgICB2YXIgZHQ7IC8vZGVsdGEgdGltZVxyXG5cclxuICAgIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5sb29wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2FtZSBsb29wXHJcbiAgICAgKi9cclxuICAgIHRoaXMubG9vcCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCl7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKTsgLy8gcXVldWUgdXAgbmV4dCBsb29wXHJcblxyXG4gICAgICAgIGR0ID0gdGltZXN0YW1wIC0gbGFzdDsgLy8gdGltZSBlbGFwc2VkIGluIG1zIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICAgIGxhc3QgPSB0aW1lc3RhbXA7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBhbmQgcmVuZGVyIGdhbWVcclxuICAgICAgICB0aGlzLnVwZGF0ZShkdCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gbmV0d29ya2luZyB1cGRhdGVcclxuICAgICAgICBpZiAodGhpcy5uZXR3b3JrLmhvc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXR3b3JrLmhvc3QudXBkYXRlKGR0KTsgLy8gaWYgaW0gdGhlIGhvc3QgZG8gaG9zdCBzdHVmZlxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV0d29yay5jbGllbnQudXBkYXRlKGR0KTsgLy8gZWxzZSB1cGRhdGUgY2xpZW50IHN0dWZmXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xyXG4gICAgICAgIHZhciBkdHMgPSBkdCAvIDEwMDA7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGZwc1xyXG4gICAgICAgIHRoaXMuZnBzID0gTWF0aC5yb3VuZCgxMDAwIC8gZHQpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5LCBpbmRleCkge1xyXG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKGR0cywgaW5kZXgpOyAvL2RlbHRhdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNhcCBudW1iZXIgb2YgcGFydGljbGVzXHJcbiAgICAgICAgaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA+IHRoaXMubWF4UGFydGljbGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzID0gdGhpcy5wYXJ0aWNsZXMuc2xpY2UodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIC0gdGhpcy5tYXhQYXJ0aWNsZXMsIHRoaXMucGFydGljbGVzLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBhcnRpY2xlc1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKGR0cywgaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGUoKTtcclxuICAgICAgICAvLyBVcGRhdGUgY2FtZXJhXHJcbiAgICAgICAgLy90aGlzLmNhbWVyYS51cGRhdGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXJpbmdcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIGNsZWFyIHNjcmVlblxyXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAvL2JnIGNvbG9yXHJcbiAgICAgICAgdGhpcy5iZ0N0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmJnQ3R4LnJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5iZ0N0eC5maWxsU3R5bGUgPSBcIiM1YjU4NTBcIjtcclxuICAgICAgICB0aGlzLmJnQ3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgLy8gZHJhdyB0ZXN0IGJhY2tncm91bmRcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIC8vIHRoaXMuYmdDdHgucmVjdCgwIC0gdGhpcy5jYW1lcmEueCwgMCAtIHRoaXMuY2FtZXJhLnksIHRoaXMubGV2ZWwud2lkdGgsIHRoaXMubGV2ZWwuaGVpZ2h0KTtcclxuICAgICAgICAvLyB0aGlzLmJnQ3R4LmZpbGxTdHlsZSA9IFwiIzg1ODI3ZFwiO1xyXG4gICAgICAgIC8vIHRoaXMuYmdDdHguZmlsbCgpO1xyXG5cclxuICAgICAgICB0aGlzLmxldmVsLnJlbmRlcih0aGlzLmJnQ3R4KTtcclxuXHJcbiAgICAgICAgLy8gcmVuZGVyIGFsbCBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAgICAgZW50aXR5LnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZW5kZXIgcGFydGljbGVzXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlc1tpXS5yZW5kZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudWkucmVuZGVyVUkoKTtcclxuICAgICAgICB0aGlzLnVpLnJlbmRlckRlYnVnKCk7XHJcbiAgICAgICAgLy8gcmVuZGVyIGZwcyBhbmQgcGluZ1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDQU1FUkE6IFg6XCIgKyB0aGlzLmNhbWVyYS54LCBcIlxcblk6XCIgKyB0aGlzLmNhbWVyYS55KTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucGxheWVyc1t0aGlzLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdKTtcclxuICAgIH07XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLmFkZFBsYXllciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cclxuICAgIC8vIGNoZWNrIGlmIHBsYXllciBhbHJlYWR5IGV4aXN0cy5cclxuICAgIGlmKGRhdGEuaWQgaW4gdGhpcy5wbGF5ZXJzKSByZXR1cm47XHJcblxyXG4gICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIoZGF0YSk7XHJcbiAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3UGxheWVyKTtcclxuICAgIHRoaXMucGxheWVyc1tkYXRhLmlkXSA9IG5ld1BsYXllcjtcclxuXHJcbiAgICB0aGlzLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wbGF5ZXJzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3UGxheWVyO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUucmVtb3ZlUGxheWVyID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coXCJnYW1lIHJlbW92aW5nIHBsYXllclwiLCBkYXRhKTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBwbGF5ZXJzIG9iamVjdFxyXG4gICAgZGVsZXRlIHRoaXMucGxheWVyc1tkYXRhLmlkXTtcclxuXHJcbiAgICAvLyByZW1vdmUgZnJvbSBlbnRpdGl0ZXMgYXJyYXlcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy5lbnRpdGllc1tpXS5pZCA9PT0gZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGhpbSAsIHJlbW92aW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudWkudXBkYXRlQ2xpZW50TGlzdCh0aGlzLnBsYXllcnMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuZ2V0R2FtZVN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC8vIGVudGl0aWVzOiB0aGlzLmVudGl0aWVzLm1hcChmdW5jdGlvbihlbnRpdHkpIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJlbnRpdHk6XCIsIGVudGl0eSk7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShlbnRpdHkpO1xyXG4gICAgICAgIC8vIH0pLFxyXG4gICAgICAgIC8vZW50aXRpZXM6IHRoaXMuZW50aXRpZXMubWFwKGZ1bmN0aW9uKGVudGl0eSkge1xyXG4gICAgICAgIC8vICAgIHJldHVybiBlbnRpdHkuZ2V0RnVsbFN0YXRlKCk7ICAgICAgICB9KSxcclxuICAgICAgICAvL3BsYXllcnM6IE9iamVjdC5rZXlzKHRoaXMucGxheWVycykubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBKU09OLnN0cmluZ2lmeSh3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV0pOyB9KVxyXG4gICAgICAgIHBsYXllcnM6IHRoaXMuZ2V0UGxheWVyc1N0YXRlKClcclxuICAgIH07XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nZXRQbGF5ZXJzU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBsYXllcnMpLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gd2luZG93LmdhbWUucGxheWVyc1trZXldLmdldEZ1bGxTdGF0ZSgpOyB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiZnVuY3Rpb24gS2V5Ym9hcmQocGxheWVyKXtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICAvL3RoaXMubGFzdFN0YXRlID0gXy5jbG9uZShwbGF5ZXIua2V5cyk7XG4gICAgdGhpcy5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgIT09IHRydWUpICBwbGF5ZXIua1VwPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogLy8gU1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gIT09IHRydWUpICBwbGF5ZXIua0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2NTogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua0xlZnQgIT09IHRydWUpICBwbGF5ZXIua0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2ODogLy8gQVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ICE9PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ5OiAvLyAxXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4ID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGxheWVyLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjaGFuZ2VXZWFwb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRXZWFwb25JbmRleDogMCxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1MDogLy8gMlxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuc2VsZWN0ZWRXZWFwb25JbmRleCA9PT0gMSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiY2hhbmdlV2VhcG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkV2VhcG9uSW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODI6IC8vIFJcbiAgICAgICAgICAgICAgICAvLyByZWxvYWQgb25seSBpZiBwbGF5ZXIgaXMgYWxpdmUgYW5kIHdlYXBvbiBtYWdhemluZSBpc250IGZ1bGxcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmFsaXZlICYmIHBsYXllci53ZWFwb25zW3BsYXllci5zZWxlY3RlZFdlYXBvbkluZGV4XS5idWxsZXRzIDwgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdLm1hZ2F6aW5lU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuYWN0aW9ucy5wdXNoKHsgLy8gYWRkIHRvIHRoZSBhY3Rpb25zIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmtleVVwSGFuZGxlciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDg3OiAvLyBXXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5rVXAgPT09IHRydWUpIHBsYXllci5rVXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODM6IC8vIFNcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua0Rvd24gPT09IHRydWUpIHBsYXllci5rRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiAvLyBBXG4gICAgICAgICAgICBpZiAocGxheWVyLmtMZWZ0ID09PSB0cnVlKSAgcGxheWVyLmtMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IC8vIEFcbiAgICAgICAgICAgIGlmIChwbGF5ZXIua1JpZ2h0ID09PSB0cnVlKSAgcGxheWVyLmtSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzLmtleURvd25IYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIix0aGlzLmtleVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwidmFyIGxldmVsMSA9IHJlcXVpcmUoXCIuL2RhdGEvbGV2ZWwxXCIpO1xyXG4vL3ZhciBUaWxlID0gcmVxdWlyZShcIi4vVGlsZVwiKTtcclxuXHJcbmZ1bmN0aW9uIExldmVsKHRpbGVzaGVldCl7XHJcbiAgICB0aGlzLnRpbGVzaGVldCA9IHRpbGVzaGVldDtcclxuICAgIHRoaXMudGlsZVNpemUgPSAzMjtcclxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDE7XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5sZXZlbC50aWxlc1swXS5sZW5ndGggKiB0aGlzLnRpbGVTaXplO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aCAqIHRoaXMudGlsZVNpemU7XHJcbiAgICB0aGlzLmNvbFRpbGVDb3VudCA9IHRoaXMubGV2ZWwudGlsZXNbMF0ubGVuZ3RoO1xyXG4gICAgdGhpcy5yb3dUaWxlQ291bnQgPSB0aGlzLmxldmVsLnRpbGVzLmxlbmd0aDtcclxuICAgIHRoaXMuaW1hZ2VOdW1UaWxlcyA9IDM4NCAvIHRoaXMudGlsZVNpemU7ICAvLyBUaGUgbnVtYmVyIG9mIHRpbGVzIHBlciByb3cgaW4gdGhlIHRpbGVzZXQgaW1hZ2VcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBUaWxlc1xyXG5cclxuXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGN0eCkge1xyXG5cclxuICAgICAgICAvL2RyYXcgYWxsIHRpbGVzXHJcbiAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLnJvd1RpbGVDb3VudDsgcm93ICs9IDEpIHtcclxuICAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbFRpbGVDb3VudDsgY29sICs9IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMubGV2ZWwudGlsZXNbcm93XVtjb2xdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVSb3cgPSAodGlsZSAvIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwOyAvLyBCaXR3aXNlIE9SIG9wZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVDb2wgPSAodGlsZSAlIHRoaXMuaW1hZ2VOdW1UaWxlcykgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy50aWxlc2hlZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgKHRpbGVDb2wgKiB0aGlzLnRpbGVTaXplKSxcclxuICAgICAgICAgICAgICAgICAgICAodGlsZVJvdyAqIHRoaXMudGlsZVNpemUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChjb2wgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS54KSxcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKChyb3cgKiB0aGlzLnRpbGVTaXplKSAtIHdpbmRvdy5nYW1lLmNhbWVyYS55KSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZVNpemUpO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xyXG4iLCJmdW5jdGlvbiBNb3VzZShwbGF5ZXIpe1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuXG4gICAgdGhpcy5jbGljayA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICB0aGlzLnBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgIGFjdGlvbjogXCJzaG9vdFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHg6IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYLFxuICAgICAgICAgICAgICAgIHk6IHdpbmRvdy5nYW1lLmNhbWVyYS55ICsgZS5vZmZzZXRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmFjdGlvbnMucHVzaChhY3Rpb24pOyAvLyB0ZWxsIHRoZSBob3N0IG9mIHRoZSBhY3Rpb25cbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1vdXNlWCA9IHdpbmRvdy5nYW1lLmNhbWVyYS54ICsgZS5vZmZzZXRYO1xuICAgICAgICB0aGlzLnBsYXllci5tb3VzZVkgPSB3aW5kb3cuZ2FtZS5jYW1lcmEueSArIGUub2Zmc2V0WTtcbiAgICB9O1xuXG4gICAgdGhpcy5tb3VzZWRvd24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ICE9PSB0cnVlKSAgcGxheWVyLm1vdXNlTGVmdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm1vdXNldXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHN3aXRjaChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSAwOiAvLyBsZWZ0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubW91c2VMZWZ0ID09PSB0cnVlKSBwbGF5ZXIubW91c2VMZWZ0ICA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmdhbWUuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICAvL3dpbmRvdy5nYW1lLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsImZ1bmN0aW9uIENvbnRyb2xzKCkge1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZCBleHRlbmRzIFBhcnRpY2xlIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgICAgICB2YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIHZhciByID0gMTUwIC0gcm5kO1xyXG4gICAgICAgIHZhciBnID0gNTAgLSBybmQ7XHJcbiAgICAgICAgdmFyIGIgPSA1MCAtIHJuZDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwicmdiKFwiICsgciArIFwiLFwiICsgZyArIFwiLFwiICsgYiArIFwiKVwiO1xyXG4gICAgICAgIGRhdGEubGlmZVRpbWUgPSAwLjM7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMztcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA0MDtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbkJsb29kLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuXHJcbiAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmxpZmVUaW1lciA+IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9vZDtcclxuIiwidmFyIFBhcnRpY2xlID0gcmVxdWlyZShcIi4vUGFydGljbGVcIik7XHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCbG9vZDIgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICAgICAgLy92YXIgcm5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xyXG4gICAgICAgIC8vIHZhciByID0gMTUwO1xyXG4gICAgICAgIC8vIHZhciBnID0gNTA7XHJcbiAgICAgICAgLy8gdmFyIGIgPSA1MDtcclxuXHJcbiAgICAgICAgZGF0YS5jb2xvciA9IFwiIzgwMjkyOVwiO1xyXG4gICAgICAgIC8vZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAzO1xyXG5cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDgwO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVEaXN0YW5jZSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgKyAxKTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5CbG9vZDIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJsb29kMjtcclxuIiwiLy92YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIEJsb29kID0gcmVxdWlyZShcIi4vQmxvb2RcIik7XHJcbnZhciBCbG9vZDIgPSByZXF1aXJlKFwiLi9CbG9vZDJcIik7XHJcbnZhciBSaWNvY2hldCA9IHJlcXVpcmUoXCIuL1JpY29jaGV0XCIpO1xyXG5cclxuZnVuY3Rpb24gRW1pdHRlcihkYXRhKSB7XHJcbiAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICB0aGlzLnkgPSBkYXRhLnk7XHJcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGU7XHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xyXG4gICAgdGhpcy5lbWl0U3BlZWQgPSBkYXRhLmVtaXRTcGVlZDsgLy8gc1xyXG4gICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgdGhpcy5lbWl0Q291bnQgPSBkYXRhLmVtaXRDb3VudDtcclxuICAgIHRoaXMubGlmZVRpbWUgPSBkYXRhLmxpZmVUaW1lO1xyXG4gICAgdGhpcy5saWZlVGltZXIgPSAwO1xyXG4gICAgdGhpcy5lbWl0KCk7XHJcbn1cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICB5OiB0aGlzLnksXHJcbiAgICAgICAgZW1pdHRlcjogdGhpc1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodGhpcy50eXBlID09PSBcIkJsb29kXCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCbG9vZChkYXRhKSk7XHJcbiAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IFwiQmxvb2QyXCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBCbG9vZDIoZGF0YSkpO1xyXG4gICAgZWxzZSBpZiAodGhpcy50eXBlID09PSBcIlJpY29jaGV0XCIpIHdpbmRvdy5nYW1lLnBhcnRpY2xlcy5wdXNoKG5ldyBSaWNvY2hldChkYXRhKSk7XHJcbn07XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuICAgIC8vIC8vIHVwZGF0ZSBhbGwgcGFydGljbGVzXHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAvLyAgICAgdGhpcy5wYXJ0aWNsZXNbaV0udXBkYXRlKGR0KTtcclxuICAgIC8vIH1cclxuXHJcblxyXG4gICAgLy8gU0VUIEVNSVRURVIgLSB0aGlzIGlzIGFuIGVtaXR0ZXIgdGhhdCBzaG91bGQgZW1pdCBhIHNldCBudW1iZXIgb2YgcGFydGljbGVzXHJcbiAgICBpZiAodGhpcy5lbWl0Q291bnQpIHtcclxuICAgICAgICBpZiAodGhpcy5lbWl0U3BlZWQpIHsgLy8gRW1pdCBhdCBhIGludGVydmFsXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdFRpbWVyICs9IGR0O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbWl0VGltZXIgPiB0aGlzLmVtaXRTcGVlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXRUaW1lciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5lbWl0Q291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbWl0Q291bnQgPCAxKXtcclxuICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZXN0cm95XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIEVtaXQgYWxsIGF0IG9uY2VcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7aSA8IHRoaXMuZW1pdENvdW50OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUSU1FRCBFTUlUVEVSXHJcbiAgICAvLyB1cGRhdGUgZW1pdHRlciBsaWZldGltZSAoaWYgaXQgaGFzIGEgbGlmZXRpbWUpIHJlbW92ZSBlbWl0dGVyIGlmIGl0cyB0aW1lIGhhcyBydW4gb3V0IGFuZCBpdCBoYXMgbm8gcmVtYWluaW5nIHBhcnRpY2xlc1xyXG4gICAgaWYgKHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICB0aGlzLmxpZmVUaW1lciArPSBkdDtcclxuICAgICAgICBpZiAodGhpcy5saWZlVGltZXIgPiB0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDT05USU5VT1VTIEVNSVRURVJcclxuICAgIC8vIGVtaXQgbmV3IHBhcnRpY2xlcyBmb3JldmVyXHJcbiAgICB0aGlzLmVtaXRUaW1lciArPSBkdDtcclxuICAgIGlmICh0aGlzLmVtaXRUaW1lciA+IHRoaXMuZW1pdFNwZWVkKSB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCk7XHJcbiAgICAgICAgdGhpcy5lbWl0VGltZXIgPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gLy8gcmVuZGVyIGFsbCBwYXJ0aWNsZXNcclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIC8vICAgICB0aGlzLnBhcnRpY2xlc1tpXS5yZW5kZXIoKTtcclxuICAgIC8vIH1cclxufTtcclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcclxuIiwiLy92YXIgRW50aXR5ID0gcmVxdWlyZShcIi4uLy4vRW50aXR5XCIpO1xyXG5cclxuY2xhc3MgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuY3R4O1xyXG4gICAgICAgIHRoaXMuY29sb3IgPSBkYXRhLmNvbG9yO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcclxuICAgICAgICB0aGlzLnggPSBkYXRhLng7XHJcbiAgICAgICAgdGhpcy55ID0gZGF0YS55O1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWUgPSBkYXRhLmxpZmVUaW1lO1xyXG4gICAgICAgIHRoaXMubGlmZVRpbWVyID0gMDtcclxuICAgICAgICB0aGlzLmVtaXR0ZXIgPSBkYXRhLmVtaXR0ZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFBhcnRpY2xlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuLy8gICAgIHRoaXMubGlmZVRpbWVyICs9IGR0O1xyXG4vLyAgICAgaWYgKHRoaXMubGlmZVRpbWVyID4gdGhpcy5saWZlVGltZSkge1xyXG4vLyAgICAgICAgIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbi8vICAgICB9XHJcbi8vIH07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuICAgIC8vdGhpcy5jdHgucm90YXRlKHRoaXMuZGlyZWN0aW9uKTsgLy8gcm90YXRlXHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoLSh0aGlzLnNpemUgLyAyKSwgLSh0aGlzLnNpemUgLyAyKSwgdGhpcy5zaXplLCB0aGlzLnNpemUpO1xyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpOyAvLyByZXN0b3JlIG9yaWdpbmFsIHN0YXRlcyAobm8gcm90YXRpb24gZXRjKVxyXG59O1xyXG5cclxuUGFydGljbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgd2luZG93LmdhbWUucGFydGljbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5QYXJ0aWNsZS5wcm90b3R5cGUuZ2V0RnVsbFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge307XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlO1xyXG4iLCJ2YXIgUGFydGljbGUgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZVwiKTtcclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcclxuXHJcbmNsYXNzIFJpY29jaGV0IGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG5cclxuICAgICAgICBkYXRhLmNvbG9yID0gXCIjNGQ0ZDRkXCI7XHJcbiAgICAgICAgZGF0YS5zaXplID0gMTtcclxuXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gaGVscGVycy50b1JhZGlhbnMoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSArIDEpO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSA4MDtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZU1vdmVkID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuUmljb2NoZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0LCBpbmRleCkge1xyXG5cclxuICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPCB0aGlzLm1vdmVEaXN0YW5jZSkge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLnggPSB0aGlzLnggKyBNYXRoLmNvcyh0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKyBNYXRoLnNpbih0aGlzLmRpcmVjdGlvbikgKiBkaXN0YW5jZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlTW92ZWQgKz0gZGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlTW92ZWQgPj0gdGhpcy5tb3ZlRGlzdGFuY2UpIHRoaXMuY3R4ID0gd2luZG93LmdhbWUuYmdDdHg7IC8vIG1vdmUgdG8gYmFja2dyb3VuZCBjdHhcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBCbG9vZFNwbGFzaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbi8vICAgICB0aGlzLmN0eC5zYXZlKCk7IC8vIHNhdmUgY3VycmVudCBzdGF0ZVxyXG4vLyAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cclxuLy8gICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4vLyAgICAgdGhpcy5jdHguYXJjKDAgLSB0aGlzLnNpemUgLyAyLCAwIC0gdGhpcy5zaXplIC8gMiwgdGhpcy5zaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4vLyAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuLy8gICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcclxuLy8gfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJpY29jaGV0O1xyXG4iLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG52YXIgTW91c2UgPSByZXF1aXJlKFwiLi9Nb3VzZVwiKTtcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoXCIuL0tleWJvYXJkXCIpO1xudmFyIE5ldHdvcmtDb250cm9scyA9IHJlcXVpcmUoXCIuL05ldHdvcmtDb250cm9sc1wiKTtcbi8vdmFyIEJ1bGxldCA9IHJlcXVpcmUoXCIuL0J1bGxldFwiKTtcbi8vdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vL3ZhciBXZWFwb24gPSByZXF1aXJlKFwiLi93ZWFwb25zL1dlYXBvblwiKTtcbnZhciBTaG90Z3VuID0gcmVxdWlyZShcIi4vd2VhcG9ucy9TaG90Z3VuXCIpO1xudmFyIEFrNDcgPSByZXF1aXJlKFwiLi93ZWFwb25zL0FrNDdcIik7XG4vL3ZhciBBbmltYXRpb24gPSByZXF1aXJlKFwiLi9BbmltYXRpb25cIik7XG52YXIgRW50aXR5ID0gcmVxdWlyZShcIi4vRW50aXR5XCIpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKFwiLi9wYXJ0aWNsZS9FbWl0dGVyXCIpO1xudmFyIHdlYXBvbkNyZWF0b3IgPSByZXF1aXJlKFwiLi93ZWFwb25zL3dlYXBvbkNyZWF0b3JcIik7XG5cbmZ1bmN0aW9uIFBsYXllcihwbGF5ZXJEYXRhKSB7XG4gICAgdGhpcy5pZCA9IHBsYXllckRhdGEuaWQ7XG4gICAgdGhpcy5yYWRpdXMgPSBwbGF5ZXJEYXRhLnJhZGl1cyB8fCAyMDsgLy8gY2lyY2xlIHJhZGl1c1xuXG4gICAgaWYgKCFwbGF5ZXJEYXRhLnggfHwgIXBsYXllckRhdGEueSkge1xuICAgICAgICB2YXIgc3Bhd25Mb2NhdGlvbiA9IGhlbHBlcnMuZmluZFNwYXduTG9jYXRpb24oKTtcbiAgICAgICAgdGhpcy54ID0gc3Bhd25Mb2NhdGlvbi54O1xuICAgICAgICB0aGlzLnkgPSBzcGF3bkxvY2F0aW9uLnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy54ID0gcGxheWVyRGF0YS54O1xuICAgICAgICB0aGlzLnkgPSBwbGF5ZXJEYXRhLnk7XG4gICAgfVxuICAgIC8vIHRoaXMueCA9IHBsYXllckRhdGEueCB8fCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XG4gICAgLy8gdGhpcy55ID0gcGxheWVyRGF0YS55IHx8IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gdGhpcy5yYWRpdXMpKSArIHRoaXMucmFkaXVzIC8gMik7XG5cbiAgICB0aGlzLmRpcmVjdGlvbiA9IHBsYXllckRhdGEuZGlyZWN0aW9uIHx8IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCkgKyAxO1xuICAgIHRoaXMudmlld2luZ0FuZ2xlID0gcGxheWVyRGF0YS52aWV3aW5nQW5nbGUgfHwgNDU7XG4gICAgdGhpcy5zcGVlZCA9IHBsYXllckRhdGEuc3BlZWQgfHwgMTAwOyAvL3BpeGVscyBwZXIgc2Vjb25kXG4gICAgdGhpcy5ocCA9IHBsYXllckRhdGEuaHAgfHwgMTAwO1xuICAgIHRoaXMuYWxpdmUgPSBwbGF5ZXJEYXRhLmFsaXZlIHx8IHRydWU7XG5cbiAgICB0aGlzLnN4ID0gMDtcbiAgICB0aGlzLnN5ID0gMDtcbiAgICB0aGlzLnN3ID0gNjA7XG4gICAgdGhpcy5zaCA9IDYwO1xuICAgIHRoaXMuZHcgPSA2MDtcbiAgICB0aGlzLmRoID0gNjA7XG5cbiAgICB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmN0eDtcblxuICAgIC8vIGtleXNcbiAgICB0aGlzLmtVcCA9IGZhbHNlO1xuICAgIHRoaXMua0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLmtMZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5rUmlnaHQgPSBmYWxzZTtcblxuICAgIC8vIG1vdXNlXG4gICAgdGhpcy5tb3VzZVggPSB0aGlzLng7XG4gICAgdGhpcy5tb3VzZVkgPSB0aGlzLnk7XG4gICAgdGhpcy5tb3VzZUxlZnQgPSBmYWxzZTtcblxuICAgIC8vIHBvc2l0aW9uIG9uIGxldmVsXG4gICAgdGhpcy50aWxlUm93ID0gMDtcbiAgICB0aGlzLnRpbGVDb2wgPSAwO1xuXG4gICAgdGhpcy53ZWFwb25zID0gW107XG4gICAgLy8gcmVjcmVhdGUgd2VhcG9ucyBpZiB0aGUgcGxheWVyIGhhcyBhbnkgZWxzZSBjcmVhdGUgbmV3IHdlYXBvbnNcbiAgICBpZiAocGxheWVyRGF0YS53ZWFwb25TdGF0ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllckRhdGEud2VhcG9uU3RhdGUubGVuZ3RoOyBpKz0gMSkge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zLnB1c2god2VhcG9uQ3JlYXRvcih0aGlzLCBwbGF5ZXJEYXRhLndlYXBvblN0YXRlW2ldKSk7XG4gICAgICAgIH1cbiAgICB9ZWxzZSB7XG4gICAgICAgIHRoaXMud2VhcG9ucyA9IFtuZXcgQWs0Nyh0aGlzKSwgbmV3IFNob3RndW4odGhpcyldO1xuICAgIH1cblxuICAgIC8vdGhpcy53ZWFwb25zID0gW25ldyBBazQ3KHRoaXMpLCBuZXcgU2hvdGd1bih0aGlzKV07XG5cbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBwbGF5ZXJEYXRhLnNlbGVjdGVkV2VhcG9uSW5kZXggfHwgMDtcblxuICAgIHRoaXMubGFzdENsaWVudFN0YXRlID0gdGhpcy5nZXRDbGllbnRTdGF0ZSgpO1xuICAgIHRoaXMubGFzdEZ1bGxTdGF0ZSA9IHRoaXMuZ2V0RnVsbFN0YXRlKCk7XG5cbiAgICB0aGlzLnBpbmcgPSBcIi1cIjtcbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsgLy8gYWN0aW9ucyB0byBiZSBwZXJmb3JtZWRcbiAgICB0aGlzLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTsgLy8gc3VjY2VzZnVsbHkgcGVyZm9ybWVkIGFjdGlvbnNcblxuICAgIC8vIHRoaXMuYW5pbWF0aW9ucyA9IHtcbiAgICAvLyAgICAgXCJpZGxlXCI6IG5ldyBBbmltYXRpb24oe25hbWU6IFwiaWRsZVwiLCBzeDogMCwgc3k6IDAsIHc6IDYwLCBoOiA2MCwgZnJhbWVzOiAxLCBwbGF5T25jZTogZmFsc2V9KSxcbiAgICAvLyAgICAgXCJmaXJlXCI6IG5ldyBBbmltYXRpb24oe25hbWU6IFwiZmlyZVwiLCBzeDogMCwgc3k6IDYwLCB3OiA2MCwgaDogNjAsIGZyYW1lczogMSwgcGxheU9uY2U6IHRydWV9KVxuICAgIC8vIH07XG4gICAgLy9cbiAgICAvLyB0aGlzLmN1cnJlbnRBbmltYXRpb24gPSB0aGlzLmFuaW1hdGlvbnMuaWRsZTtcblxuICAgIC8vaXMgdGhpcyBtZSBvciBhbm90aGVyIHBsYXllclxuICAgIGlmIChwbGF5ZXJEYXRhLmlkID09PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSB7XG4gICAgICAgIHRoaXMuY29udHJvbHMgPSB7bW91c2U6IG5ldyBNb3VzZSh0aGlzKSwga2V5Ym9hcmQ6IG5ldyBLZXlib2FyZCh0aGlzKX07XG4gICAgICAgIHdpbmRvdy5nYW1lLmNhbWVyYS5mb2xsb3codGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBOZXR3b3JrQ29udHJvbHMoKTtcbiAgICB9XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpe1xuXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIHF1ZXVlZCB1cCBhY3Rpb25zIGFuZCBwZXJmb3JtIHRoZW1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aW9ucy5sZW5ndGg7IGkgKz0gMSl7XG5cbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnBlcmZvcm1BY3Rpb24odGhpcy5hY3Rpb25zW2ldKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWVkQWN0aW9ucy5wdXNoKHRoaXMuYWN0aW9uc1tpXSk7XG4gICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTtcblxuICAgIGlmICghdGhpcy5hbGl2ZSkgcmV0dXJuO1xuXG5cbiAgICB0aGlzLm1vdmUoZHQpO1xuICAgIC8vY2hlY2sgaWYgb2ZmIHNjcmVlblxuICAgIC8vIGlmICh0aGlzLnggPiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCkgdGhpcy54ID0gd2luZG93LmdhbWUubGV2ZWwud2lkdGg7XG4gICAgLy8gaWYgKHRoaXMueCA8IDApIHRoaXMueCA9IDA7XG4gICAgLy8gaWYgKHRoaXMueSA+IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkgdGhpcy55ID0gd2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0O1xuICAgIC8vIGlmICh0aGlzLnkgPCAwKSB0aGlzLnkgPSAwO1xuXG4gICAgLy8gdXBkYXRlIGN1cnJlbnQgd2VhcG9uO1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnVwZGF0ZShkdCk7XG5cbiAgICAvL3RoaXMuY3VycmVudEFuaW1hdGlvbi51cGRhdGUoZHQpO1xuXG4gICAgaWYgKHRoaXMubW91c2VMZWZ0KSB7IC8vIGlmIGZpcmluZ1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7IC8vIGFkZCB0byB0aGUgYWN0aW9ucyBxdWV1ZVxuICAgICAgICAgICAgYWN0aW9uOiBcImZpcmVcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLm1vdXNlWCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLm1vdXNlWVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnR1cm5Ub3dhcmRzKHRoaXMubW91c2VYLCB0aGlzLm1vdXNlWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkdCkge1xuXG4gICAgLy8gVXBkYXRlIG1vdmVtZW50XG4gICAgdmFyIGRpc3RhbmNlID0gdGhpcy5zcGVlZCAqIGR0O1xuICAgIHZhciBtb3ZlWDtcbiAgICB2YXIgbW92ZVk7XG5cbiAgICBpZiAodGhpcy5rVXAgJiYgdGhpcy5rTGVmdCkge1xuICAgICAgICBkaXN0YW5jZSA9IGRpc3RhbmNlICogMC43MTtcbiAgICAgICAgbW92ZVggPSAtZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rVXAgJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gLWRpc3RhbmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5rRG93biAmJiB0aGlzLmtMZWZ0KSB7XG4gICAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKiAwLjcxO1xuICAgICAgICBtb3ZlWCA9IC1kaXN0YW5jZTtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24gJiYgdGhpcy5rUmlnaHQpIHtcbiAgICAgICAgZGlzdGFuY2UgPSBkaXN0YW5jZSAqIDAuNzE7XG4gICAgICAgIG1vdmVYID0gZGlzdGFuY2U7XG4gICAgICAgIG1vdmVZID0gZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtVcCkge1xuICAgICAgICBtb3ZlWSA9IC1kaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0Rvd24pIHtcbiAgICAgICAgbW92ZVkgPSBkaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua0xlZnQpIHtcbiAgICAgICAgbW92ZVggPSAtZGlzdGFuY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmtSaWdodCkge1xuICAgICAgICBtb3ZlWCA9IGRpc3RhbmNlO1xuICAgIH1cblxuICAgIHZhciBjb2xsaXNpb247XG4gICAgaWYgKG1vdmVYKSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IGhlbHBlcnMuY29sbGlzaW9uQ2hlY2soe3g6IHRoaXMueCArIG1vdmVYLCB5OiB0aGlzLnl9KTtcbiAgICAgICAgaWYgKCFjb2xsaXNpb24pIHtcbiAgICAgICAgICAgIHRoaXMueCArPSBtb3ZlWDtcbiAgICAgICAgICAgIHRoaXMubW91c2VYICs9IG1vdmVYO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtb3ZlWSkge1xuICAgICAgICBjb2xsaXNpb24gPSBoZWxwZXJzLmNvbGxpc2lvbkNoZWNrKHt4OiB0aGlzLngsIHk6IHRoaXMueSArIG1vdmVZfSk7XG4gICAgICAgIGlmICghY29sbGlzaW9uKSB7XG4gICAgICAgICAgICB0aGlzLnkgKz0gbW92ZVk7XG4gICAgICAgICAgICB0aGlzLm1vdXNlWSArPSBtb3ZlWTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIC8vIENvbGxpc2lvbiBjaGVjayBhZ2FpbnN0IHN1cnJvdW5kaW5nIHRpbGVzXG4vLyBQbGF5ZXIucHJvdG90eXBlLmNvbGxpc2lvbkNoZWNrID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgdmFyIHN0YXJ0aW5nUm93ID0gdGhpcy50aWxlUm93IC0gMTtcbi8vICAgICBpZiAoc3RhcnRpbmdSb3cgPCAwKSBzdGFydGluZ1JvdyAgPSAwO1xuLy8gICAgIHZhciBlbmRSb3cgPSB0aGlzLnRpbGVSb3cgKzE7XG4vLyAgICAgaWYgKGVuZFJvdyA+IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudCkgZW5kUm93ID0gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50O1xuLy8gICAgIHZhciBzdGFydGluZ0NvbCA9IHRoaXMudGlsZUNvbCAtMTtcbi8vICAgICBpZiAoc3RhcnRpbmdDb2wgPCAwKSBzdGFydGluZ0NvbCA9IDA7XG4vLyAgICAgdmFyIGVuZENvbCA9IHRoaXMudGlsZUNvbCArMTtcbi8vICAgICBpZiAoZW5kQ29sID4gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50KSBlbmRDb2wgPSB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQ7XG4vL1xuLy8gICAgIGZvciAodmFyIHJvdyA9IHN0YXJ0aW5nUm93OyByb3cgPCBlbmRSb3c7IHJvdyArPSAxKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGNvbCA9IHN0YXJ0aW5nQ29sOyBjb2wgPCBlbmRDb2w7IGNvbCArPSAxKSB7XG4vLyAgICAgICAgICAgICBpZiAod2luZG93LmdhbWUubGV2ZWwubGV2ZWwudGlsZXNbcm93XVtjb2xdID09PSAwKSBjb250aW51ZTsgLy8gZXZlcnkgdGlsZSBvdGhlciB0aGFuIDAgYXJlIG5vbiB3YWxrYWJsZVxuLy8gICAgICAgICAgICAgLy8gY29sbGlzaW9uXG4vLyAgICAgICAgICAgICBpZiAodGhpcy50aWxlUm93ID09PSByb3cgJiYgdGhpcy50aWxlQ29sID09PSBjb2wpIHtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHRydWU7XG4vLyB9O1xuXG5QbGF5ZXIucHJvdG90eXBlLm5ldHdvcmtVcGRhdGUgPSBmdW5jdGlvbih1cGRhdGUpe1xuICAgIGRlbGV0ZSB1cGRhdGUuaWQ7XG4gICAgLy8gbmV0d29ya1VwZGF0ZVxuICAgIGZvciAodmFyIGtleSBpbiB1cGRhdGUpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJhY3Rpb25zXCIpIHRoaXNba2V5XSA9IHRoaXNba2V5XS5jb25jYXQodXBkYXRlW2tleV0pO1xuICAgICAgICBlbHNlIHRoaXNba2V5XSA9IHVwZGF0ZVtrZXldO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGVyZm9ybUFjdGlvbiA9IGZ1bmN0aW9uKGFjdGlvbil7XG4gICAgc3dpdGNoKGFjdGlvbi5hY3Rpb24pe1xuICAgICAgICBjYXNlIFwidHVyblRvd2FyZHNcIjpcbiAgICAgICAgICAgIHRoaXMudHVyblRvd2FyZHMoYWN0aW9uLmRhdGEueCwgYWN0aW9uLmRhdGEueSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImZpcmVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5maXJlKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJkaWVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpZShhY3Rpb24pO1xuICAgICAgICAgICAgLy9icmVhaztcbiAgICAgICAgY2FzZSBcInJlc3Bhd25cIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc3Bhd24oYWN0aW9uKTtcbiAgICAgICAgY2FzZSBcImNoYW5nZVdlYXBvblwiOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlV2VhcG9uKGFjdGlvbik7XG4gICAgICAgIGNhc2UgXCJyZWxvYWRcIjpcbiAgICB9ICAgICAgIHJldHVybiB0aGlzLndlYXBvbnNbdGhpcy5zZWxlY3RlZFdlYXBvbkluZGV4XS5yZWxvYWQoYWN0aW9uKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICBpZighdGhpcy5hbGl2ZSkgcmV0dXJuO1xuICAgIHRoaXMuY3R4LnNhdmUoKTsgLy8gc2F2ZSBjdXJyZW50IHN0YXRlXG4gICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMueCAtIHdpbmRvdy5nYW1lLmNhbWVyYS54LCB0aGlzLnkgLSB3aW5kb3cuZ2FtZS5jYW1lcmEueSk7IC8vIGNoYW5nZSBvcmlnaW5cbiAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5kaXJlY3Rpb24pOyAvLyByb3RhdGVcblxuICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh3aW5kb3cuZ2FtZS5zcHJpdGVzaGVldCwgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3gsIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN5LCB0aGlzLnN3LCB0aGlzLnNoLCAtKHRoaXMuc3cgLyAyKSwgLSh0aGlzLnNoIC8gMiksIHRoaXMuZHcsIHRoaXMuZGgpO1xuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTsgLy8gcmVzdG9yZSBvcmlnaW5hbCBzdGF0ZXMgKG5vIHJvdGF0aW9uIGV0YylcblxufTtcblxuUGxheWVyLnByb3RvdHlwZS50dXJuVG93YXJkcyA9IGZ1bmN0aW9uKHgseSkge1xuICAgIHZhciB4RGlmZiA9IHggLSB0aGlzLng7XG4gICAgdmFyIHlEaWZmID0geSAtIHRoaXMueTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IE1hdGguYXRhbjIoeURpZmYsIHhEaWZmKTsvLyAqICgxODAgLyBNYXRoLlBJKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudGFrZURhbWFnZSA9IGZ1bmN0aW9uKGRhbWFnZSwgZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5ocCAtPSBkYW1hZ2U7XG4gICAgaWYgKHRoaXMuaHAgPD0gMCkge1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwiZGllXCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gYWRkIGJsb29kIHNwbGFzaCBlbWl0dGVyXG4gICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgRW1pdHRlcih7XG4gICAgICAgIHR5cGU6IFwiQmxvb2QyXCIsXG4gICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgIGVtaXRTcGVlZDogbnVsbCwgLy8gbnVsbCBtZWFucyBpbnN0YW50XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgfSkpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgdGhpcy53ZWFwb25zW3RoaXMuc2VsZWN0ZWRXZWFwb25JbmRleF0uc3RvcFJlbG9hZCgpO1xuXG5cbiAgICAvLyAvLyBjcmVhdGUgYSBjb3Jwc2VcbiAgICAvLyB2YXIgY29ycHNlID0gbmV3IEVudGl0eSh7XG4gICAgLy8gICAgIHg6IHRoaXMueCArIE1hdGguY29zKGFjdGlvbi5kYXRhLmRpcmVjdGlvbikgKiAxMCxcbiAgICAvLyAgICAgeTogdGhpcy55ICsgTWF0aC5zaW4oYWN0aW9uLmRhdGEuZGlyZWN0aW9uKSAqIDEwLFxuICAgIC8vICAgICBzeDogNjAgKyggTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKiA2MCksXG4gICAgLy8gICAgIHN5OiAxMjAsXG4gICAgLy8gICAgIHN3OiA2MCxcbiAgICAvLyAgICAgc2g6IDYwLFxuICAgIC8vICAgICBkdzogNjAsXG4gICAgLy8gICAgIGRoOiA2MCxcbiAgICAvLyAgICAgZGlyZWN0aW9uOiBhY3Rpb24uZGF0YS5kaXJlY3Rpb24sXG4gICAgLy8gICAgIGN0eDogd2luZG93LmdhbWUuYmdDdHhcbiAgICAvLyB9KTtcbiAgICAvL3dpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2goY29ycHNlKTtcblxuICAgIHdpbmRvdy5nYW1lLmVudGl0aWVzLnB1c2gobmV3IEVtaXR0ZXIoe1xuICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICBlbWl0Q291bnQ6IDMwLFxuICAgICAgICBlbWl0U3BlZWQ6IG51bGwsIC8vIG51bGwgbWVhbnMgaW5zdGFudFxuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgIH0pKTtcblxuXG5cbn07XG5cblBsYXllci5wcm90b3R5cGUucmVzcGF3biA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMueCA9IGFjdGlvbi5kYXRhLng7XG4gICAgdGhpcy55ID0gYWN0aW9uLmRhdGEueTtcbiAgICB0aGlzLmhwID0gMTAwO1xuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuXG4gICAgLy8gcmVmaWxsIGFsbCB3ZWFwb25zXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlYXBvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW2ldLmZpbGxNYWdhemluZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoYW5nZVdlYXBvbiA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMud2VhcG9uc1t0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXhdLnN0b3BSZWxvYWQoKTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBhY3Rpb24uZGF0YS5zZWxlY3RlZFdlYXBvbkluZGV4O1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmdldEZ1bGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55LFxuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgaHA6IHRoaXMuaHAsXG4gICAgICAgIGFsaXZlOiB0aGlzLmFsaXZlLFxuICAgICAgICByYWRpdXM6IHRoaXMucmFkaXVzLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICB2aWV3aW5nQW5nbGU6IHRoaXMudmlld2luZ0FuZ2xlLFxuICAgICAgICBzcGVlZDogdGhpcy5zcGVlZCxcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZLFxuICAgICAgICBzZWxlY3RlZFdlYXBvbkluZGV4OiB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXgsXG4gICAgICAgIHdlYXBvblN0YXRlOiB0aGlzLmdldFdlYXBvblN0YXRlKClcbiAgICB9O1xufTtcblxuLy8gVGhlIHN0YXRlIHRoZSBjbGllbnQgc2VuZHMgdG8gdGhlIGhvc3RcblBsYXllci5wcm90b3R5cGUuZ2V0Q2xpZW50U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcbiAgICAgICAga1VwOiB0aGlzLmtVcCxcbiAgICAgICAga0Rvd246IHRoaXMua0Rvd24sXG4gICAgICAgIGtMZWZ0OiB0aGlzLmtMZWZ0LFxuICAgICAgICBrUmlnaHQ6IHRoaXMua1JpZ2h0LFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZXG4gICAgfTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlU3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgIHRoaXMueCA9IG5ld1N0YXRlLng7XG4gICAgdGhpcy55ID0gbmV3U3RhdGUueTtcbiAgICAvL2lkOiB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5ocCA9IG5ld1N0YXRlLmhwO1xuICAgIHRoaXMuYWxpdmUgPSBuZXdTdGF0ZS5hbGl2ZTtcbiAgICB0aGlzLnJhZGl1cyA9IG5ld1N0YXRlLnJhZGl1cztcbiAgICB0aGlzLmRpcmVjdGlvbiA9IG5ld1N0YXRlLmRpcmVjdGlvbjtcbiAgICB0aGlzLnZpZXdpbmdBbmdsZSA9IG5ld1N0YXRlLnZpZXdpbmdBbmdsZTtcbiAgICB0aGlzLnNwZWVkID0gbmV3U3RhdGUuc3BlZWQ7XG4gICAgdGhpcy5rVXAgPSBuZXdTdGF0ZS5rVXA7XG4gICAgdGhpcy5rRG93biA9IG5ld1N0YXRlLmtEb3duO1xuICAgIHRoaXMua0xlZnQgPSBuZXdTdGF0ZS5rTGVmdDtcbiAgICB0aGlzLmtSaWdodCA9IG5ld1N0YXRlLmtSaWdodDtcbiAgICB0aGlzLm1vdXNlWCA9IG5ld1N0YXRlLm1vdXNlWDtcbiAgICB0aGlzLm1vdXNlWSA9IG5ld1N0YXRlLm1vdXNlWTtcbiAgICB0aGlzLnNlbGVjdGVkV2VhcG9uSW5kZXggPSBuZXdTdGF0ZS5zZWxlY3RlZFdlYXBvbkluZGV4O1xuICAgIC8vd2VhcG9uU3RhdGU6IHRoaXMuZ2V0V2VhcG9uU3RhdGUoKVxufTtcblxuLy8gZ2V0IHRoZSBzdGF0ZSBvZiBlYWNoIHdlYXBvblxuUGxheWVyLnByb3RvdHlwZS5nZXRXZWFwb25TdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZWFwb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHN0YXRlLnB1c2godGhpcy53ZWFwb25zW2ldLmdldFN0YXRlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGU7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xuIiwiLy8gdmFyIHdlYXBvbnMgPSByZXF1aXJlKFwiLi9kYXRhL3dlYXBvbnNcIik7XG4vLyB2YXIgV2VhcG9uID0gcmVxdWlyZShcIi4vd2VhcG9ucy9XZWFwb25cIik7XG4vL1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKFwiLi9QYXJ0aWNsZS9FbWl0dGVyXCIpO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFVpKGdhbWUpe1xuICAgIHRoaXMuY2xpZW50TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyc1wiKTtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuXG4gICAgdGhpcy51cGRhdGVDbGllbnRMaXN0ID0gZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICB2YXIgbXlJRCA9IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQ7XG4gICAgICAgIHRoaXMuY2xpZW50TGlzdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciBpZCBpbiBwbGF5ZXJzKXtcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaWQgKyBcIiBcIiArIHBsYXllcnNbaWRdLnBpbmcpO1xuICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgICAgICAgICB0aGlzLmNsaWVudExpc3QuYXBwZW5kQ2hpbGQobGkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyRGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZvbnQgPSBcIjEycHggT3BlbiBTYW5zXCI7XG4gICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3dpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWRdO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCIjZDdkN2Q3XCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkZQUzogIFwiICsgd2luZG93LmdhbWUuZnBzLCA1LCAyMCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBJTkc6IFwiICsgd2luZG93LmdhbWUubmV0d29yay5waW5nLCA1LCAzNCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIkNBTUVSQTogXCIgKyBNYXRoLmZsb29yKHdpbmRvdy5nYW1lLmNhbWVyYS54KSArIFwiLCBcIiArIE1hdGguZmxvb3Iod2luZG93LmdhbWUuY2FtZXJhLnkpLCA1LCA0OCk7XG4gICAgICAgIGlmIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBMQVlFUjogIFwiICsgTWF0aC5mbG9vcihwbGF5ZXIueCkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKHBsYXllci55KSwgNSwgNjIpO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiTU9VU0U6IFwiICsgTWF0aC5mbG9vcihwbGF5ZXIubW91c2VYKSArIFwiLCBcIiArIE1hdGguZmxvb3IocGxheWVyLm1vdXNlWSksIDUsIDc2KTtcbiAgICAgICAgICAgIGlmKHBsYXllcikgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KFwiRElSOiBcIiArIHBsYXllci5kaXJlY3Rpb24udG9GaXhlZCgyKSwgNSwgOTApO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChcIlBBUlRJQ0xFUzogXCIgKyB3aW5kb3cuZ2FtZS5wYXJ0aWNsZXMubGVuZ3RoLCA1LCAxMDQpO1xuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZm9udCA9IFwiMjRweCBPcGVuIFNhbnNcIjtcbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJVSSAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgIGlmICghcGxheWVyKSByZXR1cm47XG5cblxuICAgICAgICAvL2d1aSBiZyBjb2xvclxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5yZWN0KDAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzNSwgMTQwLCAzNSk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4zNSlcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGwoKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ3JhZGllbnRcbiAgICAgICAgdmFyIGdyZD0gd2luZG93LmdhbWUuY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDE0MCwwLDE5MCwwKTtcbiAgICAgICAgZ3JkLmFkZENvbG9yU3RvcCgwLFwicmdiYSgwLDAsMCwwLjM1KVwiKTtcbiAgICAgICAgZ3JkLmFkZENvbG9yU3RvcCgxLFwicmdiYSgwLDAsMCwwKVwiKTtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZT1ncmQ7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsUmVjdCgxNDAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAzNSw1MCwzNSk7XG5cblxuXG4gICAgICAgIHZhciB3ZWFwb24gPSAgcGxheWVyLndlYXBvbnNbcGxheWVyLnNlbGVjdGVkV2VhcG9uSW5kZXhdO1xuICAgICAgICAvLyBkcmF3IHdlYXBvbiBpY29uXG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5kcmF3SW1hZ2Uod2luZG93LmdhbWUuc3ByaXRlc2hlZXQsIHdlYXBvbi5pY29uU3gsIHdlYXBvbi5pY29uU3ksIHdlYXBvbi5pY29uVywgd2VhcG9uLmljb25ILCA5MCwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDMzLCB3ZWFwb24uaWNvblcsIHdlYXBvbi5pY29uSCk7XG4gICAgICAgIC8vIGRyYXcgbWFnYXppbmUgY291bnQnXG4gICAgICAgIGlmICh3ZWFwb24ucmVsb2FkaW5nKSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCA4NSwgMjE0LCAyMSwgMjIsIDEyNSwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDMwLCAyMSwgMjIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjI1KVwiO1xuICAgICAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHdlYXBvbi5idWxsZXRzLCAxMjIsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSA5KTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNlN2QyOWVcIjtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dCh3ZWFwb24uYnVsbGV0cywgIDEyMiwgd2luZG93LmdhbWUuY2FudmFzLmhlaWdodCAtIDEwKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gZHJhdyBoZWFydFxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZHJhd0ltYWdlKHdpbmRvdy5nYW1lLnNwcml0ZXNoZWV0LCAwLCAyMjgsIDEzLCAxMiwgMTAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAyMywgMTMsIDEyKTtcbiAgICAgICAgLy8gZHJhdyBIUFxuICAgICAgICB3aW5kb3cuZ2FtZS5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMjUpXCI7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsVGV4dChwbGF5ZXIuaHAsIDMwLCB3aW5kb3cuZ2FtZS5jYW52YXMuaGVpZ2h0IC0gOSk7XG4gICAgICAgIHdpbmRvdy5nYW1lLmN0eC5maWxsU3R5bGUgPSBcIiNlN2QyOWVcIjtcbiAgICAgICAgd2luZG93LmdhbWUuY3R4LmZpbGxUZXh0KHBsYXllci5ocCwgMzAsIHdpbmRvdy5nYW1lLmNhbnZhcy5oZWlnaHQgLSAxMCk7XG4gICAgfTtcblxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXNwYXduQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG5cbiAgICAgICAgaWYgKCFwbGF5ZXIuYWxpdmUpIHtcblxuICAgICAgICAgICAgLy8gdmFyIHNwYXduTG9jYXRpb25Gb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdmFyIHg7XG4gICAgICAgICAgICAvLyB2YXIgeTtcbiAgICAgICAgICAgIC8vIHdoaWxlICghc3Bhd25Mb2NhdGlvbkZvdW5kKSB7XG4gICAgICAgICAgICAvLyAgICAgeCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwud2lkdGggLSBwbGF5ZXIucmFkaXVzKSkgKyBwbGF5ZXIucmFkaXVzIC8gMik7XG4gICAgICAgICAgICAvLyAgICAgeSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAod2luZG93LmdhbWUubGV2ZWwuaGVpZ2h0IC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICBpZiAoaGVscGVycy5jb2xsaXNpb25DaGVjayh7eDogeCwgeTogeX0pKSBzcGF3bkxvY2F0aW9uRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gfVxuXG5cbiAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IGhlbHBlcnMuZmluZFNwYXduTG9jYXRpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVsb2FkQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgIGlmIChwbGF5ZXIuYWxpdmUpIHtcbiAgICAgICAgICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwicmVsb2FkXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiAoIXBsYXllci5hbGl2ZSkge1xuICAgICAgICAvLyAgICAgdmFyIHggPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLndpZHRoIC0gcGxheWVyLnJhZGl1cykpICsgcGxheWVyLnJhZGl1cyAvIDIpO1xuICAgICAgICAvLyAgICAgdmFyIHkgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCAtIHBsYXllci5yYWRpdXMpKSArIHBsYXllci5yYWRpdXMgLyAyKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIHBsYXllci5hY3Rpb25zLnB1c2goeyAvLyBhZGQgdG8gdGhlIGFjdGlvbnMgcXVldWVcbiAgICAgICAgLy8gICAgICAgICBhY3Rpb246IFwicmVzcGF3blwiLFxuICAgICAgICAvLyAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgeDogeCxcbiAgICAgICAgLy8gICAgICAgICAgICAgeTogeVxuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgfSk7XG5cblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VtaXR0ZXJCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF07XG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5lbnRpdGllcy5wdXNoKG5ldyBFbWl0dGVyKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkJsb29kMlwiLFxuICAgICAgICAgICAgICAgIGVtaXRDb3VudDogMTAsXG4gICAgICAgICAgICAgICAgZW1pdFNwZWVkOiBudWxsLFxuICAgICAgICAgICAgICAgIHg6IHBsYXllci54LFxuICAgICAgICAgICAgICAgIHk6IHBsYXllci55XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xufTtcbiIsInZhciBsZXZlbCA9IHtcclxuICAgIG5hbWU6IFwibGV2ZWwxXCIsXHJcbiAgICB0aWxlczogW1xyXG4gICAgICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDEsMCwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDEsMiwxLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDIsMiwyLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwxLDIsMiwyLDEsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDEsMSwxLDEsMCwwLDEsMiwyLDEsMSwxLDIsMiwxLDBdLFxyXG4gICAgICAgIFsxLDAsMCwwLDAsMCwwLDAsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDBdLFxyXG4gICAgICAgIFsxLDEsMCwwLDAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDEsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDAsMCwwLDAsMCwwLDAsMCwwLDBdLF1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGV2ZWw7XHJcbiIsInZhciBBazQ3ID0ge1xyXG4gICAgXCJuYW1lXCI6IFwiQWs0N1wiLFxyXG4gICAgXCJtYWdhemluZVNpemVcIjogMzAsIC8vIGJ1bGxldHNcclxuICAgIFwiYnVsbGV0c1wiOiAzMCxcclxuICAgIFwiZmlyZVJhdGVcIjogMC4xLCAvLyBzaG90cyBwZXIgc2Vjb25kXHJcbiAgICBcImJ1bGxldHNQZXJTaG90XCI6IDEsIC8vIHNob290IDEgYnVsbGV0IGF0IGEgdGltZVxyXG4gICAgXCJkYW1hZ2VcIjogMTAsIC8vIGhwXHJcbiAgICBcInJlbG9hZFRpbWVcIjogMiwgLy8gc1xyXG4gICAgXCJidWxsZXRTcGVlZFwiOiAxNzAwLCAvLyBwaXhlbHMgcGVyIHNlY29uZFxyXG4gICAgXCJzeFwiOiAwLCAvLyBzcHJpdGVzaGVldCB4IHBvc2l0aW9uXHJcbiAgICBcInN5XCI6IDAsIC8vIHNwcml0ZXNoZWV0IHkgcG9zaXRpb25cclxuICAgIFwiaWNvblN4XCI6IDIxLFxyXG4gICAgXCJpY29uU3lcIjogMjEwLFxyXG4gICAgXCJpY29uV1wiOiAzMCxcclxuICAgIFwiaWNvbkhcIjogMzBcclxufTtcclxuXHJcbnZhciBzaG90Z3VuID0ge1xyXG4gICAgXCJuYW1lXCI6IFwic2hvdGd1blwiLFxyXG4gICAgXCJtYWdhemluZVNpemVcIjogMTIsIC8vIGJ1bGxldHNcclxuICAgIFwiYnVsbGV0c1wiOiAxMixcclxuICAgIFwiZmlyZVJhdGVcIjogMC41LCAvLyBzaG90cyBwZXIgc2Vjb25kXHJcbiAgICBcImJ1bGxldHNQZXJTaG90XCI6IDQsIC8vIDQgc2hvdGd1biBzbHVncyBwZXIgc2hvdFxyXG4gICAgXCJkYW1hZ2VcIjogMTAsIC8vIGhwXHJcbiAgICBcInJlbG9hZFRpbWVcIjogMiwgLy8gc1xyXG4gICAgXCJidWxsZXRTcGVlZFwiOiAyNTAwLCAvLyBwaXhlbHMgcGVyIHNlY29uZFxyXG4gICAgXCJzeFwiOiAwLCAvLyBzcHJpdGVzaGVldCB4IHBvc2l0aW9uXHJcbiAgICBcInN5XCI6IDYwLCAvLyBzcHJpdGVzaGVldCB5IHBvc2l0aW9uXHJcbiAgICBcImljb25TeFwiOiA1MSxcclxuICAgIFwiaWNvblN5XCI6IDIxMCxcclxuICAgIFwiaWNvbldcIjogMzAsXHJcbiAgICBcImljb25IXCI6IDMwXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFrNDc6IEFrNDcsXHJcbiAgICBzaG90Z3VuOiBzaG90Z3VuXHJcbn07XHJcbiIsIi8vIGRlZ3JlZXMgdG8gcmFkaWFuc1xuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZykge1xuICAgIHJldHVybiBkZWcgKiAoTWF0aC5QSSAvIDE4MCk7XG59XG5cbi8vIHJhZGlhbnMgdG8gZGVncmVlc1xuZnVuY3Rpb24gdG9EZWdyZWVzKHJhZCkge1xuICAgIHJldHVybiByYWQgKiAoMTgwIC8gTWF0aC5QSSk7XG59XG5cbi8vIGNoZWNrIGlmIHRoaXMgcG9pbnQgaXMgaW5zaWRlIGEgbm9uIHdhbGthYmxlIHRpbGUuIHJldHVybnMgdHJ1ZSBpZiBub3Qgd2Fsa2FibGVcbmZ1bmN0aW9uIGNvbGxpc2lvbkNoZWNrKHBvaW50KSB7XG4gICAgdmFyIHRpbGVSb3cgPSBNYXRoLmZsb29yKHBvaW50LnkgLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSk7XG4gICAgdmFyIHRpbGVDb2wgPSBNYXRoLmZsb29yKHBvaW50LnggLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSk7XG4gICAgaWYgKHRpbGVSb3cgPCAwIHx8IHRpbGVSb3cgPj0gd2luZG93LmdhbWUubGV2ZWwucm93VGlsZUNvdW50IHx8IHRpbGVDb2wgPCAwIHx8IHRpbGVDb2wgPj0gd2luZG93LmdhbWUubGV2ZWwuY29sVGlsZUNvdW50ICkgcmV0dXJuIHRydWU7IC8vIG91dHNpZGUgbWFwXG4gICAgcmV0dXJuICh3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t0aWxlUm93XVt0aWxlQ29sXSA+IDApO1xufVxuXG4vLyB0YWtlcyBhIHBvaW50IGFuZCByZXR1bnMgdGlsZSB4eXdoIHRoYXQgaXMgdW5kZXIgdGhhdCBwb2ludFxuZnVuY3Rpb24gZ2V0UmVjdEZyb21Qb2ludChwb2ludCkge1xuICAgIHZhciB5ID0gTWF0aC5mbG9vcihwb2ludC55IC8gd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemUpICogd2luZG93LmdhbWUubGV2ZWwudGlsZVNpemU7XG4gICAgdmFyIHggPSBNYXRoLmZsb29yKHBvaW50LnggLyB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZSkgKiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZTtcbiAgICByZXR1cm4ge3g6IHgsIHk6IHksIHc6IHdpbmRvdy5nYW1lLmxldmVsLnRpbGVTaXplLCBoOiB3aW5kb3cuZ2FtZS5sZXZlbC50aWxlU2l6ZX07XG59XG5cbi8vIHJldHVybnMgdGlsZVxuZnVuY3Rpb24gZ2V0VGlsZSh4LCB5KSB7XG4gICAgaWYoeCA+PSAwICYmIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC5jb2xUaWxlQ291bnQgJiYgeSA+PSAwICYmIHkgPCB3aW5kb3cuZ2FtZS5sZXZlbC5yb3dUaWxlQ291bnQpXG4gICAgICAgIHJldHVybiB3aW5kb3cuZ2FtZS5sZXZlbC5sZXZlbC50aWxlc1t5XVt4XTtcbn1cblxuLy8gZmluZHMgYSByYW5kb20gd2Fsa2FibGUgdGlsZSBvbiB0aGUgbWFwXG5mdW5jdGlvbiBmaW5kU3Bhd25Mb2NhdGlvbigpIHtcbiAgICB2YXIgeDtcbiAgICB2YXIgeTtcbiAgICBkbyB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aW5kb3cuZ2FtZS5sZXZlbC5oZWlnaHQpO1xuICAgIH1cbiAgICB3aGlsZSAoY29sbGlzaW9uQ2hlY2soe3g6IHgsIHk6IHl9KSk7XG5cbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9O1xufVxuXG4vLyBjaGVja3MgdGhhdCBhIHh5IHBvaW50IGlzIGluc2lkZSB0aGUgZ2FtZSB3b3JsZFxuZnVuY3Rpb24gaXNJbnNpZGVHYW1lKHgsIHkpIHtcbiAgICBpZiAoeCA+PSAwICYmIHggPCB3aW5kb3cuZ2FtZS5sZXZlbC53aWR0aCAmJiB5ID49IDAgJiYgeSA8IHdpbmRvdy5nYW1lLmxldmVsLmhlaWdodCkgcmV0dXJuIHRydWU7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdG9SYWRpYW5zOiB0b1JhZGlhbnMsXG4gICAgdG9EZWdyZWVzOiB0b0RlZ3JlZXMsXG4gICAgY29sbGlzaW9uQ2hlY2s6IGNvbGxpc2lvbkNoZWNrLFxuICAgIGZpbmRTcGF3bkxvY2F0aW9uOiBmaW5kU3Bhd25Mb2NhdGlvbixcbiAgICBnZXRSZWN0RnJvbVBvaW50OiBnZXRSZWN0RnJvbVBvaW50LFxuICAgIGdldFRpbGU6IGdldFRpbGUsXG4gICAgaXNJbnNpZGVHYW1lOiBpc0luc2lkZUdhbWVcbn07XG4iLCJ2YXIgR2FtZSA9IHJlcXVpcmUoXCIuL0dhbWUuanNcIik7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5nYW1lID0gbmV3IEdhbWUoKTtcclxufSk7XHJcbiIsInZhciBQYXJ0aWNsZSA9IHJlcXVpcmUoXCIuL1BhcnRpY2xlXCIpO1xyXG4vL3ZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XHJcblxyXG5jbGFzcyBCdWxsZXRIb2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgICAgIC8vdmFyIHJuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKTtcclxuICAgICAgICAvLyB2YXIgciA9IDE1MDtcclxuICAgICAgICAvLyB2YXIgZyA9IDUwO1xyXG4gICAgICAgIC8vIHZhciBiID0gNTA7XHJcblxyXG4gICAgICAgIGRhdGEuY29sb3IgPSBcInJnYig2NiwgNjYsIDY2KVwiO1xyXG4gICAgICAgIC8vZGF0YS5saWZlVGltZSA9IDAuMztcclxuICAgICAgICBkYXRhLnNpemUgPSAyO1xyXG5cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5saWZlVGltZSA9IDEwO1xyXG4gICAgICAgIC8vdGhpcy5kaXJlY3Rpb24gPSBoZWxwZXJzLnRvUmFkaWFucyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApICsgMSk7XHJcbiAgICAgICAgLy90aGlzLnNwZWVkID0gODA7XHJcblxyXG4gICAgICAgIC8vdGhpcy5tb3ZlRGlzdGFuY2UgPSAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpICsgMSk7XHJcbiAgICAgICAgLy90aGlzLmRpc3RhbmNlTW92ZWQgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5CdWxsZXRIb2xlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCwgaW5kZXgpIHtcclxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XHJcbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHRoaXMuZGVzdHJveShpbmRleCk7XHJcbiAgICAvLyBpZiAodGhpcy5kaXN0YW5jZU1vdmVkIDwgdGhpcy5tb3ZlRGlzdGFuY2UpIHtcclxuICAgIC8vICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNwZWVkICogZHQ7XHJcbiAgICAvLyAgICAgdGhpcy54ID0gdGhpcy54ICsgTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAvLyAgICAgdGhpcy55ID0gdGhpcy55ICsgTWF0aC5zaW4odGhpcy5kaXJlY3Rpb24pICogZGlzdGFuY2U7XHJcbiAgICAvLyAgICAgdGhpcy5kaXN0YW5jZU1vdmVkICs9IGRpc3RhbmNlO1xyXG4gICAgLy9cclxuICAgIC8vICAgICBpZiAodGhpcy5kaXN0YW5jZU1vdmVkID49IHRoaXMubW92ZURpc3RhbmNlKSB0aGlzLmN0eCA9IHdpbmRvdy5nYW1lLmJnQ3R4OyAvLyBtb3ZlIHRvIGJhY2tncm91bmQgY3R4XHJcbiAgICAvLyB9XHJcblxyXG59O1xyXG5cclxuLy8gQmxvb2RTcGxhc2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4vLyAgICAgdGhpcy5jdHguc2F2ZSgpOyAvLyBzYXZlIGN1cnJlbnQgc3RhdGVcclxuLy8gICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh0aGlzLnggLSB3aW5kb3cuZ2FtZS5jYW1lcmEueCwgdGhpcy55IC0gd2luZG93LmdhbWUuY2FtZXJhLnkpOyAvLyBjaGFuZ2Ugb3JpZ2luXHJcbi8vICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuLy8gICAgIHRoaXMuY3R4LmFyYygwIC0gdGhpcy5zaXplIC8gMiwgMCAtIHRoaXMuc2l6ZSAvIDIsIHRoaXMuc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuLy8gICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbi8vICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbi8vICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7IC8vIHJlc3RvcmUgb3JpZ2luYWwgc3RhdGVzIChubyByb3RhdGlvbiBldGMpXHJcbi8vIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXRIb2xlO1xyXG4iLCIvL3ZhciB0aWxlcyA9IHJlcXVpcmUoXCIuL2xldmVsXCIpLnRpbGVzO1xyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLy4uL2hlbHBlcnMuanNcIik7XHJcbnZhciBjb2xsaXNpb25EZXRlY3Rpb24gPSByZXF1aXJlKFwiLi9jb2xsaXNpb25EZXRlY3Rpb25cIik7XHJcblxyXG5mdW5jdGlvbiBibGluZSh4MCwgeTAsIHgxLCB5MSkge1xyXG5cclxuICB2YXIgZHggPSBNYXRoLmFicyh4MSAtIHgwKSwgc3ggPSB4MCA8IHgxID8gMSA6IC0xO1xyXG4gIHZhciBkeSA9IE1hdGguYWJzKHkxIC0geTApLCBzeSA9IHkwIDwgeTEgPyAxIDogLTE7XHJcbiAgdmFyIGVyciA9IChkeD5keSA/IGR4IDogLWR5KS8yO1xyXG5cclxuICB3aGlsZSAodHJ1ZSkge1xyXG5cclxuICAgIGlmICh4MCA9PT0geDEgJiYgeTAgPT09IHkxKSBicmVhaztcclxuICAgIHZhciBlMiA9IGVycjtcclxuICAgIGlmIChlMiA+IC1keCkgeyBlcnIgLT0gZHk7IHgwICs9IHN4OyB9XHJcbiAgICBpZiAoZTIgPCBkeSkgeyBlcnIgKz0gZHg7IHkwICs9IHN5OyB9XHJcblxyXG4gICAgdmFyIHRpbGVYID0gTWF0aC5mbG9vcih4MCAvIDMyKTtcclxuICAgIHZhciB0aWxlWSA9IE1hdGguZmxvb3IoeTAgLyAzMik7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgb3V0c2lkZSBtYXBcclxuICAgIGlmICh0aWxlWCA+IHdpbmRvdy5nYW1lLmxldmVsLmNvbFRpbGVDb3VudCB8fCB0aWxlWSA+IHdpbmRvdy5nYW1lLmxldmVsLnJvd1RpbGVDb3VudCkgcmV0dXJuO1xyXG5cclxuICAgIC8vIGhpdCBjaGVjayBhZ2FpbnN0IHBsYXllcnNcclxuICAgIGZvciAodmFyIGtleSBpbiB3aW5kb3cuZ2FtZS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcclxuICAgICAgICBpZiAoIXBsYXllci5hbGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIGhpdCA9IGNvbGxpc2lvbkRldGVjdGlvbi5wb2ludENpcmNsZSh7eDogeDAsIHk6IHkwfSwge3g6IHBsYXllci54LCB5OiBwbGF5ZXIueSwgcmFkaXVzOiBwbGF5ZXIucmFkaXVzfSk7XHJcbiAgICAgICAgaWYgKGhpdCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge3R5cGU6IFwicGxheWVyXCIsIHBsYXllcjogcGxheWVyfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGFnYWluc3QgdGlsZXNcclxuICAgIGlmIChoZWxwZXJzLmdldFRpbGUodGlsZVgsdGlsZVkpID09PSAxKSByZXR1cm4ge3R5cGU6IFwidGlsZVwiLCB4OiB0aWxlWCwgeTogdGlsZVl9O1xyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBibGluZTtcclxuIiwidmFyIGludGVyc2VjdGlvbiA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdGlvblwiKTtcclxuXHJcbmZ1bmN0aW9uIGxpbmVSZWN0SW50ZXJzZWN0KGxpbmUsIHJlY3QpIHtcclxuXHJcbiAgICAgICAgLy9pZiAocG9pbnQgaXMgaW5zaWRlIHJlY3QpXHJcbiAgICAgICAgLy8gaW50ZXJzZWN0ID0gcG9pbnQ7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGxlZnRcclxuICAgICAgICB2YXIgbGVmdCA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0Lnl9LCBlbmQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICAgICAgdmFyIGxlZnRJbnRlcnNlY3QgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsbGVmdCk7XHJcbiAgICAgICAgaWYgKGxlZnRJbnRlcnNlY3QueSA+PSBsZWZ0LnN0YXJ0LnkgJiYgbGVmdEludGVyc2VjdC55IDw9IGxlZnQuZW5kLnkgJiYgbGluZS5zdGFydC54IDw9IGxlZnQuc3RhcnQueCApIHtcclxuICAgICAgICAgICAgbGVmdEludGVyc2VjdC54ICs9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiBsZWZ0SW50ZXJzZWN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hlY2sgdG9wXHJcbiAgICAgICAgdmFyIHRvcCA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0Lnl9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55fX07XHJcbiAgICAgICAgdmFyIHRvcEludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgdG9wKTtcclxuICAgICAgICBpZiAodG9wSW50ZXJzZWN0LnggPj0gdG9wLnN0YXJ0LnggJiYgdG9wSW50ZXJzZWN0LnggPD0gdG9wLmVuZC54ICYmIGxpbmUuc3RhcnQueSA8PSB0b3Auc3RhcnQueSkge1xyXG4gICAgICAgICAgICB0b3BJbnRlcnNlY3QueSArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9wSW50ZXJzZWN0O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIHJpZ2h0XHJcbiAgICAgICAgdmFyIHJpZ2h0ID0ge3N0YXJ0Ont4OiByZWN0LnggKyByZWN0LncgLHk6IHJlY3QueSB9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICAgICAgdmFyIHJpZ2h0SW50ZXJzZWN0ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCByaWdodCk7XHJcbiAgICAgICAgaWYgKHJpZ2h0SW50ZXJzZWN0LnkgPj0gcmlnaHQuc3RhcnQueSAmJiByaWdodEludGVyc2VjdC55IDwgcmlnaHQuZW5kLnkpIHtcclxuICAgICAgICAgICAgcmlnaHRJbnRlcnNlY3QueCAtPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gcmlnaHRJbnRlcnNlY3Q7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hlY2sgZG93blxyXG4gICAgICAgIHZhciBkb3duID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueSArIHJlY3QuaH0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0LnkgKyByZWN0Lmh9fTtcclxuICAgICAgICB2YXIgZG93bkludGVyc2VjdCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgZG93bik7XHJcbiAgICAgICAgdG9wSW50ZXJzZWN0LnkgLT0gMTtcclxuICAgICAgICByZXR1cm4gZG93bkludGVyc2VjdDtcclxufVxyXG5cclxuLy8gZmluZCB0aGUgcG9pbnQgd2hlcmUgYSBsaW5lIGludGVyc2VjdHMgYSByZWN0YW5nbGUuIHRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGUgbGluZSBhbmQgcmVjdCBpbnRlcnNlY3RzXHJcbmZ1bmN0aW9uIGxpbmVSZWN0SW50ZXJzZWN0MihsaW5lLCByZWN0KSB7XHJcbiAgICAvL2lmIChwb2ludCBpcyBpbnNpZGUgcmVjdClcclxuICAgIC8vIGludGVyc2VjdCA9IHBvaW50O1xyXG5cclxuICAgIC8vIGNoZWNrIGxlZnRcclxuICAgIHZhciBsZWZ0TGluZSA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0Lnl9LCBlbmQ6e3g6IHJlY3QueCwgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICB2YXIgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsbGVmdExpbmUpO1xyXG4gICAgaWYgKGludGVyc2VjdGlvblBvaW50LnkgPj0gbGVmdExpbmUuc3RhcnQueSAmJiBpbnRlcnNlY3Rpb25Qb2ludC55IDw9IGxlZnRMaW5lLmVuZC55ICYmIGxpbmUuc3RhcnQueCA8PSBsZWZ0TGluZS5zdGFydC54ICkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayB0b3BcclxuICAgIHZhciB0b3BMaW5lID0ge3N0YXJ0Ont4OiByZWN0LngsIHk6IHJlY3QueX0sIGVuZDp7eDogcmVjdC54ICsgcmVjdC53LCB5OiByZWN0Lnl9fTtcclxuICAgIGludGVyc2VjdGlvblBvaW50ID0gaW50ZXJzZWN0aW9uLmludGVyc2VjdChsaW5lLCB0b3BMaW5lKTtcclxuICAgIGlmIChpbnRlcnNlY3Rpb25Qb2ludC54ID49IHRvcExpbmUuc3RhcnQueCAmJiBpbnRlcnNlY3Rpb25Qb2ludC54IDw9IHRvcExpbmUuZW5kLnggJiYgbGluZS5zdGFydC55IDw9IHRvcExpbmUuc3RhcnQueSkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayByaWdodFxyXG4gICAgdmFyIHJpZ2h0TGluZSA9IHtzdGFydDp7eDogcmVjdC54ICsgcmVjdC53ICx5OiByZWN0LnkgfSwgZW5kOnt4OiByZWN0LnggKyByZWN0LncsIHk6IHJlY3QueSArIHJlY3QuaH19O1xyXG4gICAgaW50ZXJzZWN0aW9uUG9pbnQgPSBpbnRlcnNlY3Rpb24uaW50ZXJzZWN0KGxpbmUsIHJpZ2h0TGluZSk7XHJcbiAgICBpZiAoaW50ZXJzZWN0aW9uUG9pbnQueSA+PSByaWdodExpbmUuc3RhcnQueSAmJiBpbnRlcnNlY3Rpb25Qb2ludC55IDwgcmlnaHRMaW5lLmVuZC55ICYmIGxpbmUuc3RhcnQueCA+PSByaWdodExpbmUuc3RhcnQueCkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25Qb2ludDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBkb3duXHJcbiAgICB2YXIgZG93biA9IHtzdGFydDp7eDogcmVjdC54LCB5OiByZWN0LnkgKyByZWN0Lmh9LCBlbmQ6e3g6IHJlY3QueCArIHJlY3QudywgeTogcmVjdC55ICsgcmVjdC5ofX07XHJcbiAgICBpbnRlcnNlY3Rpb25Qb2ludCA9IGludGVyc2VjdGlvbi5pbnRlcnNlY3QobGluZSwgZG93bik7XHJcbiAgICByZXR1cm4gaW50ZXJzZWN0aW9uUG9pbnQ7XHJcbn1cclxuXHJcblxyXG4vLyBDaGVja3MgaWYgYSBwb2ludCBpcyBpbnNpZGUgYSBjaXJjbGVcclxuZnVuY3Rpb24gcG9pbnRDaXJjbGUocG9pbnQsIGNpcmNsZSkge1xyXG4gICAgICAgIHZhciBhID0gcG9pbnQueCAtIGNpcmNsZS54O1xyXG4gICAgICAgIHZhciBiID0gcG9pbnQueSAtIGNpcmNsZS55O1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggYSphICsgYipiICk7XHJcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgY2lyY2xlLnJhZGl1cykgeyAvLyBwb2ludCBpcyBpbnNpZGUgY2lyY2xlXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxufVxyXG5cclxuLy8gQ2hlY2tzIGlmIGEgcG9pbnQgaXMgaW5zaWRlIGEgcmVjdGFuZ2xlXHJcbmZ1bmN0aW9uIHBvaW50UmVjdChwb2ludCwgcmVjdCkge1xyXG4gICAgcmV0dXJuIChwb2ludC54ID49IHJlY3QueCAmJiBwb2ludC54IDw9IHJlY3QueCArIHJlY3QudyAmJiBwb2ludC55ID49IHJlY3QueSAmJiBwb2ludC55IDw9IHJlY3QueSArIHJlY3QuaCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbGluZVJlY3RJbnRlcnNlY3Q6IGxpbmVSZWN0SW50ZXJzZWN0LFxyXG4gICAgcG9pbnRDaXJjbGU6IHBvaW50Q2lyY2xlLFxyXG4gICAgcG9pbnRSZWN0OiBwb2ludFJlY3QsXHJcbiAgICBsaW5lUmVjdEludGVyc2VjdDI6IGxpbmVSZWN0SW50ZXJzZWN0MlxyXG59O1xyXG4iLCJ2YXIgaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmVjdG9yID0ge307XHJcbiAgICB2ZWN0b3Iub0EgPSBmdW5jdGlvbihzZWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHNlZ21lbnQuc3RhcnQ7XHJcbiAgICB9O1xyXG4gICAgdmVjdG9yLkFCID0gZnVuY3Rpb24oc2VnbWVudCkge1xyXG4gICAgICAgIHZhciBzdGFydCA9IHNlZ21lbnQuc3RhcnQ7XHJcbiAgICAgICAgdmFyIGVuZCA9IHNlZ21lbnQuZW5kO1xyXG4gICAgICAgIHJldHVybiB7eDplbmQueCAtIHN0YXJ0LngsIHk6IGVuZC55IC0gc3RhcnQueX07XHJcbiAgICB9O1xyXG4gICAgdmVjdG9yLmFkZCA9IGZ1bmN0aW9uKHYxLHYyKSB7XHJcbiAgICAgICAgcmV0dXJuIHt4OiB2MS54ICsgdjIueCwgeTogdjEueSArIHYyLnl9O1xyXG4gICAgfVxyXG4gICAgdmVjdG9yLnN1YiA9IGZ1bmN0aW9uKHYxLHYyKSB7XHJcbiAgICAgICAgcmV0dXJuIHt4OnYxLnggLSB2Mi54LCB5OiB2MS55IC0gdjIueX07XHJcbiAgICB9XHJcbiAgICB2ZWN0b3Iuc2NhbGFyTXVsdCA9IGZ1bmN0aW9uKHMsIHYpIHtcclxuICAgICAgICByZXR1cm4ge3g6IHMgKiB2LngsIHk6IHMgKiB2Lnl9O1xyXG4gICAgfVxyXG4gICAgdmVjdG9yLmNyb3NzUHJvZHVjdCA9IGZ1bmN0aW9uKHYxLHYyKSB7XHJcbiAgICAgICAgcmV0dXJuICh2MS54ICogdjIueSkgLSAodjIueCAqIHYxLnkpO1xyXG4gICAgfTtcclxuICAgIHZhciBzZWxmID0ge307XHJcbiAgICBzZWxmLnZlY3RvciA9IGZ1bmN0aW9uKHNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm4gdmVjdG9yLkFCKHNlZ21lbnQpO1xyXG4gICAgfTtcclxuICAgIHNlbGYuaW50ZXJzZWN0U2VnbWVudHMgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgICAgICAvLyB0dXJuIGEgPSBwICsgdCpyIHdoZXJlIDA8PXQ8PTEgKHBhcmFtZXRlcilcclxuICAgICAgICAvLyBiID0gcSArIHUqcyB3aGVyZSAwPD11PD0xIChwYXJhbWV0ZXIpXHJcbiAgICAgICAgdmFyIHAgPSB2ZWN0b3Iub0EoYSk7XHJcbiAgICAgICAgdmFyIHIgPSB2ZWN0b3IuQUIoYSk7XHJcblxyXG4gICAgICAgIHZhciBxID0gdmVjdG9yLm9BKGIpO1xyXG4gICAgICAgIHZhciBzID0gdmVjdG9yLkFCKGIpO1xyXG5cclxuICAgICAgICB2YXIgY3Jvc3MgPSB2ZWN0b3IuY3Jvc3NQcm9kdWN0KHIscyk7XHJcbiAgICAgICAgdmFyIHFtcCA9IHZlY3Rvci5zdWIocSxwKTtcclxuICAgICAgICB2YXIgbnVtZXJhdG9yID0gdmVjdG9yLmNyb3NzUHJvZHVjdChxbXAsIHMpO1xyXG4gICAgICAgIHZhciB0ID0gbnVtZXJhdG9yIC8gY3Jvc3M7XHJcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbiA9IHZlY3Rvci5hZGQocCx2ZWN0b3Iuc2NhbGFyTXVsdCh0LHIpKTtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uO1xyXG4gICAgfTtcclxuICAgIHNlbGYuaXNQYXJhbGxlbCA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIC8vIGEgYW5kIGIgYXJlIGxpbmUgc2VnbWVudHMuXHJcbiAgICAgICAgLy8gcmV0dXJucyB0cnVlIGlmIGEgYW5kIGIgYXJlIHBhcmFsbGVsIChvciBjby1saW5lYXIpXHJcbiAgICAgICAgdmFyIHIgPSB2ZWN0b3IuQUIoYSk7XHJcbiAgICAgICAgdmFyIHMgPSB2ZWN0b3IuQUIoYik7XHJcbiAgICAgICAgcmV0dXJuICh2ZWN0b3IuY3Jvc3NQcm9kdWN0KHIscykgPT09IDApO1xyXG4gICAgfTtcclxuICAgIHNlbGYuaXNDb2xsaW5lYXIgPSBmdW5jdGlvbihhLGIpIHtcclxuICAgICAgICAvLyBhIGFuZCBiIGFyZSBsaW5lIHNlZ21lbnRzLlxyXG4gICAgICAgIC8vIHJldHVybnMgdHJ1ZSBpZiBhIGFuZCBiIGFyZSBjby1saW5lYXJcclxuICAgICAgICB2YXIgcCA9IHZlY3Rvci5vQShhKTtcclxuICAgICAgICB2YXIgciA9IHZlY3Rvci5BQihhKTtcclxuXHJcbiAgICAgICAgdmFyIHEgPSB2ZWN0b3Iub0EoYik7XHJcbiAgICAgICAgdmFyIHMgPSB2ZWN0b3IuQUIoYik7XHJcbiAgICAgICAgcmV0dXJuICh2ZWN0b3IuY3Jvc3NQcm9kdWN0KHZlY3Rvci5zdWIocCxxKSwgcikgPT09IDApO1xyXG4gICAgfTtcclxuICAgIHNlbGYuc2FmZUludGVyc2VjdCA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIGlmIChzZWxmLmlzUGFyYWxsZWwoYSxiKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuaW50ZXJzZWN0U2VnbWVudHMoYSxiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBzZWxmO1xyXG59O1xyXG5pbnRlcnNlY3Rpb24uaW50ZXJzZWN0U2VnbWVudHMgPSBpbnRlcnNlY3Rpb24oKS5pbnRlcnNlY3RTZWdtZW50cztcclxuaW50ZXJzZWN0aW9uLmludGVyc2VjdCA9IGludGVyc2VjdGlvbigpLnNhZmVJbnRlcnNlY3Q7XHJcbmludGVyc2VjdGlvbi5pc1BhcmFsbGVsID0gaW50ZXJzZWN0aW9uKCkuaXNQYXJhbGxlbDtcclxuaW50ZXJzZWN0aW9uLmlzQ29sbGluZWFyID0gaW50ZXJzZWN0aW9uKCkuaXNDb2xsaW5lYXI7XHJcbmludGVyc2VjdGlvbi5kZXNjcmliZSA9IGZ1bmN0aW9uKGEsYikge1xyXG4gICAgdmFyIGlzQ29sbGluZWFyID0gaW50ZXJzZWN0aW9uKCkuaXNDb2xsaW5lYXIoYSxiKTtcclxuICAgIHZhciBpc1BhcmFsbGVsID0gaW50ZXJzZWN0aW9uKCkuaXNQYXJhbGxlbChhLGIpO1xyXG4gICAgdmFyIHBvaW50T2ZJbnRlcnNlY3Rpb24gPSB1bmRlZmluZWQ7XHJcbiAgICBpZiAoaXNQYXJhbGxlbCA9PT0gZmFsc2UpIHtcclxuICAgICAgICBwb2ludE9mSW50ZXJzZWN0aW9uID0gaW50ZXJzZWN0aW9uKCkuaW50ZXJzZWN0U2VnbWVudHMoYSxiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7Y29sbGluZWFyOiBpc0NvbGxpbmVhcixwYXJhbGxlbDogaXNQYXJhbGxlbCxpbnRlcnNlY3Rpb246cG9pbnRPZkludGVyc2VjdGlvbn07XHJcbn07XHJcblxyXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3Rpb247XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XHJcbnZhciB3ZWFwb25EYXRhID0gcmVxdWlyZShcIi4uL2RhdGEvd2VhcG9uc1wiKS5BazQ3O1xyXG5cclxuY2xhc3MgQWs0NyBleHRlbmRzIFdlYXBvbntcclxuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBleGlzdGluZ1dlYXBvbkRhdGEpIHtcclxuICAgICAgICB3ZWFwb25EYXRhID0gZXhpc3RpbmdXZWFwb25EYXRhIHx8IHdlYXBvbkRhdGE7XHJcbiAgICAgICAgc3VwZXIob3duZXIsIHdlYXBvbkRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFrNDc7XHJcbiIsInZhciBXZWFwb24gPSByZXF1aXJlKFwiLi9XZWFwb25cIik7XG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIikuc2hvdGd1bjtcbnZhciBCdWxsZXQgPSByZXF1aXJlKFwiLi4vLi9CdWxsZXRcIik7XG5cbmNsYXNzIFNob3RndW4gZXh0ZW5kcyBXZWFwb257XG4gICAgY29uc3RydWN0b3Iob3duZXIsIGV4aXN0aW5nV2VhcG9uRGF0YSkge1xuICAgICAgICB3ZWFwb25EYXRhID0gZXhpc3RpbmdXZWFwb25EYXRhIHx8IHdlYXBvbkRhdGE7XG4gICAgICAgIHN1cGVyKG93bmVyLCB3ZWFwb25EYXRhKTtcbiAgICB9XG59XG5cblNob3RndW4ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcblxuICAgIGlmICh0aGlzLmZpcmVUaW1lciA8IHRoaXMuZmlyZVJhdGUgfHwgdGhpcy5yZWxvYWRpbmcgfHwgdGhpcy5idWxsZXRzIDwgMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5idWxsZXRzIC09IDE7XG4gICAgdGhpcy5maXJlVGltZXIgPSAwO1xuXG4gICAgdmFyIGRpcmVjdGlvbnMgPSBbXTtcbiAgICB2YXIgZGlyZWN0aW9uO1xuXG4gICAgLy8gc2hvb3QgNCBidWxsZXRzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJ1bGxldHNQZXJTaG90OyBpICs9IDEpIHtcblxuICAgICAgICBpZiAoIWFjdGlvbi5kYXRhLmRpcmVjdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIHJhbmRvbWl6ZSBkaXJlY3Rpb25zIG15c2VsZlxuICAgICAgICAgICAgZGlyZWN0aW9uID0gdGhpcy5vd25lci5kaXJlY3Rpb24gKyBNYXRoLnJhbmRvbSgpICogMC4yNSAtIDAuMTI1O1xuICAgICAgICAgICAgZGlyZWN0aW9ucy5wdXNoKGRpcmVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBhY3Rpb24uZGF0YS5kaXJlY3Rpb25zW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmdhbWUuZW50aXRpZXMucHVzaChuZXcgQnVsbGV0KHtcbiAgICAgICAgICAgIHg6IHRoaXMub3duZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMub3duZXIueSxcbiAgICAgICAgICAgIHRhcmdldFg6IHRoaXMub3duZXIubW91c2VYLFxuICAgICAgICAgICAgdGFyZ2V0WTogdGhpcy5vd25lci5tb3VzZVksXG4gICAgICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJGSVJFXCIsIGFjdGlvbiwgZGlyZWN0aW9ucyk7XG4gICAgYWN0aW9uLmRhdGEuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnM7XG5cblxuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3RndW47XG4iLCJ2YXIgQnVsbGV0ID0gcmVxdWlyZShcIi4uLy4vQnVsbGV0MlwiKTtcblxuY2xhc3MgV2VhcG9ue1xuICAgIGNvbnN0cnVjdG9yKG93bmVyLCBkYXRhKSB7XG4gICAgICAgIHRoaXMub3duZXIgPSBvd25lcjtcbiAgICAgICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lO1xuICAgICAgICB0aGlzLm1hZ2F6aW5lU2l6ZSA9IGRhdGEubWFnYXppbmVTaXplO1xuICAgICAgICB0aGlzLmJ1bGxldHMgPSBkYXRhLmJ1bGxldHM7XG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSBkYXRhLmZpcmVSYXRlO1xuICAgICAgICB0aGlzLmRhbWFnZSA9IGRhdGEuZGFtYWdlO1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWUgPSBkYXRhLnJlbG9hZFRpbWU7XG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSBkYXRhLmJ1bGxldFNwZWVkO1xuICAgICAgICB0aGlzLmJ1bGxldHNQZXJTaG90ID0gZGF0YS5idWxsZXRzUGVyU2hvdDtcbiAgICAgICAgdGhpcy5zeCA9IGRhdGEuc3g7XG4gICAgICAgIHRoaXMuc3kgPSBkYXRhLnN5O1xuXG4gICAgICAgIHRoaXMuaWNvblN4ID0gZGF0YS5pY29uU3g7XG4gICAgICAgIHRoaXMuaWNvblN5ID0gZGF0YS5pY29uU3k7XG4gICAgICAgIHRoaXMuaWNvblcgPSBkYXRhLmljb25XO1xuICAgICAgICB0aGlzLmljb25IID0gZGF0YS5pY29uSDtcblxuICAgICAgICB0aGlzLmZpcmVUaW1lciA9IHRoaXMuZmlyZVJhdGU7XG5cbiAgICAgICAgdGhpcy5yZWxvYWRpbmcgPSBkYXRhLnJlbG9hZGluZyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5yZWxvYWRUaW1lciA9IGRhdGEucmVsb2FkVGltZXIgfHwgMDtcbiAgICB9XG59XG5cbldlYXBvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlKSB0aGlzLmZpcmVUaW1lciArPSBkdDtcblxuICAgIGlmICh0aGlzLnJlbG9hZGluZykge1xuICAgICAgICB0aGlzLnJlbG9hZFRpbWVyICs9IGR0O1xuICAgICAgICBpZiAodGhpcy5yZWxvYWRUaW1lciA+IHRoaXMucmVsb2FkVGltZSl7XG4gICAgICAgICAgICB0aGlzLmZpbGxNYWdhemluZSgpO1xuICAgICAgICAgICAgdGhpcy5zdG9wUmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBpZiAodGhpcy5maXJlVGltZXIgPCB0aGlzLmZpcmVSYXRlIHx8IHRoaXMucmVsb2FkaW5nIHx8IHRoaXMuYnVsbGV0cyA8IDEpIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuYnVsbGV0cyAtPSB0aGlzLmJ1bGxldHNQZXJTaG90O1xuICAgIHRoaXMuZmlyZVRpbWVyID0gMDtcblxuICAgIHZhciBidWxsZXQgPSBuZXcgQnVsbGV0KHtcbiAgICAgICAgeDogdGhpcy5vd25lci54LFxuICAgICAgICB5OiB0aGlzLm93bmVyLnksXG4gICAgICAgIHRhcmdldFg6IHRoaXMub3duZXIubW91c2VYLFxuICAgICAgICB0YXJnZXRZOiB0aGlzLm93bmVyLm1vdXNlWSxcbiAgICAgICAgZGlyZWN0aW9uOiB0aGlzLm93bmVyLmRpcmVjdGlvbixcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgIH0pO1xuICAgIHJldHVybiBhY3Rpb247XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHRoaXMucmVsb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbG9hZFRpbWVyID0gMDtcbiAgICByZXR1cm4gYWN0aW9uO1xufTtcblxuV2VhcG9uLnByb3RvdHlwZS5maWxsTWFnYXppbmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJ1bGxldHMgPSB0aGlzLm1hZ2F6aW5lU2l6ZTtcbn07XG5cbldlYXBvbi5wcm90b3R5cGUuc3RvcFJlbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVsb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZWxvYWRUaW1lciA9IDA7XG59O1xuXG5XZWFwb24ucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICBidWxsZXRzOiB0aGlzLmJ1bGxldHMsXG4gICAgICAgIGZpcmVUaW1lcjogdGhpcy5maXJlUmF0ZSxcbiAgICAgICAgcmVsb2FkaW5nOiB0aGlzLnJlbG9hZGluZyxcbiAgICAgICAgcmVsb2FkVGltZXI6IHRoaXMucmVsb2FkVGltZXJcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gV2VhcG9uO1xuIiwidmFyIFNob3RndW4gPSByZXF1aXJlKFwiLi4vLi93ZWFwb25zL1Nob3RndW5cIik7XHJcbnZhciBBazQ3ID0gcmVxdWlyZShcIi4uLy4vd2VhcG9ucy9BazQ3XCIpO1xyXG52YXIgd2VhcG9uRGF0YSA9IHJlcXVpcmUoXCIuLi9kYXRhL3dlYXBvbnNcIik7XHJcblxyXG5mdW5jdGlvbiB3ZWFwb25DcmVhdG9yKG93bmVyLCBkYXRhKSB7XHJcblxyXG4gICAgdmFyIHdlcERhdGEgPSB3ZWFwb25EYXRhW2RhdGEubmFtZV07XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkgeyB3ZXBEYXRhW2tleV0gPSBkYXRhW2tleV07IH1cclxuXHJcbiAgICBzd2l0Y2ggKGRhdGEubmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJBazQ3XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWs0Nyhvd25lciwgd2VwRGF0YSk7XHJcbiAgICAgICAgY2FzZSBcInNob3RndW5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTaG90Z3VuKG93bmVyLCB3ZXBEYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3ZWFwb25DcmVhdG9yO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi8uLi9QbGF5ZXJcIik7XG5cbmZ1bmN0aW9uIENsaWVudChJRCl7XG4gICAgLy90aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKElELCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLCBwb3J0OiB3aW5kb3cubG9jYXRpb24ucG9ydCwgcGF0aDogXCIvcGVlclwifSk7XG5cbiAgICAvLyBTdHJlc3MgdGVzdFxuICAgIHRoaXMudGVzdHNSZWNlaXZlZCA9IDA7XG5cbiAgICB0aGlzLmFjdGlvbnMgPSBbXTsvLyBoZXJlIHdlIHdpbGwgc3RvcmUgcmVjZWl2ZWQgYWN0aW9ucyBmcm9tIHRoZSBob3N0XG4gICAgdGhpcy5jaGFuZ2VzID0gW107IC8vIGhlcmUgd2Ugd2lsbCBzdG9yZSByZWNlaXZlZCBjaGFuZ2VzIGZyb20gdGhlIGhvc3RcblxuICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgLy8gaXZlIGdvdCBteSBwZWVySUQgYW5kIGdhbWVJRCwgbGV0cyBzZW5kIGl0IHRvIHRoZSBzZXJ2ZXIgdG8gam9pbiB0aGUgaG9zdFxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLnNvY2tldC5lbWl0KFwiam9pblwiLCB7cGVlcklEOiBpZCwgZ2FtZUlEOiB3aW5kb3cuZ2FtZS5nYW1lSUR9KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJteSBjbGllbnQgcGVlcklEIGlzIFwiLCBpZCk7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuZ2FtZS5zdGFydGVkKSB3aW5kb3cuZ2FtZS5zdGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIC8vIHRoZSBob3N0IGhhcyBzdGFydGVkIHRoZSBjb25uZWN0aW9uXG5cbiAgICAgICAgLy8gY2xvc2Ugb3V0IGFueSBvbGQgY29ubmVjdGlvbnNcbiAgICAgICAgaWYoT2JqZWN0LmtleXModGhpcy5jb25uZWN0aW9ucykubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjb25uUGVlciBpbiB0aGlzLmNvbm5lY3Rpb25zKXtcbiAgICAgICAgICAgICAgICBpZiAoY29ublBlZXIgIT09IGNvbm4ucGVlcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5QZWVyXVswXS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jb25uZWN0aW9uc1tjb25uUGVlcl07XG4gICAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBvbGQgaG9zdHMgcGxheWVyIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZGVsZXRlIG9sZCBwbGF5ZXJcIiwgY29ublBlZXIpO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm5QZWVyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgaXRcbiAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG5cbiAgICAgICAgY29ubi5vbihcImRhdGFcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5ZXJKb2luZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKGRhdGEucGxheWVyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhc2UgXCJwbGF5ZXJMZWZ0XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLmFkZFBsYXllcihkYXRhLnBsYXllckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogZGF0YS5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZ2FtZVN0YXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUuYWRkUGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJnYW1lU3RhdGVVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZ2FtZVN0YXRlLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlkICE9PSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkKSAvLyBpZ25vcmUgbXkgb3duIHN0YXRlIGZvciBub3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1twbGF5ZXIuaWRdLnVwZGF0ZVN0YXRlKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiY2hhbmdlc1wiOiAvLyBjaGFuZ2VzIGFuZCBhY3Rpb25zIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5jaGFuZ2VzID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY2hhbmdlcy5jb25jYXQoZGF0YS5jaGFuZ2VzKTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5hY3Rpb25zID0gd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuYWN0aW9ucy5jb25jYXQoZGF0YS5hY3Rpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicGluZ1wiOiAvLyBob3N0IHNlbnQgYSBwaW5nLCBhbnN3ZXIgaXRcbiAgICAgICAgICAgICAgICAgICBjb25uLnNlbmQoeyBldmVudDogXCJwb25nXCIsIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXAgfSk7XG4gICAgICAgICAgICAgICAgICAgZGF0YS5waW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbcGluZy5pZF0ucGluZyA9IHBpbmcucGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsucGluZyA9IHdpbmRvdy5nYW1lLnBsYXllcnNbd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGVlci5pZF0ucGluZztcbiAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KHdpbmRvdy5nYW1lLnBsYXllcnMpO1xuICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgaG9zdCwgY2FsY3VsYXRlIHBpbmd0aW1lXG4gICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH0pO1xufVxuXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKClcbntcbiAgICAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW3RoaXMucGVlci5pZF07XG4gICAgaWYgKCFwbGF5ZXIpIHJldHVybjtcblxuICAgIHZhciBjdXJyZW50U3RhdGUgPSBwbGF5ZXIuZ2V0Q2xpZW50U3RhdGUoKTtcbiAgICB2YXIgbGFzdENsaWVudFN0YXRlID0gcGxheWVyLmxhc3RDbGllbnRTdGF0ZTtcbiAgICB2YXIgY2hhbmdlID0gXy5vbWl0KGN1cnJlbnRTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0Q2xpZW50U3RhdGVba10gPT09IHY7IH0pOyAvLyBjb21wYXJlIG5ldyBhbmQgb2xkIHN0YXRlIGFuZCBnZXQgdGhlIGRpZmZlcmVuY2VcblxuICAgIC8vIGFkZCBhbnkgcGVyZm9ybWVkIGFjdGlvbnMgdG8gY2hhbmdlIHBhY2thZ2VcbiAgICBpZiAocGxheWVyLnBlcmZvcm1lZEFjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgY2hhbmdlLmFjdGlvbnMgPSBwbGF5ZXIucGVyZm9ybWVkQWN0aW9ucztcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpKSB7XG4gICAgICAgIC8vIHRoZXJlJ3MgYmVlbiBjaGFuZ2VzLCBzZW5kIGVtIHRvIGhvc3RcbiAgICAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgICAgICAgICAgZXZlbnQ6IFwibmV0d29ya1VwZGF0ZVwiLFxuICAgICAgICAgICAgdXBkYXRlczogY2hhbmdlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwbGF5ZXIubGFzdENsaWVudFN0YXRlID0gY3VycmVudFN0YXRlO1xuXG5cblxuXG4gICAgLy8gdXBkYXRlIHdpdGggY2hhbmdlcyByZWNlaXZlZCBmcm9tIGhvc3RcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjaGFuZ2UgPSB0aGlzLmNoYW5nZXNbaV07XG5cbiAgICAgICAgLy8gZm9yIG5vdywgaWdub3JlIG15IG93biBjaGFuZ2VzXG4gICAgICAgIGlmIChjaGFuZ2UuaWQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjaGFuZ2UuaWRdLm5ldHdvcmtVcGRhdGUoY2hhbmdlKTtcbiAgICAgICAgICAgIH1jYXRjaCAoZXJyKSB7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VzID0gW107XG4gICAgcGxheWVyLnBlcmZvcm1lZEFjdGlvbnMgPSBbXTtcblxuXG5cbiAgICAvLyAvLyBjaGVjayBpZiBteSBrZXlzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIC8vIHZhciBteVBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNbdGhpcy5wZWVyLmlkXTtcbiAgICAvLyBpZiAoIW15UGxheWVyKSByZXR1cm47XG4gICAgLy9cbiAgICAvLyAgaWYgKCFfLmlzRXF1YWwobXlQbGF5ZXIua2V5cywgbXlQbGF5ZXIuY29udHJvbHMua2V5Ym9hcmQubGFzdFN0YXRlKSkge1xuICAgIC8vICAgICAvLyBzZW5kIGtleXN0YXRlIHRvIGhvc3RcbiAgICAvLyAgICAgdGhpcy5jb25uLnNlbmQoe1xuICAgIC8vICAgICAgICAgZXZlbnQ6IFwia2V5c1wiLFxuICAgIC8vICAgICAgICAga2V5czogbXlQbGF5ZXIua2V5c1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgfVxuICAgIC8vIG15UGxheWVyLmNvbnRyb2xzLmtleWJvYXJkLmxhc3RTdGF0ZSA9IF8uY2xvbmUobXlQbGF5ZXIua2V5cyk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIGdldCB0aGUgZGlmZmVyZW5jZSBzaW5jZSBsYXN0IHRpbWVcbiAgICAvL1xuICAgIC8vIHZhciBjdXJyZW50UGxheWVyc1N0YXRlID0gW107XG4gICAgLy8gdmFyIGNoYW5nZXMgPSBbXTtcbiAgICAvLyB2YXIgbGFzdFN0YXRlID0gbXlQbGF5ZXIubGFzdFN0YXRlO1xuICAgIC8vIHZhciBuZXdTdGF0ZSA9IG15UGxheWVyLmdldFN0YXRlKCk7XG4gICAgLy9cbiAgICAvLyAvLyBjb21wYXJlIHBsYXllcnMgbmV3IHN0YXRlIHdpdGggaXQncyBsYXN0IHN0YXRlXG4gICAgLy8gdmFyIGNoYW5nZSA9IF8ub21pdChuZXdTdGF0ZSwgZnVuY3Rpb24odixrKSB7IHJldHVybiBsYXN0U3RhdGVba10gPT09IHY7IH0pO1xuICAgIC8vIGlmICghXy5pc0VtcHR5KGNoYW5nZSkpIHtcbiAgICAvLyAgICAgLy8gdGhlcmUncyBiZWVuIGNoYW5nZXNcbiAgICAvLyAgICAgY2hhbmdlLnBsYXllcklEID0gbXlQbGF5ZXIuaWQ7XG4gICAgLy8gICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIG15UGxheWVyLmxhc3RTdGF0ZSA9IG5ld1N0YXRlO1xuICAgIC8vIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzXG4gICAgLy8gaWYgKGNoYW5nZXMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAvLyAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYgKHRoaXMuYWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgIC8vIHNlbmQgYWxsIHBlcmZvcm1lZCBhY3Rpb25zIHRvIHRoZSBob3N0XG4gICAgLy8gICAgIHRoaXMuY29ubi5zZW5kKHtcbiAgICAvLyAgICAgICAgIGV2ZW50OiBcImFjdGlvbnNcIixcbiAgICAvLyAgICAgICAgIGRhdGE6IHRoaXMuYWN0aW9uc1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy5hY3Rpb25zID0gW107IC8vIGNsZWFyIGFjdGlvbnMgcXVldWVcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvLyB1cGRhdGUgd2l0aCBjaGFuZ2VzIHJlY2VpdmVkIGZyb20gaG9zdFxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jaGFuZ2VzW2ldLmxlbmd0aDsgaiArPSAxKSAge1xuICAgIC8vICAgICAgICAgY2hhbmdlID0gdGhpcy5jaGFuZ2VzW2ldW2pdO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAvLyBmb3Igbm93LCBpZ25vcmUgbXkgb3duIGNoYW5nZXNcbiAgICAvLyAgICAgICAgIGlmIChjaGFuZ2UucGxheWVySUQgIT09IHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQpIHdpbmRvdy5nYW1lLnBsYXllcnNbY2hhbmdlLnBsYXllcklEXS5jaGFuZ2UoY2hhbmdlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHRoaXMuY2hhbmdlcyA9IFtdO1xuXG59O1xuXG4gICAgLy9cbiAgICAvLyB0aGlzLnBlZXIub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAvLyAgICAgLy8gdGhlIGhvc3QgaGFzIHN0YXJ0ZWQgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQuY29ubiA9IGNvbm47XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiBmcm9tIHNlcnZlclwiLCB0aGlzLnBlZXIsIGNvbm4pO1xuICAgIC8vXG4gICAgLy8gICAgIC8vY3JlYXRlIHRoZSBwbGF5ZXJcbiAgICAvLyAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXIgPSB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoY29ubi5wZWVyKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIC8vTGlzdGVuIGZvciBkYXRhIGV2ZW50cyBmcm9tIHRoZSBob3N0XG4gICAgLy8gICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgICAgIGlmIChkYXRhLmV2ZW50ID09PSBcInBpbmdcIil7IC8vIGhvc3Qgc2VudCBhIHBpbmcsIGFuc3dlciBpdFxuICAgIC8vICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgaWYoZGF0YS5ldmVudCA9PT0gXCJwb25nXCIpIHsgLy8gd2UndmUgcmVjZWl2ZWQgYSBwb25nIGZyb20gdGhlIGhvc3QsIGNhbHVjYXRlIHBpbmd0aW1lXG4gICAgLy8gICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgLy8gICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5waW5nID0gcGluZztcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICAvLyBwaW5nIHRlc3RcbiAgICAvLyAgICAgd2luZG93LmdhbWUubmV0d29yay5jbGllbnQucGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LmNvbm4uc2VuZCh7XG4gICAgLy8gICAgICAgICAgICAgZXZlbnQ6IFwicGluZ1wiLFxuICAgIC8vICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH0sIDIwMDApO1xuICAgIC8vXG4gICAgLy8gfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIb3N0KCl7XG4gICAgdGhpcy5jb25ucyA9IHt9O1xuICAgIHRoaXMuYWN0aW9ucyA9IHt9OyAvLyBoZXJlIHdlIHdpbGwgc3RvcmUgYWxsIHRoZSBhY3Rpb25zIHJlY2VpdmVkIGZyb20gY2xpZW50c1xuICAgIHRoaXMubGFzdFBsYXllcnNTdGF0ZSA9IFtdO1xuICAgIHRoaXMuZGlmZiA9IG51bGw7XG5cbiAgICB0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgLy90aGlzLnBlZXIgPSBuZXcgUGVlcih7a2V5OiBcImdweTVpNGhqeWpyNGZndmlcIn0pO1xuICAgICAgICB0aGlzLnBlZXIgPSBuZXcgUGVlcihkYXRhLmhvc3RJRCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSwgcG9ydDogd2luZG93LmxvY2F0aW9uLnBvcnQsIHBhdGg6IFwiL3BlZXJcIn0pO1xuXG4gICAgICAgIHRoaXMucGVlci5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgaG9zdHMgcGxheWVyIG9iamVjdCBpZiBpdCBkb2VzbnQgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGlmICghKHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50LnBlZXIuaWQgaW4gd2luZG93LmdhbWUucGxheWVycykpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5hZGRQbGF5ZXIoe2lkOiB3aW5kb3cuZ2FtZS5uZXR3b3JrLmNsaWVudC5wZWVyLmlkfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNlbmQgYSBwaW5nIGV2ZXJ5IDIgc2Vjb25kcywgdG8gdHJhY2sgcGluZyB0aW1lXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgICAgICBldmVudDogXCJwaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgcGluZ3M6IHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5nZXRQaW5ncygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LDIwMDApO1xuXG4gICAgICAgICAgICAvLyBzZW5kIGZ1bGwgZ2FtZSBzdGF0ZSBvbmNlIGluIGEgd2hpbGVcbiAgICAgICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd2luZG93LmdhbWUubmV0d29yay5ob3N0LmJyb2FkY2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBcImdhbWVTdGF0ZVVwZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LDEwMDApO1xuXG4gICAgICAgICAgICBkYXRhLnBlZXJzLmZvckVhY2goZnVuY3Rpb24ocGVlcklEKSB7XG4gICAgICAgICAgICAgICAgLy9jb25uZWN0IHdpdGggZWFjaCByZW1vdGUgcGVlclxuICAgICAgICAgICAgICAgIHZhciBjb25uID0gIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5wZWVyLmNvbm5lY3QocGVlcklEKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhvc3RJRDpcIiwgd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXIuaWQsIFwiIGNvbm5lY3Qgd2l0aFwiLCBwZWVySUQpO1xuICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUubmV0d29yay5ob3N0LnBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uc1twZWVySURdID0gY29ubjtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IHdpbmRvdy5nYW1lLmFkZFBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xuXG4gICAgICAgICAgICAgICAgY29ubi5vbihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgbmV3IHBsYXllciBkYXRhIHRvIGV2ZXJ5b25lXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJKb2luZWRcIiwgcGxheWVyRGF0YTogbmV3UGxheWVyLmdldEZ1bGxTdGF0ZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbmV3IHBsYXllciB0aGUgZnVsbCBnYW1lIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuZW1pdCgge2NsaWVudElEOiBjb25uLnBlZXIsIGV2ZW50OiBcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGU6IHdpbmRvdy5nYW1lLmdldEdhbWVTdGF0ZSgpfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubnNbY29ubi5wZWVyXTtcbiAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuYnJvYWRjYXN0KHsgZXZlbnQ6IFwicGxheWVyTGVmdFwiLCBpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vd2luZG93LmdhbWUucmVtb3ZlUGxheWVyKHtpZDogY29ubi5wZWVyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25uLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiRVJST1IgRVZFTlRcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbm4ub24oXCJkYXRhXCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRhdGEuZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm4uc2VuZCh7IGV2ZW50OiBcInBvbmdcIiwgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcCB9KTsgLy8gYW5zd2VyIHRoZSBwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicG9uZ1wiOiAvLyB3ZSd2ZSByZWNlaXZlZCBhIHBvbmcgZnJvbSB0aGUgY2xpZW50LCBjYWx1Y2F0ZSBwaW5ndGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBpbmcgPSBEYXRlLm5vdygpIC0gZGF0YS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0ucGluZyA9IHBpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5ldHdvcmtVcGRhdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgZnJvbSBhIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5uZXR3b3JrVXBkYXRlKGRhdGEudXBkYXRlcyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEuYWN0aW9ucyk7IC8vIFRPRE8gdmVyaWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJhY3Rpb25zXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiYWN0aW9ucyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2Nvbm4ucGVlcl0uYWN0aW9ucy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY2FzZSBcImNoYW5nZXNcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwiSGV5IHRoZXJlIGhhcyBiZWVuIGNoYW5nZXMhXCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmNoYW5nZShkYXRhLmNoYW5nZXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhc2UgXCJrZXlzXCI6IC8vIHJlY2VpdmluZyBhY3Rpb25zIGZyb20gYSBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIGNvbnNvbGUubG9nKFwia2V5cyByZWNlaXZlZCBmcm9tXCIsIGNvbm4ucGVlciwgZGF0YS5rZXlzLCAgd2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnNbY29ubi5wZWVyXS5rZXlzID0gXy5jbG9uZShkYXRhLmtleXMpOyAvL1RPRE86IHZlcmlmeSBpbnB1dCAoY2hlY2sgdGhhdCBpdCBpcyB0aGUga2V5IG9iamVjdCB3aXRoIHRydWUvZmFsc2UgdmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY29uc29sZS5sb2cod2luZG93LmdhbWUucGxheWVyc1tjb25uLnBlZXJdLmtleXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5icm9hZGNhc3QgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGZvciAodmFyIGNvbm4gaW4gdGhpcy5jb25ucyl7XG4gICAgICAgICAgICB0aGlzLmNvbm5zW2Nvbm5dLnNlbmQoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8ganVzdCBzZW5kIGRhdGEgdG8gYSBzcGVjaWZpYyBjbGllbnRcbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRU1JVCFcIiwgZGF0YSk7XG4gICAgICAgIHRoaXMuY29ubnNbZGF0YS5jbGllbnRJRF0uc2VuZChkYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICAvLyBnZXQgdGhlIGRpZmZlcmVuY2Ugc2luY2UgbGFzdCB0aW1lXG5cbiAgICAgICAgdmFyIGNoYW5nZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2luZG93LmdhbWUucGxheWVycykge1xuICAgICAgICAgICAgdmFyIHBsYXllciA9IHdpbmRvdy5nYW1lLnBsYXllcnNba2V5XTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RnVsbFN0YXRlID0gcGxheWVyLmdldEZ1bGxTdGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IF8ub21pdChjdXJyZW50RnVsbFN0YXRlLCBmdW5jdGlvbih2LGspIHsgcmV0dXJuIHBsYXllci5sYXN0RnVsbFN0YXRlW2tdID09PSB2OyB9KTsgLy8gY29tcGFyZSBuZXcgYW5kIG9sZCBzdGF0ZSBhbmQgZ2V0IHRoZSBkaWZmZXJlbmNlXG4gICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShjaGFuZ2UpIHx8IHBsYXllci5wZXJmb3JtZWRBY3Rpb25zLmxlbmd0aCA+IDApIHsgLy90aGVyZSdzIGJlZW4gY2hhbmdlcyBvciBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY2hhbmdlLmlkID0gcGxheWVyLmlkO1xuICAgICAgICAgICAgICAgIGNoYW5nZS5hY3Rpb25zID0gcGxheWVyLnBlcmZvcm1lZEFjdGlvbnM7XG4gICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmxhc3RGdWxsU3RhdGUgPSBjdXJyZW50RnVsbFN0YXRlO1xuICAgICAgICAgICAgICAgIHBsYXllci5wZXJmb3JtZWRBY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIC8vIHNlbmQgY2hhbmdlc1xuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAgICAgICAgIGV2ZW50OiBcImNoYW5nZXNcIixcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBjaGFuZ2VzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgdGhpcy5nZXRQaW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGluZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdpbmRvdy5nYW1lLnBsYXllcnMpIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzW2tleV07XG4gICAgICAgICAgICBwaW5ncy5wdXNoKHtpZDogcGxheWVyLmlkLCBwaW5nOiBwbGF5ZXIucGluZyB8fCBcImhvc3RcIn0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBpbmdzO1xuICAgIH07XG59O1xuIiwidmFyIENsaWVudCA9IHJlcXVpcmUoXCIuL0NsaWVudFwiKTtcclxudmFyIEhvc3QgPSByZXF1aXJlKFwiLi9Ib3N0XCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJSVEMoKXtcclxuICAgIHRoaXMucGluZyA9IFwiLVwiO1xyXG4gICAgdGhpcy5zb2NrZXQgPSBpbygpO1xyXG5cclxuICAgIC8vIHJlY2VpdmluZyBteSBjbGllbnQgSURcclxuICAgIHRoaXMuc29ja2V0Lm9uKFwiSURcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuY2xpZW50ID0gbmV3IENsaWVudChkYXRhLklEKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKFwieW91QXJlSG9zdFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJpbSB0aGUgaG9zdFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QgPSBuZXcgSG9zdCgpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5jb25uZWN0KHtob3N0SUQ6IGRhdGEuaG9zdElELCBwZWVyczogZGF0YS5wZWVyc30pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJKb2luZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGpvaW5lZFwiLCBkYXRhKTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5uZXR3b3JrLmhvc3QuY29ubmVjdCh7aG9zdElEOiBkYXRhLmhvc3RJRCwgcGVlcnM6W2RhdGEucGVlcklEXX0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBMQVlFUiBMRUZUXCIsIGRhdGEpO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGRhdGEucGxheWVySUR9KTtcclxuICAgIH0pO1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLm5ldHdvcmsuaG9zdC5icm9hZGNhc3QoeyBldmVudDogXCJwbGF5ZXJMZWZ0XCIsIGlkOiBjb25uLnBlZXJ9KTtcclxuICAgIC8vICAgICAvL3dpbmRvdy5nYW1lLnJlbW92ZVBsYXllcih7aWQ6IGNvbm4ucGVlcn0pO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJwbGF5ZXJMZWZ0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICBkZWxldGUgd2luZG93LmdhbWUucGxheWVyc1tkYXRhLmlkXTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyB0aGlzLnBlZXJzID0ge307XHJcbiAgICAvLyB0aGlzLmNvbm5zID0ge307XHJcbiAgICAvLyB0aGlzLnNvY2tldC5lbWl0KFwiaG9zdFN0YXJ0XCIsIHtnYW1lSUQ6IHRoaXMuZ2FtZUlEfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5zb2NrZXQub24oXCJqb2luXCIsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vICAgICAvLyBhIHBlZXIgd2FudHMgdG8gam9pbi4gQ3JlYXRlIGEgbmV3IFBlZXIgYW5kIGNvbm5lY3QgdGhlbVxyXG4gICAgLy8gICAgIHRoaXMucGVlciA9IG5ldyBQZWVyKHtrZXk6IFwiZ3B5NWk0aGp5anI0Zmd2aVwifSk7XHJcbiAgICAvLyAgICAgdGhpcy5wZWVyLm9uKFwib3BlblwiLCBmdW5jdGlvbihpZCkge1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4gPSB0aGlzLnBlZXIuY29ubmVjdChkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGlkLCBkYXRhLnBlZXJJRCk7XHJcbiAgICAvLyAgICAgICAgIHRoaXMucGVlcnNbaWRdID0gdGhpcy5wZWVyO1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm5zW2RhdGEucGVlcklEXSA9IHRoaXMuY29ubjtcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy5nYW1lLnVpLnVwZGF0ZUNsaWVudExpc3QodGhpcy5wZWVycyk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLmNvbm4ub24oXCJjbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIC8vIGEgcGVlciBoYXMgZGlzY29ubmVjdGVkXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpc2Nvbm5lY3RlZCFcIiwgdGhpcy5jb25uLCBcIlBFRVJcIiwgdGhpcy5wZWVyKTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlZXJzW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5zW3RoaXMuY29ubi5wZWVyXTtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuZ2FtZS51aS51cGRhdGVDbGllbnRMaXN0KCk7XHJcbiAgICAvLyAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gfSk7XHJcbn07XHJcbiJdfQ==
