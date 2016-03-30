var helpers = require("./helpers");

function player() {
    this.x = 50;
    this.y = 50;
    this.radius = 20;
    this.direction = 0;
    this.viewingAngle = 45;
    this.speed = 10;
    this.update = function(){

    };

    this.update= function(dt){

    };

    this.render = function(canvas, ctx){
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
}

module.exports = player;
