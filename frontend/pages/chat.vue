<template>
    <div class="flex h-screen">
        <!-- Left Column (Channels List) -->
        <div class="flex flex-col min-w-[300px] w-1/4 bg-gray-100 p-4">
            <!-- Channels Row -->
            <div class="mb-4">
                <h3 class="text-lg font-semibold">Channels</h3>
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
                <div class="mt-2 space-y-2">
                    <ChannelItem
                        v-for="channel in chatStore.channels"
                        :key="channel._id"
                        :channel="channel"
                        :typing-users="chatStore.typingUsers"
                        :active-channel-id="chatStore.currentChannel?._id"
                        @click="selectChannel(channel._id)"
                    />
                </div>
                <!-- <div
                    v-for="channel in chatStore.channels"
                    :key="channel._id + authStore.user.id"
                    class="mt-2"
                >
                    <div
                        @click="selectChannel(channel._id)"
                        class="border border-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        {{ channel.name }}
                        ({{ channel.members.length }} members)
                    </div>
                    <button
                        @click="leaveChannel(channel._id)"
                        v-if="
                            channel.members.some(
                                (member) =>
                                    member._id &&
                                    member._id.toString() === authStore.user.id
                            )
                        "
                        class="btn bg-red-500 text-white px-2 py-1 rounded mt-1 hover:bg-red-600"
                    >
                        Leave channel
                    </button>
                    <button
                        @click="removeChannel(channel._id)"
                        v-if="channel.creator._id === authStore.user.id"
                        class="btn bg-red-500 text-white px-2 py-1 rounded mt-1 hover:bg-red-600"
                    >
                        Delete Channel
                    </button>
                </div> -->
            </div>

            <!-- PM Row -->
            <div>
                <h3 class="text-lg font-semibold">Personal</h3>
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
                            class="text-sm text-gray-600"
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
                    class="flex-1 overflow-y-auto mb-4"
                >
                    <div class="space-y-2">
                        <!-- Group messages by sender -->
                        <div
                            v-for="(message, index) in chatStore.messages"
                            :key="message.timestamp"
                            :class="[
                                'flex',
                                message.sender._id.toString() ===
                                authStore.user.id.toString()
                                    ? 'justify-end'
                                    : 'justify-start',
                            ]"
                        >
                            <div
                                :class="[
                                    'p-2 rounded max-w-[70%]',
                                    message.sender._id.toString() ===
                                    authStore.user.id.toString()
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200',
                                ]"
                            >
                                <!-- Show sender's name only if it's a new sender or the first message -->
                                <div
                                    v-if="
                                        index === 0 ||
                                        chatStore.messages[
                                            index - 1
                                        ].sender._id.toString() !==
                                            message.sender._id.toString()
                                    "
                                    class="text-sm font-semibold mb-1"
                                >
                                    {{ message.sender.username }}
                                </div>
                                <p>{{ message.content }}</p>
                                <small
                                    :class="[
                                        'block text-xs mt-1',
                                        message.sender._id.toString() ===
                                        authStore.user.id.toString()
                                            ? 'text-white'
                                            : 'text-gray-600',
                                    ]"
                                >
                                    {{
                                        new Date(
                                            message.timestamp
                                        ).toLocaleTimeString()
                                    }}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pinned Bottom Row -->
                <div
                    class="h-16 bg-gray-100 flex items-center justify-center rounded"
                >
                    <div class="message_input flex gap-2 w-full px-4">
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
                            class="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            Send
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
        <div class="flex flex-col min-w-[300px] w-1/4 bg-gray-100 p-4">
            <!-- First Row: Channel Info -->
            <div class="mb-4">
                <h3 class="text-lg font-semibold">Channel Info</h3>
                <div v-if="chatStore.currentChannel">
                    <h4 class="text-lg font-medium">
                        {{ chatStore.currentChannel.name }}
                    </h4>
                    <p class="text-xs text-gray-400">
                        {{ chatStore.currentChannel._id }}
                    </p>
                </div>
                <div v-else>
                    <p class="text-sm text-gray-600">No channel selected.</p>
                </div>
            </div>

            <!-- Second Row: Members List -->
            <div class="mb-4 flex-1 overflow-y-auto">
                <h3 class="text-lg font-semibold">
                    Members ({{
                        chatStore.currentChannel?.members?.length || 0
                    }})
                </h3>
                <div v-if="chatStore.currentChannel" class="space-y-2 mt-2">
                    <div
                        v-for="member in chatStore.currentChannel.members"
                        :key="member._id"
                        class="p-2 bg-white rounded shadow-sm"
                    >
                        {{ member }}
                    </div>
                </div>
                <div v-else>
                    <p class="text-sm text-gray-600">No channel selected.</p>
                </div>
            </div>

            <!-- Third Row: Leave Channel Button -->
            <div class="mt-auto">
                <button
                    v-if="chatStore.currentChannel"
                    @click="leaveChannel(chatStore.currentChannel._id)"
                    class="w-full btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Leave Channel
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
// Components imports
import ChannelItem from "~/components/ChannelItem.vue";

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
const onlineMembersCount = computed(() => {
    if (!chatStore.currentChannel) return 0;

    // Filter online users who are members of the current channel
    return chatStore.onlineUsers.filter((userId) =>
        chatStore.currentChannel.members.includes(userId)
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
    if (chatStore.currentChannel) {
        chatStore.scrollToBottom();
    }
});

onUnmounted(() => {
    // Clean up
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
    }
});

// Watcher to update messagesContainer in the store
watch(messagesContainer, (newContainer) => {
    chatStore.messagesContainer = newContainer;
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

// Helper function to get typing users for a specific channel
function getTypingUsersForChannel(channelId) {
    return chatStore.typingUsers.filter((user) => user.channelId === channelId);
}

// Watchers
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
