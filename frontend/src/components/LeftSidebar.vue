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
  <div class="sticky top-28 space-y-4">
    <div class="bg-[#0a0a1a] shadow-xl border-l-4 border-[#ccff00] overflow-hidden">
      <div class="p-4 bg-[#1a1a3a] font-black uppercase italic text-xs tracking-widest text-[#ccff00] border-b border-white/5">
        Match Center
      </div>
      
      <ul class="menu p-0 rounded-none">
        <li>
          <RouterLink to="/" class="rounded-none border-b border-white/5 py-4 px-6 hover:bg-[#ccff00] hover:text-black group transition-all">
            <span class="font-black italic uppercase text-sm tracking-tighter">Stadium Index</span>
          </RouterLink>
        </li>
        
        <div class="p-4 pt-6 pb-2 text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">Game Modes</div>
        
        <div v-if="isLoading" class="p-6 text-center">
          <span class="loading loading-spinner loading-sm text-[#ccff00]"></span>
        </div>
        
        <li v-for="cat in categories" :key="cat.id">
          <RouterLink :to="`/category/${cat.id}`" class="rounded-none border-b border-white/5 py-4 px-6 hover:bg-[#ccff00] hover:text-black transition-all">
            <span class="font-black italic uppercase text-sm tracking-tighter">{{ cat.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="p-6 bg-[#ccff00]/5 border border-[#ccff00]/20">
      <div class="text-[10px] font-black uppercase text-[#ccff00] mb-2 tracking-widest">Live Updates</div>
      <p class="text-[11px] font-bold opacity-60 leading-relaxed uppercase">
        Market crash expected after 6PM content drop. Check Tactics section for Meta formations.
      </p>
    </div>
  </div>
</template>