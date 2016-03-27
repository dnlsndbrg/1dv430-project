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

var servers = {};

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
app.get("/host/:serverID", (req, res) => {
    //TODO: verify input

    res.render("server", {serverID: req.params.serverID});
});

app.get("/:serverID", (req, res) => {
    //TODO: verify input

    if (!servers[req.params.serverID]) {
        return res.send("server doesn't exist");
    }

    res.render("client", {serverID: req.params.serverID});
});


// Socket.io -------------------------------------------------------------------

io.on("connection", (socket) => {
    console.log("socket connection");

    socket.on("serverStart", (data) => {
        console.log("server started", data);
        // a server has started
        //TODO: validate input
        servers[data.serverID] = socket;
    });

    socket.on("join", (data) => {
        // a client wants to join data.serverID
        // emit the clients peerID to the server so that it can start a webRTC connection
        servers[data.serverID].emit("join", {peerID: data.peerID});
    });

});
