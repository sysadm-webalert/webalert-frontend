<script setup>
   import { ref, onBeforeMount } from 'vue';
   import { validateToken } from './api/api';
   import { useRouter } from 'vue-router';
   import { useSession } from './stores/user';
   import Sidebar from './components/layout/Sidebar.vue';
   import Navbar from './components/layout/Navbar.vue';
   import sweetalert from '../src/composables/sweetalert';
   
   const router = useRouter();
   const session = useSession();
   const isAuthenticating = ref(true);
   const { errorAlert } = sweetalert();
   
   const getLocalStorageSession = async () => {
     const nameLS = localStorage.getItem('name');
     const tokenLS = localStorage.getItem('token');
     
     if (nameLS && tokenLS) {
       try {
         await validateToken(session.getToken);
         session.name = nameLS;
         session.token = tokenLS;
         session.logged = true;
         router.push({ name: 'Overview' });
       } catch (error) {
         errorAlert(error.response.data.message);
         localStorage.removeItem('token');
         session.token = null;
         session.logged = false;
         router.push({ name: 'login' });
       }
     } else {
       session.logged = false;
     }
     isAuthenticating.value = false;
   };
   
   onBeforeMount(() => {
     getLocalStorageSession();
   });
</script>
<template>
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
   <div v-if="!isAuthenticating">
      <div v-if="session.logged">
         <Sidebar />
         <div class="content">
            <Navbar />
            <router-view />
         </div>
      </div>
      <div v-else>
         <router-view />
      </div>
   </div>
   <footer class="text-center mt-4 fixed-bottom bg-light py-2">
      <p>&copy; 2024 Webalert. All rights reserved.</p>
   </footer>
</template>
<style scoped>
   .content {
   margin-left: 10%;
   margin-right: 0%;
   padding: 20px;
   }
   @media (max-width: 1200px) {
   .content {
   margin-left: 0%;
   }
   }
   @media (max-width: 1200px) {
   .sidebar {
   display: none;
   }
   }
</style>