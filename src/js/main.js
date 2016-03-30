var Game = require("./Game.js");

document.addEventListener("DOMContentLoaded", function() {
    window.game = new Game();
    window.game.start();
});
