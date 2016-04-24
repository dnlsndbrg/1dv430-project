function Mouse(player){
    this.player = player;

    this.click = function(e){
        this.player.actions.push({ // add to the actions queue
            action: "shoot",
            data: {
                x: e.offsetX,
                y: e.offsetY
            }
        });
        //window.game.network.client.actions.push(action); // tell the host of the action
    };

    this.mousemove = function(e) {
        this.player.mouseX = e.offsetX;
        this.player.mouseY = e.offsetY;
    };

    window.game.canvas.addEventListener("mousemove", this.mousemove.bind(this));
    window.game.canvas.addEventListener("click",this.click.bind(this));
}



module.exports = Mouse;
