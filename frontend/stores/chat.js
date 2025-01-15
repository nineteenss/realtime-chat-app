//
//    chat.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import { defineStore } from "pinia";
import { io } from "socket.io-client";
import { useAuthStore } from "./auth";
import { nextTick } from "vue";

// Define a Pinia store for chat functionality
export const useChatStore = defineStore("chat", {
    // Initial state of the store
    state: () => ({
        socket: null, // Socket.io connection instance
        currentChannel: null, // Currently active channel
        messages: [], // Array to store chat messages
        channels: [], // Array to store available channels
        typingUsers: [], // Array to store users typing in the channel
        messagesContainer: ref(null), // Add a ref for the messages container
        allMembers: [], // Array to store all registered members
        onlineUsers: [], // Initialize onlineUsers
    }),

    actions: {
        // Helper function to scroll to the bottom of the messages container
        scrollToBottom() {
            if (!this.currentChannel || !this.messagesContainer) {
                console.warn(
                    "No channel selected or messagesContainer is null."
                );
                return;
            }

            // Wait for the DOM to update before scrolling
            nextTick(() => {
                this.messagesContainer.scrollTo({
                    top: this.messagesContainer.scrollHeight,
                    behavior: "smooth",
                });
            });
        },

        // Helper function to sort channels by the last message timestamp
        sortChannelsByLastMessage(channels) {
            return channels.slice().sort((a, b) => {
                const lastMessageA =
                    a.messages[a.messages.length - 1]?.timestamp || 0;
                const lastMessageB =
                    b.messages[b.messages.length - 1]?.timestamp || 0;
                return new Date(lastMessageB) - new Date(lastMessageA);
            });
        },

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
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            // Connect to the Socket.io server
            this.socket = io(backendUrl, {
                auth: {
                    token: authStore.token, // Authenticate socket connection
                },
            });

            // Initialize onlineUsers as an empty array
            this.onlineUsers = [];

            // Notify the server that the user is online
            this.socket.emit("user-online", authStore.user.id);

            // Listen for updates to the online user list
            this.socket.on("update-online-users", (onlineUserIds) => {
                this.onlineUsers = onlineUserIds;
                // console.log("Online users:", this.onlineUsers); // Debugging
            });

            // Listen for updates to the channels list
            this.socket.on("update-channels", (updatedChannel) => {
                // console.log("Received update-channels event:", updatedChannel); // Debugging
                const index = this.channels.findIndex(
                    (channel) => channel._id === updatedChannel._id
                );

                if (index !== -1) {
                    // Update the messages array reactively
                    this.channels[index] = updatedChannel;
                } else {
                    this.channels.push(updatedChannel);
                }

                this.channels = this.sortChannelsByLastMessage(this.channels);
            });

            this.socket.on("channel-deleted", (deletedChannelId) => {
                // console.log("Channel deleted:", deletedChannelId); // Debugging

                // Remove the deleted channel from the channels list
                this.channels = this.channels.filter(
                    (channel) => channel._id !== deletedChannelId
                );

                // If the deleted channel was the current channel, reset the UI
                if (this.currentChannel?._id === deletedChannelId) {
                    this.currentChannel = null;
                    this.messages = [];
                    navigateTo("/chat"); // Back to the base root
                }
            });

            // this.socket.on("update-channels", (updatedChannel) => {
            //     // console.log("Received update-channels event:", updatedChannel); // Debugging
            //     const index = this.channels.findIndex(
            //         (channel) => channel._id === updatedChannel._id
            //     );

            //     if (index !== -1) {
            //         // Update the messages array reactively
            //         this.channels[index].messages = updatedChannel.messages;
            //         // console.log("Updated channels list:", this.channels); // Debugging

            //         // Sort the channels by the last message timestamp
            //         this.channels = this.sortChannelsByLastMessage(
            //             this.channels
            //         );

            //         // console.log("Sorted channels list:", this.channels); // Debugging
            //     }
            // });

            this.socket.on("channel-updated", (updatedChannel) => {
                // Check if the channel already exists in the list
                const index = this.channels.findIndex(
                    (channel) => channel._id === updatedChannel._id
                );

                if (index !== -1) {
                    // Update the existing channel
                    this.channels[index] = updatedChannel;
                } else {
                    // Add the new channel to the list
                    this.channels.push(updatedChannel);
                }

                // If the updated channel is the current channel, update the currentChannel state
                if (this.currentChannel?._id === updatedChannel._id) {
                    this.currentChannel = updatedChannel;
                }

                // console.log("Channel updated:", updatedChannel); // Debugging
            });

            // Listen for incoming messages and add them to messages array
            this.socket.on("receive-message", async (message) => {
                // Add the new message to the messages array
                this.messages.push(message);

                // Wait for the DOM to update before scrolling
                await nextTick();

                // Scroll to the bottom after receiving the message
                if (this.currentChannel) {
                    this.scrollToBottom();
                }
            });

            await this.fetchChannels();
        },

        /*
            Global-related actions
        */

        // Fetch all registered members
        async fetchAllMembers() {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(`${backendUrl}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${authStore.token}`,
                    },
                });

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch all members");
                }

                const data = await response.json();
                this.allMembers = data; // Store all registered users
            } catch (error) {
                console.error("Error fetching all members:", error);
                throw error;
            }
        },

        /*
            Channel-related actions
        */

        // Fetch available chat channels
        async fetchChannels() {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();

                // Send a GET request to the server
                const response = await fetch(`${backendUrl}/api/channels`, {
                    headers: {
                        Authorization: `Bearer ${authStore.token}`, // Include token
                    },
                });

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

                const data = await response.json(); // Parse the JSON response
                this.channels = data;
            } catch (error) {
                console.error("Error fetching channels:", error);
                throw error;
            }
        },

        // Create a new chat channel
        async createChannel(name, description) {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(`${backendUrl}/api/channels`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authStore.token}`, // Include token
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        creatorId: authStore.user.id,
                    }),
                });

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

                if (!response.ok) {
                    const errorData = await response.json(); // Parse the error response
                    console.error(
                        "Failed to create channel. Error:",
                        errorData
                    ); // Debugging
                    throw new Error("Failed to create channel");
                }

                // Refresh channels list
                const channel = await response.json();

                // Verify that channel._id is valid
                if (!channel._id) {
                    throw new Error("Channel ID is undefined");
                }

                // Add the new channel to the list
                // this.channels.push(channel);

                // Join the channel after creation
                await this.joinChannel(channel._id);

                console.log("Created channel:", channel); // Debugging

                return channel;
            } catch (error) {
                console.error("Error creating channel:", error);
                throw error;
            }
        },

        // Delete a chat channel
        async removeChannel(channelId) {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authStore.token}`, // Include token
                        },
                        body: JSON.stringify({
                            userId: authStore.user.id,
                        }),
                    }
                );

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

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

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();

                //  Fetch the full channel details from the backend
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}/join`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authStore.token}`, // Include token
                        },
                        body: JSON.stringify({
                            userId: authStore.user.id,
                        }),
                    }
                );

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Failed to join channel"
                    );
                }

                const channel = await response.json();

                // Emit event to server to join the channel & update current channel
                this.socket.emit("join-channel", channelId);

                // Update the currentChannel state with the fetched data
                this.currentChannel = channel; // Store the full channel object
                this.messages = []; // Cleaning messages on channel switch

                // Fetch messages for selected channel
                await this.fetchMessages(channelId);
                // console.log("Joined channel:", channel); // Debugging
                // console.log("Channel members:", channel.members); // Debugging
            } catch (error) {
                console.error("Error joining channel", error);
                throw error;
            }
        },

        // Fetch channel details without joining
        async fetchChannelDetails(channelId) {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authStore.token}`,
                        },
                    }
                );

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch channel details");
                }

                const channel = await response.json();
                return channel;
            } catch (error) {
                console.error("Error fetching channel details:", error);
                throw error;
            }
        },

        // Leave the channel
        async leaveChannel(channelId) {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}/leave`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authStore.token}`, // Include token
                        },
                        body: JSON.stringify({
                            userId: authStore.user.id,
                        }),
                    }
                );

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

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
                channelId: this.currentChannel._id, // Added - ._id to fix the issue of typing notification not being rendered
                username: authStore.user.username,
            });
        },

        // Stop sending typing notification
        stopTypingNotification() {
            if (!this.currentChannel) return;

            const authStore = useAuthStore();
            this.socket.emit("stop-typing", {
                channelId: this.currentChannel._id, // Added - ._id to fix the issue of typing notification not being rendered
                username: authStore.user.username,
            });
        },

        // Listen for typing notifications
        listenForTypingNotifications() {
            const authStore = useAuthStore();

            this.socket.on("user-typing", (data) => {
                // Filter out the current user from the typingUsers array
                this.typingUsers = data.typingUsers
                    .filter((username) => username !== authStore.user.username)
                    .map((username) => ({
                        username,
                        channelId: data.channelId,
                    }));
            });
        },

        /*
            Message-related actions
        */

        // Fetch messages for a specific channel
        async fetchMessages(channelId) {
            const authStore = useAuthStore();

            if (!authStore.token) {
                throw new Error("No token found. Please log in.");
            }

            try {
                const backendUrl = this.getBackendUrl();
                const response = await fetch(
                    `${backendUrl}/api/channels/${channelId}/messages`,
                    {
                        headers: {
                            Authorization: `Bearer ${authStore.token}`, // Include token
                        },
                    }
                );

                if (response.status === 401) {
                    authStore.logout();
                    navigateTo("/login");
                    throw new Error("Session expired. Please log in again.");
                }

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

            this.socket.emit("send-message", {
                channelId: this.currentChannel._id,
                content,
                userId: authStore.user.id,
            });
        },
    },
});
