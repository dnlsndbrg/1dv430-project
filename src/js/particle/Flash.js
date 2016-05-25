var Particle = require("./Particle");
var helpers = require("../helpers");

class Flash extends Particle {
    constructor(data) {
        //var rnd = Math.floor(Math.random() * 50);
        // var r = 150;
        // var g = 50;
        // var b = 50;

        data.color = "#ffe600";
        //data.lifeTime = 0.3;
        data.container = window.game.particles;
        super(data);

        this.lifeTime = 0.05;

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
