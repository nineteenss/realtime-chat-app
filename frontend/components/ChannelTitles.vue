<template>
    <h3
        class="text-[15px]/[18px] font-bold uppercase mb-3 flex flex-row items-center gap-3"
    >
        <Icon :name="`proicons:${icon}`" class="w-7 h-7 bg-blue-500" />
        <slot></slot>
    </h3>
</template>

<script setup>
defineProps({
    icon: {
        type: String,
        required: true,
    },
});
</script>
