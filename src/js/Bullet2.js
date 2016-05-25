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
