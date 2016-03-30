var helpers = require("./helpers");

function Player(playerData) {
    this.id = playerData.id;
    this.x = playerData.x || Math.floor(Math.random() * window.game.width) + 1;
    this.y = playerData.y || Math.floor(Math.random() * window.game.height) + 1;
    this.radius = playerData.radius || 20;
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 10;
}

Player.prototype.update = function(dt){

};

Player.prototype.render = function(canvas, ctx){
    //draw circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, helpers.toRadians(360), false);
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();

    // draw viewing direction
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y,this.radius, helpers.toRadians(this.direction - this.viewingAngle), helpers.toRadians(this.direction + this.viewingAngle));
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
};

module.exports = Player;
