import { defineStore } from "pinia";
import { reactive } from "vue";
import { useStorage } from "@vueuse/core";

export const useAppStore = defineStore("app", () => {
    const sidebarStatus = useStorage("sidebarstatus", "closed");
    const sidebar = reactive({
        opened: sidebarStatus.value !== "closed",
        withoutAnimation: false
    })

    function toggleSidebar() {
        sidebar.opened = !sidebar.opened;
        sidebar.withoutAnimation = false
        if (sidebar.opened) {
            sidebarStatus.value = "opened"
        } else {
            sidebarStatus.value = "closed"
        }
    }

    function closeSidebar(withoutAnimation) {
        sidebar.opened = false;
        sidebar.withoutAnimation = withoutAnimation;
        sidebarStatus.value = "closed";
    }

    function openSidebar(withoutAnimation) {
        sidebar.opened = true;
        sidebar.withoutAnimation = withoutAnimation;
        sidebarStatus.value = "opened";
    }

    return {
        sidebar,
        toggleSidebar,
        closeSidebar,
        openSidebar
    }
})