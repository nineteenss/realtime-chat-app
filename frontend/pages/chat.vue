<template>
    <div class="flex h-screen">
        <!-- Left Column (Channels List) -->
        <div
            class="flex flex-col min-w-[300px] max-w-[400px] w-1/4 bg-gray-100 p-4"
        >
            <!-- Channels Row -->
            <div class="mb-4 flex flex-col h-full">
                <ChannelTitles>Channels</ChannelTitles>
                <div>
                    <input
                        v-model="newChannelName"
                        placeholder="New channel name"
                        class="w-full p-2 border rounded mb-2"
                    />
                    <button
                        @click="createNewChannel"
                        :disabled="!newChannelName.trim()"
                        class="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        Create Channel
                    </button>
                </div>
                <p class="mt-2 text-sm text-gray-600">
                    Click on the channel below to join or enter
                </p>
                <!-- Scrollable Channels List -->
                <div class="mt-2 space-y-0 rounded-lg flex-1 overflow-y-auto">
                    <ChannelItem
                        v-for="channel in chatStore.channels"
                        :key="channel._id"
                        :channel="channel"
                        :typing-users="chatStore.typingUsers"
                        :active-channel-id="chatStore.currentChannel?._id"
                        :is-active="
                            chatStore.currentChannel?._id === channel._id
                        "
                        @click="selectChannel(channel._id)"
                    />
                </div>
            </div>
        </div>

        <!-- Middle Column (Chat Messages) -->
        <div class="flex flex-col flex-1 bg-white p-4">
            <template v-if="chatStore.currentChannel">
                <!-- Header with Room Title and Members Count -->
                <div class="border-b border-gray-200 pb-4 mb-4">
                    <h2 class="text-xl font-semibold">
                        {{ chatStore.currentChannel.name }}
                    </h2>
                    <div class="text-sm text-gray-600 flex flex-row">
                        {{ onlineMembersCount }} members online.&nbsp;
                        <p
                            v-if="chatStore.typingUsers.length > 0"
                            class="text-sm text-blue-500"
                        >
                            {{
                                formatTypingNotification(chatStore.typingUsers)
                            }}
                        </p>
                    </div>
                </div>

                <!-- Scrollable Top Row -->
                <div
                    ref="messagesContainer"
                    class="flex-1 overflow-y-auto mb-4 space-y-0.5"
                >
                    <div
                        v-for="(message, index) in chatStore.messages"
                        :key="message.timestamp"
                    >
                        <!-- Date separator -->
                        <div
                            v-if="shouldShowDateSeparator(index)"
                            class="flex items-center my-4"
                        >
                            <div class="flex-1 border-t border-gray-200"></div>
                            <div class="mx-4 text-sm text-gray-500">
                                {{ formatDateSeparator(message.timestamp) }}
                            </div>
                            <div class="flex-1 border-t border-gray-200"></div>
                        </div>

                        <!-- Chat bubble -->
                        <ChannelChatBubble
                            :message="message"
                            :auth-store="authStore"
                            :chat-store="chatStore"
                            :index="index"
                        />
                    </div>
                </div>

                <!-- Pinned Bottom Row -->
                <div
                    class="h-16 bg-gray-100 flex items-center justify-center rounded"
                >
                    <div class="message_input flex gap-3 w-full px-4">
                        <input
                            v-model="newMessage"
                            @keyup.enter="sendMessage"
                            @input="handleInput"
                            placeholder="Type a message..."
                            class="flex-1 p-2 border rounded"
                        />
                        <button
                            @click="sendMessage"
                            :disabled="!newMessage.trim()"
                            class="disabled:text-slate-300 text-blue-500 transition-colors duration-200 flex items-center cursor-pointer"
                        >
                            <!-- Replace "Send" with a "send" icon -->
                            <Icon name="proicons:send" class="w-7 h-7" />
                        </button>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="flex-1 flex items-center justify-center">
                    <p class="text-gray-500 text-center">
                        Please select a channel or chat to start a conversation.
                    </p>
                </div>
            </template>
        </div>

        <!-- Right Column (Channel Info) -->
        <div
            class="flex flex-col min-w-[300px] max-w-[400px] w-1/4 bg-gray-100 p-4 overflow-hidden"
        >
            <div class="mb-4 flex flex-col h-full">
                <!-- Channel Description -->
                <div class="mb-4">
                    <ChannelTitles>Channel info</ChannelTitles>
                    <div v-if="chatStore.currentChannel">
                        <p class="text-sm text-gray-600">
                            {{
                                chatStore.currentChannel.description ||
                                "No description available."
                            }}
                        </p>
                    </div>
                    <div v-else>
                        <p class="text-sm text-gray-600">
                            No channel selected.
                        </p>
                    </div>
                </div>

                <!-- Delete Channel Button (Creator Only) -->
                <div v-if="isChannelCreator" class="mb-4">
                    <label class="flex items-center gap-2 mb-2">
                        <input
                            v-model="confirmDelete"
                            type="checkbox"
                            class="form-checkbox"
                        />
                        <span class="text-xs text-gray-700">
                            I understand what I am doing by deleting this
                            channel.
                        </span>
                    </label>
                    <button
                        @click="deleteChannel"
                        :disabled="!confirmDelete"
                        class="w-full btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Delete Channel
                    </button>
                </div>

                <!-- Members List with Search -->
                <!-- Search Field -->
                <div class="mb-4">
                    <ChannelTitles>
                        {{ filteredMembers.length }} Members
                    </ChannelTitles>
                    <input
                        v-model="searchQuery"
                        placeholder="Search members..."
                        class="w-full p-2 border rounded"
                    />
                </div>

                <!-- Scrollable Members List -->
                <div class="space-y-0.5 h-full overflow-y-auto">
                    <div
                        v-for="member in filteredMembers"
                        :key="member._id"
                        class="p-2 bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md shadow-sm flex items-center gap-3"
                    >
                        <!-- Circle with Initial -->
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                            :style="{
                                backgroundColor: stringToColor(
                                    member.username || ''
                                ),
                            }"
                        >
                            {{
                                member.username?.charAt(0).toUpperCase() || "?"
                            }}
                        </div>
                        <!-- Username and Online Status -->
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold truncate">
                                {{ member.username || "Unknown User" }}
                            </p>
                            <p
                                :class="[
                                    'text-sm font-normal',
                                    isUserOnline(member._id)
                                        ? 'text-green-600'
                                        : 'text-gray-500',
                                ]"
                            >
                                {{
                                    isUserOnline(member._id)
                                        ? "online"
                                        : "last seen recently"
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Components imports
import ChannelItem from "~/components/ChannelItem.vue";
import ChannelChatBubble from "~/components/ChannelChatBubble.vue";
import ChannelTitles from "~/components/ChannelTitles.vue";

// Imports
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useChatStore } from "../stores/chat";
import { useAuthStore } from "../stores/auth";

// Page meta
definePageMeta({
    requiresAuth: true,
});

// Head meta
useHead({
    title: "Chat",
});

// Variables
const chatStore = useChatStore();
const authStore = useAuthStore();
const newMessage = ref("");
const newChannelName = ref("");
const typingTimeout = ref(null);
const messagesContainer = ref(null); // Ref for the messages container
const confirmDelete = ref(false); // Ref for channel deleting confirmation
const searchQuery = ref(""); // For member search
const onlineMembersCount = computed(() => {
    if (!chatStore.currentChannel) return 0;

    // Filter online users who are members of the current channel
    return chatStore.onlineUsers.filter((userId) =>
        chatStore.currentChannel.members.some(
            (member) => member._id === userId || member === userId
        )
    ).length;
});

// Lifecycle hooks
onMounted(async () => {
    // Wait for the DOM to be fully rendered
    await nextTick();

    // Bind the messagesContainer ref to the store
    chatStore.messagesContainer = messagesContainer.value;

    // Initialize socket and fetch channels
    chatStore.initSocket();
    chatStore.listenForTypingNotifications();

    // Scroll to the bottom when the component is mounted
    // Automatically re-join the current channel if it exists
    if (chatStore.currentChannel) {
        try {
            await chatStore.joinChannel(chatStore.currentChannel._id);
            await chatStore.fetchMessages(chatStore.currentChannel._id);
            chatStore.scrollToBottom();
        } catch (error) {
            console.error("Error re-joining channel:", error);
            chatStore.currentChannel = null; // Reset currentChannel if re-joining fails
        }
    } else {
        // If no channel is selected, fetch the first channel (optional)
        if (chatStore.channels.length > 0) {
            await chatStore.joinChannel(chatStore.channels[0]._id);
            await chatStore.fetchMessages(chatStore.channels[0]._id);
            chatStore.scrollToBottom();
        }
    }

    console.log("Current Channel (onMounted):", chatStore.currentChannel); // Debugging
    console.log("Members (onMounted):", chatStore.currentChannel?.members); // Debugging
});

onUnmounted(() => {
    // Clean up
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
    }
});

// Functions
async function createNewChannel() {
    if (newChannelName.value.trim()) {
        try {
            // Create a new channel
            await chatStore.createChannel(newChannelName.value);
            newChannelName.value = "";
        } catch (error) {
            console.error("Error creating channel:", error);
            alert("Error creating channel");
        }
    }
}

// async function removeChannel(channelId) {
//     try {
//         // Remove the channel
//         await chatStore.removeChannel(channelId);
//     } catch (error) {
//         console.error("Error deleting channel:", error);
//         alert("Error deleting channel");
//     }
// }

async function selectChannel(channelId) {
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
}

async function leaveChannel(channelId) {
    try {
        // Leave the selected channel
        await chatStore.leaveChannel(channelId);
    } catch (error) {
        console.error("Error leaving channel:", error);
        alert("Error leaving channel");
    }
}

function sendMessage() {
    if (newMessage.value.trim()) {
        // Send the message
        chatStore.sendMessage(newMessage.value);
        newMessage.value = ""; // Clear the input field

        // Scroll to the bottom after sending the message
        if (chatStore.currentChannel) {
            chatStore.scrollToBottom();
        }
    }
}

function handleInput() {
    // Send typing notification if not already sent
    if (!typingTimeout.value) {
        chatStore.sendTypingNotification();
    }

    // Clear the previous timeout (if any)
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
    }

    // Set a new timeout to stop the typing notification
    // after 2 seconds of inactivity
    typingTimeout.value = setTimeout(() => {
        chatStore.stopTypingNotification();
        typingTimeout.value = null;
    }, 2000);
}

function formatTypingNotification(typingUsers) {
    // Extract usernames from the typingUsers array
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
}

// Check if the current user is the channel creator
const isChannelCreator = computed(() => {
    return (
        chatStore.currentChannel?.creator?._id === authStore.user?.id ||
        chatStore.currentChannel?.creator === authStore.user?.id
    );
});

// Filter members based on search query
const filteredMembers = computed(() => {
    if (!chatStore.currentChannel?.members) return [];
    return chatStore.currentChannel.members
        .filter((member) => member?.username) // Filter out undefined/null members
        .filter((member) =>
            member.username
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase())
        );
});

// Helper function to generate a color from a string (for member initials)
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

// Check if a user is online
const isUserOnline = (userId) => {
    return chatStore.onlineUsers.includes(userId);
};

// Delete Channel Function
const deleteChannel = async () => {
    if (confirmDelete.value && chatStore.currentChannel) {
        try {
            await chatStore.removeChannel(chatStore.currentChannel._id);
            confirmDelete.value = false; // Reset checkbox
        } catch (error) {
            console.error("Error deleting channel:", error);
            alert("Failed to delete channel.");
        }
    }
};

// Helper function to check if a date separator should be shown
function shouldShowDateSeparator(index) {
    if (index === 0) return true; // Always show for the first message
    const currentDate = new Date(
        chatStore.messages[index].timestamp
    ).toDateString();
    const previousDate = new Date(
        chatStore.messages[index - 1].timestamp
    ).toDateString();
    return currentDate !== previousDate;
}

// Helper function to format the date separator
function formatDateSeparator(timestamp) {
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
}

// Watchers
watch(messagesContainer, (newContainer) => {
    // Watcher to update messagesContainer in the store
    chatStore.messagesContainer = newContainer;
});

watch(
    () => chatStore.messages, // Watch for changes in the messages array
    () => {
        if (chatStore.currentChannel) {
            chatStore.scrollToBottom();
        }
    },
    { deep: true }
);
</script>
