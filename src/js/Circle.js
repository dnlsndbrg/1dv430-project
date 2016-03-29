function Circle() {
    this.x = 10;
    this.y = 10;
    this.radius = 10;
    this.update = function(){

    };

    this.update= function(dt){

    };

    this.render = function(canvas, ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.closePath();
        ctx.fill();
    };
}

module.exports = Circle;
