// server

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

// Heroku
app.set("port", (process.env.PORT || 8080));

app.use(express.static(__dirname + "/public"));

server.listen(app.get("port"), function() {
  console.log("Servidor corriendo en", app.get("port"));
});

//Hasta aquí Heroku

// Chat

var numUsers = 0;

io.on("connection", function(socket) {
	var addedUser = false;

	socket.on("new-message", function(data) {
		socket.broadcast.emit("new-message", {
			username: socket.username,
			message: " " + data
		});
	});

	socket.on("add-user", function(username) {
		if(addedUser) return
		socket.username = username;
		++numUsers;
		addedUser = true;
		socket.emit("login", {
			numUsers: numUsers
		});

		socket.broadcast.emit("user-joined", {
			username: socket.username,
			numUsers: socket.username
		});
	});

	socket.on("typing", function () {
    	socket.broadcast.emit("typing", {
      		username: socket.username
    	});
  	});

	socket.on("stop-typing", function() {
		socket.broadcast.emit("stop-typing", {
			username: socket.username
		});
	});

	socket.on("disconnect", function() {
		if(addedUser) {
			--numUsers;
			socket.broadcast.emit("user-left", {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});
});