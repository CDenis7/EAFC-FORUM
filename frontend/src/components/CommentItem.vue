<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AddCommentForm from './AddCommentForm.vue';

const props = defineProps({
  comment: Object,
  postId: [String, Number]
});

const emit = defineEmits(['comment-added']);
const authStore = useAuthStore();
const isReplying = ref(false);

const handleReplyAdded = (newComment) => {
  isReplying.value = false;
  emit('comment-added', newComment);
};

const canManage = computed(() => {
  if (!authStore.isAuthenticated) return false;
  return authStore.user?.id === props.comment.user_id || authStore.isModerator;
});
</script>

<template>
  <div class="relative mt-4">
    <div class="absolute left-[19px] top-10 bottom-0 w-[2px] bg-[#ccff00]/10 group-hover:bg-[#ccff00]/30 transition-colors"></div>

    <div class="flex gap-4 group">
      <div class="relative z-10">
        <div class="w-10 h-10 bg-[#0a0a1a] border-2 border-white/5 flex items-center justify-center font-black italic text-[#ccff00] text-sm group-hover:border-[#ccff00] transition-all">
          {{ comment.author?.[0] || '?' }}
        </div>
      </div>

      <div class="flex-1 space-y-2">
        <div class="bg-[#0a0a1a] p-4 border border-white/5 group-hover:border-white/10 transition-all">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase italic tracking-tighter text-[#ccff00]">
                Analyst: {{ comment.author }}
              </span>
              <span class="text-[9px] font-bold opacity-30 uppercase">
                {{ new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>
            
            <div v-if="canManage" class="dropdown dropdown-end">
              <button class="btn btn-ghost btn-xs text-[10px] opacity-30 hover:opacity-100 rounded-none font-black italic">MOD</button>
              <ul class="dropdown-content z-[1] menu p-2 shadow bg-[#1a1a3a] border border-white/10 w-32 rounded-none">
                <li><a class="text-error text-[10px] font-black uppercase italic">Delete</a></li>
              </ul>
            </div>
          </div>

          <p class="text-sm opacity-80 leading-relaxed font-medium">{{ comment.content }}</p>

          <div class="mt-4 flex gap-4">
            <button 
              v-if="authStore.isAuthenticated"
              @click="isReplying = !isReplying"
              class="text-[10px] font-black uppercase italic text-[#ccff00] hover:text-white transition-colors"
            >
              {{ isReplying ? '[ Cancel Analysis ]' : '[ Counter-Analyze ]' }}
            </button>
          </div>
        </div>

        <div v-if="isReplying" class="ml-4 mt-4 animate-in slide-in-from-left duration-300">
          <div class="bg-[#1a1a3a]/30 p-4 border-l-4 border-[#ccff00]">
            <AddCommentForm 
              :post-id="postId" 
              :parent-comment-id="comment.id" 
              @comment-added="handleReplyAdded" 
            />
          </div>
        </div>
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