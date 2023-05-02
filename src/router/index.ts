import { createRouter, createWebHistory } from "vue-router"
import menu    from "@/views/MenuView.vue"
import login   from "@/views/LoginView.vue"
import photo   from "@/views/PhotoView.vue"
import profile from "@/views/ProfileView.vue"
import friend  from "@/views/FriendView.vue"


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "menu",
      component: menu
    },
    {
      path: "/login",
      name: "login",
      component: login
    },
    {
      path: "/photo",
      name: "photo",
      component: photo
    },
    {
      path: "/profile",
      name: "profile",
      component: profile
    },
    {
      path: "/friend",
      name: "friend",
      component: friend
    }
  ]
});

export default router
