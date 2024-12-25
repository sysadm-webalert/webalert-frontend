<script setup>
   import { useRouter } from 'vue-router';
   import { useSession } from '../../stores/user';
     
   const session = useSession();
   const router = useRouter();
   
</script>
<template>
   <div v-if="session.logged" class="sidebar p-3">
      <h4 class="pb-3">Webalert</h4>
      <router-link :to="{ name: 'Overview' }" class="nav-link">
         <a href="#"><span class="bi bi-list"></span><span class="ms-2">Overview</span></a>
      </router-link>
      <router-link :to="{ name: 'Sites' }" class="nav-link">
         <a href="#"><span class="bi bi-globe"></span><span class="ms-2">My Sites</span></a>
      </router-link>
      <router-link :to="{ name: 'Metrics' }" class="nav-link">
         <a href="#"><span class="bi bi-bar-chart"></span><span class="ms-2">Metrics</span></a>
      </router-link>
      <router-link :to="{ name: 'Alerts' }" class="nav-link">
         <a href="#"><span class="bi bi-exclamation-triangle-fill"></span><span class="ms-2">Alerts</span></a>
      </router-link>
      <router-link :to="{ name: 'Events' }" class="nav-link">
         <a href="#"><span class="bi bi-bell"></span><span class="ms-2">Events</span></a>
      </router-link>
   </div>
   <!-- Content -->
</template>
<style scoped>
   .sidebar {
   background-color: #1e1e2f;
   color: white;
   height: 100vh;
   position: fixed;
   width: 250px;
   transition: all 0.3s;
   max-width: 10%;
   }
   .sidebar a {
   color: white;
   padding: 15px;
   text-decoration: none;
   display: flex;
   align-items: center;
   transition: all 0.2s;
   }
   .sidebar a:hover {
   background-color: #343a40;
   padding-left: 20px;
   }
   .sidebar a i {
   margin-right: 15px;
   }
</style>
