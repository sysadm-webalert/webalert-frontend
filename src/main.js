import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import routes from './router/routes'
import App from './App.vue'
import 'sweetalert2/dist/sweetalert2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const pinia = createPinia()
createApp(App).use(pinia).use(routes).mount('#app')
