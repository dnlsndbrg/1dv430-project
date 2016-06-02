var Particle = require("./Particle");

class Flash extends Particle {
    constructor(data) {
        data.color = "#ffe600";
        data.lifeTime = 0.05;
        data.container = window.game.particles;
        super(data);
    }
}

Flash.prototype.update = function(dt, index) {
    this.lifeTime -= dt;
    if (this.lifeTime < 0) this.destroy(index);
};

module.exports = Flash;
