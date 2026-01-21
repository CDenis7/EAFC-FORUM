<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const description = ref('');
const isSubmitting = ref(false);
const error = ref(null);

const createGuild = async () => {
  if (!name.value.trim()) {
    error.value = "Guild name cannot be empty.";
    return;
  }
  
  if (!authStore.isAdmin) {
    error.value = "You do not have the clearance (Admin) to establish guilds.";
    return;
  }
  
  isSubmitting.value = true;
  error.value = null;
  
  try {
    const response = await apiClient.post('/communities', {
      name: name.value.trim(),
      description: description.value.trim()
    });
    
    router.push({ name: 'community-detail', params: { id: response.data.id } });
  } catch (err) {
    console.error("Guild creation failed:", err);
    error.value = err.response?.data?.error || "Failed to establish guild. The name might already be taken.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div v-if="!authStore.isAdmin" class="alert alert-error font-black uppercase italic shadow-lg">
      <div class="flex items-center gap-2">
        <span>🛑</span>
        <span>Access Denied: Administrator clearance required to establish new Guilds.</span>
      </div>
    </div>

    <div v-else class="space-y-8 animate-in fade-in duration-500">
      <div class="flex items-center gap-4 border-l-8 border-primary pl-6">
        <h1 class="text-4xl font-black italic uppercase tracking-tighter">
          Establish New Guild
        </h1>
      </div>

      <div class="card bg-base-200 shadow-2xl p-8 border border-white/5">
        <div v-if="error" class="alert alert-error mb-6 text-sm font-bold">
          <span>{{ error }}</span>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label">
            <span class="label-text font-black uppercase text-xs tracking-widest text-primary">Guild Designation (Name)</span>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold opacity-30 italic">/g/</span>
            <input 
              v-model="name" 
              type="text" 
              placeholder="e.g. Cyberpunk-2077" 
              class="input input-bordered input-primary w-full bg-base-300 font-bold focus:ring-2 ring-primary/20" 
              :disabled="isSubmitting"
            />
          </div>
          <label class="label">
            <span class="label-text-alt opacity-50 italic">Unique identifiers only. No spaces recommended.</span>
          </label>
        </div>

        <div class="form-control w-full mb-8">
          <label class="label">
            <span class="label-text font-black uppercase text-xs tracking-widest text-primary">Guild Manifest (Description)</span>
          </label>
          <textarea 
            v-model="description" 
            class="textarea textarea-bordered textarea-primary bg-base-300 h-32 focus:ring-2 ring-primary/20" 
            placeholder="Define the purpose of this gathering, rules, or lore..."
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button @click="router.back()" class="btn btn-ghost flex-1 uppercase font-bold">Cancel</button>
          <button 
            @click="createGuild" 
            class="btn btn-primary flex-[2] font-black uppercase text-lg shadow-lg shadow-primary/30"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner"></span>
            Establish Guild
          </button>
        </div>
      </div>

      <div class="text-center opacity-30 text-[10px] uppercase tracking-widest font-bold">
        All guild establishments are logged in the master archive.
      </div>
    </div>
  </div>
</template>