//
//    auth.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 11.01.2025
//

import { defineStore } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: null,
        user: null,
    }),

    actions: {
        async register(username, password) {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/register",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username, password }),
                    }
                );

                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                this.token = data.token;
                this.user = data.user;

                return data;
            } catch (error) {
                throw error;
            }
        },

        async login(username, password) {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username, password }),
                    }
                );

                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                this.token = data.token;
                this.user = data.user;

                return data;
            } catch (error) {
                throw error;
            }
        },

        logout() {
            this.token = null;
            this.user = null;
        },
    },
    persist: true,
});
