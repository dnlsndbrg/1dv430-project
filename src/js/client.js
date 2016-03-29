document.addEventListener("DOMContentLoaded", function() {

    var socket = io();
    var peer = new Peer({key: "gpy5i4hjyjr4fgvi"});
    var gameID = document.querySelector("#gameID").textContent;

    peer.on("open", function(id) {
        // ive got my peerID and hostID, lets send it to the server to join
        setTimeout(function() { // wait to make sure socket.io is established TODO: better solution plz
            console.log("emit a join", {peerID: id, gameID: gameID});
            socket.emit("join", {peerID: id, gameID: gameID});
        },500);
    });


    peer.on("connection", function(conn) {
        // the server has started the connection
        console.log("connection from server", conn);

        conn.on("data", function(data) {
            console.log("RECEIVED!", data);
        });
    });


    // socket.on("serverID", function(data) {
    //     //connect to webRTC serverID
    //     var conn = peer.connect(data.serverID);
    //
    //     conn.on("open", function() {
    //         console.log("CONN OPEN");
    //         conn.send("HELLO");
    //     });
    //
    //     conn.on("data", function(data){
    //         console.log("DATA RECEIVED", data);
    //     });
    // });
    //



    //
    // socket.on("peerID", function(data){
    //     console.log("Received peerID over socket.io", data.peerID);
    //     // connect to this peerID
    //     var conn = peer.connect(data.peerID);
    //
    //     conn.on("open", function() {
    //         console.log("CONN OPEN");
    //         conn.send("HELLO");
    //     });
    //
    //     conn.on("data", function(data){
    //         console.log("DATA RECEIVED", data);
    //     });
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
