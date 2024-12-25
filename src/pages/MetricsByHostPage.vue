<script setup>
   import { ref, onMounted } from 'vue';
   import { useRoute } from 'vue-router';
   import { useSession } from '../stores/user';
   import { GChart } from 'vue-google-charts';
   import { getStatusBySite, getMetricsBySite } from '../api/api';
   import {Tooltip} from "bootstrap"
   
   const route = useRoute();
   const session = useSession();
   const chartKey = ref(0);
   const responseTimeData = ref([]);
   const statusCodeData = ref([]);
   const pageLoadData = ref([]);
   const pageSizeData = ref([]);
   const cpuUsageData = ref([]);
   const memoryUsageData = ref([]);
   const diskUsageData = ref([]);
   const hasMetrics = ref(false);
   const selectedFilter = ref('7d');
   
   const vCustomTooltip = {
     mounted: (el) => new Tooltip(el)
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
     colors: ['#4CAF50'],
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
     colors: ['#4CAF50'],
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
     colors: ['#4CAF50'],
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
     colors: ['#4CAF50'],
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
     colors: ['#4CAF50'],
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
     colors: ['#4CAF50'],
     explorer: {
       actions: ['dragToZoom', 'rightClickToReset'],
       axis: 'horizontal',
       keepInBounds: true,
       maxZoomIn: 0.1,
     },
   });
   
   function setFilter(filter) {
     selectedFilter.value = filter;
     loadData(); // Reloading data qwith the selected filter
   }
   
   // Grouping checkedAt for 15 minutes
   function groupDataByInterval(data, metricKey) {
     const groupedData = {};
   
     data.forEach((item) => {
       const intervalTime = Math.floor(new Date(item.checkedAt).getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
   
       if (!groupedData[intervalTime]) {
         groupedData[intervalTime] = [];
       }
       groupedData[intervalTime].push(item[metricKey]);
     });
   
     return Object.entries(groupedData).map(([time, values]) => {
       const avgValue = values.reduce((sum, value) => sum + value, 0) / values.length;
       return [new Date(Number(time)), avgValue];
     });
   }
   
   // Format data for googlecharts
   function formatStatusCodeData(data) {
     return data.map((status) => [
       new Date(status.checkedAt),
       status.statusCode,
     ]);
   }
   
   // This functions add 10% of the Y axis of the graphic
   // in order to more human friendly redeable
   function calculateMaxValue(data) {
     if (data.length <= 1) return 100;
     const values = data.slice(1).map(row => row[1]).filter(value => value != null);
     const maxValue = Math.max(...values);
     return Math.ceil(maxValue + maxValue * 0.2);
   }
   
   async function loadData() {
     if (!session.isLogged) {
       return;
     }
   
     try {
       const statuses = await getStatusBySite(session.getToken, route.params.id, selectedFilter.value);
       const metrics = await getMetricsBySite(session.getToken, route.params.id, selectedFilter.value);
       responseTimeData.value = [['Date', 'Response Time (ms)'], ...groupDataByInterval(statuses, 'responseTime')];
       pageLoadData.value = [['Date', 'Page Load Time (ms)'], ...groupDataByInterval(statuses, 'pageLoad')];
       pageSizeData.value = [['Date', 'Page size (kb)'], ...groupDataByInterval(statuses, 'pageSize')];
       statusCodeData.value = [['Date', 'HTTP Status Code'], ...formatStatusCodeData(statuses)];
       responseOptions.value.vAxis.maxValue = calculateMaxValue(responseTimeData.value);
       pageLoadOptions.value.vAxis.maxValue = calculateMaxValue(pageLoadData.value);
   
       if (metrics.length > 0) {
         cpuUsageData.value = [['Date', 'CPU Usage (%)'], ...groupDataByInterval(metrics, 'cpuUsage')];
         memoryUsageData.value = [['Date', 'Memory Usage (%)'], ...groupDataByInterval(metrics, 'memoryUsage')];
         diskUsageData.value = [['Date', 'Disk Usage (%)'], ...groupDataByInterval(metrics, 'diskUsage')];
         hasMetrics.value = true;
         cpuOptions.value.vAxis.maxValue = calculateMaxValue(cpuUsageData.value);
         memoryOptions.value.vAxis.maxValue = calculateMaxValue(memoryUsageData.value);
         diskOptions.value.vAxis.maxValue = calculateMaxValue(diskUsageData.value);
       } else {
         hasMetrics.value = false;
       }
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   }
   
   onMounted(loadData);
</script>
<template>
   <div class="container mt-4">
      <h1 class="text-center title">Metrics for {{ route.params.url }}</h1>
      <div class="mb-4 text-center">
         <button class="btn btn-primary me-2" @click="setFilter('7d')" :class="{ active: selectedFilter === '7d' }">Last week</button>
         <button class="btn btn-primary me-2" @click="setFilter('1m')" :class="{ active: selectedFilter === '1m' }">Last month</button>
         <button class="btn btn-primary" @click="setFilter('all')" :class="{ active: selectedFilter === 'all' }">All</button>
      </div>
      <div class="row justify-content-center">
         <div v-if="responseTimeData.length > 1" class="col-12 col-md-10 mb-4">
            <div class="card shadow-sm">
               <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Response Time
                     <i v-custom-tooltip title="This chart displays the server's response time in milliseconds (ms) over a selected time period, helping to identify performance trends." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
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
                  <!-- Spinner de Bootstrap -->
                  <div class="spinner-border text-primary" role="status">
                     <span class="visually-hidden">Loading...</span>
                  </div>
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
                     colors: ['#4CAF50'],
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
                  <h5 class="mb-0">HTTP Status code
                     <i v-custom-tooltip title="This chart shows the HTTP status codes returned by the server over time, providing insights into server errors and availability." data-bs-placement="right" class="bi bi-info-square-fill"></i>
                  </h5>
               </div>
               <div class="card-body text-center">
                  <!-- Spinner de Bootstrap -->
                  <div class="spinner-border text-primary" role="status">
                     <span class="visually-hidden">Loading...</span>
                  </div>
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
                  <!-- Spinner de Bootstrap -->
                  <div class="spinner-border text-primary" role="status">
                     <span class="visually-hidden">Loading...</span>
                  </div>
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
                  <!-- Spinner de Bootstrap -->
                  <div class="spinner-border text-primary" role="status">
                     <span class="visually-hidden">Loading...</span>
                  </div>
               </div>
            </div>
         </div>
         <template v-if="hasMetrics">
            <div class="col-12 col-md-10 mb-4">
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
            <div class="col-12 col-md-10 mb-4">
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
            <div class="col-12 col-md-10 mb-4">
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
         </template>
      </div>
   </div>
</template>
<style scoped></style>
