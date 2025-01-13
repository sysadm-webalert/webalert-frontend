<script setup>
   import { ref, onMounted, computed } from 'vue';
   import { getAllAlerts } from '../api/api';
   import { useSession } from '../stores/user';
   import Multiselect from 'vue-multiselect';
   import {Tooltip} from "bootstrap"
   
   const session = useSession();
   const alerts = ref([]);
   const selectedAlert = ref([]);
   const detailedAlert = ref({});
   const filterTypes = ref([]);
   const resolvedFilter = ref([]);
   
   const vCustomTooltip = {
     mounted: (el) => new Tooltip(el)
   }

   onMounted(async () => {
     if (!session.isLogged) {
       return; 
     }
     try {
       alerts.value = await getAllAlerts(session.getToken);
       console.log(alerts.value)
       filterTypes.value = [...new Set(alerts.value.map(alert => alert.type))]
         .map(type => ({ label: type, value: type }));
   
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   });
   
   const filteredAlerts = computed(() => {
     return alerts.value.filter(alert => {
       const matchesType = selectedAlert.value.length === 0 || selectedAlert.value.map(item => item.value).includes(alert.type);
       const matchesResolved = resolvedFilter.value.length === 0 || resolvedFilter.value.some(item => item.value === alert.isResolved);
       return matchesType && matchesResolved;
     });
   });
   
   
   function openEditModal(alert) {
     detailedAlert.value = alert;
   }
</script>
<template>
   <div class="container mt-3">
      <div class="row">
         <h3>Select your filter:</h3>
         <div class="col-md-4">
            <h5>Error type:</h5>
            <Multiselect
               v-model="selectedAlert"
               :options="filterTypes"
               label="label"
               track-by="value"
               placeholder="Select one or more error types"
               :multiple="true"
               :close-on-select="false"
               :clear-on-select="false"
               />
         </div>
         <div class="col-md-4">
            <h5>Status:</h5>
            <Multiselect
               v-model="resolvedFilter"
               :options="[{ label: 'Resolved', value: true }, { label: 'Not Resolved', value: false }]"
               label="label"
               track-by="value"
               placeholder="Select resolution status"
               :multiple="true"
               :close-on-select="false"
               :clear-on-select="false"
               />
         </div>
      </div>
   </div>
   <div class="container mt-5">
      <div class="d-flex align-items-center">
         <h3 class="mb-0">Organization alerts</h3>
         <small class="text-muted ms-2">Last 100</small>
         <i v-custom-tooltip title="Alerts are visible to all organizational members." data-bs-placement="right" class="bi bi-info-square-fill ms-2"></i>
      </div>
      <div class="table-responsive">
         <table class="table table-borderless table-hover">
            <thead class="table-primary">
               <tr>
                  <th scope="col">Generated</th>
                  <th scope="col">Type</th>
                  <th scope="col">Website</th>
                  <th scope="col">Resolved</th>
                  <th scope="col">Resolved At</th>
                  <th scope="col">Action</th>
               </tr>
            </thead>
            <tbody>
               <template v-if="filteredAlerts.length === 0">
                  <tr>
                     <td colspan="6" class="text-center">No Alerts found</td>
                  </tr>
               </template>
               <template v-else>
                  <tr v-for="alert in filteredAlerts" :key="alert.id">
                     <td>{{ alert.createdAt }}</td>
                     <td>{{ alert.type.toUpperCase() }}</td>
                     <td>{{ alert.website }}</td>
                     <td><span :class="alert.isResolved ? 'badge bg-success' : 'badge bg-danger'">
                        {{ alert.isResolved ? 'Resolved' : 'Active' }}
                        </span>
                     </td>
                     <td>{{ alert.resolvedAt ? alert.resolvedAt : 'No' }}</td>
                     <td class="text-end">
                        <button
                           type="button"
                           class="btn btn-primary btn-sm me-2"
                           data-bs-toggle="modal"
                           data-bs-target="#statusModal"
                           @click="openEditModal(alert)"
                           >
                        Info
                        </button>
                     </td>
                  </tr>
               </template>
            </tbody>
         </table>
      </div>
   </div>
   <!-- Modal -->
   <div class="modal fade" id="statusModal" tabindex="-1" aria-labelledby="statusModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header bg-primary text-white">
               <h5 class="modal-title" id="statusModalLabel">Alert Details </h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
               <div class="mb-3 p-3 rounded bg-light">
                  <p><strong>Type:</strong> <span class="text-muted">{{ detailedAlert.type }}</span></p>
                  <p><strong>Generated:</strong> <span class="text-muted">{{ detailedAlert.createdAt }}</span></p>
                  <p><strong>Website:</strong> <span class="text-muted">{{ detailedAlert.website }}</span></p>
                  <p v-if="detailedAlert.status"><strong>HTTP code:</strong> <span class="text-muted">{{ detailedAlert.status }}</span></p>
                  <p v-if="detailedAlert.responseTime"><strong>Response time:</strong> <span class="text-muted">{{ detailedAlert.responseTime }}</span></p>
                  <p v-if="detailedAlert.isUp"><strong>Is up: </strong> 
                     <span v-if="detailedAlert.isUp" class="text-success">
                     <i class="bi bi-arrow-up-circle"></i> Up
                     </span>
                     <span v-else class="text-danger">
                     <i class="bi bi-arrow-down-circle"></i> Down
                     </span>
                  </p>
                  <p v-if="detailedAlert.cpuUsage"><strong>CPU Usage:</strong> <span class="text-muted">{{ detailedAlert.cpuUsage }}</span></p>
                  <p v-if="detailedAlert.memoryUsage"><strong>Memory Usage:</strong> <span class="text-muted">{{ detailedAlert.memoryUsage }}</span></p>
                  <p v-if="detailedAlert.diskUsage"><strong>Disk Usage:</strong> <span class="text-muted">{{ detailedAlert.diskUsage }}</span></p>
                  <p><strong>Resolved At:</strong> <span class="text-muted">{{ detailedAlert.resolvedAt ? detailedAlert.resolvedAt : 'No' }}</span></p>
                  <p>
                     <strong>Status: </strong> 
                     <span :class="detailedAlert.isResolved ? 'badge bg-success' : 'badge bg-warning text-dark'">
                     {{ detailedAlert.isResolved ? 'Resolved' : 'Active' }}
                     </span>
                  </p>
               </div>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
         </div>
      </div>
   </div>
</template>
