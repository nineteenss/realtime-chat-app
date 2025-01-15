<template>
    <div class="mb-4 flex flex-col h-full">
        <!-- Render channel info if a channel is selected -->
        <template v-if="chatStore.currentChannel">
            <!-- Channel Description -->
            <div class="mb-4">
                <ChannelTitles>Channel info</ChannelTitles>
                <div>
                    <p class="text-sm text-gray-600">
                        {{
                            chatStore.currentChannel.description ||
                            "No description available."
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
        </template>

        <!-- Always render the members list -->
        <!-- <ChatMembersListSearch /> -->
        <ChatMembersList />
    </div>
</template>

<script setup>
import ChannelTitles from "~/components/ChannelTitles.vue";
import ChatMembersList from "~/components/ChatMembersList.vue";
import initializeStores from "~/composables/chat-logic.js";

const { chatStore, confirmDelete, isChannelCreator, deleteChannel } =
    initializeStores();
</script>
