module.exports = function(game){
    this.game = game;
    this.socket = io();
    this.peers = {};
    this.conns = {};
    this.gameID = document.querySelector("#gameID").textContent;

    this.socket.emit("hostStart", {gameID: gameID});

    this.socket.on("join", function(data) {
        // a peer wants to join. Create a new Peer and connect them
        this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
        this.peer.on("open", function(id) {
            this.conn = this.peer.connect(data.peerID);
            console.log(id, data.peerID);
            this.peers[id] = this.peer;
            this.conns[data.peerID] = this.conn;



            this.game.ui.updateClientList(this.peers);

            this.conn.on("close", function() {
                // a peer has disconnected
                console.log("disconnected!", this.conn, "PEER", this.peer);
                delete this.peers[this.conn.peer];
                delete this.conns[this.conn.peer];
                this.game.ui.updateClientList();
            });
        });
    });
};
