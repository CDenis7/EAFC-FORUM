<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const results = ref({ quests: [], guilds: [] });
const isLoading = ref(true);
const error = ref(null);

const performSearch = async () => {
  const query = route.query.q;
  if (!query) return;

  try {
    isLoading.value = true;
    error.value = null;
    const response = await apiClient.get(`/search?q=${query}`);
    results.value = response.data;
  } catch (error) {
    error.value = "The search system failed to scan the logs.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(performSearch);
watch(() => route.query.q, performSearch);
</script>

<template>
  <div class="space-y-8">
    <div class="bg-base-200 p-6 rounded-2xl border-l-4 border-accent shadow-lg">
      <h1 class="text-3xl font-black italic uppercase tracking-tighter">
        🔍 Search Results for: <span class="text-accent">"{{ route.query.q }}"</span>
      </h1>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-infinity loading-lg text-accent"></span>
    </div>

    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else class="space-y-10">
      <section v-if="results.guilds.length > 0">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-4 px-2">Discovered Guilds</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RouterLink 
            v-for="guild in results.guilds" 
            :key="guild.id" 
            :to="`/community/${guild.id}`"
            class="card bg-base-300 hover:bg-base-200 border border-white/5 transition-colors"
          >
            <div class="card-body p-4 flex-row items-center gap-4">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content rounded-lg w-12">
                  <span class="text-xl">🛡️</span>
                </div>
              </div>
              <div>
                <h4 class="font-black italic uppercase text-primary">/g/{{ guild.name }}</h4>
                <p class="text-xs opacity-60 line-clamp-1">{{ guild.description }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

      <section>
        <h3 class="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-4 px-2">Relevant Quests</h3>
        <div v-if="results.quests.length > 0" class="space-y-4">
          <PostCard v-for="post in results.quests" :key="post.id" :post="post" />
        </div>
        <div v-else class="text-center py-10 opacity-30 italic bg-base-200 rounded-xl">
          No matching quests found in the archives.
        </div>
      </section>
    </div>
  </div>
</template>