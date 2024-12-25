<script setup>
   import { useRouter } from 'vue-router';
   import { useSession } from '../../stores/user';
     
   const session = useSession();
   const router = useRouter();
   
   const logout = () => {
     session.logout();
     router.push({ name: 'login' });
   };
</script>
<template>
   <!-- Navbar Desktop-->
   <nav v-if="session.logged" class="navbar navbar-desktop navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
         <a class="navbar-brand" href="#">Client Dashboard</a>
         <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
         <span class="navbar-toggler-icon"></span>
         </button>
         <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav">
               <li class="nav-item">
                  <router-link :to="{ name: 'Organization' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-people"></span>
                     <span class="ms-2">Organization</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Profile' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-person-circle"></span>
                     <span class="ms-2">Profile</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <a href="#" @click.prevent="logout" class="nav-link d-flex align-items-center">
                  <span class="bi bi-box-arrow-right"></span>
                  <span class="ms-2">Log out</span>
                  </a>
               </li>
            </ul>
         </div>
      </div>
   </nav>
   <!-- Navbar Mobile-->
   <nav v-if="session.logged" class="navbar navbar-mobile navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
         <a class="navbar-brand" href="#">Client Dashboard</a>
         <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
         <span class="navbar-toggler-icon"></span>
         </button>
         <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav">
               <li class="nav-item">
                  <router-link :to="{ name: 'Overview' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-list"></span>
                     <span class="ms-2">Overview</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Sites' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-globe"></span>
                     <span class="ms-2">Sites</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Metrics' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-bar-chart"></span>
                     <span class="ms-2">Metrics</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Alerts' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-exclamation-triangle-fill"></span>
                     <span class="ms-2">Alerts</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Events' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-bell"></span>
                     <span class="ms-2">Events</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Organization' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-people"></span>
                     <span class="ms-2">Organization</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <router-link :to="{ name: 'Profile' }" class="nav-link d-flex align-items-center">
                     <span class="bi bi-person-circle"></span>
                     <span class="ms-2">Profile</span>
                  </router-link>
               </li>
               <li class="nav-item">
                  <a href="#" @click.prevent="logout" class="nav-link d-flex align-items-center">
                  <span class="bi bi-box-arrow-right"></span>
                  <span class="ms-2">Log out</span>
                  </a>
               </li>
            </ul>
         </div>
      </div>
   </nav>
</template>
<style scoped>
   .navbar {
   background-color: #fff;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
   }
   @media (max-width: 1200px) {
   .navbar-desktop {
   display: none;
   }
   }
   @media (min-width: 1200px) {
   .navbar-mobile {
   display: none;
   }
   }
</style>