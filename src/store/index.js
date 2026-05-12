import { createPinia } from "pinia";

const store = createPinia();

export function setupStore(app) {
    app.use(store)
}

export * from "@/store/modules/tagsView";
export * from "@/store/modules/app";

export { store }