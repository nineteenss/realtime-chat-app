//
//    server.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/User";
import { error } from "console";

dotenv.config();

// Main server class that handles Express, Socket.IO and MongoDB setup
class ChatServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        // Initialize Socket.IO with CORS settings for frontend connection
        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
            },
        });

        this.setupMiddleware();
        this.setupSocketEvents();
        this.connectDatabase();
        this.setupRoutes();
    }

    // Configure basic Express middleware
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupSocketEvents() {
        // Handle new client connections
        this.io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            // Handle channel join requests
            socket.on("join-channel", (channelId) => {
                socket.join(channelId);
                console.log(`User ${socket.id} joined channel ${channelId}`);
            });

            // Handle channel leave requests
            socket.on("leave-channel", (channelId) => {
                socket.leave(channelId);
                console.log(`User ${socket.id} left channel ${channelId}`);
            });

            // Sending message to a specific channel
            socket.on("send-message", (data) => {
                this.io.to(data.channelId).emit("receive-message", data);
            });

            // Clean up on client disconnect
            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });
    }

    // Establish MongoDB connection
    async connectDatabase() {
        try {
            await mongoose.connect(process.env.MONGODB_URI); // Replaced URI with dotenv constant
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Database connection error:", error);
        }
    }

    setupRoutes() {
        // Registration
        this.app.post("/api/register", async (req, res) => {
            try {
                const { username, password } = req.body;
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = new User({
                    username,
                    password: hashedPassword,
                });

                await user.save();

                const token = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "24h",
                    }
                );

                res.status(201).json({
                    token,
                    user: { id: user._id, username },
                });
            } catch {
                res.status(400).json({ error: error.message });
            }
        });

        this.app.post("/api/login", async (req, res) => {
            try {
                const { username, password } = req.body;
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(401).json({ error: "User not found" });
                }

                const validPassword = await bcrypt.compare(
                    password,
                    user.password
                );
                if (!validPassword) {
                    return res.status(401).json({ error: "Invalid password" });
                }

                const token = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "24h",
                    }
                );

                res.json({ token, user: { id: user._id, username } });
            } catch {
                res.status(400).json({ error: error.message });
            }
        });
    }

    // Start the server on a specified port
    start(port) {
        this.server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}

// Create and start server instance
const chatServer = new ChatServer();
chatServer.start(4000);
