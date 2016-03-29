/**
 * @author Daniel Sundberg
 * @version 1.0.0
 */

"use strict";

let
    path        = require("path"),
    exphbs      = require("express-handlebars"),
    http        = require("http"),
    io          = require("socket.io"),
    express     = require("express");

let app     = express(),
    port    = process.env.PORT || 8000;

var games = {};

// Launch Application ----------------------------------------------------------

let server = http.createServer(app).listen(port, () => {
    console.log("Express is running on port %s", port);
});

io = io(server);


// Confifguration --------------------------------------------------------------

app.use(express.static(path.join(__dirname + "/public")));

app.engine("hbs", exphbs({
    extname: ".hbs"
}));

app.set("view engine", "hbs");


// Routes ----------------------------------------------------------------------
//
app.get("/play/:gameID", (req, res) => {
    //TODO: verify input

    // if this game name doesn't exist, host it. else join as a client
    if (!games[req.params.gameID]) {
        return res.render("game", {gameID: req.params.gameID});
    }
    res.render("game", {gameID: req.params.gameID});
});

// app.get("/:serverID", (req, res) => {
//     //TODO: verify input
//
//     if (!servers[req.params.serverID]) {
//         return res.send("server doesn't exist");
//     }
//
//     res.render("client", {serverID: req.params.serverID});
// });


// Socket.io -------------------------------------------------------------------

io.on("connection", (socket) => {
    console.log("socket connection");

    socket.on("hostStart", (data) => {
        //TODO: validate input
         // a server has started
        games[data.gameID] = {
            host: socket,
            peers: []
        };
        //hosts[data.hostID].host = socket;
        //hosts[data.hostID].peers = [];
        socket.join(data.gameID);
        games[data.gameID].peers.push(socket);
        socket.gameID = data.gameID;
    });

    socket.on("join", (data) => {
        // a client wants to join data.hostID
        // emit the clients peerID to the host so that it can start a webRTC connection
        games[data.gameID].host.emit("join", {peerID: data.peerID});
        games[data.gameID].peers.push(socket);
        socket.join(data.hostID);
        socket.gameID = data.gameID;
    });

});
