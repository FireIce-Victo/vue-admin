import { createPinia } from "pinia";

const store = createPinia();

export function setupStore(app) {
    app.use(store)
}

export * from "@/stores/modules/tagsView";
export * from "@/stores/modules/app";
export * from '@/stores/modules/user'

export { store }