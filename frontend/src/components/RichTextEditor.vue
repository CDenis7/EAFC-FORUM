<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  content: props.modelValue,
  editorProps: {
    attributes: {
      class: 'prose prose-invert max-w-none focus:outline-none min-h-[16rem] p-4 text-white/90 font-medium leading-relaxed',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (value) => {
  const isSame = editor.value.getHTML() === value
  if (isSame) return
  editor.value.commands.setContent(value, false)
})

onBeforeUnmount(() => {
  editor.value.destroy()
})
</script>

<template>
  <div class="border border-white/10 bg-[#1a1a3a] overflow-hidden group focus-within:border-[#ccff00]">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-1 p-2 border-b border-white/5 bg-[#0a0a1a]">
      
      <!-- Bold -->
      <button 
        @click="editor.chain().focus().toggleBold().run()" 
        :class="{ 'bg-[#ccff00] text-black': editor.isActive('bold'), 'text-white/50 hover:text-white': !editor.isActive('bold') }" 
        class="btn btn-xs btn-square rounded-none transition-colors" 
        title="Bold"
      >
        <strong class="font-black serif">B</strong>
      </button>
      
      <!-- Italic -->
      <button 
        @click="editor.chain().focus().toggleItalic().run()" 
        :class="{ 'bg-[#ccff00] text-black': editor.isActive('italic'), 'text-white/50 hover:text-white': !editor.isActive('italic') }" 
        class="btn btn-xs btn-square rounded-none transition-colors" 
        title="Italic"
      >
        <em class="font-serif italic">I</em>
      </button>

      <!-- Underline -->
      <button 
        @click="editor.chain().focus().toggleUnderline().run()" 
        :class="{ 'bg-[#ccff00] text-black': editor.isActive('underline'), 'text-white/50 hover:text-white': !editor.isActive('underline') }" 
        class="btn btn-xs btn-square rounded-none transition-colors" 
        title="Underline"
      >
        <span class="underline font-bold">U</span>
      </button>

      <!-- Strikethrough -->
      <button 
        @click="editor.chain().focus().toggleStrike().run()" 
        :class="{ 'bg-[#ccff00] text-black': editor.isActive('strike'), 'text-white/50 hover:text-white': !editor.isActive('strike') }" 
        class="btn btn-xs btn-square rounded-none transition-colors" 
        title="Strikethrough"
      >
        <span class="line-through font-bold">S</span>
      </button>

      <div class="w-[1px] h-4 bg-white/10 mx-1 self-center"></div>

      <!-- Bullet List -->
      <button 
        @click="editor.chain().focus().toggleBulletList().run()" 
        :class="{ 'bg-[#ccff00] text-black': editor.isActive('bulletList'), 'text-white/50 hover:text-white': !editor.isActive('bulletList') }" 
        class="btn btn-xs btn-square rounded-none transition-colors" 
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <!-- Ordered List -->
      <button 
        @click="editor.chain().focus().toggleOrderedList().run()" 
        :class="{ 'bg-[#ccff00] text-black': editor.isActive('orderedList'), 'text-white/50 hover:text-white': !editor.isActive('orderedList') }" 
        class="btn btn-xs btn-square rounded-none transition-colors" 
        title="Ordered List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01" /></svg>
      </button>

      <div class="w-[1px] h-4 bg-white/10 mx-1 self-center"></div>

      <!-- Align Left -->
      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'bg-[#ccff00] text-black': editor.isActive({ textAlign: 'left' }), 'text-white/50 hover:text-white': !editor.isActive({ textAlign: 'left' }) }" class="btn btn-xs btn-square rounded-none transition-colors"><span class="text-[10px]">L</span></button>
      <!-- Align Center -->
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'bg-[#ccff00] text-black': editor.isActive({ textAlign: 'center' }), 'text-white/50 hover:text-white': !editor.isActive({ textAlign: 'center' }) }" class="btn btn-xs btn-square rounded-none transition-colors"><span class="text-[10px]">C</span></button>
      <!-- Align Right -->
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'bg-[#ccff00] text-black': editor.isActive({ textAlign: 'right' }), 'text-white/50 hover:text-white': !editor.isActive({ textAlign: 'right' }) }" class="btn btn-xs btn-square rounded-none transition-colors"><span class="text-[10px]">R</span></button>
      
      <div class="w-[1px] h-4 bg-white/10 mx-1 self-center"></div>
      
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-[#ccff00] text-black': editor.isActive('heading', { level: 2 }), 'text-white/50 hover:text-white': !editor.isActive('heading', { level: 2 }) }" class="btn btn-xs rounded-none px-2 font-black uppercase text-[10px]">H1</button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'bg-[#ccff00] text-black': editor.isActive('heading', { level: 3 }), 'text-white/50 hover:text-white': !editor.isActive('heading', { level: 3 }) }" class="btn btn-xs rounded-none px-2 font-black uppercase text-[10px]">H2</button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<style>
.ProseMirror p { margin-bottom: 0.5em; }
.ProseMirror h2 { font-size: 1.5em; font-weight: 900; font-style: italic; color: white; margin-top: 0.5em; }
.ProseMirror h3 { font-size: 1.25em; font-weight: 800; color: white; margin-top: 0.5em; }
.ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin-bottom: 0.5em; }
.ProseMirror ul { list-style-type: disc; }
.ProseMirror ol { list-style-type: decimal; }
.ProseMirror li { margin-bottom: 0.25em; }
</style>