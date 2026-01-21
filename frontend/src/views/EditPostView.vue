<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const router = useRouter();
const title = ref('');
const body = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);

onMounted(async () => {
  try {
    const response = await apiClient.get(`/posts/${route.params.id}`);
    title.value = response.data.title;
    body.value = response.data.content;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const updateQuest = async () => {
  isSubmitting.value = true;
  try {
    await apiClient.put(`/posts/${route.params.id}`, {
      title: title.value,
      body: body.value
    });
    router.push({ name: 'post-detail', params: { id: route.params.id } });
  } catch  {
    alert("Failed to update quest log.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div v-if="isLoading" class="text-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="space-y-8">
      <h1 class="text-4xl font-black italic uppercase tracking-tighter text-secondary border-l-8 border-secondary pl-4">
        Modify Quest Log
      </h1>

      <div class="card bg-base-200 shadow-2xl p-8 border border-white/5">
        <div class="form-control w-full mb-6">
          <label class="label font-black uppercase text-xs tracking-widest text-secondary">Update Title</label>
          <input 
            v-model="title" 
            type="text" 
            class="input input-bordered input-secondary bg-base-300 font-bold" 
          />
        </div>

        <div class="form-control w-full mb-8">
          <label class="label font-black uppercase text-xs tracking-widest text-secondary">Update Detailed Report</label>
          <textarea 
            v-model="body" 
            class="textarea textarea-bordered textarea-secondary bg-base-300 h-48"
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button @click="router.back()" class="btn btn-ghost uppercase flex-1 font-bold">Cancel</button>
          <button 
            @click="updateQuest" 
            class="btn btn-secondary flex-[2] font-black uppercase text-lg shadow-lg shadow-secondary/20"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner"></span>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>