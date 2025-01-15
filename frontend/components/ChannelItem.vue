<template>
    <div
        :class="[
            'flex items-center p-2 transition-colors duration-200 cursor-pointer',
            isActive
                ? 'bg-gray-300 border-r-4 border-blue-500'
                : 'hover:bg-gray-200',
        ]"
    >
        <!-- Circle with initials -->
        <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            :style="{ backgroundColor: channel.color }"
        >
            {{ channelInitials }}
        </div>

        <!-- Channel name and last message/typing -->
        <div class="ml-3 flex-1 min-w-0">
            <div
                class="font-semibold truncate flex flex-row items-center gap-1"
                style="
                    mask-image: linear-gradient(
                        to left,
                        transparent,
                        25%,
                        #000
                    );
                "
            >
                <div
                    class="uppercase text-[10px]/[9px] text-white bg-slate-500 px-1.5 py-1 rounded-full flex font-bold"
                >
                    Channel
                </div>
                {{ channel.name }}
            </div>
            <div
                class="text-sm text-gray-600 truncate flex flex-row items-end gap-1 relative overflow-hidden"
            >
                <!-- Show typing notification if someone is typing in this channel -->
                <template v-if="isTypingInThisChannel">
                    <Icon
                        name="svg-spinners:3-dots-bounce"
                        class="bg-blue-500 absolute top-1"
                    />
                    <p class="text-blue-500 ml-5">{{ typingText }}</p>
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
// Imports
import { computed } from "vue";

// Component props
const props = defineProps({
    channel: {
        type: Object,
        required: true,
    },
    typingUsers: {
        type: Array,
        default: () => [],
    },
    isActive: {
        type: Boolean,
        default: false,
    },
});

// Variables
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
        return `${users[0]} is typing`;
    } else if (users.length === 2) {
        return `${users[0]} and ${users[1]} are typing`;
    } else if (users.length > 2) {
        return `${users[0]}, ${users[1]} and ${
            users.length - 2
        } more are typing`;
    }
    return "";
});

// Get the last message text
const lastMessageText = computed(() => {
    const lastMessage =
        props.channel.messages[props.channel.messages.length - 1];
    return lastMessage ? lastMessage.content : "No messages yet";
});
</script>
