import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)
// Router を追加
app.use(router)

app.mount('#app')
