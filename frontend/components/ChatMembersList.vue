<template>
    <div class="grid grid-rows-[auto_1fr] h-full rounded-lg overflow-hidden">
        <!-- Members List with Search -->
        <div class="mb-4">
            <ChannelTitles icon="emoji">
                {{ filteredMembers.length }} Members
            </ChannelTitles>
            <input
                v-model="searchQuery"
                placeholder="Type to search members..."
                class="w-full p-2 border rounded"
            />
        </div>
        <!-- Scrollable Members List -->
        <div class="space-y-0.5 overflow-y-auto">
            <div
                v-for="member in filteredMembers"
                :key="member._id"
                class="p-2 bg-white hover:bg-gray-50 transition-colors duration-200 rounded-lg flex items-center gap-3 relative"
            >
                <!-- Kick Button -->
                <ChannelKickButton
                    :member="member"
                    :is-channel-creator="isChannelCreator"
                    :is-user-self="isUserSelf(member._id)"
                    @kick="handleKick"
                />

                <!-- Circle with Initial -->
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                    :style="{
                        backgroundColor: stringToColor(member.username || ''),
                    }"
                >
                    {{ member.username?.charAt(0).toUpperCase() || "?" }}
                </div>
                <!-- Username and Online Status -->
                <div class="flex-1 min-w-0">
                    <div class="flex flex-row relative">
                        <div
                            class="font-semibold truncate flex flex-row items-center gap-2"
                        >
                            {{ member.username || "Unknown User" }}
                            <div
                                v-if="isUserSelf(member._id)"
                                class="w-2 h-2 bg-blue-500 rounded-full"
                            ></div>
                        </div>
                        <p
                            v-if="channelCreator(member._id)"
                            class="uppercase text-[10px]/[23px] text-orange-500 font-bold absolute right-0 mr-1"
                        >
                            Owner
                        </p>
                    </div>

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
</template>

<script setup>
import initializeStores from "~/composables/chat-logic.js";
import ChannelKickButton from "./ChannelKickButton.vue";

const props = defineProps({
    chatStore: {
        type: Object,
        required: true,
    },
});

const {
    isUserOnline,
    searchQuery,
    filteredMembers,
    stringToColor,
    isChannelMember,
    isChannelCreator,
} = initializeStores();

// Check if the sender is the channel creator
const channelCreator = (senderId) => {
    const creatorId =
        props.chatStore.currentChannel?.creator?._id ||
        props.chatStore.currentChannel?.creator;
    return creatorId === senderId;
};

// Check if the user is the current user
const isUserSelf = (senderId) => {
    const authStore = useAuthStore();
    return senderId === authStore.user.id;
};

// Handle kick event
const handleKick = async (memberId) => {
    try {
        await props.chatStore.kickMember(memberId);
    } catch (error) {
        console.error("Error kicking member:", error);
    }
};
</script>
