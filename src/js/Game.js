var Ui = require("./Ui");
var Network = require("./webRTC/WebRTC");
var Player = require("./Player");
var KeyboardControls = require("./KeyboardControls");

function Game() {
    this.width = 480;
    this.height = 640;

    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px serif";

    this.gameID = window.location.pathname.split("/")[2];

    this.ui = new Ui(this);
    this.network = new Network();
    //this.controls = new KeyboardControls();

    this.entities = []; // game entities

    var last = 0; // time variable
    var dt; //delta time

    this.start = function(){
        this.loop();
    };

    /**
     * Game loop
     */
    this.loop = function(timestamp){
        requestAnimationFrame(this.loop.bind(this)); // queue up next loop
        dt = timestamp - last; // time elapsed in ms since last loop
        last = timestamp;
        //this.controls.handleInput();
        this.update(dt);
        this.render();
    };

    /**
     * Update
     */
    this.update = function(dt){
        // calculate fps
        this.fps = Math.round(1000 / dt);

        // Update entities
        this.entities.forEach(function(entity) {
            entity.update(dt);
        });
    };

    /**
     * Rendering
     */
    this.render = function(){
        // clear screen
        this.ctx.clearRect(0, 0, this.width, this.height);

        // render all entities
        this.entities.forEach(function(entity) {
            entity.render(this.canvas, this.ctx);
        }.bind(this));

        // render fps and ping
        this.ctx.fillStyle = "black";
        this.ctx.fillText("FPS:  " + this.fps, 10, 20);
        this.ctx.fillText("PING: " + this.network.ping, 10, 42);
    };
}

Game.prototype.addPlayer = function(id){
    var newPlayer = new Player(id);
    this.entities.push(newPlayer);
    return newPlayer;
};

module.exports = Game;
