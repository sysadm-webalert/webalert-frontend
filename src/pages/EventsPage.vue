<script setup>
   import { ref, onMounted, computed } from 'vue';
   import { getEvents } from '../api/api';
   import { useSession } from '../stores/user';
   import Multiselect from 'vue-multiselect';
   import {Tooltip} from "bootstrap"
   
   const session = useSession();
   const events = ref([]);
   const selectedAcknowledged = ref([]);
   const filterTypes = ref([
     { label: 'Acknowledged', value: true },
     { label: 'Not Acknowledged', value: false }
   ]);
   
   const vCustomTooltip = {
     mounted: (el) => new Tooltip(el)
   }
   
   onMounted(async () => {
     if (!session.isLogged) {
       return; 
     }
     try {
       events.value = await getEvents(session.getToken, true);
       selectedAcknowledged.value = [{ label: 'Not Acknowledged', value: false }];
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   });
   
   const filteredEvents = computed(() => {
     return events.value.filter(event => {
       const matchesAcknowledged = selectedAcknowledged.value.length === 0 || 
         selectedAcknowledged.value.some(item => item.value === event.acknowledge);
       return matchesAcknowledged;
     });
   });
</script>
<template>
   <div class="container mt-3">
      <div class="row">
         <h3>Filter by acknowledgment:</h3>
         <div class="col-md-4">
            <Multiselect
               v-model="selectedAcknowledged"
               :options="filterTypes"
               label="label"
               track-by="value"
               placeholder="Select acknowledgment status"
               :multiple="true"
               :close-on-select="false"
               :clear-on-select="false"
               />
         </div>
      </div>
   </div>
   <div class="container mt-5">
      <div class="d-flex align-items-center">
         <h3 class="mb-0">Organization events</h3>
         <small class="text-muted ms-2">Last 100</small>
         <i v-custom-tooltip title="Events are visible to all organizational members and are automatically marked as acknowledged upon viewing." data-bs-placement="right" class="bi bi-info-square-fill ms-2"></i>
      </div>
      <div class="table-responsive">
         <table class="table table-borderless table-hover">
            <thead class="table-primary">
               <tr>
                  <th scope="col">Generated</th>
                  <th scope="col">Message</th>
                  <th scope="col">Type</th>
                  <th scope="col">Acknowledged</th>
               </tr>
            </thead>
            <tbody>
               <template v-if="filteredEvents.length === 0">
                  <tr>
                     <td colspan="5" class="text-center">No events found</td>
                  </tr>
               </template>
               <template v-else>
                  <tr v-for="event in filteredEvents" :key="event.id">
                     <td>{{ event.createdAt }}</td>
                     <td>{{ event.message }}</td>
                     <td>{{ event.type.toUpperCase() }}</td>
                     <td>
                        <span :class="event.acknowledge ? 'badge bg-success' : 'badge bg-warning text-dark'">
                        {{ event.acknowledge ? 'Yes' : 'No' }}
                        </span>
                     </td>
                  </tr>
               </template>
            </tbody>
         </table>
      </div>
   </div>
</template>