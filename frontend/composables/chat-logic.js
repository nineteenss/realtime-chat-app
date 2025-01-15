//
//    chat-logic.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 15.01.2025
//

import { ref, computed } from "vue";
import { useChatStore } from "~/stores/chat";
import { useAuthStore } from "~/stores/auth";

// Function to initialize stores
const initializeStores = () => {
    const chatStore = useChatStore();
    const authStore = useAuthStore();

    // Refs
    const newChannelName = ref("");
    const newChannelDescription = ref("");
    const newMessage = ref("");
    const typingTimeout = ref(null);
    const messagesContainer = ref(null);
    const confirmDelete = ref(false);
    const searchQuery = ref("");

    // Computed properties
    const onlineMembersCount = computed(() => {
        if (!chatStore.currentChannel) return 0;
        return chatStore.onlineUsers.filter((userId) =>
            chatStore.currentChannel.members.some(
                (member) => member._id === userId || member === userId
            )
        ).length;
    });

    // Filter members based on search query
    const filteredMembers = computed(() => {
        const members = chatStore.currentChannel
            ? chatStore.currentChannel.members
            : chatStore.allMembers;

        if (!members) return [];
        return members
            .filter((member) => member?.username) // Filter out undefined/null members
            .filter((member) =>
                member.username
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase())
            );
    });

    // Check if the current user is the channel creator
    const isChannelCreator = computed(() => {
        return (
            chatStore.currentChannel?.creator?._id === authStore.user?.id ||
            chatStore.currentChannel?.creator === authStore.user?.id
        );
    });

    // Functions
    const createNewChannel = async () => {
        if (newChannelName.value.trim()) {
            try {
                // Create a new channel
                await chatStore.createChannel(
                    newChannelName.value,
                    newChannelDescription.value // Populating with description
                );

                newChannelName.value = "";
                newChannelDescription.value = "";
            } catch (error) {
                console.error("Error creating channel:", error);
                alert("Error creating channel");
            }
        }
    };

    const selectChannel = async (channelId) => {
        try {
            // Join the selected channel and fetch messages
            await chatStore.joinChannel(channelId);
            await chatStore.fetchMessages(channelId);

            // Scroll to the bottom after joining the channel
            if (chatStore.currentChannel) {
                chatStore.scrollToBottom();
            }
        } catch (error) {
            console.error("Error joining channel:", error);
            alert("Error joining channel");
        }
    };

    const leaveChannel = async () => {
        if (chatStore.currentChannel) {
            try {
                await chatStore.leaveChannel(chatStore.currentChannel._id);
            } catch (error) {
                console.error("Error leaving channel:", error);
                alert("Failed to leave channel.");
            }
        }
    };

    const sendMessage = () => {
        if (newMessage.value.trim()) {
            // Send the message
            chatStore.sendMessage(newMessage.value);
            newMessage.value = "";

            // Scroll to the bottom after sending the message
            if (chatStore.currentChannel) {
                chatStore.scrollToBottom();
            }
        }
    };

    const handleInput = () => {
        // Send typing notification if not already sent
        if (!typingTimeout.value) {
            chatStore.sendTypingNotification();
        }

        // Clear the previous timeout (if any)
        if (typingTimeout.value) {
            clearTimeout(typingTimeout.value);
        }

        // Set a new timeout to stop the typing notification
        // after 1.5 seconds of inactivity
        typingTimeout.value = setTimeout(() => {
            chatStore.stopTypingNotification();
            typingTimeout.value = null;
        }, 1500);
    };

    const formatTypingNotification = (typingUsers) => {
        const usernames = typingUsers // Extract usernames from the typingUsers array
            .filter((user) => user.channelId === chatStore.currentChannel._id)
            .map((user) => user.username);

        if (usernames.length === 1) {
            return `${usernames[0]} is typing...`;
        } else if (usernames.length === 2) {
            return `${usernames[0]} and ${usernames[1]} are typing...`;
        } else if (usernames.length > 2) {
            return `${usernames[0]}, ${usernames[1]} and ${
                usernames.length - 2
            } more are typing...`;
        }
        return "";
    };

    // Helper to check if a date separator should be shown
    const shouldShowDateSeparator = (index) => {
        if (index === 0) return true; // Always show for the first message
        const currentDate = new Date(
            chatStore.messages[index].timestamp
        ).toDateString();
        const previousDate = new Date(
            chatStore.messages[index - 1].timestamp
        ).toDateString();
        return currentDate !== previousDate;
    };

    // Helper to format the date separator
    const formatDateSeparator = (timestamp) => {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return "Today";
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return messageDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    };

    // Delete Channel Function
    const deleteChannel = async () => {
        if (confirmDelete.value && chatStore.currentChannel) {
            try {
                await chatStore.removeChannel(chatStore.currentChannel._id);
                confirmDelete.value = false; // Reset checkbox

                // Navigate to the lobby or default state
                navigateTo("/chat"); // Back to the base root

                // Refresh the channels list
                await chatStore.fetchChannels();
            } catch (error) {
                console.error("Error deleting channel:", error);
                alert("Failed to delete channel.");
            }
        }
    };

    // Check if a user is online
    const isUserOnline = (userId) => {
        if (!chatStore.onlineUsers) return false; // Handle undefined case
        return chatStore.onlineUsers.includes(userId);
    };

    // Helper to generate a color from a string (for member initials)
    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = "#";
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += ("00" + value.toString(16)).substr(-2);
        }
        return color;
    };

    return {
        newChannelName,
        newChannelDescription,
        newMessage,
        typingTimeout,
        messagesContainer,
        confirmDelete,
        searchQuery,
        onlineMembersCount,
        filteredMembers,
        isChannelCreator,
        chatStore,
        authStore,
        createNewChannel,
        selectChannel,
        leaveChannel,
        sendMessage,
        handleInput,
        formatTypingNotification,
        shouldShowDateSeparator,
        formatDateSeparator,
        deleteChannel,
        isUserOnline,
        stringToColor,
    };
};

export default initializeStores;
