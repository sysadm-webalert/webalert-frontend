<script setup>
   import { ref, onMounted, onUnmounted } from 'vue';
   import Multiselect from 'vue-multiselect';
   import 'vue-multiselect/dist/vue-multiselect.min.css';
   import { GChart } from 'vue-google-charts';
   import { useSession } from '../stores/user';
   import { getSites, getStatusByMultipleHosts, getMetricsByMultipleHosts } from '../api/api';
   import {Tooltip} from "bootstrap"
   
   const session = useSession();
   
   const sites = ref([]);
   const selectedHosts = ref([]);
   const responseTimeData = ref([]);
   const statusCodeData = ref([]);
   const pageLoadData = ref([]);
   const pageSizeData = ref([]);
   const cpuUsageData = ref([]);
   const memoryUsageData = ref([]);
   const diskUsageData = ref([]);
   const chartKey = ref(0);
   const selectedFilter = ref('7d');
   
   const vCustomTooltip = {
     mounted: (el) => new Tooltip(el)
   }
   
   const arrayColors = [];
   
   function generateColorPalette(count) {
     const colors = [];
     for (let i = 0; i < count; i++) {
       let color = "#" + Math.floor(Math.random() * 16777215).toString(16);
       while (color.length < 7) {
         color += '0';
       }
       arrayColors.push(color);
     }
     return arrayColors;
   }
   
   const responseOptions = ref({
     title: 'Response Time Over Time',
     width: '100%',
     height: 300,
     hAxis: {
       title: 'Date',
       format: 'MMM d, HH:mm',
       gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } },
     },
     vAxis: {
       title: 'Response Time (ms)',
       minValue: 0,
       maxValue: 100,
     },
     colors: generateColorPalette(responseTimeData.length),
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   const pageLoadOptions = ref({
     title: 'Page Load Over Time',
     width: '100%',
     height: 300,
     hAxis: {
       title: 'Date',
       format: 'MMM d, HH:mm',
       gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } },
     },
     vAxis: {
       title: 'Page Load Over Time (ms)',
       minValue: 0,
       maxValue: 100,
     },
     colors: generateColorPalette(pageLoadData.length),
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   const pageSizeOptions = ref({
     title: 'Page Size',
     width: '100%',
     height: 300,
     hAxis: {
       title: 'Date',
       format: 'MMM d, HH:mm',
       gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } },
     },
     vAxis: {
       title: 'Page size (kb)',
       minValue: 0,
       maxValue: 100,
     },
     colors: generateColorPalette(pageSizeData.length),
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   const cpuOptions = ref({
     title: 'CPU Usage Over Time',
     width: '100%',
     height: 300,
     hAxis: {
       title: 'Date',
       format: 'MMM d, HH:mm',
       gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } },
     },
     vAxis: {
       title: 'CPU Usage (%)',
       minValue: 0,
       maxValue: 100,
     },
     colors: generateColorPalette(responseTimeData.length),
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   const memoryOptions = ref({
     title: 'Memory usage Over Time',
     width: '100%',
     height: 300,
     hAxis: {
       title: 'Date',
       format: 'MMM d, HH:mm',
       gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } },
     },
     vAxis: {
       title: 'Memory Usage (%)',
       minValue: 0,
       maxValue: 100,
     },
     colors: generateColorPalette(responseTimeData.length),
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   const diskOptions = ref({
     title: 'Disk usage Over Time',
     width: '100%',
     height: 300,
     hAxis: {
       title: 'Date',
       format: 'MMM d, HH:mm',
       gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } },
     },
     vAxis: {
       title: 'Disk Usage (%)',
       minValue: 0,
       maxValue: 100,
     },
     colors: generateColorPalette(responseTimeData.length),
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   function calculateMaxValue(data) {
     if (data.length <= 1) return 100;
     const values = data.slice(1).map(row => row[1]).filter(value => value != null);
     const maxValue = Math.max(...values);
     return Math.ceil(maxValue + maxValue * 0.2);
   }
   
   // Getting all sites
   async function loadHosts() {
     if (!session.isLogged) {
       return; 
     }
     try {
       sites.value = await getSites(session.getToken);
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   }
   
   function setFilter(filter) {
     selectedFilter.value = filter;
     loadSelectedHostsData(); // Reload data with the selected filter
   }
   
   // Loading data for selected sites
   async function loadSelectedHostsData() {
     const websiteIds = selectedHosts.value.map(site => site.id);
     
     if (websiteIds.length === 0) {
       // Cleaning the graphs if no host selected
       responseTimeData.value = [['Date', 'No sites selected']];
       statusCodeData.value = [['Date', 'No sites selected']];
       pageLoadData.value = [['Date', 'No sites selected']];
       pageSizeData.value = [['Date', 'No sites selected']];
       cpuUsageData.value = [['Date', 'No sites selected']];
       memoryUsageData.value = [['Date', 'No sites selected']];
       diskUsageData.value = [['Date', 'No sites selected']];
       chartKey.value += 1; // Forcing re-render of the charts
       return;
     }
     
     try {
       const statuses = await getStatusByMultipleHosts(session.getToken, websiteIds, selectedFilter.value);
       const metrics = await getMetricsByMultipleHosts(session.getToken, websiteIds, selectedFilter.value);
       
       groupResponseTimeByHost(statuses);
       groupMetricsByHost(metrics);
       responseOptions.value.vAxis.maxValue = calculateMaxValue(responseTimeData.value);
       pageLoadOptions.value.vAxis.maxValue = calculateMaxValue(pageLoadData.value);
       pageSizeOptions.value.vAxis.maxValue = calculateMaxValue(pageSizeData.value);
       cpuOptions.value.vAxis.maxValue = calculateMaxValue(cpuUsageData.value);
       memoryOptions.value.vAxis.maxValue = calculateMaxValue(memoryUsageData.value);
       diskOptions.value.vAxis.maxValue = calculateMaxValue(diskUsageData.value);
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   }
   
   // Loading multi select
   function handleHostSelection(selected) {
     selectedHosts.value = selected;
     loadSelectedHostsData();
   }
   
   // Grouping checkedAt for 15 minutes for response times
   function groupResponseTimeByHost(data) {
     const groupedData = {};
     const hostNames = new Set(data.map((item) => item.websiteName));
   
     data.forEach((item) => {
       const intervalTime = Math.floor(new Date(item.checkedAt).getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
   
       if (!groupedData[intervalTime]) {
         groupedData[intervalTime] = {};
       }
       if (!groupedData[intervalTime][item.websiteName]) {
         groupedData[intervalTime][item.websiteName] = { responseTimes: [], statusCodes: [], pageLoads: [], pageSizes: [] };
       }
       groupedData[intervalTime][item.websiteName].responseTimes.push(item.responseTime);
       groupedData[intervalTime][item.websiteName].statusCodes.push(item.statusCode);
       groupedData[intervalTime][item.websiteName].pageLoads.push(item.pageLoad);
       groupedData[intervalTime][item.websiteName].pageSizes.push(item.pageSize);
     });
     
     responseTimeData.value = [['Date', ...hostNames]];
     statusCodeData.value = [['Date', ...hostNames]];
     pageLoadData.value = [['Date', ...hostNames]];
     pageSizeData.value = [['Date', ...hostNames]];
     
     for (const [time, sites] of Object.entries(groupedData)) {
       const rowResponseTime = [new Date(Number(time))];
       const rowStatusCode = [new Date(Number(time))];
       const rowPageLoad = [new Date(Number(time))];
       const rowPageSize = [new Date(Number(time))];
       
       hostNames.forEach((host) => {
         const hostData = sites[host];
         if (hostData) {
           const avgResponseTime = hostData.responseTimes.reduce((sum, value) => sum + value, 0) / hostData.responseTimes.length;
           const lastStatusCode = hostData.statusCodes.at(-1);
           const avgPageLoad = hostData.pageLoads.reduce((sum, value) => sum + value, 0) / hostData.pageLoads.length;
           const avgPagesize = hostData.pageSizes.reduce((sum, value) => sum + value, 0) / hostData.pageSizes.length;
           rowResponseTime.push(avgResponseTime);
           rowStatusCode.push(lastStatusCode);
           rowPageLoad.push(avgPageLoad);
           rowPageSize.push(avgPagesize);
         } else {
           rowResponseTime.push(null);
           rowStatusCode.push(null);
           rowPageLoad.push(null);
           rowPageSize.push(null);
         }
       });
   
       responseTimeData.value.push(rowResponseTime);
       statusCodeData.value.push(rowStatusCode);
       pageLoadData.value.push(rowPageLoad);
       pageSizeData.value.push(rowPageSize);
     }
   }
   
   // Function to group metrics data
   function groupMetricsByHost(data) {
     const groupedData = {};
     const hostNames = new Set(data.map((item) => item.websiteName));
   
     data.forEach((item) => {
       const intervalTime = Math.floor(new Date(item.checkedAt).getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
   
       if (!groupedData[intervalTime]) {
         groupedData[intervalTime] = {};
       }
       if (!groupedData[intervalTime][item.websiteName]) {
         groupedData[intervalTime][item.websiteName] = { cpuUsage: [], memoryUsage: [], diskUsage: [] };
       }
       groupedData[intervalTime][item.websiteName].cpuUsage.push(item.cpuUsage);
       groupedData[intervalTime][item.websiteName].memoryUsage.push(item.memoryUsage);
       groupedData[intervalTime][item.websiteName].diskUsage.push(item.diskUsage);
     });
     
     cpuUsageData.value = [['Date', ...hostNames]];
     memoryUsageData.value = [['Date', ...hostNames]];
     diskUsageData.value = [['Date', ...hostNames]];
   
     for (const [time, sites] of Object.entries(groupedData)) {
       const rowCpuUsage = [new Date(Number(time))];
       const rowMemoryUsage = [new Date(Number(time))];
       const rowDiskUsage = [new Date(Number(time))];
       
       hostNames.forEach((host) => {
         const hostData = sites[host];
         if (hostData) {
           const avgCpuUsage = hostData.cpuUsage.reduce((sum, value) => sum + value, 0) / hostData.cpuUsage.length;
           const avgMemoryUsage = hostData.memoryUsage.reduce((sum, value) => sum + value, 0) / hostData.memoryUsage.length;
           const avgDiskUsage = hostData.diskUsage.reduce((sum, value) => sum + value, 0) / hostData.diskUsage.length;
           
           rowCpuUsage.push(avgCpuUsage);
           rowMemoryUsage.push(avgMemoryUsage);
           rowDiskUsage.push(avgDiskUsage);
         } else {
           rowCpuUsage.push(null);
           rowMemoryUsage.push(null);
           rowDiskUsage.push(null);
         }
       });
   
       cpuUsageData.value.push(rowCpuUsage);
       memoryUsageData.value.push(rowMemoryUsage);
       diskUsageData.value.push(rowDiskUsage);
     }
   }
   
   onMounted(() => {
     loadHosts();
     const interval = setInterval(loadHosts, 300000);
     onUnmounted(() => {
       clearInterval(interval);
     });
   });
</script>
<template>
   <div class="container mt-4">
      <h1 class="text-center title">Global Metrics</h1>
      <div>
         <div class="mb-4 text-center">
            <button class="btn btn-primary me-2" @click="setFilter('7d')" :class="{ active: selectedFilter === '7d' }">Last week</button>
            <button class="btn btn-primary me-2" @click="setFilter('1m')" :class="{ active: selectedFilter === '1m' }">Last month</button>
            <button class="btn btn-primary" @click="setFilter('all')" :class="{ active: selectedFilter === 'all' }">All</button>
         </div>
         <h1 class="text-left title">Select sites:</h1>
         <Multiselect
            v-model="selectedHosts"
            :options="sites"
            label="name"
            track-by="id"
            placeholder="Select one or more sites"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            @update:model-value="handleHostSelection"
            />
      </div>
      <br>
      <div class="row justify-content-center">
         <div v-if="responseTimeData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Response Time</h5>
                  <i v-custom-tooltip title="This chart displays the server's response time in milliseconds (ms) over a selected time period, helping to identify performance trends." data-bs-placement="right" class="bi bi-info-square-fill"></i>
               </div>
               <div class="card-body">
                  <GChart
                     type="LineChart"
                     :data="responseTimeData"
                     :options="responseOptions"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Response Time
                     <i v-custom-tooltip title="This chart displays the server's response time in milliseconds (ms) over a selected time period, helping to identify performance trends." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for Response time.</p>
               </div>
            </div>
         </div>
         <div v-if="statusCodeData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">HTTP Status Code
                     <i v-custom-tooltip title="This chart shows the HTTP status codes returned by the server over time, providing insights into server errors and availability." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body">
                  <GChart
                     :key="chartKey + '-statusCode'"
                     type="LineChart"
                     :data="statusCodeData"
                     :options="{
                     title: 'HTTP Status Code Over Time',
                     width: '100%',
                     height: 300,
                     hAxis: { title: 'Date', format: 'MMM d, HH:mm', gridlines: { count: -1, units: { hours: { format: ['HH:mm'] }, days: { format: ['MMM d'] } } } },
                     vAxis: { title: 'HTTP Status Code', minValue: 100, maxValue: 600 },
                     colors: generateColorPalette(statusCodeData.length),
                     explorer: {
                     actions: ['dragToZoom', 'rightClickToReset'],
                     axis: 'horizontal',
                     keepInBounds: true,
                     maxZoomIn: 0.1
                     }
                     }"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">HTTP Status Code
                     <i v-custom-tooltip title="This chart shows the HTTP status codes returned by the server over time, providing insights into server errors and availability." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for HTTP Status code.</p>
               </div>
            </div>
         </div>
         <div v-if="pageLoadData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Page Load Time
                     <i v-custom-tooltip title="This chart illustrates the time taken to load a webpage in milliseconds (ms), reflecting the user experience and performance." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body">
                  <GChart
                     type="LineChart"
                     :data="pageLoadData"
                     :options="pageLoadOptions"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Page Load Time
                     <i v-custom-tooltip title="This chart illustrates the time taken to load a webpage in milliseconds (ms), reflecting the user experience and performance." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for Page Load.</p>
               </div>
            </div>
         </div>
         <div v-if="pageSizeData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Page Size
                     <i v-custom-tooltip title="This chart visualizes the size of the webpage in kilobytes (KB), showing changes in resource usage over time." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body">
                  <GChart
                     type="LineChart"
                     :data="pageSizeData"
                     :options="pageSizeOptions"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Page Size
                     <i v-custom-tooltip title="This chart visualizes the size of the webpage in kilobytes (KB), showing changes in resource usage over time." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for Page Size.</p>
               </div>
            </div>
         </div>
         <div v-if="cpuUsageData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">CPU Usage
                     <i v-custom-tooltip title="This chart tracks the CPU usage percentage over time, indicating the server's processing load and capacity." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body">
                  <GChart
                     type="LineChart"
                     :data="cpuUsageData"
                     :options="cpuOptions"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">CPU Usage
                     <i v-custom-tooltip title="This chart tracks the CPU usage percentage over time, indicating the server's processing load and capacity." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for CPU usage.</p>
               </div>
            </div>
         </div>
         <div v-if="memoryUsageData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Memory Usage
                     <i v-custom-tooltip title="This chart presents the percentage of memory (RAM) utilized by the server, highlighting resource efficiency and potential bottlenecks." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body">
                  <GChart
                     type="LineChart"
                     :data="memoryUsageData"
                     :options="memoryOptions"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Memory Usage
                     <i v-custom-tooltip title="This chart presents the percentage of memory (RAM) utilized by the server, highlighting resource efficiency and potential bottlenecks." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for Memory usage.</p>
               </div>
            </div>
         </div>
         <div v-if="diskUsageData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Disk Usage
                     <i v-custom-tooltip title="This chart shows the percentage of disk space used on the server, helping monitor storage availability and trends." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body">
                  <GChart
                     type="LineChart"
                     :data="diskUsageData"
                     :options="diskOptions"
                     />
               </div>
            </div>
         </div>
         <div v-else class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Disk Usage
                     <i v-custom-tooltip title="This chart shows the percentage of disk space used on the server, helping monitor storage availability and trends." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <p>No data available for disk usage.</p>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>