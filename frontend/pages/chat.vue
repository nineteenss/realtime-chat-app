<template>
    <div>
        <div class="channels">
            <h3>Channels</h3>
            <div
                v-for="channel in chatStore.channels"
                :key="channel._id"
                @click="selectChannel(channel._id)"
            >
                {{ channel.name }}
            </div>
        </div>

        <div class="messages">
            <div class="list">
                <div
                    v-for="message in chatStore.messages"
                    :key="message.timestamp"
                    class="message"
                >
                    <strong>
                        {{ message.sender }}
                    </strong>
                    <p>
                        {{ message.content }}
                    </p>
                    <small>
                        {{ new Date(message.timestamp).toLocaleString() }}
                    </small>
                </div>
            </div>
            <div class="message_input">
                <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    placeholder="Type a message..."
                />
                <button @click="sendMessage">Send...</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "../stores/chat";

const chatStore = useChatStore();
const newMessage = ref("");

onMounted(() => {
    chatStore.initSocket();
});

function selectChannel(channelId) {
    chatStore.joinChannel(channelId);
}

function sendMessage() {
    if (newMessage.value.trim()) {
        chatStore.sendMessage(newMessage.value);
        newMessage.value = "";
    }
}
</script>
