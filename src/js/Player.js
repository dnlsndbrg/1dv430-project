var helpers = require("./helpers");
var Mouse = require("./Mouse");
var NetworkControls = require("./NetworkControls");

function Player(playerData) {
    this.id = playerData.id;
    this.radius = playerData.radius || 20; // circle radius
    this.x = playerData.x || (Math.floor(Math.random() * (window.game.width - this.radius)) + this.radius / 2);
    this.y = playerData.y || (Math.floor(Math.random() * (window.game.height - this.radius)) + this.radius / 2);
    this.direction = playerData.direction || Math.floor(Math.random() * 360) + 1;
    this.viewingAngle = playerData.viewingAngle || 45;
    this.speed = playerData.speed || 10;

    this.actions = [];
    this.lastState = this.getState();

    //is this me or another player
    this.controls = (playerData.id === window.game.network.client.peer.id) ? new Mouse(this) : new NetworkControls();

    console.log("Spawning player at", this.x, this.y);
}

Player.prototype.update = function(dt){

    // go through all the queued up actions and perform them
    for (var i = 0; i < this.actions.length; i += 1){
        for (var j = 0; j < this.actions[i].data.length; j += 1){
                    var action = this.actions[i].data[j];
                    this.performAction(action);
        }
    }

    this.actions = [];
};

Player.prototype.change = function(change){
    // changes from the host
    console.log("update", this, "with ", change);

    delete change.playerID;
    for (var key in change) {
        this[key] = change[key];
    }
};

Player.prototype.performAction = function(action){
    switch(action.action){
        case "turnTowards":
            this.turnTowards(action.data.x, action.data.y);
            break;
    }
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

Player.prototype.turnTowards = function(x,y) {
    console.log("turn towards",x,y);
    console.log("im at", this.x, this.y, "and looking in direction", this.direction);

    var xDiff = x - this.x;
    var yDiff = y - this.y;
    this.direction = Math.atan2(yDiff, xDiff) * (180 / Math.PI);

    console.log(xDiff, yDiff, this.direction);
};

Player.prototype.getState = function() {
    return {
        x: this.x,
        y: this.y,
        id: this.id,
        radius: this.radius,
        direction: this.direction,
        viewingAngle: this.viewingAngle,
        speed: this.speed
    };
};

module.exports = Player;
