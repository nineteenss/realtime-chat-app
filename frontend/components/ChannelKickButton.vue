<template>
    <div v-if="isChannelCreator && !isUserSelf" class="absolute right-3 z-10">
        <div
            class="bg-red-500 w-12 h-9 flex flex-row items-center justify-center rounded-md backdrop-blur cursor-pointer"
            @click="handleKick"
        >
            <Icon
                name="proicons:panel-right-contract"
                class="w-7 h-7 bg-white relative"
            />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    member: {
        type: Object,
        required: true,
    },
    isChannelCreator: {
        type: Boolean,
        required: true,
    },
    isUserSelf: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(["kick"]);

const handleKick = () => {
    emit("kick", props.member._id);
};
</script>
