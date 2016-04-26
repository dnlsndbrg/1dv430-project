module.exports = function Ui(game){
    this.clientList = document.querySelector("#players");
    this.game = game;

    this.updateClientList = function(players) {
        var myID = window.game.network.client.peer.id;
        this.clientList.innerHTML = "";
        for (var id in players){
            var li = document.createElement("li");
            var content = document.createTextNode(id + " " + players[id].ping);

            if (id === myID) {
                li.classList.add("me");
            }
            li.appendChild(content);
            this.clientList.appendChild(li);
        }
    };

    this.renderDebug = function() {
        var player = window.game.players[window.game.network.client.peer.id];
        window.game.ctx.fillStyle = "black";
        window.game.ctx.fillText("FPS:  " + window.game.fps, 5, 20);
        window.game.ctx.fillText("PING: " + window.game.network.ping, 5, 42);
        window.game.ctx.fillText("PLAYER:  " + Math.floor(player.x) + ", " + Math.floor(player.y), 5, 64);
        window.game.ctx.fillText("CAMERA: " + Math.floor(window.game.camera.x) + ", " + Math.floor(window.game.camera.y), 5, 86);
        window.game.ctx.fillText("MOUSE: " + Math.floor(player.mouseX) + ", " + Math.floor(player.mouseY), 5, 108);
        window.game.ctx.fillText("DIR: " + player.direction.toFixed(2), 5, 130);
    };
};
