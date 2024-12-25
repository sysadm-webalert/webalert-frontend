<script setup>
   import { ref, onMounted } from 'vue';
   import { getSites, postSites, putSites, deleteSites, createSnapshot } from '../api/api';
   import { useSession } from '../stores/user';
   import SitesForm from '../components/forms/SitesForm.vue';
   import { useRouter } from 'vue-router';
   import sweetalert from '../composables/sweetalert';
   
   const session = useSession();
   const router = useRouter();
   let response = ref([]);
   const sites = ref([]);
   let editSite = ref(null);
   const loadingSnapshot = ref({});
   const activeAlerts = {};
   const { successAlert } = sweetalert();
   const { errorAlert } = sweetalert();
   const { cooldownAlert } = sweetalert();
   const { confirmAlert } = sweetalert();
   
   onMounted(async () => {
     if (!session.isLogged) {
       return; 
     }
     response = await getSites(session.getToken);
     sites.value = response;
   });
   
   // lastCheckAt time ago calculation
   const timeAgo = (date) => {
     const now = new Date();
     const seconds = Math.floor((now - new Date(date)) / 1000);
     
     let interval = Math.floor(seconds / 31536000);
     if (interval > 1) return `${interval} years ago`;
     
     interval = Math.floor(seconds / 2592000);
     if (interval > 1) return `${interval} months ago`;
     
     interval = Math.floor(seconds / 86400);
     if (interval > 1) return `${interval} days ago`;
     
     interval = Math.floor(seconds / 3600);
     if (interval === 1) return '1 hour ago';
     if (interval > 1) {
       const minutes = Math.floor((seconds % 3600) / 60);
       return `${interval} hours${minutes > 0 ? ' and ' + minutes + ' minutes' : ''} ago`;
     }
   
     interval = Math.floor(seconds / 60);
     if (interval === 1) return '1 minute ago';
     return `${interval} minutes ago`;
   };
   
   const openModal = () => {
     editSite.value = null;
   };
   
   const openEditModal = (site) => {
     editSite.value = { ...site }; // Clone the object clean to avoid duplications
   };
   
   const createSite = async (site) => {
     try {
       const response = await postSites(site, session.getToken);
       successAlert(response.message);
       const sitesResponse = await getSites(session.getToken);
       sites.value = sitesResponse;
     } catch (error) {
       errorAlert(error.response.data.error);
     }
   };
   
   const updateSite = async (site) => {
     try {
       const response = await putSites(site, session.getToken);
       successAlert(response.message);
       const sitesResponse = await getSites(session.getToken);
       sites.value = sitesResponse;
     } catch (error) {
        errorAlert(error.response.data.error);
     }
   };
   
   const removeSite = async (siteId) => {
     try {
       const result = await confirmAlert("Do you wanna remove the site? All metrics will be deleted.");
       if (result.isConfirmed) {
         const response = await deleteSites(siteId, session.getToken);
         successAlert(response.message);
         const sitesResponse = await getSites(session.getToken);
         sites.value = sitesResponse;
      }
     } catch (error) {
      errorAlert(error.message);
     }
   };
   
   const captureScreenshot = async (site) => {
     if (session.isCooldownActive(site.id)) {
       const remainingTime = session.getCooldownRemaining(site.id);
   
       // If alert exist, return
       if (activeAlerts[site.id]) {
         return;
       }
   
       if (remainingTime > 0) {
         cooldownAlert(site, remainingTime, session);
       }
   
       return;
     }
   
     loadingSnapshot.value[site.id] = true;
     try {
       const response = await createSnapshot(site, session.getToken);
       successAlert(response.message);
       site.snapshotUrl = `${site.snapshotUrl.split('?')[0]}?timestamp=${Date.now()}`;
       session.setCooldown(site.id);
     } catch (error) {
       errorAlert(error.response.data.error);
     } finally {
       loadingSnapshot.value[site.id] = false;
     }
   };
   
   const openImage = (url) => {
     window.open(url, '_blank');
   };
   
   const setFallbackImage = (event, url) => {
     const baseUrl = url.substring(0, url.lastIndexOf('/'));
     event.target.src = `${baseUrl}/no_image.png`;
   };
   
   const goToMetrics = (url, id) => {
     router.push({ name: 'Metrics-url', params: { url, id } });
   };
</script>
<template>
   <div class="container mt-5">
      <button type="button" class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#siteModal" @click="openModal">
      Add Site
      </button>
      <div class="modal fade" id="siteModal" tabindex="-1" aria-labelledby="siteModalLabel" aria-hidden="true">
         <div class="modal-dialog">
            <div class="modal-content">
               <div class="modal-header">
                  <h1 class="modal-title fs-5" id="siteModalLabel">{{ editSite ? 'Edit Site' : 'Add New Site' }}</h1>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
                  <SitesForm :site="editSite" @add-site="createSite" @edit-site="updateSite" />
               </div>
            </div>
         </div>
      </div>
      <div class="row">
         <template v-if="sites.length === 0">
            <div class="col-12 text-center">
               <p>No sites found</p>
            </div>
         </template>
         <template v-else>
            <div v-for="site in sites" :key="site.id" class="col-md-6 col-lg-4 mb-4">
               <div class="card shadow-sm">
                  <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
                     <h6 class="mb-0">{{ site.name }}</h6>
                     <span class="badge bg-primary">Production</span>
                  </div>
                  <div class="card-body">
                     <div class="web-image-container text-center mb-3 position-relative">
                        <img :src="site.snapshotUrl" class="img-fluid rounded" style="cursor: pointer;" @click="openImage(site.snapshotUrl)" @error="setFallbackImage($event, site.snapshotUrl)"/>
                        <div v-if="loadingSnapshot[site.id]" class="overlay position-absolute w-100 h-100 d-flex justify-content-center align-items-center">
                           <div class="spinner-border text-primary" role="status">
                              <span class="visually-hidden">Loading...</span>
                           </div>
                        </div>
                        <i class="bi bi-camera" style="cursor: pointer; font-size: 1.5rem; transform: translate(-10%, -10%);" @click.stop="captureScreenshot(site)" ></i>
                     </div>
                     <h5 class="card-title text-center">{{ site.name }}</h5>
                     <p class="text-center"><a :href="site.url" target="_blank">{{ site.url }}</a></p>
                     <div v-if="site.agent && site.agent.isInstalled" class="d-flex justify-content-between text-muted">
                        <small>CPU {{ site.lastMetric ? site.lastMetric.cpu_usage.toFixed(2) + '%' : 'N/A' }}</small>
                        <small>RAM {{ site.lastMetric ? site.lastMetric.memory_usage.toFixed(2) + '%' : 'N/A' }}</small>
                        <small>DISK {{ site.lastMetric ? site.lastMetric.disk_usage.toFixed(2) + '%' : 'N/A' }}</small>
                     </div>
                     <div class="d-flex justify-content-between align-items-center text-muted mt-2">
                        <button type="button" 
                           :class="['btn', site.agent && site.agent.isInstalled ? 'btn-success' : 'btn-secondary', 'btn-sm']" 
                           :disabled="!site.agent">
                        {{ site.agent && site.agent.isInstalled ? `Agent: v${site.agent.version}` : 'Agent not installed' }}
                        </button>
                        <small v-if="site.agent && site.agent.isInstalled">Last check: {{ timeAgo(site.agent.lastCheckedAt) }}</small>
                        <button v-else type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#downloadModal">Download Agent</button>
                     </div>
                  </div>
                  <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                     <button type="button" class="btn btn-outline-primary btn-sm" @click="goToMetrics(site.url, site.id)">Metrics</button>
                     <div class="d-flex">
                        <button type="button" class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#siteModal" @click="openEditModal(site)">Edit</button>
                        <button type="button" class="btn btn-danger btn-sm" @click="removeSite(site.id)">Delete</button>
                     </div>
                  </div>
               </div>
            </div>
         </template>
      </div>
   </div>
   <!-- Modal -->
   <div class="modal fade" id="downloadModal" tabindex="-1" aria-labelledby="downloadModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
         <div class="modal-content">
            <div class="modal-header">
               <h5 class="modal-title" id="downloadModalLabel">Download & Install WebAlert Agent</h5>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
               <p>
                  You are about to download the latest version of WebAlert Agent. Please follow the instructions below for installation and configuration.
               </p>
               <h6>1. Download the Package</h6>
               <a href="https://github.com/sysadm-webalert/webalert-agent/releases/download/v1.0.0/webalert-agent-latest.deb" 
                  class="btn btn-success mb-3" 
                  download>
               Download WebAlert Agent (.deb)
               </a>
               <h6>2. Install the Package</h6>
               <pre><code>sudo dpkg -i webalert-agent-latest.deb</code></pre>
               <h6>3. Verify Agent is running</h6>
               <pre><code>systemctl status webalert-agent</code></pre>
               <h6>4. Configure the Agent</h6>
               <p>Configure <strong>config.json</strong> file in <code>/etc/webalert-agent/</code> with the following <a href="https://github.com/sysadm-webalert/webalert-agent?tab=readme-ov-file#configuration">instructions</a></p>
            </div>
            <div class="modal-footer">
               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
         </div>
      </div>
   </div>
</template>
<style scoped>
   .web-image-container img {
   max-height: 150px;
   width: 100%;
   object-fit: cover;
   }
   i.bi-camera {
   position: absolute;
   top: 5px;
   left: 10px;
   width: 30px;
   height: 30px;
   display: flex;
   justify-content: center;
   align-items: center;
   border-radius: 50%;
   border: 1px solid black;
   background-color: transparent;
   color: black;
   font-size: 1.2rem;
   transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
   }
   i.bi-camera:hover {
   transform: scale(1.2); 
   box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
   background-color: black;
   color: white;
   }
   .no-hover {
   pointer-events: auto;
   opacity: 0.5;
   }
   .no-hover:hover {
   transform: none;
   box-shadow: none;
   background-color: transparent;
   color: inherit;
   }
   .overlay {
   background-color: rgba(255, 255, 255, 0.8);
   top: 0;
   left: 0;
   z-index: 2;
   }
</style>
