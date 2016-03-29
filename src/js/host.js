


document.addEventListener("DOMContentLoaded", function() {
    var socket = io();
    var peers = {};
    var conns = {};
    var ui = new Ui();
    var gameID = document.querySelector("#gameID").textContent;

    socket.emit("hostStart", {gameID: gameID});

    socket.on("join", function(data) {
        // a peer wants to join. Create a new Peer and connect them
        var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
        peer.on("open", function(id) {
            var conn = peer.connect(data.peerID);
            console.log(id, data.peerID);
            peers[id] = peer;
            conns[data.peerID] = conn;

            ui.updateClientList(peers);

            conn.on("close", function() {
                // a peer has disconnected
                console.log("disconnected!", conn, "PEER", peer);
                delete peers[conn.peer];
                delete conns[conn.peer];
                ui.updateClientList();
            });
        });

    });




    // Test. send to all peers
    document.querySelector("#sendTest").addEventListener("click", function() {
        for (var conn in conns){
            console.log(conn, conns[conn]);
            conns[conn].send("Hello!");
        }
    });





    // socket.on("peerJoined", function(data) {
    //     // a peer has joined the server. Create a new peer to it and save it in peers
    //     var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //
    //     peer.on("open", function(id) {
    //         var conn = peer.connect(data.peerID);
    //     });
    // });



    //
    // var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    //
    // peer.on("open", function(id) {
    //   console.log("My peer ID is: " + id);
    //
    //   document.querySelector("#serverID").textContent = id;
    //
    //   setTimeout(function() {
    //       // to wait for socket.io to establish TODO: fix this
    //       console.log("emitting peer ID");
    //       socket.emit("serverStart", {peerID: id});
    //   },1000);
    // });
    //
    //
    // peer.on("connection", function(conn) {
    //     console.log("CONNECTION", conn);
    //
    //     conn.on("data", function(data){
    //         console.log("DATA RECEIVED", data);
    //     });
    // });
});
