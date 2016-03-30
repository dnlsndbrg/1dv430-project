module.exports = function Client(network){
    this.game = network.game;
    this.peer = new Peer({key: "gpy5i4hjyjr4fgvi"});

    this.peer.on("open", function(id) {
        // ive got my peerID and hostID, lets send it to the server to join
        this.game.network.socket.emit("join", {peerID: id, gameID: this.game.gameID});
    }.bind(this));

    this.peer.on("connection", function(conn) {
        // the host has started the connection
        window.game.network.client.conn = conn;
        console.log("connection from server", conn);

        //Listen for data events from the host
        conn.on("data", function(data) {
            if (data.event === "ping"){ // host sent a ping, answer it
                conn.send({ event: "pong", timestamp: data.timestamp });
            }

            if(data.event === "pong") { // we've received a pong from the host, calucate pingtime
                var ping = Date.now() - data.timestamp;
                window.game.network.ping = ping;
            }
        });





        // ping test
        window.game.network.client.pingInterval = setInterval(function(){
            console.log(window.game);
            window.game.network.client.conn.send({
                event: "ping",
                timestamp: Date.now()
            });
        }, 2000);

    });




};
