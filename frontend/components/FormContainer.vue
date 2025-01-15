<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
            <h2 v-if="title" class="text-2xl font-bold mb-6 text-center">
                {{ title }}
            </h2>
            <form @submit.prevent="handleSubmit">
                <!-- Username Input -->
                <div class="mb-0.5">
                    <p v-if="usernameError" class="text-red-500 text-xs">
                        {{ usernameError }}
                    </p>
                    <input
                        v-model="username"
                        type="text"
                        placeholder="Username"
                        required
                        class="w-full p-2 border rounded mb-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Password Input -->
                <div class="mb-1 relative">
                    <p v-if="passwordError" class="text-red-500 text-xs">
                        {{ passwordError }}
                    </p>
                    <input
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Password"
                        required
                        class="w-full p-2 border rounded mb-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        @click="toggleShowPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                        <Icon
                            :name="
                                showPassword
                                    ? 'proicons:eye-off'
                                    : 'proicons:eye'
                            "
                            class="w-5 h-5"
                        />
                    </button>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    class="w-full btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {{ submitButtonText }}
                </button>

                <!-- Footer Link -->
                <p class="mt-4 text-center text-gray-600">
                    {{ footerText }}
                    <NuxtLink
                        :to="footerLink"
                        class="text-blue-500 hover:underline"
                    >
                        {{ footerLinkText }}
                    </NuxtLink>
                </p>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
    title: {
        type: String,
        default: "",
    },
    submitButtonText: {
        type: String,
        default: "Submit",
    },
    footerText: {
        type: String,
        default: "",
    },
    footerLink: {
        type: String,
        default: "",
    },
    footerLinkText: {
        type: String,
        default: "",
    },
});

// Emits
const emit = defineEmits(["submit"]);

// Variables
const username = ref("");
const password = ref("");
const usernameError = ref("");
const passwordError = ref("");
const showPassword = ref(false);

// Functions
function validateUsername() {
    if (username.value.length < 3 || username.value.length > 20) {
        usernameError.value = "Username must be between 3 and 20 characters.";
        return false;
    }
    usernameError.value = "";
    return true;
}

function validatePassword() {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password.value)) {
        passwordError.value =
            "Password must be at least 6 characters and include at least one letter and one number.";
        return false;
    }
    passwordError.value = "";
    return true;
}

function toggleShowPassword() {
    showPassword.value = !showPassword.value;
}

function handleSubmit() {
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (!isUsernameValid || !isPasswordValid) {
        return;
    }

    // Emit the form data to the parent component
    emit("submit", {
        username: username.value,
        password: password.value,
    });
}
</script>
