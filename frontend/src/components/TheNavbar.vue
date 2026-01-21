<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<template>
  <div class="navbar bg-[#0a0a1a] border-b-2 border-[#ccff00] px-4 md:px-8 py-3 sticky top-0 z-50 shadow-2xl">
    <div class="navbar-start">
      <RouterLink to="/" class="group flex items-center gap-2">
       <span class="text-3xl font-black italic uppercase tracking-tighter text-[#ccff00] group-hover:text-white transition-colors">
         FC<span class="text-white group-hover:text-[#ccff00]">FORUM</span>
       </span>
       <div class="bg-[#ccff00] h-6 w-1 -skew-x-12"></div>
      </RouterLink>
    </div>
    
    <div class="navbar-end gap-4">
      <template v-if="!authStore.isAuthenticated">
        <RouterLink to="/login" class="text-xs font-black uppercase tracking-widest hover:text-[#ccff00] transition-colors">Login</RouterLink>
        <RouterLink to="/register" class="btn btn-sm btn-primary rounded-none font-black italic uppercase px-6">Join Club</RouterLink>
      </template>

      <template v-else>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="flex items-center gap-3 cursor-pointer group">
            <div class="text-right hidden sm:block">
              <div class="text-xs font-black uppercase italic tracking-tighter">{{ authStore.user?.username }}</div>
              <div class="text-[9px] font-bold text-[#ccff00] uppercase">{{ authStore.user?.role }}</div>
            </div>
            <div class="avatar online">
              <div class="w-10 rounded-none border-2 border-[#ccff00] group-hover:border-white transition-colors">
                <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" />
                <div v-else class="bg-[#1a1a3a] flex items-center justify-center h-full text-xl font-black text-white/20">
                  {{ authStore.user?.username[0] }}
                </div>
              </div>
            </div>
          </div>
          <ul tabindex="0" class="menu menu-md dropdown-content mt-4 z-[100] p-2 shadow-2xl bg-[#0a0a1a] border-2 border-[#ccff00] rounded-none w-56">
            <li class="p-2 text-[10px] font-black uppercase text-[#ccff00] opacity-50 tracking-widest">Player Menu</li>
            <li><RouterLink :to="`/user/${authStore.user?.username}`" class="rounded-none font-bold uppercase text-xs italic"> Squad Member Profile</RouterLink></li>
            <li v-if="authStore.isAdmin"><RouterLink to="/admin" class="rounded-none font-bold uppercase text-xs italic text-[#ccff00]">Manager Panel</RouterLink></li>
            <div class="divider my-0 opacity-10"></div>
            <li><a @click.prevent="authStore.logout()" class="rounded-none font-bold uppercase text-xs italic text-error">Logout Session</a></li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>