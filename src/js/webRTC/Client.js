"use strict";
// var Player = require("./../Player");

function Client(){
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

    // Stress test
    this.testsReceived = 0;

    this.actions = []; //here we will store client actions before we send them to the host
    this.changes = []; // here we will store received changes from the host

    this.peer.on("open", function(id) {
        // ive got my peerID and gameID, lets send it to the server to join the host
        window.game.network.socket.emit("join", {peerID: id, gameID: window.game.gameID});
        console.log("my client peerID is ", id);
    });

    this.peer.on("connection", function(conn) {
        // the host has started the connection

        // close out any old connections
        if(Object.keys(this.connections).length > 1) {
            for (var connPeer in this.connections){
                if (connPeer !== conn.peer) {
                    this.connections[connPeer][0].close();
                    delete this.connections[connPeer];
                }
            }
        }
        // store it
        window.game.network.client.conn = conn;

        conn.on("data", function(data) {
            switch(data.event){
                case "playerJoined":
                    console.log("player joined", data);
                    window.game.addPlayer(data.playerData);
                    break;

                case "test": // stress testing
                    console.log("test!");
                    //window.game.network.client.testsReceived += 1;
                    break;

                case "gameState":
                    console.log("receiving game state", data.gameState.entities, data.gameState.players);
                    data.gameState.players.forEach(function(player){
                        window.game.addPlayer(player);
                    });
                    break;

                case "changes":
                    console.log("Hey there has been changes!", data);
                    window.game.network.client.changes.push(data.changes);
                    break;

                case "ping": // host sent a ping, answer it
                   conn.send({ event: "pong", timestamp: data.timestamp });
                   break;

               case "pong": // we've received a pong from the host, calucate pingtime
                   var ping = Date.now() - data.timestamp;
                   window.game.network.ping = ping;
                   break;
            }
        });


    });
}

Client.prototype.update = function()
{
    // check if my keystate has changed
    var myPlayer = window.game.players[this.peer.id];

     if (!_.isEqual(myPlayer.controls.keyboard.keys, myPlayer.controls.keyboard.lastState)) {
        // send keystate to host
     }

    myPlayer.controls.keyboard.lastState = _.clone(myPlayer.controls.keyboard.keys);


    if (this.actions.length > 0) {
        // send all performed actions to the host
        this.conn.send({
            event: "actions",
            data: this.actions
        });
        this.actions = []; // clear actions queue
    }

    // update with changes received from host
    for (var i = 0; i < this.changes.length; i += 1) {
        for (var j = 0; j < this.changes[i].length; j += 1)  {
            var change = this.changes[i][j];
            window.game.players[change.playerID].change(change);
        }
    }

    this.changes = [];

};

    //
    // this.peer.on("connection", function(conn) {
    //     // the host has started the connection
    //     window.game.network.client.conn = conn;
    //     console.log("connection from server", this.peer, conn);
    //
    //     //create the player
    //     //window.game.player = window.game.addPlayer(conn.peer);
    //
    //
    //     //Listen for data events from the host
    //     conn.on("data", function(data) {
    //         if (data.event === "ping"){ // host sent a ping, answer it
    //             conn.send({ event: "pong", timestamp: data.timestamp });
    //         }
    //
    //         if(data.event === "pong") { // we've received a pong from the host, calucate pingtime
    //             var ping = Date.now() - data.timestamp;
    //             window.game.network.ping = ping;
    //         }
    //     });
    //
    //
    //
    //
    //
    //     // ping test
    //     window.game.network.client.pingInterval = setInterval(function(){
    //         window.game.network.client.conn.send({
    //             event: "ping",
    //             timestamp: Date.now()
    //         });
    //     }, 2000);
    //
    // });

module.exports = Client;
