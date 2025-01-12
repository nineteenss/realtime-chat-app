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
import User from "./models/User.js";
import Channel from "./models/Channel.js";

dotenv.config();

// Main server class that handles Express, Socket.IO and MongoDB setup
class ChatServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);

        // CORS setup for Express
        this.app.use(
            cors({
                // Only for development purposes
                // In production replace with actual frontend URL
                origin: "*", // Allow access from any source
                methods: ["GET", "POST", "PUT", "DELETE"],
                allowedHeaders: ["Content-Type", "Authorization"],
            })
        );

        // Initialize Socket.IO with CORS settings for frontend connection
        this.io = new Server(this.server, {
            cors: {
                // Only for development purposes
                // In production replace with actual frontend URL
                origin: "*",
                // origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
            },
        });

        // Call setup methods
        this.setupMiddleware();
        this.setupSocketEvents();
        this.connectDatabase();
        this.setupRoutes();
    }

    // Configure basic Express middleware
    setupMiddleware() {
        // this.app.use(cors());
        this.app.use(express.json());
        // Error handling middleware
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                error: `Something went wrong: ${err.message}`,
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
            process.exit(1); // Exit process if database connection fails
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
            } catch (error) {
                console.errir("Registration error:", error);
                res.status(400).json({ error: error.message });
            }
        });
        // Login
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
            } catch (error) {
                console.error("Login error:", error);
                res.status(400).json({ error: error.message });
            }
        });
        // New channel
        this.app.post("/api/channels", async (req, res) => {
            try {
                const { name, creatorId } = req.body;
                const channel = new Channel({
                    name,
                    creator: creatorId,
                    members: [creatorId],
                });

                await channel.save();

                // Refresh user's channels list
                await User.findByIdAndUpdate(creatorId, {
                    $push: { channels: channel._id },
                });
                res.status(201).json(channel); // Send response
            } catch (error) {
                console.error("Channel creation error:", error);
                res.status(400).json({ error: error.message });
            }
        });
        // Delete channel
        this.app.delete("/api/channels/:channelId", async (req, res) => {
            try {
                const { channelId } = req.params;
                const { userId } = req.body;

                // Find the channel
                const channel = await Channel.findById(channelId);
                if (!channel) {
                    return res.status(404).json({ error: "Channel not found" });
                }

                // Check if the user is the channel creator
                if (channel.creator.toString() !== userId) {
                    return res.status(403).json({
                        error: "Only the creator can delete the channel",
                    });
                }

                // Delete the channel
                await Channel.findByIdAndDelete(channelId);

                // Remove the channel from all users channels list
                await User.updateMany(
                    { channels: channelId },
                    { $pull: { channels: channelId } }
                );

                res.json({ message: "Channel deleted successfully" });
            } catch (error) {
                console.error("Channel deletion error:", error);
                res.status(400).json({ error: error.message });
            }
        });
        // Get channels
        this.app.get("/api/channels", async (req, res) => {
            try {
                const channels = await Channel.find()
                    .populate("creator", "username")
                    .populate("members", "username");
                res.json(channels);
            } catch (error) {
                console.error("Get channels error:", error);
                res.status(400).json({ error: error.message });
            }
        });
        // Channel join
        this.app.post("/api/channels/:channelId/join", async (req, res) => {
            try {
                const { channelId } = req.params;
                const { userId } = req.body;

                const channel = await Channel.findByIdAndUpdate(
                    channelId,
                    { $addToSet: { members: userId } },
                    { new: true }
                );

                await User.findByIdAndUpdate(userId, {
                    $addToSet: { channels: channelId },
                });

                res.json(channel); // Fixed typo: res.join -> res.json
            } catch (error) {
                console.error("Channel join error:", error);
                res.status(400).json({ error: error.message });
            }
        });
        // Get messages for a channel
        this.app.get("/api/channels/:channelId/messages", async (req, res) => {
            try {
                const { channelId } = req.params;
                if (!channelId) {
                    return req
                        .status(400)
                        .json({ error: "Channel ID is required" });
                }
                const channel = await Channel.findById(channelId).populate(
                    "messages.sender",
                    "username"
                );
                res.json(channel.messages);
            } catch (error) {
                console.error(
                    "Unable to get messages for a selected channel",
                    error
                );
                res.status(400).json({ error: error.message });
            }
        });
        // Leave channel
        this.app.post("/api/channels/:channelId/leave", async (req, res) => {
            try {
                const { channelId } = req.params;
                const { userId } = req.body;

                const channel = await Channel.findByIdAndUpdate(
                    channelId,
                    { $pull: { members: userId } },
                    { new: true }
                );

                // Remove channel from user's list
                await User.findByIdAndUpdate(userId, {
                    $pull: { channels: channelId },
                });

                res.json(channel);
            } catch (error) {
                console.error("Error leaving channel:", error);
                res.status(400).json({ error: error.message });
            }
        });
    }

    setupSocketEvents() {
        // Handle new client connections
        this.io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            const typingUsers = {}; // Track typing users for each channel

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
            socket.on("send-message", async (data) => {
                try {
                    const { channelId, content, userId } = data;

                    // Validate channelId and userId
                    const channel = await Channel.findById(channelId);
                    const user = await User.findById(userId);

                    if (!channel || !user) {
                        throw new Error("Invalid channel or user");
                    }

                    // Save message to MongoDB
                    await Channel.findByIdAndUpdate(
                        channelId,
                        {
                            $push: {
                                messages: {
                                    sender: userId,
                                    content,
                                    timestamp: new Date(),
                                },
                            },
                        },
                        { new: true }
                    );

                    // Broadcast message to channel
                    this.io.to(channelId).emit("receive-message", {
                        channelId,
                        content,
                        sender: { id: userId, username: user.username },
                        timestamp: new Date(),
                    });
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            });

            // Handle message typing indicator
            socket.on("typing", (data) => {
                const { channelId, username } = data;

                // Add user to typing list for the channel
                if (!typingUsers[channelId]) {
                    typingUsers[channelId] = new Set();
                }
                typingUsers[channelId].add(username);

                // Broadcast the updated typing list to the channel
                this.io.to(channelId).emit("user-typing", {
                    channelId,
                    typingUsers: Array.from(typingUsers[channelId]),
                });
            });

            socket.on("stop-typing", (data) => {
                const { channelId, username } = data;

                // Remove user from the typing list
                if (typingUsers[channelId]) {
                    typingUsers[channelId].delete(username);

                    // Broadcast the updated typing list to the channel
                    this.io.to(channelId).emit("user-typing", {
                        channelId,
                        typingUsers: Array.from(typingUsers[channelId]),
                    });
                }
            });

            // Clean up on client disconnect
            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
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
chatServer.start(process.env.PORT || 4000);
