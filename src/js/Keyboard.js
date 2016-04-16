function Keyboard(player){
    this.player = player;

    this.keys = {
        w: false,
        s: false,
        a: false,
        d: false
    };

    this.lastState = _.clone(this.keys);

    this.keyDownHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (this.keys.w !== true){
                    console.log("AAASDOKASODKASODKAOSKDOASK");
                    this.keys.w = true;
                }
                break;
            case 83: // S
                console.log("S");
        }
    };

    this.keyUpHandler = function(e){
        switch(e.keyCode) {
            case 87: // W
                if (this.keys.w === true){
                    this.keys.w = false;
                }
                break;
            case 83: // S
                console.log("S");
        }
    };

    document.addEventListener("keydown",this.keyDownHandler.bind(this), false);
    document.addEventListener("keyup",this.keyUpHandler.bind(this), false);
}



module.exports = Keyboard;
