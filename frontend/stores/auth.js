//
//    auth.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 11.01.2025
//

import { defineStore } from "pinia";

// Define a Pinia store for authentication functionality
export const useAuthStore = defineStore("auth", {
    // Initial state of the store
    state: () => ({
        token: null,
        user: null,
    }),

    actions: {
        /*
            Getter properties
        */

        // Helper function to get the backend URL
        getBackendUrl() {
            const config = useRuntimeConfig();
            return config.public.apiBase;
        },

        /*
            Authentication-related actions
        */

        // Register a new user
        async register(username, password) {
            try {
                const backendUrl = this.getBackendUrl();
                // Send a POST request to the server
                const response = await fetch(`${backendUrl}/api/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                });

                // Parse the JSON response
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                // Store the token and user data in the store
                this.token = data.token;
                this.user = data.user;

                return data;
            } catch (error) {
                throw error;
            }
        },

        // Log in an existing user
        async login(username, password) {
            try {
                const backendUrl = this.getBackendUrl();
                // Send a POST request to the login endpoint
                const response = await fetch(`${backendUrl}/api/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                });

                // Parse the JSON response
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                // Store the token and user data in the store
                this.token = data.token;
                this.user = data.user;

                console.log("Login successful. Token:", this.token);
                return data;
            } catch (error) {
                throw error;
            }
        },

        // Log out the current user
        logout() {
            this.token = null;
            this.user = null;
        },
    },
    persist: true,
});
