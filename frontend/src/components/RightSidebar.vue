<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const stats = ref({ totalPosts: 0, totalUsers: 0 });
const userData = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    isLoading.value = true;
    const statRes = await apiClient.get('/admin/stats').catch(() => null);
    if (statRes) stats.value = statRes.data;

    if (authStore.user) {
      const profileRes = await apiClient.get(`/users/${authStore.user.username}`).catch(() => null);
      if (profileRes) userData.value = profileRes.data.user;
    }
  } catch (err) {
    console.error("Sidebar sync error:", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="sticky top-28 space-y-6">
    <div v-if="authStore.isAuthenticated" class="relative group animate-in slide-in-from-right duration-700">
      <div class="card bg-[#0a0a1a] shadow-2xl border-t-2 border-[#ccff00] overflow-hidden rounded-none clip-path-card">
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col items-center">
              <div class="text-4xl font-black italic text-[#ccff00] leading-none">88</div>
              <div class="text-[10px] font-bold text-white uppercase tracking-tighter opacity-80">{{ authStore.user?.role }}</div>
            </div>
            <div class="w-20 h-20 bg-gradient-to-b from-[#1a1a3a] to-transparent rounded-lg flex items-center justify-center border-b-2 border-[#ccff00]/30">
                <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" class="w-full h-full object-cover" />
                <span v-else class="text-4xl font-black text-white/10">{{ authStore.user?.username[0] }}</span>
            </div>
          </div>

          <div class="mt-4 text-center">
            <h3 class="text-xl font-black italic uppercase tracking-tighter text-white">{{ authStore.user?.username }}</h3>
          </div>

          <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 border-t border-white/10 pt-4">
            <div class="flex justify-between items-center group/stat">
              <span class="text-[10px] font-bold opacity-40 group-hover/stat:text-[#ccff00]">PAC</span>
              <span class="text-xs font-black text-white">82</span>
            </div>
            <div class="flex justify-between items-center group/stat">
              <span class="text-[10px] font-bold opacity-40 group-hover/stat:text-[#ccff00]">DRI</span>
              <span class="text-xs font-black text-white">85</span>
            </div>
            <div class="flex justify-between items-center group/stat">
              <span class="text-[10px] font-bold opacity-40 group-hover/stat:text-[#ccff00]">SHO</span>
              <span class="text-xs font-black text-white">79</span>
            </div>
            <div class="flex justify-between items-center group/stat">
              <span class="text-[10px] font-bold opacity-40 group-hover/stat:text-[#ccff00]">DEF</span>
              <span class="text-xs font-black text-white">45</span>
            </div>
            <div class="flex justify-between items-center group/stat">
              <span class="text-[10px] font-bold opacity-40 group-hover/stat:text-[#ccff00]">PAS</span>
              <span class="text-xs font-black text-white">88</span>
            </div>
            <div class="flex justify-between items-center group/stat">
              <span class="text-[10px] font-bold opacity-40 group-hover/stat:text-[#ccff00]">PHY</span>
              <span class="text-xs font-black text-white">72</span>
            </div>
          </div>
        </div>

        <div class="bg-[#ccff00] p-3 text-center transition-colors hover:bg-white">
          <RouterLink :to="`/user/${authStore.user?.username}`" class="text-[10px] font-black uppercase text-black">
            View Career Records
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="card bg-[#0a0a1a] shadow-xl border-l-4 border-[#ccff00] rounded-none">
      <div class="p-4 bg-[#1a1a3a] border-b border-white/5">
        <h3 class="font-black uppercase italic text-xs tracking-widest text-[#ccff00]">Club Records</h3>
      </div>
      
      <div class="p-5 space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold uppercase opacity-40">Match Tactics</span>
          <span class="text-xl font-black text-white">{{ stats.totalPosts || 0 }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold uppercase opacity-40">Active Squad</span>
          <span class="text-xl font-black text-white">{{ stats.totalUsers || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clip-path-card {
  clip-path: polygon(0% 0%, 100% 0%, 100% 92%, 50% 100%, 0% 92%);
}
</style>