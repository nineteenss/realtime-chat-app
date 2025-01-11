//
//    chat.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import { defineStore } from "pinia";
import { io } from "socket.io-client";

// Define a Pinia store for chat functionality
export const useChatStore = defineStore("chat", {
    // Initial state of the store
    state: () => ({
        socket: null, // Socket.io connection instance
        currentChannel: null, // Currently active channel
        messages: [], // Array to store chat messages
        channels: [], // Array to store available channels
        users: [], // Array to store connected users
    }),

    actions: {
        // Initialize Socket.io connection
        initSocket() {
            // Connect to the Socket.io server running on localhost:4000
            this.socket = io("http://localhost:4000");

            // Listen for incoming messages and add them to messages array
            this.socket.on("receive-message", (message) => {
                this.messages.push(message);
            });
        },

        // Join a specific chat channel
        joinChannel(channelId) {
            // Emit event to server to join the channel & update current channel
            this.socket.emit("join-channel", channelId);
            this.currentChannel = channelId;
        },

        // Send a message in the current channel
        sendMessage(content) {
            // Check if user is in a channel before sending
            if (!this.currentChannel) return;

            // Create message object with required information
            const message = {
                channelId: this.currentChannel,
                content,
                timestamp: new Date(),
            };

            // Send the message to the server
            this.socket.emit("send-message", message);
        },
    },
});
