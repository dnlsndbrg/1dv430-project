module.exports = function Host(network){
    this.game = network.game;
    //this.socket = io();
    this.peers = {};
    this.conns = {};
    //this.gameID = document.querySelector("#gameID").textContent;

    network.socket.emit("hostStart", {gameID: this.game.gameID});

    /**
     * A user has joined. establish a new peer connection with it
    */
    network.socket.on("join", function(data) {
        // a peer wants to join. Create a new Peer and connect them
        var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
        peer.on("open", function(id) {
            var conn =  peer.connect(data.peerID);
            this.peers[id] = peer;
            this.conns[data.peerID] = conn;

            this.send("new user joined! id:" + conn);

            //this.game.ui.updateClientList(this.peers);

            // conn.on("close", function() {
            //     // a peer has disconnected
            //     console.log("disconnected!", conn, "PEER", peer);
            //     delete this.peers[conn.peer];
            //     delete this.conns[conn.peer];
            //     this.game.ui.updateClientList(this.peers);
            // }.bind(this));
        }.bind(this));
    }.bind(this));

    this.send = function(data) {
        console.log("Send", data);
        for (var conn in this.conns){
            this.conns[conn].send(data);
        }
    };
};
