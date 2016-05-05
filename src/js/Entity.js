function Entity(data) {
    this.x = data.x;
    this.y = data.y;
    this.sx = data.sx;
    this.sy = data.sy;
    this.sw = data.sw;
    this.sh = data.sh;
    this.dw = data.dw;
    this.dh = data.dh;
    this.direction = data.direction;
}

Entity.prototype.update = function(dt) {

};

Entity.prototype.render = function(canvas, ctx) {
    ctx.save(); // save current state
    ctx.translate(this.x - window.game.camera.x, this.y - window.game.camera.y); // change origin
    ctx.rotate(this.direction); // rotate

    ctx.drawImage(window.game.spritesheet, this.sx, this.sy, this.sw, this.sh, -(this.sw / 2), -(this.sh / 2), this.dw, this.dh);

    ctx.restore(); // restore original states (no rotation etc)
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
