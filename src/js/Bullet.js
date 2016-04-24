var helpers = require("./helpers");

function Bullet(data) {
    this.x = data.x;
    this.y = data.y;
    this.length = 10; // trail length
    this.direction = data.direction;
    this.speed = 400;
}

Bullet.prototype.update = function(dt, index) {

    var distance = this.speed * dt;

    this.x = this.x + Math.cos(this.direction) * distance;
    this.y = this.y + Math.sin(this.direction) * distance;
    //

    // if off screen, remove it
    if (this.x < 0 || this.x > window.game.width || this.y < 0 || this.y > window.game.height)
        window.game.entities.splice(index, 1);

};

Bullet.prototype.render = function(canvas, ctx){

    ctx.save(); // save current state
    ctx.translate(this.x, this.y); // change origin
    ctx.rotate(helpers.toRadians(this.direction - 45 )); // rotate

    // // linear gradient from start to end of line
    var grad= ctx.createLinearGradient(0, 0, 0, this.length);
    grad.addColorStop(0, "red");
    grad.addColorStop(1, "rgba(255,165,0,0)");
    ctx.strokeStyle = grad;

    ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.length, this.length);
      ctx.stroke();


    // ctx.lineWidth = 1;

    //
    // ctx.beginPath();
    // ctx.moveTo(0,0);
    // ctx.lineTo(0,this.length);

    ctx.stroke();


    ctx.restore(); // restore original states (no rotation etc)

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
