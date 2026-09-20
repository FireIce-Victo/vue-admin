import { createApp } from 'vue';
import '@/styles/index.scss';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { setupElIcons } from './plugins';
import "virtual:svg-icons-register";
import { setupStore } from './stores';
import permission from '@/directives/permission';

const app = createApp(App);

setupElIcons(app);
setupStore(app);
app.use(router);
app.use(ElementPlus);
app.directive('permission', permission);
app.mount('#app');
