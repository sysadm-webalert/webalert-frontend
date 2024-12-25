<script setup>
   import { ref, watch } from 'vue';
   
   const props = defineProps({
     site: {
       type: Object,
       default: () => null
     }
   });
   
   const emits = defineEmits(['add-site', 'edit-site']);
   
   const formData = ref({
     name: '',
     protocol: 'http',
     url: '',
     description: '',
     codes: '',
     maxResponse: '',
     maxCPU: '',
     maxRAM: '',
     maxDISK: '',
   });
   
   // Observe changes to the 'site' prop and update the form data accordingly.
   watch(
   () => props.site,
   (newSite) => {
    if (newSite) {
      const threshold = newSite.Threshold || {}; // If Threshold is null
   
      formData.value = {
        name: newSite.name || '',
        protocol: newSite.url?.startsWith('https') ? 'https' : 'http',
        url: newSite.url?.replace(/(^\w+:|^)\/\//, '') || '', // Removing protocol from the url field
        description: newSite.description || '',
        codes: threshold.codes || '',
        maxResponse: threshold.maxResponse || '',
        maxCPU: threshold.maxCPU || '',
        maxRAM: threshold.maxRAM || '',
        maxDISK: threshold.maxDISK || '',
      };
    } else {
      formData.value = {
        name: '',
        protocol: 'http',
        url: '',
        description: '',
        codes: '',
        maxResponse: '',
        maxCPU: '',
        maxRAM: '',
        maxDISK: '',
      };
    }
   },
   { immediate: true }
   );
   
   // Function to construct the full URL protocol + url
   const getFullUrl = () => `${formData.value.protocol}://${formData.value.url}`;
   
   const submitForm = () => {
     const fullUrl = getFullUrl();
     if (props.site) {
       emits('edit-site', { ...formData.value, url: fullUrl, id: props.site.id });
     } else {
       emits('add-site', { ...formData.value, url: fullUrl });
     }
   };
</script>
<template>
   <form @submit.prevent="submitForm">
      <!-- Sites section -->
      <div class="mb-3">
         <label for="site-name" class="col-form-label">Site Name:</label>
         <input type="text" class="form-control" id="site-name" v-model="formData.name"/>
      </div>
      <div class="mb-3 d-flex align-items-center">
         <label for="site-protocol" class="col-form-label me-2">Protocol:</label>
         <select class="form-select me-2" id="site-protocol" v-model="formData.protocol" style="width: auto;">
            <option value="http">http</option>
            <option value="https">https</option>
         </select>
         <input type="text" class="form-control" id="site-url" v-model="formData.url" placeholder="www.example.com"/>
      </div>
      <!-- Threshold section -->
      <div class="mb-3">
         <label for="site-codes" class="col-form-label">Accepted HTTP Codes:</label>
         <input type="text" class="form-control" id="site-codes" v-model="formData.codes" placeholder="E.g., 200 or 200-299"/>
      </div>
      <div class="mb-3">
         <label for="sites-maxresponse" class="col-form-label">Max Response Time (ms):</label>
         <input type="number" class="form-control" id="sites-maxresponse" v-model="formData.maxResponse" placeholder="E.g., 3000"/>
      </div>
      <!-- Agent section -->
      <div v-if="props.site?.agent?.isInstalled" class="mb-3">
         <label for="sites-maxcpu" class="col-form-label">CPU Threshold (%):</label>
         <input type="number" class="form-control" id="sites-maxcpu" v-model="formData.maxCPU" placeholder="E.g., 80"/>
      </div>
      <div v-if="props.site?.agent?.isInstalled" class="mb-3">
         <label for="sites-maxram" class="col-form-label">RAM Threshold (%):</label>
         <input type="number" class="form-control" id="sites-maxram" v-model="formData.maxRAM" placeholder="E.g., 70"/>
      </div>
      <div v-if="props.site?.agent?.isInstalled" class="mb-3">
         <label for="sites-maxdisk" class="col-form-label">Disk Threshold (%):</label>
         <input type="number" class="form-control" id="sites-maxdisk" v-model="formData.maxDISK" placeholder="E.g., 90"/>
      </div>
      <!-- Modal footer -->
      <div class="modal-footer">
         <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
         <button type="submit" class="btn btn-primary">Save changes</button>
      </div>
   </form>
</template>
<style scoped></style>