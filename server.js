import express from "express";
import bodyParser from "body-parser";
import path from "path";
import http from "http";
import socket_io from "socket.io";
import { init } from "./src/io";

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();
const server = http.createServer(app);
const io = socket_io(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

init(io);

server.listen(port, () => console.log(`Listening on port ${port}`));
