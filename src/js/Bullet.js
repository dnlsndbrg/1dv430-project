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
