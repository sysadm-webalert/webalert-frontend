<script setup>
   import { ref, onMounted, computed, onUnmounted } from 'vue';
   import { getSites, getAllAlerts, getEvents } from '../api/api';
   import { useSession } from '../stores/user';
   import sweetalert from '../composables/sweetalert';
   
   const session = useSession();
   const sites = ref([]);
   const alerts = ref([]);
   const events = ref([]);
   const { successAlert } = sweetalert();
      
   const activeAlerts = computed(() => {
     return Object.values(alerts.value).filter(alert => !alert.isResolved).length;
   });
   const activeAcknowledge = computed(() => {
     return Object.values(events.value).filter(event => !event.acknowledge).length;
   });
   const last24HoursAlerts = computed(() => {
     const now = new Date();
     const lastTwentyHours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
   
     return Object.values(alerts.value).filter(alert => {
       const createdAt = new Date(alert.createdAt);
       return createdAt >= lastTwentyHours;
     });
   });
   const loadData = async () => {
   if (!session.isLogged) {
      return; 
   }
   try {
      sites.value = await getSites(session.getToken);
      alerts.value = await getAllAlerts(session.getToken);
      events.value = await getEvents(session.getToken);
      if (session.showWelcomeAlert) {
         successAlert("Welcome, " + session.getName);
         session.hideAlert();
      }
   } catch (error) {
      console.error('Error fetching data:', error);
   }
   };
   onMounted(() => {
      loadData();
     const interval = setInterval(loadData, 300000);
     onUnmounted(() => {
       clearInterval(interval);
     });
   });
</script>
<template>
   <!-- Main Content -->
   <div class="container mt-4">
      <div class="row">
         <!-- Site card -->
         <div class="col-md-4 mb-4">
            <div class="card panel">
               <div class="card-body text-center">
                  <span class="text-primary" style="font-size: 3rem;"><i class="bi bi-globe"></i></span>
                  <h5 class="card-title">Sites</h5>
                  <p class="card-text">Total sites: {{ sites.length }}</p>
                  <router-link :to="{ name: 'Sites' }" class="btn btn-primary"><i class="bi bi-info-circle"></i> Details</router-link>
               </div>
            </div>
         </div>
         <!-- Alert card -->
         <div class="col-md-4 mb-4">
            <div class="card panel">
               <div class="card-body text-center">
                  <span class="text-danger" style="font-size: 3rem;"><i class="bi-exclamation-triangle-fill"></i></span>
                  <h5 class="card-title">Active Alerts</h5>
                  <p class="card-text">Total: {{ activeAlerts }}</p>
                  <router-link :to="{ name: 'Alerts' }" class="btn btn-primary"><i class="bi bi-info-circle"></i> Details</router-link>
               </div>
            </div>
         </div>
         <!-- Event cards -->
         <div class="col-md-4 mb-4">
            <div class="card panel">
               <div class="card-body text-center">
                  <span class="text-primary" style="font-size: 3rem;"><i class="bi bi-bell"></i></span>
                  <h5 class="card-title">Events</h5>
                  <p class="card-text">Total: {{ activeAcknowledge }}</p>
                  <router-link :to="{ name: 'Events' }" class="btn btn-primary"><i class="bi bi-info-circle"></i> Details</router-link>
               </div>
            </div>
         </div>
      </div>
   </div>
   <div class="row justify-content-center">
      <div class="col-12 col-md-10 mb-4">
         <div class="card panel shadow-sm">
            <div class="card-header bg-primary text-white">
               <h5 class="mb-0">Last alerts in 24 hours <i class="bi-exclamation-triangle-fill"></i></h5>
            </div>
            <div class="card-body">
               <div v-for="alert in last24HoursAlerts" :key="alert.id" class="card mb-3">
                  <div class="card-header d-flex justify-content-between align-items-center">
                     <span class="fw-bold text-warning">Website: {{ alert.website }}</span>
                     <span :class="alert.isResolved ? 'badge bg-success' : 'badge bg-danger'">
                     {{ alert.isResolved ? 'Resolved' : 'Active' }}
                     </span>
                  </div>
                  <div class="card-body">
                     <p class="card-text"><strong>Alert type:</strong> {{ alert.type }}</p>
                     <p  v-if="alert.status" class="card-text"><strong>Status Code:</strong> {{ alert.status }}</p>
                     <p  v-if="alert.responseTime" class="card-text"><strong>Response Time:</strong> {{ alert.responseTime }}</p>
                     <p  v-if="alert.cpuUsage && alert.type=='max_cpu'" class="card-text"><strong>CPU Usage:</strong> {{ alert.cpuUsage.toFixed(2) + '%' }}</p>
                     <p  v-if="alert.memoryUsage && alert.type=='max_ram'" class="card-text"><strong>Memory Usage:</strong> {{ alert.memoryUsage.toFixed(2) + '%' }}</p>
                     <p  v-if="alert.diskUsage && alert.type=='max_disk'" class="card-text"><strong>Disk Usage:</strong> {{ alert.diskUsage.toFixed(2) + '%' }}</p>
                     <p class="card-text"><strong>Created At:</strong> {{ alert.createdAt }}</p>
                     <p v-if="alert.resolvedAt" class="card-text"><strong>Resolved At:</strong> {{ alert.resolvedAt }}</p>
                     <p v-else class="card-text text-muted"><em>This alert is still active.</em></p>
                  </div>
               </div>
               <router-link :to="{ name: 'Alerts' }"href="#" class="btn btn-outline-danger mt-3">View All Alerts</router-link>
            </div>
         </div>
      </div>
   </div>
</template>
