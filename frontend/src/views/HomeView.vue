<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import apiClient from '@/services/api';

const categories = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await apiClient.get('/categories');
    categories.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-5xl mx-auto py-8">
    <div class="mb-12">
      <h1 class="text-6xl font-black italic uppercase tracking-tighter text-white mb-2">Main Menu</h1>
      <div class="h-1 w-24 bg-[#ccff00]"></div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <RouterLink 
        v-for="cat in categories" 
        :key="cat.id" 
        :to="`/category/${cat.id}`"
        class="group relative overflow-hidden bg-[#0a0a1a] border border-white/5 hover:border-[#ccff00]/50 transition-all p-8 shadow-2xl h-48 flex flex-col justify-end"
      >
        <div class="absolute top-0 right-0 p-4 text-8xl font-black text-white/5 uppercase select-none group-hover:text-[#ccff00]/5 transition-colors">
          {{ cat.name.split(' ')[0] }}
        </div>
        
        <div class="relative z-10">
          <h2 class="text-3xl font-black italic uppercase text-white group-hover:text-[#ccff00] transition-colors leading-none mb-2">
            {{ cat.name }}
          </h2>
          <p class="text-xs opacity-50 font-bold uppercase tracking-widest">{{ cat.description }}</p>
        </div>

        <div class="absolute top-4 right-4 flex flex-col items-end">
          <span class="text-2xl font-black text-[#ccff00] leading-none">{{ cat.post_count }}</span>
          <span class="text-[8px] font-black uppercase opacity-40">Threads</span>
        </div>

        <div class="absolute bottom-0 left-0 w-0 h-1 bg-[#ccff00] group-hover:w-full transition-all duration-300"></div>
      </RouterLink>
    </div>
  </div>
</template>