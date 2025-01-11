//
//    auth.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 11.01.2025
//

import { useAuthStore } from "~/stores/auth";

// This code defines a Nuxt.js route middleware for authentication handling
export default defineNuxtRouteMiddleware((to, from) => {
    // Get access to the authentication store using Pinia
    const authStore = useAuthStore();

    // Check three conditions:
    // 1. If there's no authentication token (!authStore.token)
    // 2. If user is NOT trying to access the login page (to.path !== '/login')
    // 3. If user is NOT trying to access the register page (to.path !== '/register')
    if (!authStore.token && to.path !== "/login" && to.path !== "/register") {
        // If all conditions are true (no token and trying to access protected route)
        // Redirect the user to the login page
        return navigateTo("/login");
    }
});
