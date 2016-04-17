function Keyboard(player){
    this.player = player;

    this.lastState = _.clone(player.keys);

    this.keyDownHandler = function(e){
        console.log(e.keyCode);
        switch(e.keyCode) {
            case 87: // W
                if (player.keys.w !== true)  player.keys.w = true;
                break;
            case 83: // S
            if (player.keys.s !== true)  player.keys.s = true;
            break;
            case 65: // A
            if (player.keys.a !== true)  player.keys.a = true;
            break;
            case 68: // A
            if (player.keys.d !== true)  player.keys.d = true;
            break;
        }
    };

    this.keyUpHandler = function(e){

        switch(e.keyCode) {
            case 87: // W
                if (player.keys.w === true) player.keys.w = false;
                break;
            case 83: // S
            if (player.keys.s === true) player.keys.s = false;
            break;
            case 65: // A
            if (player.keys.a === true)  player.keys.a = false;
            break;
            case 68: // A
            if (player.keys.d === true)  player.keys.d = false;
            break;
        }
    };

    document.addEventListener("keydown",this.keyDownHandler.bind(this), false);
    document.addEventListener("keyup",this.keyUpHandler.bind(this), false);
}



module.exports = Keyboard;
