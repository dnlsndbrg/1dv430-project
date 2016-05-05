function Animation(data) {
    this.name = data.name;
    this.originalSx = data.sx;
    this.originalSy = data.sy;
    this.sx = data.sx;
    this.sy = data.sy;
    this.w = data.w;
    this.h = data.h;
    this.frames = data.frames;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.animationSpeed = 0.2; // frames per second

    this.playOnce = data.playOnce;
}

Animation.prototype.update = function(dt) {
    this.frameTimer += dt;

    if (this.frameTimer > this.animationSpeed) {
        this.currentFrame += 1;
        this.frameTimer = 0;
    }

    if (this.currentFrame >= this.frames) {
        this.currentFrame = 0;
    }

    this.sx = this.currentAnimation.sx + this.currentAnimation.w * this.currentAnimation.currentFrame;
};

module.exports = Animation;
