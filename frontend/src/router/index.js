import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import PostDetailView from '@/views/PostDetailView.vue';
import CreatePostView from '@/views/CreatePostView.vue';
import UserProfileView from '@/views/UserProfileView.vue';
import SettingsView from '@/views/SettingsView.vue';
import AdminPanelView from '@/views/AdminPanelView.vue';
import CategoryDetailView from '@/views/CategoryDetailView.vue'; 

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/thread/:id', name: 'post-detail', component: PostDetailView },
  { path: '/category/:id', name: 'category-detail', component: CategoryDetailView },
  { path: '/submit', name: 'post-create', component: CreatePostView, meta: { requiresAuth: true } },
  { path: '/user/:username', name: 'user-profile', component: UserProfileView },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminPanelView, meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) next('/login');
  else if (to.meta.requiresAdmin && !auth.isAdmin) next('/');
  else next();
});

export default router;