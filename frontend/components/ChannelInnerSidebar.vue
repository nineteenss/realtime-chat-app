<template>
    <div class="mb-4 flex flex-col h-full">
        <!-- Channel Description -->
        <div class="mb-4">
            <ChannelTitles>Channel info</ChannelTitles>
            <div v-if="chatStore.currentChannel">
                <p class="text-sm text-gray-600">
                    {{
                        chatStore.currentChannel.description ||
                        "No description available."
                    }}
                </p>
            </div>
            <div v-else>
                <p class="text-sm text-gray-600">No channel selected.</p>
            </div>
        </div>

        <!-- Delete Channel Button (Creator Only) -->
        <div v-if="isChannelCreator" class="mb-4">
            <label class="flex items-center gap-2 mb-2">
                <input
                    v-model="confirmDelete"
                    type="checkbox"
                    class="form-checkbox"
                />
                <span class="text-xs text-gray-700">
                    I understand what I am doing by deleting this channel.
                </span>
            </label>
            <button
                @click="deleteChannel"
                :disabled="!confirmDelete"
                class="w-full btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Delete Channel
            </button>
        </div>

        <!-- Members List with Search -->
        <!-- Search Field -->
        <div class="mb-4">
            <ChannelTitles>
                {{ filteredMembers.length }} Members
            </ChannelTitles>
            <input
                v-model="searchQuery"
                placeholder="Search members..."
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
                    <p class="font-semibold truncate">
                        {{ member.username || "Unknown User" }}
                    </p>
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
import ChannelTitles from "~/components/ChannelTitles.vue";
import initializeStores from "~/composables/chat-logic.js";

const {
    chatStore,
    confirmDelete,
    searchQuery,
    filteredMembers,
    isChannelCreator,
    deleteChannel,
    isUserOnline,
    stringToColor,
} = initializeStores();
</script>
