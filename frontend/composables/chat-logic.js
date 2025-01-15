import { ref, computed } from "vue";
import { useChatStore } from "~/stores/chat";
import { useAuthStore } from "~/stores/auth";

// Function to initialize stores
const initializeStores = () => {
    const chatStore = useChatStore();
    const authStore = useAuthStore();

    // Refs
    const newChannelName = ref("");
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

    const filteredMembers = computed(() => {
        if (!chatStore.currentChannel?.members) return [];
        return chatStore.currentChannel.members
            .filter((member) => member?.username)
            .filter((member) =>
                member.username
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase())
            );
    });

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
                await chatStore.createChannel(newChannelName.value);
                newChannelName.value = "";
            } catch (error) {
                console.error("Error creating channel:", error);
                alert("Error creating channel");
            }
        }
    };

    const selectChannel = async (channelId) => {
        try {
            await chatStore.joinChannel(channelId);
            await chatStore.fetchMessages(channelId);
            if (chatStore.currentChannel) {
                chatStore.scrollToBottom();
            }
        } catch (error) {
            console.error("Error joining channel:", error);
            alert("Error joining channel");
        }
    };

    const sendMessage = () => {
        if (newMessage.value.trim()) {
            chatStore.sendMessage(newMessage.value);
            newMessage.value = "";
            if (chatStore.currentChannel) {
                chatStore.scrollToBottom();
            }
        }
    };

    const handleInput = () => {
        if (!typingTimeout.value) {
            chatStore.sendTypingNotification();
        }
        if (typingTimeout.value) {
            clearTimeout(typingTimeout.value);
        }
        typingTimeout.value = setTimeout(() => {
            chatStore.stopTypingNotification();
            typingTimeout.value = null;
        }, 2000);
    };

    const formatTypingNotification = (typingUsers) => {
        const usernames = typingUsers
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

    const shouldShowDateSeparator = (index) => {
        if (index === 0) return true;
        const currentDate = new Date(
            chatStore.messages[index].timestamp
        ).toDateString();
        const previousDate = new Date(
            chatStore.messages[index - 1].timestamp
        ).toDateString();
        return currentDate !== previousDate;
    };

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

    const deleteChannel = async () => {
        if (confirmDelete.value && chatStore.currentChannel) {
            try {
                await chatStore.removeChannel(chatStore.currentChannel._id);
                confirmDelete.value = false;
            } catch (error) {
                console.error("Error deleting channel:", error);
                alert("Failed to delete channel.");
            }
        }
    };

    const isUserOnline = (userId) => {
        return chatStore.onlineUsers.includes(userId);
    };

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
