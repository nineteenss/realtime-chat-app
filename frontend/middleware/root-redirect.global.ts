//
//    root-redirect.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 12.01.2025
//

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Redirect to /chat if logged in and trying to access a guest-only route
    if (to.meta.requiresGuest && authStore.token) {
        return navigateTo("/chat");
    }

    // Redirect to /login if not logged in and trying to access an auth-only route
    if (to.meta.requiresAuth && !authStore.token) {
        return navigateTo("/login");
    }

    // Default behavior for root route
    if (to.path === "/") {
        if (authStore.token) {
            return navigateTo("/chat");
        } else {
            return navigateTo("/login");
        }
    }
});
