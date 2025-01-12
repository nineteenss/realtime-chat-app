<template>
    <div>
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
                <button @click="leaveChannel(channel._id)">
                    Leave channel
                </button>
                <button
                    v-if="channel.creator._id === authStore.user.id"
                    @click="removeChannel(channel._id)"
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
            <div class="message_input">
                <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
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
import { ref, onMounted } from "vue";
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

// Lifecycle hooks
onMounted(() => {
    chatStore.initSocket();
});

// Functions
async function createNewChannel() {
    if (newChannelName.value.trim()) {
        try {
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
        await chatStore.removeChannel(channelId);
    } catch (error) {
        console.error("Error deleting channel:", error);
        alert("Error deleting channel");
    }
}

async function selectChannel(channelId) {
    try {
        await chatStore.joinChannel(channelId);
        await chatStore.fetchMessages(channelId);
    } catch (error) {
        console.error("Error joining channel:", error);
        alert("Error joining channel");
    }
}

async function leaveChannel(channelId) {
    try {
        await chatStore.leaveChannel(channelId);
    } catch (error) {
        console.error("Error leaving channel:", error);
        alert("Error leaving channel");
    }
}

function sendMessage() {
    if (newMessage.value.trim()) {
        chatStore.sendMessage(newMessage.value);
        newMessage.value = "";
    }
}

// Computed properties (if needed)

// Watchers (if needed)
</script>
