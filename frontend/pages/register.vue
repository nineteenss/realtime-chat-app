<template>
    <FormContainer
        title="Register"
        submit-button-text="Register"
        footer-text="Already have an account?"
        footer-link="/login"
        footer-link-text="Login"
        @submit="handleSubmit"
    />
</template>

<script setup>
// Imports
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Components
import FormContainer from "../components/FormContainer.vue";

// Page meta
definePageMeta({
    requiresGuest: true,
});

// Head meta
useHead({
    title: "Register",
});

// Variables
const router = useRouter();
const authStore = useAuthStore();

// Functions
async function handleSubmit(formData) {
    try {
        await authStore.register(formData.username, formData.password);
        router.push("/chat");
    } catch (error) {
        alert(error.message);
    }
}
</script>
