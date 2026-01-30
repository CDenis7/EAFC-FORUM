<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const router = useRouter();
const title = ref('');
const content = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);

onMounted(async () => {
  try {
    const response = await apiClient.get(`/posts/${route.params.id}`);
    title.value = response.data.title;
    content.value = response.data.content;
  } catch (err) {
    console.error(err);
    alert("Failed to load tactic data.");
    router.back();
  } finally {
    isLoading.value = false;
  }
});

const updateTactic = async () => {
  if (!title.value.trim() || !content.value.trim()) return;
  
  isSubmitting.value = true;
  try {
    await apiClient.put(`/posts/${route.params.id}`, {
      title: title.value,
      content: content.value
    });
    router.push({ name: 'post-detail', params: { id: route.params.id } });
  } catch (err) {
    console.error(err);
    alert("Failed to update tactic.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-in zoom-in duration-300">
    <div class="border-l-8 border-[#ccff00] pl-6">
      <h1 class="text-4xl font-black italic uppercase tracking-tighter text-white">Adjust Tactic</h1>
      <p class="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest mt-1">Refine Match Intelligence</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else class="bg-[#0a0a1a] p-10 border border-white/5 shadow-2xl space-y-8">
      
      <div class="form-control">
        <label class="label text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Analysis Title</label>
        <input 
          v-model="title" 
          type="text" 
          class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-black italic text-lg" 
        />
      </div>

      <div class="form-control">
        <label class="label text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Detailed Instructions</label>
        <textarea 
          v-model="content" 
          class="textarea textarea-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] h-64 font-medium leading-relaxed"
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button @click="router.back()" class="btn btn-ghost rounded-none flex-1 font-black uppercase italic">Cancel</button>
        <button @click="updateTactic" class="btn btn-primary rounded-none flex-[2] font-black uppercase italic text-lg" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="loading loading-spinner"></span>
          Save Adjustments
        </button>
      </div>
    </div>
  </div>
</template>