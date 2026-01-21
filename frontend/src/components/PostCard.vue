<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  post: Object
});
</script>

<template>
  <RouterLink 
    :to="`/thread/${post.id}`"
    class="group block bg-[#0a0a1a] border border-white/5 hover:border-[#ccff00] transition-all overflow-hidden"
  >
    <div class="flex items-center">
      <div class="w-16 bg-[#1a1a3a] py-6 flex flex-col items-center justify-center group-hover:bg-[#ccff00] transition-colors">
        <span class="text-xs font-black italic uppercase opacity-40 group-hover:text-black">Score</span>
        <span class="text-2xl font-black italic text-white group-hover:text-black">{{ post.vote_count }}</span>
      </div>

      <div class="flex-1 p-6">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black uppercase text-[#ccff00] tracking-widest">{{ post.category_name }}</span>
            <span class="text-[9px] font-bold opacity-30 uppercase">Analysis by {{ post.author }}</span>
          </div>
          <div class="text-[9px] font-bold opacity-30 uppercase">{{ new Date(post.created_at).toLocaleDateString() }}</div>
        </div>
        
        <h3 class="text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-[#ccff00] transition-colors line-clamp-1">
          {{ post.title }}
        </h3>
        
        <div class="mt-4 flex gap-4">
          <div class="text-[10px] font-bold uppercase opacity-40 flex items-center gap-1">
            <span class="text-[#ccff00]">💬</span> {{ post.comment_count }} Replies
          </div>
        </div>
      </div>

      <div class="px-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="text-[#ccff00] text-xl">→</span>
      </div>
    </div>
  </RouterLink>
</template>