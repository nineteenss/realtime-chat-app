import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

class ChatServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
            },
        });

        this.setupMiddleware();
        this.setupSocketEvents();
        this.connectDatabase();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("join-channel", (channelId) => {
                socket.join(channelId);
                console.log(`User ${socket.id} joined channel ${channelId}`);
            });

            socket.on("leave-channel", (channelId) => {
                socket.leave(channelId);
                console.log(`User ${socket.id} left channel ${channelId}`);
            });

            socket.on("send-message", (data) => {
                this.io.to(data.channelId).emit("receive-message", data);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });
    }

    async connectDatabase() {
        try {
            await mongoose.connect("mongodb://localhost:27017/rt-chat-app");
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Database connection error:", error);
        }
    }

    start(port) {
        this.server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}

const chatServer = new ChatServer();
chatServer.start(4000);
