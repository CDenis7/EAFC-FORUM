<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import CommentItem from '@/components/CommentItem.vue';
import AddCommentForm from '@/components/AddCommentForm.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const post = ref(null);
const isLoading = ref(true);
const isVoting = ref(false);

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

    const sortComments = (list) => {
      list.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      list.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortComments(item.children);
        }
      });
    };

    sortComments(commentTree);
    
    data.comments = commentTree;
    post.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleVote = async (value) => {
  if (!authStore.isAuthenticated) {
    alert("Please login to vote on tactics.");
    return;
  }
  if (isVoting.value || !post.value) return;

  isVoting.value = true;

  const originalVote = post.value.user_vote;
  
  let newVote = 0;
  if (originalVote === value) {
      newVote = 0;
  } else {
      newVote = value;
  }

  let diff = 0;
  if (originalVote === value) {
      diff = -originalVote; 
  } else {
      diff = value - (originalVote || 0);
  }
  
  post.value.user_vote = newVote;
  post.value.vote_count += diff;

  try {
    const res = await apiClient.post('/votes', {
      voteableId: post.value.id,
      voteableType: 'post',
      value: value
    });
    
    post.value.vote_count = res.data.newVoteCount;
    post.value.user_vote = res.data.userVote;
  } catch (err) {
    console.error("Vote failed:", err);
    post.value.user_vote = originalVote;
    post.value.vote_count -= diff;
  } finally {
    isVoting.value = false;
  }
};

const handleCommentAdded = () => {
  fetchPost(); 
};

const deletePost = async () => {
  if (!confirm('Are you sure you want to delete this tactic? This action cannot be undone.')) return;
  
  try {
    await apiClient.delete(`/posts/${post.value.id}`);
    if (post.value.category_id) {
        router.push(`/category/${post.value.category_id}`);
    } else {
        router.push('/');
    }
  } catch (err) {
    alert(err.response?.data?.error || "Failed to delete tactic.");
  }
};

const editPost = () => {
    router.push({ name: 'post-edit', params: { id: post.value.id } });
};

const isOwner = computed(() => {
  return post.value && authStore.user && (authStore.user.id === post.value.user_id || authStore.isAdmin);
});

onMounted(fetchPost);
</script>

<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div v-if="isLoading" class="flex justify-center py-24">
      <span class="loading loading-bars loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else-if="post" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div class="bg-[#0a0a1a] border-t-4 border-[#ccff00] shadow-2xl relative flex flex-col md:flex-row overflow-hidden">
        
        <div class="flex flex-row md:flex-col items-center md:justify-start md:pt-12 justify-center gap-2 bg-[#1a1a3a]/30 p-4 md:w-20 md:border-r border-white/5 border-b md:border-b-0 shrink-0">
          <button 
            @click="handleVote(1)"
            class="btn btn-ghost btn-sm btn-square rounded-none hover:bg-[#ccff00]/10"
            :class="{ 'text-[#ccff00]': post.user_vote === 1, 'text-white/30': post.user_vote !== 1 }"
            :disabled="isVoting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <span class="font-black italic text-xl my-1" :class="{
             'text-[#ccff00]': post.user_vote === 1,
             'text-error': post.user_vote === -1,
             'text-white': post.user_vote === 0
          }">
            {{ post.vote_count }}
          </span>
          
          <button 
            @click="handleVote(-1)"
            class="btn btn-ghost btn-sm btn-square rounded-none hover:bg-error/10"
            :class="{ 'text-error': post.user_vote === -1, 'text-white/30': post.user_vote !== -1 }"
            :disabled="isVoting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div class="flex-1 p-6 md:p-10 min-w-0">
            <div class="flex justify-between items-start mb-6">
                <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#ccff00]">Formation Tactic</span>
                    <span class="text-xs font-bold opacity-40 uppercase">By {{ post.author }} in {{ post.category_name }}</span>
                </div>
                
                <div v-if="isOwner" class="flex gap-2 ml-4">
                   <button 
                        @click="editPost"
                        class="btn btn-ghost btn-xs rounded-none font-black uppercase italic tracking-wider text-white/50 hover:text-[#ccff00]"
                    >
                        Edit
                    </button>
                    <button 
                        @click="deletePost"
                        class="btn btn-error btn-xs rounded-none font-black uppercase italic tracking-wider opacity-80 hover:opacity-100"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <h1 class="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight break-words" style="text-wrap: balance;">
                {{ post.title }}
            </h1>
            
            <!-- Updated to use v-html and rich-text-content class -->
            <div 
              class="rich-text-content text-lg opacity-80 leading-relaxed font-medium border-l-4 border-white/5 pl-6 py-2 break-words"
              v-html="post.content"
            ></div>
        </div>
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

<style>
/* Scoped styles for the rich text content inside the post detail */
.rich-text-content p {
  margin-bottom: 0.75rem;
}
.rich-text-content strong {
  font-weight: 900;
  color: white;
}
.rich-text-content em {
  font-style: italic;
  color: #ccff00;
}
.rich-text-content h2 {
  font-size: 1.5rem;
  font-weight: 900;
  font-style: italic;
  color: white;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.rich-text-content h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>