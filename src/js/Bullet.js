var helpers = require("./helpers");
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

    var line = {
        start: {x: this.originX, y: this.originY},
        end: {x: this.x, y: this.y}
    };

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

    this.ctx.stroke();

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(this.length, this.length, 1, 1 );


    this.ctx.restore(); // restore original states (no rotation etc)
};

module.exports = Bullet;
