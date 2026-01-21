<script setup>
import { RouterView } from 'vue-router';
import TheNavbar from './components/TheNavbar.vue';
import LeftSidebar from './components/LeftSidebar.vue';
import RightSidebar from './components/RightSidebar.vue';
</script>

<template>
  <div class="min-h-screen bg-[#05050a] text-white font-sans selection:bg-[#ccff00] selection:text-black">
    <div class="fixed inset-0 opacity-[0.03] pointer-events-none z-0" 
         style="background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');"></div>
    
    <header class="relative z-50">
      <TheNavbar />
    </header>

    <main class="container mx-auto px-4 py-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside class="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </aside>

        <div class="col-span-1 lg:col-span-6 space-y-6">
          <RouterView v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>

        <aside class="hidden lg:block lg:col-span-3">
          <RightSidebar />
        </aside>
      </div>
    </main>

    <footer class="footer footer-center p-12 bg-[#0a0a1a] text-white/40 mt-20 border-t border-[#ccff00]/10">
      <div>
        <p class="font-black italic uppercase tracking-tighter text-2xl text-[#ccff00]">EA FC</p>
        <p class="text-[10px] font-bold uppercase tracking-widest mt-2">EA SPORTS IT'S IN THE GAME</p>
      </div>
    </footer>
  </div>
</template>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #05050a;
}
::-webkit-scrollbar-thumb {
  background: #ccff00;
}
::-webkit-scrollbar-thumb:hover {
  background: #e5ff80;
}

body {
  background-color: #05050a;
  overflow-x: hidden;
}

.btn-primary {
  @apply bg-[#ccff00] border-[#ccff00] text-black hover:bg-white hover:border-white;
}

.input, .textarea, .select {
  @apply bg-[#0a0a1a] border-white/10 focus:border-[#ccff00] rounded-none text-white;
}
</style>