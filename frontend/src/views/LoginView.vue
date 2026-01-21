<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
  } catch (err) {
    error.value = err.response?.data?.error || "Login sequence failed. Check credentials.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md animate-in zoom-in duration-500">
      <div class="mb-8 border-l-8 border-[#ccff00] pl-6 py-2">
        <h1 class="text-4xl font-black italic uppercase tracking-tighter text-white">Access Squad Hub</h1>
        <p class="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest mt-1">Enter credentials to sync records</p>
      </div>

      <div class="bg-[#0a0a1a] shadow-2xl border border-white/5 relative overflow-hidden">
        <div class="p-10 space-y-6">
          <div v-if="error" class="bg-error/10 border-l-4 border-error p-3 text-error text-[10px] font-black uppercase italic">
            {{ error }}
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Email Address</span>
            </label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="squad.member@eafc" 
              class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-bold h-12"
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-[10px] font-black uppercase text-[#ccff00] tracking-widest">Security Code</span>
            </label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              class="input input-bordered rounded-none bg-[#1a1a3a] border-white/10 focus:border-[#ccff00] font-bold h-12"
              @keyup.enter="handleLogin"
            />
          </div>

          <button 
            @click="handleLogin" 
            class="btn btn-primary w-full rounded-none font-black uppercase italic text-lg h-14 shadow-lg shadow-[#ccff00]/20 mt-4 group"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading loading-spinner"></span>
            <span v-else class="flex items-center gap-2">
              Enter Pitch <span class="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>

          <div class="text-center mt-6">
            <p class="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">New to the squad?</p>
            <RouterLink to="/register" class="text-xs font-black uppercase text-[#ccff00] hover:underline italic">
              Sign Membership Contract
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>