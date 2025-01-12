<template>
    <div class="p-4 bg-slate-400">
        <div class="channels">
            <h3>Channels</h3>
            <div>
                <input
                    v-model="newChannelName"
                    placeholder="New channel name"
                />
                <button
                    @click="createNewChannel"
                    :disabled="!newChannelName.trim()"
                >
                    Create Channel
                </button>
            </div>
            <p style="border-radius: 5px; font-size: 14px; width: fit-content">
                Click on the channel below to join or enter
            </p>
            <div
                v-for="channel in chatStore.channels"
                :key="channel._id + authStore.user.id"
            >
                <div
                    @click="selectChannel(channel._id)"
                    style="
                        border: 1px solid;
                        padding: 5px 10px;
                        margin-bottom: 5px;
                        border-radius: 5px;
                        font-size: 14px;
                        width: fit-content;
                        cursor: pointer;
                    "
                >
                    {{ channel.name }}
                    ({{ channel.members.length }} members)
                </div>
                <button
                    @click="leaveChannel(channel._id)"
                    v-if="
                        channel.members.some(
                            (member) =>
                                member._id.toString() === authStore.user.id
                        )
                    "
                >
                    Leave channel
                </button>
                <button
                    @click="removeChannel(channel._id)"
                    v-if="channel.creator._id === authStore.user.id"
                >
                    Delete Channel
                </button>
            </div>
        </div>
        <hr />
        <div class="messages" v-if="chatStore.currentChannel">
            <div class="list">
                <h3>Chat</h3>
                <div
                    v-for="message in chatStore.messages"
                    :key="message.timestamp"
                >
                    <strong>{{ message.sender.username }}</strong>
                    <p>{{ message.content }}</p>
                    <small>{{
                        new Date(message.timestamp).toLocaleString()
                    }}</small>
                </div>
            </div>
            <hr />
            <div
                v-if="chatStore.typingUsers.length > 0"
                class="typing-notification"
            >
                {{ formatTypingNotification(chatStore.typingUsers) }}
            </div>
            <hr />
            <div class="message_input">
                <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    @input="handleInput"
                    placeholder="Type a message..."
                />
                <button @click="sendMessage" :disabled="!newMessage.trim()">
                    Send
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
// Imports
import { ref, onMounted, onUnmounted } from "vue";
import { useChatStore } from "../stores/chat";
import { useAuthStore } from "../stores/auth";

// Page meta
definePageMeta({
    requiresAuth: true,
});

// Variables
const chatStore = useChatStore();
const authStore = useAuthStore();
const newMessage = ref("");
const newChannelName = ref("");
const typingTimeout = ref(null);

// Lifecycle hooks
onMounted(() => {
    chatStore.initSocket();
    chatStore.listenForTypingNotifications();
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

async function removeChannel(channelId) {
    try {
        // Remove the channel
        await chatStore.removeChannel(channelId);
    } catch (error) {
        console.error("Error deleting channel:", error);
        alert("Error deleting channel");
    }
}

async function selectChannel(channelId) {
    try {
        // Join the selected channel and fetch messages
        await chatStore.joinChannel(channelId);
        await chatStore.fetchMessages(channelId);
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
        newMessage.value = "";
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
    if (typingUsers.length === 1) {
        return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
        return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else if (typingUsers.length > 2) {
        return `${typingUsers[0]}, ${typingUsers[1]} and ${
            typingUsers.length - 2
        } more are typing...`;
    }
    return "";
}

// Computed properties (if needed)

// Watchers (if needed)
</script>

<style scoped>
.typing-notification {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
}
</style>
