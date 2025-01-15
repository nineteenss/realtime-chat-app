<template>
    <div>
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
                        backgroundColor: stringToColor(member.username || ''),
                    }"
                >
                    {{ member.username?.charAt(0).toUpperCase() || "?" }}
                </div>
                <!-- Username and Online Status -->
                <div class="flex-1 min-w-0">
                    <div class="flex flex-row relative">
                        <p class="font-semibold truncate">
                            {{ member.username || "Unknown User" }}
                        </p>
                        <p
                            v-if="isChannelCreator(member._id)"
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

const props = defineProps({
    chatStore: {
        type: Object,
        required: true,
    },
});

const { isUserOnline, searchQuery, filteredMembers, stringToColor } =
    initializeStores();

// Check if the sender is the channel creator
const isChannelCreator = (senderId) => {
    const creatorId =
        props.chatStore.currentChannel?.creator?._id ||
        props.chatStore.currentChannel?.creator;
    return creatorId === senderId;
};
</script>
