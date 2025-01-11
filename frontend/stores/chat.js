//
//    chat.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import { defineStore } from "pinia";
import { io } from "socket.io-client";
import { useAuthStore } from "./auth";

// Define a Pinia store for chat functionality
export const useChatStore = defineStore("chat", {
    // Initial state of the store
    state: () => ({
        socket: null, // Socket.io connection instance
        currentChannel: null, // Currently active channel
        messages: [], // Array to store chat messages
        channels: [], // Array to store available channels
        // users: [], // Array to store connected users
    }),

    actions: {
        // Initialize Socket.io connection
        async initSocket() {
            // Connect to the Socket.io server running on localhost:4000
            this.socket = io("http://localhost:4000");

            // Listen for incoming messages and add them to messages array
            this.socket.on("receive-message", (message) => {
                this.messages.push(message);
            });

            await this.fetchChannels();
        },

        async fetchChannels() {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/channels"
                );
                const data = await response.json();
                this.channels = data;
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        },

        async createChannel(name) {
            const authStore = useAuthStore();
            try {
                const response = await fetch(
                    "http://localhost:4000/api/channels",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name,
                            creatorId: authStore.user.id,
                        }),
                    }
                );

                const channel = await response.json();
                this.channels.push(channel);
                return channel;
            } catch (error) {
                console.error("Error creating channel:", error);
                throw error;
            }
        },

        // Join a specific chat channel
        async joinChannel(channelId) {
            const authStore = useAuthStore();
            try {
                const response = await fetch(
                    `http://localhost:4000/api/channels/${channelId}/join`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId: authStore.user.id,
                        }),
                    }
                );

                // Emit event to server to join the channel & update current channel
                this.socket.emit("join-channel", channelId);
                this.currentChannel = channelId;
                this.messages = []; // Cleaning messages on channel switch

                // Fetch messages for selected channel
                await this.fetchMessages(channelId);
            } catch (error) {
                console.error("Error joining channel", error);
                throw error;
            }
        },

        async fetchMessages(channelId) {
            try {
                const response = await fetch(
                    `http://localhost:4000/api/channels/${channelId}/messages`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch messages");
                }
                const data = await response.json();
                this.messages = data;
            } catch (error) {
                console.error("Error fetching messages:", error);
                throw error;
            }
        },

        // Send a message in the current channel
        sendMessage(content) {
            // Check if user is in a channel before sending
            if (!this.currentChannel) return;

            const authStore = useAuthStore();
            // Create message object with required information
            const message = {
                channelId: this.currentChannel,
                content,
                userId: authStore.user.id,
                timestamp: new Date(),
            };

            // Send the message to the server
            this.socket.emit("send-message", message);
        },
    },
});
