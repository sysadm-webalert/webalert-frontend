<script setup>
const emits = defineEmits(['close-modal'])
const closeModal = () => {
  emits('close-modal');
}
</script>

<template>
<div class="modal-container">
   <div class="modal">
      <div class="modal__header">
         <slot name="header">
         </slot>
         <button class="close-modal-btn" @click="closeModal">
         <img src="../assets/images/close-button.svg">
         </button>
      </div>
      <div class="modal__body">
         <slot name="body"></slot>
      </div>
   </div>
</div>
</template>
    
<style scoped>
</style>