<template>
    <div
        :class="[
            'flex flex-col',
            message.sender._id === authStore.user.id
                ? 'items-end'
                : 'items-start',
        ]"
    >
        <!-- Show sender's name only if it's a new sender or the first message -->
        <div
            v-if="
                index === 0 ||
                chatStore.messages[index - 1].sender._id !== message.sender._id
            "
            :class="[
                'text-sm font-semibold mb-1 mt-4 mx-3 flex gap-1',
                message.sender._id === authStore.user.id
                    ? 'flex-row-reverse'
                    : 'flex-row',
            ]"
        >
            <p
                class="uppercase text-[10px]/[12px] text-white bg-orange-500 px-1.5 py-1 rounded-full flex font-bold"
            >
                Owner
            </p>
            <p>{{ message.sender.username }}</p>
        </div>
        <div
            :class="[
                'p-3 rounded-2xl max-w-[70%]',
                message.sender._id === authStore.user.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200',
            ]"
        >
            <p class="font-medium">{{ message.content }}</p>
            <p
                :class="[
                    'block text-[12px]/[9px] mt-2',
                    message.sender._id === authStore.user.id
                        ? 'text-blue-300'
                        : 'text-gray-400',
                ]"
            >
                {{ new Date(message.timestamp).toLocaleTimeString() }}
            </p>
        </div>
    </div>
</template>

<script setup>
// Component props
const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
    authStore: {
        type: Object,
        required: true,
    },
    chatStore: {
        type: Object,
        required: true,
    },
    index: {
        type: Number,
        required: true,
    },
});
</script>
