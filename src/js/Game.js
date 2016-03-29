var Ui = require("./Ui");
var Network = require("./webRTC");
var Circle = require("./Circle");
function Game() {
    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ui = new Ui(this);
    this.network = new Network(this);

    this.entitites = [];

    var last = 0;
    var dt;


    this.start = function(){
        this.entitites.push(new Circle());
        this.loop();
    };

    this.loop = function(timestamp){
        requestAnimationFrame(this.loop.bind(this)); // queue up next loop

        dt = timestamp - last; // time elapsed in ms since last loop
        last = timestamp;
        this.update(dt);
        this.render();
    };

    this.update = function(dt){
        this.entitites.forEach(function(entity) {
            entity.update(dt);
        });
    };

    this.render = function(){
        this.entitites.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));
    };

    //window.requestAnimationFrame(this.loop);

}

module.exports = Game;
