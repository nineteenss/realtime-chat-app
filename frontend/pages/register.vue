<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <h2>Register</h2>
            <input
                v-model="username"
                type="text"
                placeholder="Username"
                required
            />
            <input
                v-model="password"
                type="password"
                placeholder="Password"
                required
            />
            <button type="submit">Register</button>
            <p>
                Already have an account?
                <NuxtLink to="/login">[ Login ]</NuxtLink>
            </p>
        </form>
    </div>
</template>

<script setup>
// Imports
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Page meta
definePageMeta({
    requiresGuest: true,
});

// Variables
const router = useRouter();
const authStore = useAuthStore();
const username = ref("");
const password = ref("");

// Functions
async function handleSubmit() {
    try {
        await authStore.register(username.value, password.value);
        router.push("/chat");
    } catch (error) {
        alert(error.message);
    }
}

// Computed properties (if needed)

// Watchers (if needed)
</script>
