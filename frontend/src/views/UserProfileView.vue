<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const authStore = useAuthStore();

const user = ref(null);
const posts = ref([]);
const achievements = ref([]);
const isLoading = ref(true);

const isEditing = ref(false);
const editForm = ref({ bio: '', avatar_url: '' });
const isSaving = ref(false);

const isOwnProfile = computed(() => authStore.isOwner(route.params.username));

const fetchUser = async () => {
  try {
    isLoading.value = true;
    const res = await apiClient.get(`/users/${route.params.username}`);
    user.value = res.data.user;
    posts.value = res.data.posts;
    achievements.value = res.data.achievements;
    editForm.value.bio = user.value.bio || '';
    editForm.value.avatar_url = user.value.avatar_url || '';
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const saveTacticalAdjustment = async () => {
  isSaving.value = true;
  try {
    const res = await apiClient.put('/users/profile', {
      bio: editForm.value.bio,
      avatar_url: editForm.value.avatar_url
    });
    
    user.value.bio = editForm.value.bio;
    user.value.avatar_url = editForm.value.avatar_url;
    
    authStore.updateUser(res.data.user);
    
    isEditing.value = false;
  } catch  {
    alert("Tactical sync failed. Connection lost.");
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchUser);
watch(() => route.params.username, fetchUser);
</script>

<template>
  <div class="space-y-8">
    <div v-if="isLoading" class="flex justify-center py-24">
      <span class="loading loading-bars loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else-if="user" class="animate-in fade-in duration-700">
      <div class="bg-[#0a0a1a] border-b-4 border-[#ccff00] p-8 md:p-12 relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end">
          
          <div class="relative group">
            <div class="w-44 h-44 bg-[#05050a] border-4 border-[#ccff00] p-1 relative overflow-hidden">
              <img 
                v-if="user.avatar_url && !isEditing" 
                :src="user.avatar_url" 
                class="w-full h-full object-cover" 
              />
              <div v-else-if="isEditing" class="w-full h-full bg-[#1a1a3a] flex flex-col items-center justify-center p-4">
                 <span class="text-[9px] font-black uppercase text-[#ccff00] mb-2">New Image URL</span>
                 <input 
                    v-model="editForm.avatar_url" 
                    class="input input-xs w-full bg-[#05050a] border-[#ccff00]/30 rounded-none text-[10px]"
                    placeholder="https://..."
                 />
              </div>
              <div v-else class="w-full h-full flex items-center justify-center text-7xl font-black text-[#ccff00]/10 italic bg-[#1a1a3a]">
                {{ user.username[0] }}
              </div>
            </div>
          </div>
          <div class="flex-1 text-center md:text-left space-y-4">
            <div>
              <div class="text-[10px] font-black text-[#ccff00] uppercase tracking-[0.4em] mb-1">Squad Member Records</div>
              <h1 class="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">{{ user.username }}</h1>
            </div>

            <div v-if="!isEditing" class="max-w-xl">
              <p class="text-sm opacity-60 font-medium leading-relaxed italic">
                {{ user.bio || "No career summary provided. Squad member is currently a mystery." }}
              </p>
            </div>
            <div v-else class="max-w-xl">
              <textarea 
                v-model="editForm.bio"
                class="textarea textarea-primary w-full bg-[#05050a] rounded-none text-xs italic"
                placeholder="Modify your career bio..."
              ></textarea>
            </div>

            <div class="flex flex-wrap gap-4 mt-4 justify-center md:justify-start items-center">
              <div class="badge badge-outline border-[#ccff00] text-[#ccff00] font-black italic uppercase px-4 py-3">{{ user.role }}</div>
              
              <template v-if="isOwnProfile">
                <button 
                  v-if="!isEditing"
                  @click="isEditing = true"
                  class="btn btn-xs btn-primary rounded-none font-black italic uppercase px-4"
                >
                  ⚙️ Tactical Adjustment
                </button>
                <div v-else class="flex gap-2">
                  <button 
                    @click="saveTacticalAdjustment"
                    class="btn btn-xs btn-success rounded-none font-black italic uppercase px-4"
                    :disabled="isSaving"
                  >
                    Submit Changes
                  </button>
                  <button 
                    @click="isEditing = false"
                    class="btn btn-xs btn-ghost rounded-none font-black italic uppercase px-4"
                  >
                    Discard
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
        <span class="absolute top-0 right-0 text-[12rem] font-black text-white/[0.02] -mr-16 -mt-16 select-none italic pointer-events-none">
          {{ user.username.substring(0, 3) }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        <div class="lg:col-span-1 space-y-6">
          <h3 class="text-xl font-black italic uppercase text-white border-l-4 border-[#ccff00] pl-4">Career Milestones</h3>
          <div class="grid gap-2">
            <div v-for="ach in achievements" :key="ach.name" class="bg-[#0a0a1a] p-4 border border-white/5 flex items-center gap-4 group hover:border-[#ccff00] transition-all">
              <div class="text-2xl opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all text-[#ccff00]">★</div>
              <div>
                <div class="text-xs font-black uppercase text-white tracking-tighter">{{ ach.name }}</div>
                <div class="text-[9px] font-bold opacity-30 uppercase">{{ ach.description }}</div>
              </div>
            </div>
            <div v-if="achievements.length === 0" class="text-center py-10 opacity-20 font-black uppercase italic text-xs">No Records Found</div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <h3 class="text-xl font-black italic uppercase text-white border-l-4 border-[#ccff00] pl-4">Tactical Analysis Feed</h3>
          <div class="grid gap-4">
            <PostCard v-for="post in posts" :key="post.id" :post="post" />
            <div v-if="posts.length === 0" class="text-center py-20 bg-[#0a0a1a] opacity-20 font-black uppercase italic">No Matches Logged</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>