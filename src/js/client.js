module.exports = function Client(network){
    this.game = network.game;

    //this.socket = io();
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //this.gameID = document.querySelector("#gameID").textContent;

    this.peer.on("open", function(id) {
        // ive got my peerID and hostID, lets send it to the server to join
        this.game.network.socket.emit("join", {peerID: id, gameID: this.game.gameID});
    }.bind(this));

    this.peer.on("connection", function(conn) {
        // the server has started the connection
        console.log("connection from server", conn);

        conn.on("data", function(data) {
            console.log("RECEIVED!", data);
        });
    });
};
