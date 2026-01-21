<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import CommentItem from '@/components/CommentItem.vue';
import AddCommentForm from '@/components/AddCommentForm.vue';

const route = useRoute();
const post = ref(null);
const isLoading = ref(true);

const fetchPost = async () => {
  try {
    isLoading.value = true;
    const response = await apiClient.get(`/posts/${route.params.id}`);
    const data = response.data;
    const commentMap = {};
    data.comments.forEach(c => {
      commentMap[c.id] = { ...c, children: [] };
    });
    
    const commentTree = [];
    data.comments.forEach(c => {
      if (c.parent_comment_id && commentMap[c.parent_comment_id]) {
        commentMap[c.parent_comment_id].children.push(commentMap[c.id]);
      } else {
        commentTree.push(commentMap[c.id]);
      }
    });
    
    data.comments = commentTree;
    post.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleCommentAdded = () => {
  fetchPost(); 
};

onMounted(fetchPost);
</script>

<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div v-if="isLoading" class="flex justify-center py-24">
      <span class="loading loading-bars loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else-if="post" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="bg-[#0a0a1a] border-t-4 border-[#ccff00] p-8 md:p-12 shadow-2xl relative">
        <div class="flex justify-between items-start mb-6">
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#ccff00]">Formation Tactic #{{ post.id }}</span>
            <span class="text-xs font-bold opacity-40 uppercase">By {{ post.author }} in {{ post.category_name }}</span>
          </div>
        </div>

        <h1 class="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none">
          {{ post.title }}
        </h1>
        
        <p class="text-lg opacity-80 leading-relaxed whitespace-pre-wrap font-medium border-l-4 border-white/5 pl-6 py-2">
          {{ post.content }}
        </p>
      </div>

      <div class="space-y-6">
        <h2 class="text-xl font-black italic uppercase text-white border-l-4 border-[#ccff00] pl-4">Pitch Counter-Analyses</h2>

        <div v-if="!post.is_closed" class="bg-[#1a1a3a]/20 p-8 border border-white/5">
          <h3 class="text-[10px] font-black uppercase text-[#ccff00] mb-4">Initial Analysis</h3>
          <AddCommentForm :post-id="post.id" @comment-added="handleCommentAdded" />
        </div>
        
        <div class="space-y-2">
          <CommentItem 
            v-for="comment in post.comments" 
            :key="comment.id" 
            :comment="comment" 
            :post-id="post.id"
            @comment-added="handleCommentAdded"
          />
        </div>
      </div>
    </div>
  </div>
</template>