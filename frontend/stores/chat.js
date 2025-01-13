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
        typingUsers: [], // Array to store users typing in the channel
    }),

    actions: {
        /*
            Getter properties
        */

        // Helper function to get the backend URL
        getBackendUrl() {
            const config = useRuntimeConfig();
            return config.public.apiBase;
        },

        /*
            Socket-related actions
        */

        // Initialize Socket.io connection
        async initSocket() {
            const backendUrl = this.getBackendUrl();
            // Connect to the Socket.io server running on localhost:4000
            this.socket = io(backendUrl);

            // Listen for incoming messages and add them to messages array
            this.socket.on("receive-message", (message) => {
                this.messages.push(message);
            });

            await this.fetchChannels();
        },

        /*
            Channel-related actions
        */

        // Fetch available chat channels
        async fetchChannels() {
            try {
                const backendUrl = this.getBackendUrl();
                // Send a GET request to the server
                const response = await fetch(`${backendUrl}/api/channels`);
                const data = await response.json(); // Parse the JSON response
                this.channels = data;
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        },

        // Create a new chat channel
        async createChannel(name) {
            const authStore = useAuthStore();
            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(`${backendUrl}/api/channels`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        creatorId: authStore.user.id,
                    }),
                });

                // Refresh channels list
                const channel = await response.json();
                this.channels.push(channel);
                return channel;
            } catch (error) {
                console.error("Error creating channel:", error);
                throw error;
            }
        },

        // Delete a chat channel
        async removeChannel(channelId) {
            const authStore = useAuthStore();
            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId: authStore.user.id,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete channel");
                }

                // Refresh channels list
                await this.fetchChannels();

                // Reset current channel if it was deleted
                if (this.currentChannel === channelId) {
                    this.currentChannel = null;
                    this.messages = [];
                }
            } catch (error) {
                console.error("Error deleting channel:", error);
                throw error;
            }
        },

        // Join a specific chat channel
        async joinChannel(channelId) {
            const authStore = useAuthStore();
            try {
                const backendUrl = this.getBackendUrl();

                //  Fetch the full channel details from the backend
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}/join`,
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

                if (!response.ok) {
                    throw new Error("Failed to fetch channel details");
                }

                // Emit event to server to join the channel & update current channel
                this.socket.emit("join-channel", channelId);
                // Update the currentChannel state with the fetched data
                this.currentChannel = channelId;
                this.messages = []; // Cleaning messages on channel switch

                // Fetch messages for selected channel
                await this.fetchMessages(channelId);
            } catch (error) {
                console.error("Error joining channel", error);
                throw error;
            }
        },

        // Leave the channel
        async leaveChannel(channelId) {
            const authStore = useAuthStore();
            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}/leave`,
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

                if (!response.ok) {
                    throw new Error("Failed to leave channel");
                }

                // Emit event to server to leave the channel
                this.socket.emit("leave-channel", channelId);
                // Reset current channel and messages
                if (this.currentChannel === channelId) {
                    this.currentChannel = null;
                    this.messages = [];
                }
                // Refresh channels list
                await this.fetchChannels();
            } catch (error) {
                console.error("Error leaving channel", error);
                throw error;
            }
        },

        // Send typing notification
        sendTypingNotification() {
            if (!this.currentChannel) return;

            const authStore = useAuthStore();
            this.socket.emit("typing", {
                channelId: this.currentChannel,
                username: authStore.user.username,
            });
        },

        // Stop sending typing notification
        stopTypingNotification() {
            if (!this.currentChannel) return;

            const authStore = useAuthStore();
            this.socket.emit("stop-typing", {
                channelId: this.currentChannel,
                username: authStore.user.username,
            });
        },

        // Listen for typing notifications
        listenForTypingNotifications() {
            this.socket.on("user-typing", (data) => {
                this.typingUsers = data.typingUsers; // Store typing users
            });
        },

        /*
            Message-related actions
        */

        // Fetch messages for a specific channel
        async fetchMessages(channelId) {
            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}/messages`
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
