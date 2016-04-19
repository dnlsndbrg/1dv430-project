module.exports = function Host(){
    this.conns = {};
    this.actions = {}; // here we will store all the actions received from clients
    this.lastPlayersState = [];
    this.diff = null;

    this.connect = function(peers){
        console.log("connect", peers);
        this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

        this.peer.on("open", function() {

            // create the hosts player object if it doesnt already exists
            if (!(window.game.network.client.peer.id in window.game.players)) {
                window.game.addPlayer({id: window.game.network.client.peer.id});
            }

            // send a ping every 2 seconds, to track ping time
            setInterval(function(){
                window.game.network.host.broadcast({event: "ping", timestamp: Date.now()});
            },2000);

            peers.forEach(function(peerID) {
                //connect with each remote peer
                var conn =  window.game.network.host.peer.connect(peerID);
                console.log("hostID:", window.game.network.host.peer.id, " connect with", peerID);
                //window.game.network.host.peers[peerID] = peer;
                window.game.network.host.conns[peerID] = conn;

                // create the player
                var newPlayer = window.game.addPlayer({id: conn.peer});

                conn.on("open", function() {
                    // send new player data to everyone
                    if (newPlayer) {
                        window.game.network.host.broadcast({ event: "playerJoined", playerData: newPlayer.getState() });
                        // send the new player the full game state
                        window.game.network.host.emit( {clientID: conn.peer, event: "gameState", gameState: window.game.getGameState()} );
                    }
                });

                conn.on("close", function() {
                    delete window.game.network.host.conns[conn.peer];
                    window.game.network.host.broadcast({ event: "playerLeft", id: conn.peer});
                    window.game.removePlayer({id: conn.peer});
                });

                conn.on("error", function(err) {
                    console.log("ERROR EVENT", err);
                });

                conn.on("data", function(data) {
                    switch(data.event){
                        case "ping":
                           conn.send({ event: "pong", timestamp: data.timestamp }); // answer the ping
                           break;

                       case "pong": // we've received a pong from the client, calucate pingtime
                           var ping = Date.now() - data.timestamp;
                           window.game.players[conn.peer].ping = ping;
                           break;

                       case "actions": // receiving actions from a player
                           console.log("actions received from", conn.peer, data);
                           window.game.players[conn.peer].actions.push(data);
                           break;

                       case "keys": // receiving actions from a player
                               console.log("keys received from", conn.peer, data);
                               window.game.players[conn.peer].keys = data.keys; //TODO: verify input (check that it is the key object with true/false values)
                               break;
                    }
                });
            });
        });
    };

    this.broadcast = function(data) {
        for (var conn in this.conns){
            this.conns[conn].send(data);
        }
    };

    // just send data to a specific client
    this.emit = function(data) {
        console.log("EMIT!", data);
        this.conns[data.clientID].send(data);
    };


    document.querySelector("#btnTest").addEventListener("click", function(){
        window.game.network.host.broadcast({event: "test", message: "asdasdas"});
    });

    this.update = function()
    {
        // get the difference since last time

        var currentPlayersState = [];
        var changes = [];

        for (var key in window.game.players) {
            var lastState = window.game.players[key].lastState;
            var newState = window.game.players[key].getState();

            // compare this players new state with it's last state
            var change = _.omit(newState, function(v,k) { return lastState[k] === v; });
            if (!_.isEmpty(change)) {
                // there's been changes
                change.playerID = window.game.players[key].id;
                changes.push(change);
            }

            window.game.players[key].lastState = newState;
        }


        //
        // for(var i = 0; i < this.lastPlayersState.length; i += 1){
        //
        //     // get the players last and new state
        //     var id = this.lastPlayersState[i].id;
        //     var lastState = this.lastPlayersState[i];
        //     var newState = window.game.players[id].getState();
        //
        //
        //
        //     // compare this players new state with it's last state
        //     var change = _.omit(newState, function(v,k) { return lastState[k] === v; });
        //     if (!_.isEmpty(change)) {
        //         // there's been changes
        //         console.log("changes!!!!!!!!!!!!!!!!!!");
        //         change.playerID = id;
        //         changes.push(change);
        //     }
        //
        //     currentPlayersState.push(newState);
        // }
        //
        // this.lastPlayersState = currentPlayersState;
        // if (this.lastPlayersState.length === 0) this.lastPlayersState = window.game.getPlayersState(); // if newly started game..


        // if there are changes
        if (changes.length > 0){
            this.broadcast({
                event: "changes",
                changes: changes
            });
        }

        //console.log(currentPlayersState);
        //
        // compare current state to earlier getGameState
        // send difference to players

        // window.game.players.forEach(function(player) {
        //
        // });

        // send actions to all clients
        // this.broadcast({
        //     event: "actions",
        //     actions:
        // })

    };
};















// // stress test
// setInterval(function(){
//     window.game.network.host.broadcast({
//         type: "test",
//         data: "asdasdas dasdsadas dasasdasd asdasd asdadsdqw23qwklp gklp"
//     });
// },16);
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
