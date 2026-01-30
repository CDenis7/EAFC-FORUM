<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';
import AddCommentForm from './AddCommentForm.vue';

const props = defineProps({
  comment: Object,
  postId: [String, Number]
});

const emit = defineEmits(['comment-added']);
const authStore = useAuthStore();
const isReplying = ref(false);
const isVoting = ref(false);
const isEditing = ref(false);
const editContent = ref('');
const isUpdating = ref(false);

// Local state for voting to avoid mutating props
const localVoteCount = ref(props.comment.vote_count || 0);
const localUserVote = ref(props.comment.user_vote || 0);

// Watch for changes from parent (e.g. re-fetch) to sync local state
watch(() => props.comment, (newVal) => {
  localVoteCount.value = newVal.vote_count || 0;
  localUserVote.value = newVal.user_vote || 0;
  if (!isEditing.value) {
    editContent.value = newVal.content;
  }
}, { deep: true, immediate: true });

const handleReplyAdded = (newComment) => {
  isReplying.value = false;
  emit('comment-added', newComment);
};

const canManage = computed(() => {
  if (!authStore.isAuthenticated) return false;
  // Loose equality check for ID in case of string/number mismatch
  return authStore.user?.id == props.comment.user_id || authStore.isModerator;
});

const handleEdit = () => {
    editContent.value = props.comment.content;
    isEditing.value = true;
};

const cancelEdit = () => {
    isEditing.value = false;
    editContent.value = props.comment.content;
};

const saveEdit = async () => {
    if (!editContent.value.trim()) return;
    isUpdating.value = true;
    try {
        await apiClient.put(`/comments/${props.comment.id}`, { content: editContent.value });
        emit('comment-added'); 
        isEditing.value = false;
    } catch (err) {
        console.error("Edit failed:", err);
        alert('Failed to update comment.');
    } finally {
        isUpdating.value = false;
    }
};

const handleDelete = async () => {
    if(!confirm('Delete this analysis?')) return;
    try {
        await apiClient.delete(`/comments/${props.comment.id}`);
        emit('comment-added'); 
    } catch (err) {
        console.error("Delete failed:", err);
        alert('Failed to delete comment.');
    }
};

const handleVote = async (value) => {
  if (!authStore.isAuthenticated) {
    alert("Please login to vote.");
    return;
  }
  if (isVoting.value) return;

  isVoting.value = true;
  
  const originalVote = localUserVote.value;
  const originalCount = localVoteCount.value;
  
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
  
  localUserVote.value = newVote;
  localVoteCount.value += diff;

  try {
    const res = await apiClient.post('/votes', {
      voteableId: props.comment.id,
      voteableType: 'comment',
      value: value
    });
    
    localVoteCount.value = res.data.newVoteCount;
    localUserVote.value = res.data.userVote;
  } catch (err) {
    console.error("Comment vote failed:", err);
    localUserVote.value = originalVote;
    localVoteCount.value = originalCount;
  } finally {
    isVoting.value = false;
  }
};
</script>

<template>
  <!-- Outer wrapper with 'group' class for hover chain effect -->
  <div class="relative mt-6 group">
    
    <!-- Thread Line: Lights up when hovering ANY part of this comment or its children -->
    <div class="absolute left-[28px] top-12 bottom-0 w-[2px] bg-white/5 group-hover:bg-[#ccff00] transition-colors duration-300"></div>

    <div class="flex gap-6 items-start relative z-10">
      
      <!-- Voting Column -->
      <div class="flex flex-col items-center gap-1 mt-1 bg-[#05050a] rounded-full p-1 border border-white/5 shadow-lg">
         <button 
            @click="handleVote(1)"
            class="btn btn-ghost btn-xs btn-square rounded-full hover:bg-[#ccff00]/10 w-8 h-8 min-h-0"
            :class="{ 'text-[#ccff00]': localUserVote === 1, 'text-white/30': localUserVote !== 1 }"
            :disabled="isVoting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <span class="font-black italic text-xs my-1" :class="{
             'text-[#ccff00]': localUserVote === 1,
             'text-error': localUserVote === -1,
             'text-white': localUserVote === 0
          }">
            {{ localVoteCount }}
          </span>
          
          <button 
            @click="handleVote(-1)"
            class="btn btn-ghost btn-xs btn-square rounded-full hover:bg-error/10 w-8 h-8 min-h-0"
            :class="{ 'text-error': localUserVote === -1, 'text-white/30': localUserVote !== -1 }"
            :disabled="isVoting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
      </div>

      <!-- Comment Card -->
      <div class="flex-1 space-y-4">
        <div class="bg-[#0a0a1a] p-6 border border-white/5 hover:border-[#ccff00]/30 transition-all shadow-xl">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="w-8 h-8 bg-[#1a1a3a] flex items-center justify-center font-black italic text-[#ccff00] text-xs border border-white/10">
                {{ comment.author?.[0] || '?' }}
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-black uppercase italic tracking-tighter text-[#ccff00] leading-none">
                   {{ comment.author }}
                </span>
                <span class="text-[9px] font-bold opacity-30 uppercase mt-1">
                  {{ new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} • {{ new Date(comment.created_at).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-if="isEditing" class="space-y-3 animate-in fade-in duration-200">
              <textarea 
                  v-model="editContent" 
                  class="textarea textarea-bordered w-full bg-[#1a1a3a] border-white/20 focus:border-[#ccff00] text-base text-white rounded-none h-32 leading-relaxed"
              ></textarea>
              <div class="flex gap-3 justify-end">
                  <button @click="cancelEdit" class="btn btn-sm btn-ghost rounded-none font-bold uppercase opacity-60" :disabled="isUpdating">Cancel</button>
                  <button @click="saveEdit" class="btn btn-sm btn-primary rounded-none font-bold uppercase" :disabled="isUpdating">
                    <span v-if="isUpdating" class="loading loading-spinner loading-xs"></span>
                    Save Changes
                  </button>
              </div>
          </div>

          <!-- View Mode -->
          <div v-else>
             <p class="text-base text-white/90 leading-relaxed font-medium whitespace-pre-wrap">{{ comment.content }}</p>

             <div class="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center">
                <button 
                  v-if="authStore.isAuthenticated"
                  @click="isReplying = !isReplying"
                  class="text-[10px] font-black uppercase italic text-[#ccff00] hover:text-white transition-colors flex items-center gap-1"
                >
                  {{ isReplying ? '✖ Cancel' : '💬 Counter-Analyze' }}
                </button>

                <!-- Management Buttons -->
                <div v-if="canManage" class="flex gap-4 border-l border-white/10 pl-4 ml-2">
                    <button @click="handleEdit" class="text-[10px] font-black uppercase italic text-white/40 hover:text-[#ccff00] transition-colors">
                        Edit
                    </button>
                    <button @click="handleDelete" class="text-[10px] font-black uppercase italic text-white/40 hover:text-error transition-colors">
                        Delete
                    </button>
                </div>
             </div>
          </div>
        </div>

        <!-- Reply Form -->
        <div v-if="isReplying" class="ml-6 mt-4 animate-in slide-in-from-left duration-300">
          <div class="bg-[#1a1a3a]/30 p-6 border-l-4 border-[#ccff00]">
            <AddCommentForm 
              :post-id="postId" 
              :parent-comment-id="comment.id" 
              @comment-added="handleReplyAdded" 
            />
          </div>
        </div>
        
        <!-- Recursive Children -->
        <div v-if="comment.children && comment.children.length" class="space-y-2 mt-2">
          <CommentItem 
            v-for="child in comment.children" 
            :key="child.id" 
            :comment="child" 
            :post-id="postId"
            @comment-added="(c) => $emit('comment-added', c)"
          />
        </div>
      </div>
    </div>
  </div>
</template>