<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const guilds = ref([]);
const isLoading = ref(true);
onMounted(async () => {
  try {
    isLoading.value = true;
    const res = await apiClient.get('/communities');
    guilds.value = res.data;
  } catch (err) {
    console.error("Failed to load guilds:", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
      <div class="border-l-4 border-primary pl-4">
        <h1 class="text-4xl font-black italic uppercase tracking-tighter text-white">Guild Directory</h1>
        <p class="text-xs opacity-50 uppercase tracking-widest font-bold mt-1">Explore active gaming realms</p>
      </div>
      <RouterLink 
        v-if="authStore.isAdmin" 
        to="/communities/create" 
        class="btn btn-primary btn-md shadow-lg shadow-primary/20 font-black uppercase italic"
      >
        ➕ Establish New Guild
      </RouterLink>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-bars loading-lg text-primary"></span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="guild in guilds" 
        :key="guild.id" 
        class="card bg-base-200 shadow-xl hover:bg-base-300 transition-all border border-white/5 hover:border-primary/30 group"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <h2 class="card-title text-2xl font-black italic text-primary uppercase group-hover:scale-105 transition-transform">
              /g/{{ guild.name }}
            </h2>
          </div>
          <p class="text-sm opacity-70 mt-2 line-clamp-3">
            {{ guild.description || 'No manifest provided for this guild.' }}
          </p>
          
          <div class="card-actions justify-end mt-6 pt-4 border-t border-white/5">
            <RouterLink 
              :to="`/community/${guild.id}`" 
              class="btn btn-ghost btn-sm uppercase font-black hover:text-primary"
            >
              Enter Realm →
            </RouterLink>
          </div>
        </div>
      </div>
      <div 
        v-if="guilds.length === 0 && authStore.isAdmin" 
        class="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-2xl"
      >
        <p class="opacity-40 font-bold uppercase mb-4">The directory is empty.</p>
        <RouterLink to="/communities/create" class="btn btn-outline btn-primary">Establish the first Guild</RouterLink>
      </div>
    </div>
  </div>
</template>