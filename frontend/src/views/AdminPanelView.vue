<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const users = ref([]);
const stats = ref({ totalUsers: 0, totalPosts: 0, totalCategories: 0 });
const isLoading = ref(true);

const loadData = async () => {
  try {
    isLoading.value = true;
    const [uRes, sRes] = await Promise.all([
      apiClient.get('/admin/users'),
      apiClient.get('/admin/stats')
    ]);
    users.value = uRes.data;
    stats.value = sRes.data;
  } catch (err) {
    console.error("Admin data sync failed:", err);
  } finally {
    isLoading.value = false;
  }
};

const updateRole = async (userId, newRole) => {
  try {
    await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
    const user = users.value.find(u => u.id === userId);
    if (user) user.role = newRole;
  } catch  {
    alert("Role reassignment failed.");
  }
};

onMounted(loadData);
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-700">
    <div class="border-l-8 border-[#ccff00] pl-6 py-2">
      <h1 class="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Manager Control Center</h1>
      <p class="text-xs font-bold text-[#ccff00] uppercase tracking-[0.3em] mt-2">Executive Overview & Squad Management</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-bars loading-lg text-[#ccff00]"></span>
    </div>

    <div v-else class="space-y-12">
      <section>
        <h3 class="text-xs font-black uppercase tracking-widest opacity-40 mb-4 px-2">Club Records</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-[#0a0a1a] border-t-2 border-[#ccff00] p-6 shadow-2xl relative overflow-hidden group">
            <div class="text-[10px] font-black uppercase text-[#ccff00] mb-2">Total Squad Members</div>
            <div class="text-5xl font-black italic text-white group-hover:scale-110 transition-transform origin-left">{{ stats.totalUsers }}</div>
            <span class="absolute right-[-10px] bottom-[-20px] text-6xl font-black italic text-white/[0.03] select-none uppercase">Squad</span>
          </div>
          
          <div class="bg-[#0a0a1a] border-t-2 border-[#ccff00] p-6 shadow-2xl relative overflow-hidden group">
            <div class="text-[10px] font-black uppercase text-[#ccff00] mb-2">Tactical Analyses</div>
            <div class="text-5xl font-black italic text-white group-hover:scale-110 transition-transform origin-left">{{ stats.totalPosts }}</div>
            <span class="absolute right-[-10px] bottom-[-20px] text-6xl font-black italic text-white/[0.03] select-none uppercase">Tactics</span>
          </div>

          <div class="bg-[#0a0a1a] border-t-2 border-[#ccff00] p-6 shadow-2xl relative overflow-hidden group">
            <div class="text-[10px] font-black uppercase text-[#ccff00] mb-2">Active Game Modes</div>
            <div class="text-5xl font-black italic text-white group-hover:scale-110 transition-transform origin-left">{{ stats.totalCategories }}</div>
            <span class="absolute right-[-10px] bottom-[-20px] text-6xl font-black italic text-white/[0.03] select-none uppercase">Modes</span>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-widest opacity-40 mb-4 px-2">Squad Roster Management</h3>
        <div class="bg-[#0a0a1a] border border-white/5 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="table w-full rounded-none">
              <thead class="bg-[#1a1a3a] text-[#ccff00] font-black uppercase italic text-xs border-b border-[#ccff00]/20">
                <tr>
                  <th class="rounded-none">Player Info</th>
                  <th>Current Designation</th>
                  <th>Promotion/Reassignment</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr v-for="user in users" :key="user.id" class="border-b border-white/5 hover:bg-[#ccff00]/5 transition-colors group">
                  <td class="py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-[#05050a] flex items-center justify-center font-black italic text-[#ccff00] border border-[#ccff00]/20">
                        {{ user.username[0] }}
                      </div>
                      <div>
                        <div class="font-black uppercase italic text-white">{{ user.username }}</div>
                        <div class="text-[10px] opacity-40 font-bold uppercase tracking-tighter">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="badge rounded-none font-black italic uppercase text-[10px] px-3 py-2"
                         :class="user.role === 'admin' ? 'bg-[#ccff00] text-black border-none' : 'badge-outline border-white/20 opacity-50'">
                      {{ user.role }}
                    </div>
                  </td>
                  <td>
                    <select 
                      class="select select-bordered select-sm rounded-none bg-[#05050a] border-white/10 focus:border-[#ccff00] font-bold uppercase text-[10px] w-full max-w-xs"
                      :value="user.role"
                      @change="updateRole(user.id, $event.target.value)"
                    >
                      <option value="user">Squad Member</option>
                      <option value="moderator">Match Manager</option>
                      <option value="admin">Club Legend</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="p-6 bg-[#ccff00]/5 border border-[#ccff00]/20 text-center">
        <p class="text-[10px] font-black uppercase italic tracking-[0.2em] text-[#ccff00]">
          Authorized Club Legend Access Only • Session Logged
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table :where(thead, tfoot) :where(th, td) {
  @apply bg-[#1a1a3a] py-4;
}
</style>