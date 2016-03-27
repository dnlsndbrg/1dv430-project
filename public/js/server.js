document.addEventListener("DOMContentLoaded", function() {
    var socket = io();
    var peers = {};
    var conns = {};

    var serverID = document.querySelector("#serverID").textContent;
    var clientList = document.querySelector("#clients");

    socket.emit("serverStart", {serverID: serverID});

    socket.on("join", function(data) {
        // a peer wants to join. Create a new Peer and connect them

        var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
        peer.on("open", function(id) {
            var conn = peer.connect(data.peerID);
            peers[id] = peer;
            conns[data.peerID] = conn;

            //TODO: use handlebars
            var li = document.createElement("li");
            var content = document.createTextNode(data.peerID);
            li.appendChild(content);
            clientList.appendChild(li);
        });
    });




    // Test
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
