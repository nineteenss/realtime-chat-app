//
//    pinia-persistedstate.client.ts
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 15.01.2025
//

import { defineNuxtPlugin } from "#app";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export default defineNuxtPlugin((nuxtApp) => {
    // console.log("Initializing pinia-plugin-persistedstate"); // Debugging
    // Access the Pinia instance created by @pinia/nuxt
    const pinia = usePinia();

    // Use the persistedstate plugin
    pinia.use(piniaPluginPersistedstate);
});