var Ui = require("./Ui");
var Network = require("./WebRTC");
var Circle = require("./Circle"); // test entity

function Game() {
    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");

    this.gameID = document.querySelector("#gameID").textContent;

    this.ui = new Ui(this);
    this.network = new Network(this);

    this.entitites = []; // game entities

    var last = 0; // time variable
    var dt; //delta time

    this.start = function(){
        this.entitites.push(new Circle());
        this.loop();
    };

    /**
     * Game loop
     */
    this.loop = function(timestamp){
        requestAnimationFrame(this.loop.bind(this)); // queue up next loop
        dt = timestamp - last; // time elapsed in ms since last loop
        last = timestamp;
        this.update(dt);
        this.render();
    };

    /**
     * Update entities
     */
    this.update = function(dt){
        this.entitites.forEach(function(entity) {
            entity.update(dt);
        });
    };

    /**
     * Rendering
     */
    this.render = function(){
        this.entitites.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));
    };
}

module.exports = Game;
