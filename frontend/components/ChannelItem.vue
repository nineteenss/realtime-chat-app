<template>
    <div class="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
        <!-- Circle with initials -->
        <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            :style="{ backgroundColor: channel.color }"
        >
            {{ channelInitials }}
        </div>

        <!-- Channel name and last message/typing -->
        <div class="ml-3 flex-1 min-w-0">
            <div class="font-semibold truncate">{{ channel.name }}</div>
            <div class="text-sm text-gray-600 truncate">
                <!-- Show typing notification if someone is typing in this channel -->
                <template v-if="isTypingInThisChannel">
                    {{ typingText }}
                </template>
                <!-- Otherwise, show the last message -->
                <template v-else>
                    {{ lastMessageText }}
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    channel: {
        type: Object,
        required: true,
    },
    typingUsers: {
        type: Array,
        default: () => [],
    },
});

// Get the first two letters of the channel name
const channelInitials = computed(() => {
    return props.channel.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
});

// Check if someone is typing in this channel
const isTypingInThisChannel = computed(() => {
    return props.typingUsers.some(
        (user) => user.channelId === props.channel._id
    );
});

// Format the typing text
const typingText = computed(() => {
    const users = props.typingUsers
        .filter((user) => user.channelId === props.channel._id)
        .map((user) => user.username);

    if (users.length === 1) {
        return `${users[0]} is typing...`;
    } else if (users.length === 2) {
        return `${users[0]} and ${users[1]} are typing...`;
    } else if (users.length > 2) {
        return `${users[0]}, ${users[1]} and ${
            users.length - 2
        } more are typing...`;
    }
    return "";
});

// Get the last message text
const lastMessageText = computed(() => {
    const lastMessage =
        props.channel.messages[props.channel.messages.length - 1];
    if (lastMessage) {
        return lastMessage.content.length > 30
            ? lastMessage.content.substring(0, 30) + "..."
            : lastMessage.content;
    }
    return "No messages yet";
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
