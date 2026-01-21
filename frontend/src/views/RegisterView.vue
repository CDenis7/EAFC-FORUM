<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    });
  } catch (err) {
    error.value = err.response?.data?.error || "Recruitment sequence failed. Data invalid.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-lg animate-in slide-in-from-bottom-8 duration-700">
      <div class="mb-8 border-l-8 border-[#ccff00] pl-6 py-2">
        <h1 class="text-4xl font-black italic uppercase tracking-tighter text-white">Recruit Squad Member</h1>
        <p class="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest mt-1">Initialize player profile records</p>
      </div>

      <div class="bg-[#0a0a1a] shadow-2xl border border-white/5 relative overflow-hidden rounded-none">
        <div class="p-10 space-y-6">
          <div v-if="error" class="bg-error/10 border-l-4 border-error p-3 text-error text-[10px] font-black uppercase italic">
            {{ error }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control w-full md:col-span-2">
              <label class="label">
                <span class="label-text text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Designated Username</span>
              </label>
              <input 
                v-model="username" 
                type="text" 
                placeholder="PLAYER_NAME" 
                class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-black italic h-12"
              />
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Email Address</span>
              </label>
              <input 
                v-model="email" 
                type="email" 
                placeholder="email@domain.com" 
                class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-bold h-12"
              />
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Access Key</span>
              </label>
              <input 
                v-model="password" 
                type="password" 
                placeholder="••••••••" 
                class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-bold h-12"
              />
            </div>
          </div>

          <button 
            @click="handleRegister" 
            class="btn btn-primary w-full rounded-none font-black uppercase italic text-xl h-14 shadow-lg shadow-[#ccff00]/30 mt-4"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading loading-spinner"></span>
            <span v-else>Join the Club</span>
          </button>

          <div class="text-center mt-6">
            <p class="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">Already under contract?</p>
            <RouterLink to="/login" class="text-xs font-black uppercase text-[#ccff00] hover:underline italic">
              Login to Squad Center
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>