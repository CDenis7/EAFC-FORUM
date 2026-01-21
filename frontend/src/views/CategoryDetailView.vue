<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const category = ref(null);
const posts = ref([]);
const isLoading = ref(true);

const fetchData = async () => {
  try {
    isLoading.value = true;
    const res = await apiClient.get(`/categories/${route.params.id}`);
    category.value = res.data.category;
    posts.value = res.data.posts;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
watch(() => route.params.id, fetchData);
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else-if="category" class="space-y-8 animate-in slide-in-from-left duration-500">
      <div class="bg-[#0a0a1a] p-10 border-b-8 border-[#ccff00] flex justify-between items-end relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-6xl font-black italic uppercase tracking-tighter text-white">{{ category.name }}</h1>
          <p class="text-sm font-bold opacity-60 uppercase tracking-widest mt-2">{{ category.description }}</p>
        </div>
        <RouterLink 
          :to="{ path: '/submit', query: { catId: category.id }}" 
          class="btn btn-primary rounded-none font-black italic uppercase px-8 mb-[-4px] relative z-10"
        >
          Create Tactic
        </RouterLink>
        <span class="absolute top-0 right-0 text-9xl font-black text-white/[0.02] -mr-10 -mt-10 select-none italic">{{ category.name[0] }}</span>
      </div>

      <div class="grid gap-2">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
        
        <div v-if="posts.length === 0" class="text-center py-32 bg-[#0a0a1a] border border-dashed border-white/10">
          <p class="text-2xl font-black italic uppercase opacity-20">No Tactics Shared in this Mode</p>
        </div>
      </div>
    </div>
  </div>
</template>