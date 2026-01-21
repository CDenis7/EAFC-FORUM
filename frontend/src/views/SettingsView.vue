<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const bio = ref('');
const avatarUrl = ref('');
const message = ref({ text: '', type: '' });

onMounted(async () => {
    try {
        const res = await apiClient.get(`/users/${authStore.user.username}`);
        bio.value = res.data.user.bio || '';
        avatarUrl.value = res.data.user.avatar_url || '';
    } catch (err) { console.error(err); }
});

const handleSave = async () => {
    try {
        await apiClient.put(`/users/profile`, { bio: bio.value, avatarUrl: avatarUrl.value });
        message.value = { text: 'Character sheet updated!', type: 'success' };
    } catch { message.value = { text: 'Update failed.', type: 'error' }; }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-black uppercase italic mb-8">Character Settings</h1>
    <div class="card bg-base-200 p-6 shadow-xl space-y-6">
      <div v-if="message.text" :class="`alert alert-${message.type}`">{{ message.text }}</div>
      <div class="form-control">
        <label class="label text-xs font-bold uppercase">Avatar URL</label>
        <input v-model="avatarUrl" type="text" class="input input-bordered" placeholder="https://..." />
      </div>
      <div class="form-control">
        <label class="label text-xs font-bold uppercase">Player Bio</label>
        <textarea v-model="bio" class="textarea textarea-bordered h-32" placeholder="Describe your history..."></textarea>
      </div>
      <button @click="handleSave" class="btn btn-primary uppercase font-bold">Update Sheet</button>
    </div>
  </div>
</template>