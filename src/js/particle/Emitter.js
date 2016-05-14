//var Particle = require("./Particle");
var Blood = require("./Blood");

function Emitter(data) {
    this.x = data.x;
    this.y = data.y;
    this.type = data.type;
    this.particles = [];
    this.emitSpeed = data.emitSpeed; // s
    this.emitTimer = 0;
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
    if (this.type === "Blood") this.particles.push(new Blood(data));
};

Emitter.prototype.update = function(dt, index) {
    // update all particles
    for (var i = 0; i < this.particles.length; i += 1) {
        this.particles[i].update(dt);
    }

    // update emitter lifetime (if it has a lifetime) remove emitter if its time has run out and it has no remaining particles
    if (this.lifeTime) {
        this.lifeTimer += dt;
        if (this.lifeTimer > this.lifeTime) {
            if (this.particles.length === 0) this.destroy(index);
            return;
        }
    }

    // emit new particles
    this.emitTimer += dt;
    if (this.emitTimer > this.emitSpeed) {
        this.emit();
        this.emitTimer = 0;
    }
};

Emitter.prototype.render = function() {

    // render all particles
    for (var i = 0; i < this.particles.length; i += 1) {
        this.particles[i].render();
    }
};

Emitter.prototype.destroy = function(index) {
    window.game.entities.splice(index, 1);
};

module.exports = Emitter;
