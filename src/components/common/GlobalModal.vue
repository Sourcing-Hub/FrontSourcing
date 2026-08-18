<script setup>
import { useModalStore } from '../../stores/modal'
import { 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  X 
} from 'lucide-vue-next'

const store = useModalStore()
</script>

<template>
  <div 
    v-if="store.isOpen" 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto"
  >
    <!-- Background backdrop -->
    <div 
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
      @click="store.cancel"
    ></div>

    <!-- Modal Box -->
    <div 
      class="relative bg-white rounded-2xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all p-6 text-left"
    >
      <!-- Close button (top right) -->
      <button 
        @click="store.cancel" 
        class="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
      >
        <X class="w-4 h-4" />
      </button>

      <div class="flex items-start gap-4">
        <!-- Icon Container based on variant -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="{ 'bg-red-50 text-red-600': store.variant === 'danger', 'bg-amber-50 text-amber-600': store.variant === 'warning', 'bg-emerald-50 text-emerald-600': store.variant === 'success', 'bg-[#CE0033]/10 text-[#CE0033]': store.variant === 'primary' || !store.variant }"
        >
          <AlertTriangle v-if="store.variant === 'danger'" class="w-5 h-5" />
          <AlertCircle v-else-if="store.variant === 'warning'" class="w-5 h-5" />
          <CheckCircle2 v-else-if="store.variant === 'success'" class="w-5 h-5" />
          <Info v-else class="w-5 h-5" />
        </div>

        <!-- Content -->
        <div class="flex-1">
          <h3 class="text-base font-bold text-gray-900 mb-2">
            {{ store.title }}
          </h3>
          <p class="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
            {{ store.message }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <!-- Cancel button if confirm type -->
        <button 
          v-if="store.isConfirm" 
          @click="store.cancel"
          class="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors"
        >
          {{ store.cancelText }}
        </button>

        <!-- Confirm button -->
        <button 
          @click="store.accept"
          class="px-4 py-2 text-white text-xs font-semibold rounded-xl transition-colors"
          :class="{ 'bg-red-600 hover:bg-red-700': store.variant === 'danger', 'bg-amber-600 hover:bg-amber-700': store.variant === 'warning', 'bg-emerald-600 hover:bg-emerald-700': store.variant === 'success', 'bg-[#CE0033] hover:bg-[#a8002a]': store.variant === 'primary' || !store.variant }"
        >
          {{ store.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
