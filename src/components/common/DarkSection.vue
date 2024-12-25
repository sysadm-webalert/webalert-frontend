<script setup></script>
<template>
   <!-- Dark Section -->
   <div class="split left">
      <div class="credits">
         <small class="text-light">Photo by Taylor Vick at Unsplash</small>
      </div>
   </div>
</template>
<style scoped>
   .left {
   width: 45%;
   left: 0;
   background: linear-gradient(
   rgba(30, 30, 47, 0.7),
   rgba(30, 30, 47, 0.7)
   ),
   url('@/assets/rac_0.jpg') no-repeat center center;
   background-size: cover;
   }
   .credits {
   background-color: rgba(#292833);
   opacity: 0.3;
   font-size: 10px;
   }
</style>
