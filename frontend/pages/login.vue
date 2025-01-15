<template>
    <FormContainer
        title="Login"
        submit-button-text="Login"
        footer-text="Don't have an account?"
        footer-link="/register"
        footer-link-text="Register"
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
    title: "Login",
});

// Variables
const router = useRouter();
const authStore = useAuthStore();

// Functions
async function handleSubmit(formData) {
    try {
        await authStore.login(formData.username, formData.password);
        router.push("/chat");
    } catch (error) {
        alert(error.message);
    }
}
</script>
