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
            <div v-for="channel in chatStore.channels" :key="channel._id">
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
import { ref, onMounted } from "vue";
import { useChatStore } from "../stores/chat";

const chatStore = useChatStore();
const newMessage = ref("");
const newChannelName = ref("");

onMounted(() => {
    chatStore.initSocket();
});

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

async function selectChannel(channelId) {
    try {
        await chatStore.joinChannel(channelId);
        await chatStore.fetchMessages(channelId);
    } catch (error) {
        console.error("Error joining channel:", error);
        alert("Error joining channel");
    }
}

function sendMessage() {
    if (newMessage.value.trim()) {
        chatStore.sendMessage(newMessage.value);
        newMessage.value = "";
    }
}
</script>
