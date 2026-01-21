<script setup>
import { ref } from 'vue';
import apiClient from '@/services/api';

const props = defineProps({
  postId: [String, Number],
  parentCommentId: [String, Number]
});

const emit = defineEmits(['comment-added']);
const content = ref('');
const isSubmitting = ref(false);

const submitComment = async () => {
  if (!content.value.trim()) return;
  isSubmitting.value = true;
  try {
    const response = await apiClient.post('/comments', {
      content: content.value,
      postId: props.postId,
      parentCommentId: props.parentCommentId
    });
    content.value = '';
    emit('comment-added', response.data);
  } catch (err) {
    console.error("Analysis submission failed:", err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="space-y-3">
    <textarea 
      v-model="content"
      class="textarea textarea-bordered w-full h-24 bg-[#05050a] border-white/10 focus:border-[#ccff00] rounded-none text-sm font-medium"
      placeholder="Provide your counter-analysis..."
    ></textarea>
    <div class="flex justify-end">
      <button 
        @click="submitComment" 
        class="btn btn-primary btn-sm rounded-none font-black italic uppercase tracking-widest"
        :disabled="isSubmitting || !content.trim()"
      >
        <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
        Submit Analysis
      </button>
    </div>
  </div>
</template>