function Mouse(player){
    this.player = player;

    this.click = function(e){
        this.player.turnTowards(e.offsetX, e.offsetY);
        window.game.network.client.actions.push({
            action: "turnTowards",
            data: {
                x: e.offsetX,
                y: e.offsetY
            }
        });
    };

    this.mousemove = function(e) {
        this.player.turnTowards(e.offsetX, e.offsetY);
    };
    //
    // this.keyUpHandler = function(e){
    //     switch(e.keyCode) {
    //         case 87: // W
    //             if (this.keys.w === true){
    //                 window.game.network.client.conn.send( {event: "keyUp", key: 87} );
    //                 this.keys.w = false;
    //             }
    //             break;
    //         case 83: // S
    //             console.log("S");
    //     }
    // };

    window.game.canvas.addEventListener("mousemove", this.mousemove.bind(this));
    window.game.canvas.addEventListener("click",this.click.bind(this));
    //window.game.canvas.addEventListener("keyup",this.keyUpHandler.bind(this), false);
}



module.exports = Mouse;
