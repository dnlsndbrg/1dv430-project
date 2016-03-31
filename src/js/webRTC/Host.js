module.exports = function Host(){
    this.peers = {};
    this.conns = {};

    this.connect = function(peers){
        console.log("connect", peers);
        peers.forEach(function(peerID) {
            // create a new peer
            var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
            // and once it's opened, connect with the remote peer
            peer.on("open", function() {
                console.log("connect with", peerID);
                var conn =  peer.connect(peerID);
                window.game.network.host.peers[peerID] = peer;
                window.game.network.host.conns[peerID] = conn;
            });
        });
    };
};

    //
    // network.socket.emit("hostStart", {gameID: this.game.gameID});
    //
    // /**
    //  * A user has joined. establish a new peer connection with it
    // */
    // network.socket.on("join", function(data) {
    //     // a peer wants to join. Create a new Peer and connect them
    //     var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //
    //     peer.on("open", function(id) {
    //         var conn =  peer.connect(data.peerID);
    //         this.peers[id] = peer;
    //         this.conns[data.peerID] = conn;
    //
    //         console.log("SADLASDASDAS", id, peer, conn);
    //         var newPlayer = window.game.addPlayer({id: conn.peer});
    //         this.broadcast({ event: "playerJoined", playerData: JSON.stringify(newPlayer) });
    //
    //
    //
    //
    //         //receiving data from a client
    //         conn.on("data", function(data) {
    //             console.log("=====\nHOST - data from client\n", data,"\n=====");
    //             if (data.event === "ping"){ // answer the ping
    //                 conn.send({ event: "pong", timestamp: data.timestamp });
    //             }
    //             if(data.event === "pong") {
    //                 var ping = Date.now() - data.timestamp;
    //                 window.game.network.host.peers[conn.peer].ping = ping;
    //             }
    //
    //         });
    //
    //         //this.game.ui.updateClientList(this.peers);
    //         // conn.on("close", function() {
    //         //     // a peer has disconnected
    //         //     console.log("disconnected!", conn, "PEER", peer);
    //         //     delete this.peers[conn.peer];
    //         //     delete this.conns[conn.peer];
    //         //     this.game.ui.updateClientList(this.peers);
    //         // }.bind(this));
    //         //
    //     }.bind(this));
    //
    // }.bind(this));
    //
    // this.broadcast = function(data) {
    //     console.log("Send", data);
    //     for (var conn in this.conns){
    //         this.conns[conn].send(data);
    //     }
    // };
    //
    // // just send data to a specific client
    // this.emit = function(data) {
    //     this.conns[data.clientID].send(data);
    // };
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // document.querySelector("#sendTest").addEventListener("click", function() {
    //     this.send("asdasdasdasdas");
    // }.bind(this));
