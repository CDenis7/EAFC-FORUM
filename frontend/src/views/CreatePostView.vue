<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/services/api';

const router = useRouter();
const route = useRoute();
const categories = ref([]);
const categoryId = ref(route.query.catId || '');
const title = ref('');
const body = ref('');
const isSubmitting = ref(false);

onMounted(async () => {
  const res = await apiClient.get('/categories');
  categories.value = res.data;
});

const submitPost = async () => {
  if (!title.value || !categoryId.value) return;
  isSubmitting.value = true;
  try {
    await apiClient.post('/posts', { 
      title: title.value, 
      content: body.value, 
      category_id: categoryId.value 
    });
    router.push(`/category/${categoryId.value}`);
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-in zoom-in duration-300">
    <div class="border-l-8 border-[#ccff00] pl-6">
      <h1 class="text-4xl font-black italic uppercase tracking-tighter text-white">Share New Tactic</h1>
      <p class="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest mt-1">Submit Match Intelligence</p>
    </div>

    <div class="bg-[#0a0a1a] p-10 border border-white/5 shadow-2xl space-y-8">
      <div class="form-control">
        <label class="label text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Game Mode Designation</label>
        <select v-model="categoryId" class="select select-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-bold">
          <option value="" disabled>Select Mode...</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Analysis Title</label>
        <input 
          v-model="title" 
          type="text" 
          placeholder="e.g. 4-3-2-1 Direct Passing Meta"
          class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-black italic text-lg" 
        />
      </div>

      <div class="form-control">
        <label class="label text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Detailed Instructions</label>
        <textarea 
          v-model="body" 
          class="textarea textarea-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] h-64 font-medium"
          placeholder="Share player instructions, depth, and width..."
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button @click="router.back()" class="btn btn-ghost rounded-none flex-1 font-black uppercase italic">Discard</button>
        <button @click="submitPost" class="btn btn-primary rounded-none flex-[2] font-black uppercase italic text-lg" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="loading loading-spinner"></span>
          Publish Tactic
        </button>
      </div>
    </div>
  </div>
</template>