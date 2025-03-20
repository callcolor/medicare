import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import responseCache from "./src/utilities/responseCache";
import { MINUTES } from "./src/utilities/constants";
import findDrugs from "./src/routes/findDrugs";
import findPrescriber from "./src/routes/findPrescriber";

const PORT = 3030;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.text());
app.use(express.json());

// app.get("/", index);

app.get("/drugs", responseCache(5 * MINUTES), findDrugs);
app.get("/prescribers", responseCache(5 * MINUTES), findPrescriber);

io.on("connection", (socket) => {
  console.log("Incoming socket connection!");
  socket.on("message", (data) => {});
});

const main = async () => {
  server.listen(PORT);
  console.log(`Listening on port ${PORT}.`);
};

main();
