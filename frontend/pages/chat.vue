<template>
    <div class="flex h-screen">
        <!-- Left Column (Channels List) -->
        <div
            class="flex flex-col min-w-[300px] max-w-[400px] w-1/4 bg-gray-100 p-4"
        >
            <div class="mb-4 pb-4 border-b border-gray-200">
                <div class="flex flex-row items-center gap-2">
                    <div
                        class="flex flex-row items-center w-full justify-between"
                    >
                        <!-- Username -->
                        <div class="flex flex-row gap-2 items-center">
                            <div
                                class="bg-green-500 w-2.5 h-2.5 rounded-full"
                            ></div>
                            <p class="text-lg font-semibold">
                                {{ authStore.user.username || "Unknown User" }}
                            </p>
                        </div>

                        <div class="flex flex-row gap-2">
                            <!-- Logout Button -->
                            <Icon
                                @click="logout"
                                name="proicons:door-open"
                                class="bg-red-500 hover:bg-red-600 cursor-pointer w-6 h-6"
                            />

                            <!-- Lobby Button -->
                            <Icon
                                @click="goToLobby"
                                name="proicons:arrow-import"
                                class="bg-blue-500 hover:bg-blue-600 cursor-pointer w-6 h-6"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <!-- Channels Row -->
            <div class="flex flex-col h-full overflow-hidden">
                <ChannelTitles icon="chat">Channels</ChannelTitles>
                <div class="mb-4">
                    <input
                        v-model="newChannelName"
                        placeholder="Channel name"
                        class="w-full p-2 border rounded mb-0.5"
                    />
                    <textarea
                        v-model="newChannelDescription"
                        placeholder="Channel description (optional)"
                        class="w-full p-2 border rounded resize-none"
                        rows="3"
                        maxlength="300"
                    ></textarea>
                    <button
                        @click="createNewChannel"
                        :disabled="!newChannelName.trim()"
                        class="w-full btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Create Channel
                    </button>
                </div>
                <p class="mt-2 text-xs text-gray-400 text-center">
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
        <div class="flex flex-col flex-1 bg-white p-4 relative">
            <template v-if="chatStore.currentChannel">
                <!-- Blurred Overlay for Non-Members -->
                <div
                    v-if="!isChannelMember"
                    class="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                >
                    <p class="text-gray-500 text-lg mb-4">
                        Join channel to start a conversation.
                    </p>
                    <button
                        @click="joinChannel"
                        class="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Join Channel
                    </button>
                </div>

                <!-- Header with Room Title and Members Count -->
                <div
                    class="border-b border-gray-200 pb-4 mb-4 flex flex-row relative"
                >
                    <Icon
                        name="proicons:hash"
                        class="w-5 h-5 bg-gray-400 absolute top-1"
                    />
                    <div class="ml-7">
                        <h2 class="text-xl font-semibold">
                            {{ chatStore.currentChannel.name }}
                        </h2>
                        <div class="text-sm text-gray-600 flex flex-row">
                            {{ onlineMembersCount }} members online.&nbsp;
                            <div
                                v-if="chatStore.typingUsers.length > 0"
                                class="text-sm text-blue-500 relative"
                            >
                                <Icon
                                    name="svg-spinners:3-dots-bounce"
                                    class="bg-blue-500 absolute top-1"
                                />
                                <p class="ml-5">
                                    {{
                                        formatTypingNotification(
                                            chatStore.typingUsers,
                                            chatStore.currentChannel._id
                                        )
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scrollable Top Row -->
                <div
                    v-if="isChannelMember"
                    ref="messagesContainer"
                    class="flex-1 overflow-y-auto mb-4 px-1 space-y-0.5 rounded-2xl"
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
                    v-if="isChannelMember"
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
                            <Icon name="proicons:send" class="w-7 h-7" />
                        </button>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="flex-1 flex items-center justify-center">
                    <p class="text-gray-500 text-center">
                        Please select a channel to view details.
                    </p>
                </div>
            </template>
        </div>

        <!-- Right Column (Channel Info) -->
        <div
            class="flex flex-col min-w-[300px] max-w-[400px] w-1/4 bg-gray-100 p-4 overflow-hidden"
        >
            <ChannelInnerSidebar />
        </div>
    </div>
</template>

<script setup>
// Components imports
import ChannelItem from "~/components/ChannelItem.vue";
import ChannelChatBubble from "~/components/ChannelChatBubble.vue";
import ChannelTitles from "~/components/ChannelTitles.vue";
import ChannelInnerSidebar from "~/components/ChannelInnerSidebar.vue";
import initializeStores from "~/composables/chat-logic.js";

// Scripts
const {
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
    isChannelMember,
    chatStore,
    authStore,
    createNewChannel,
    selectChannel,
    joinChannel,
    sendMessage,
    handleInput,
    formatTypingNotification,
    shouldShowDateSeparator,
    formatDateSeparator,
    deleteChannel,
    isUserOnline,
    stringToColor,
} = initializeStores();

// Logout function
const logout = () => {
    authStore.logout();
    navigateTo("/login");
};

// Go to Lobby function
const goToLobby = () => {
    // Clear the current channel from localStorage
    localStorage.removeItem("currentChannelId");

    // Navigate to /chat
    navigateTo("/chat");

    // Refresh the page to reset the state
    window.location.reload();
};

// Handle "Esc" key press
const handleKeydown = (event) => {
    if (event.key === "Escape") {
        goToLobby();
    }
};

// Page meta
definePageMeta({
    requiresAuth: true,
});

// Head meta
useHead({
    title: "Chat",
});

// Lifecycle hooks
onMounted(async () => {
    // Wait for the DOM to be fully rendered
    await nextTick();

    window.addEventListener("keydown", handleKeydown);

    // Bind the messagesContainer ref to the store
    chatStore.messagesContainer = messagesContainer.value;

    // Initialize socket and fetch channels
    chatStore.initSocket();
    chatStore.listenForTypingNotifications();

    // Fetch all registered users
    chatStore.fetchAllMembers();

    // Check localStorage for the current channel ID
    const currentChannelId = localStorage.getItem("currentChannelId");

    // Scroll to the bottom when the component is mounted
    // Automatically re-join the current channel if it exists
    if (currentChannelId) {
        try {
            // Fetch the channel details
            const channel = await chatStore.fetchChannelDetails(
                currentChannelId
            );
            chatStore.currentChannel = channel;

            // Re-join the Socket.IO room for the current channel
            if (chatStore.socket) {
                chatStore.socket.emit("join-channel", currentChannelId);
            }

            // Check if the user is a member of the channel
            if (
                chatStore.currentChannel.members.some(
                    (member) => member._id === authStore.user.id
                )
            ) {
                // Fetch messages for the current channel
                await chatStore.fetchMessages(currentChannelId);
                chatStore.scrollToBottom();
            }
        } catch (error) {
            console.error("Error restoring channel:", error);
            localStorage.removeItem("currentChannelId"); // Clear invalid channel ID
            chatStore.currentChannel = null;
        }
    }

    // If no channel is selected, fetch the first channel (optional)
    if (!chatStore.currentChannel && chatStore.channels.length > 0) {
        await chatStore.joinChannel(chatStore.channels[0]._id);
        await chatStore.fetchMessages(chatStore.channels[0]._id);
        chatStore.scrollToBottom();
    }

    // console.log("Current Channel (onMounted):", chatStore.currentChannel); // Debugging
    // console.log("Members (onMounted):", chatStore.currentChannel?.members); // Debugging
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    // Clean up
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
    }
});

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
