<template>
    <div class="flex flex-col h-full">
        <!-- Render channel info if a channel is selected -->
        <template v-if="chatStore.currentChannel">
            <!-- Channel Description -->
            <div class="mb-4">
                <ChannelTitles icon="info">Channel info</ChannelTitles>
                <div>
                    <p class="text-sm text-gray-500 font-light italic">
                        {{
                            chatStore.currentChannel.description ||
                            "No description."
                        }}
                    </p>
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
                        Yes, I am sure that i want to delete this channel.
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
        </template>

        <!-- Always render the members list -->
        <ChatMembersList :chat-store="chatStore" />

        <!-- Leave Channel Button (Pinned to Bottom) -->
        <template v-if="chatStore.currentChannel">
            <div class="mt-auto pt-4">
                <button
                    @click="leaveChannel"
                    class="w-full btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Leave Channel
                </button>
            </div>
        </template>
    </div>
</template>

<script setup>
import ChannelTitles from "~/components/ChannelTitles.vue";
import initializeStores from "~/composables/chat-logic.js";

const {
    chatStore,
    confirmDelete,
    isChannelCreator,
    deleteChannel,
    leaveChannel,
} = initializeStores();
</script>
