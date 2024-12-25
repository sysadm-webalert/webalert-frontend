<script setup>
   import { ref, onMounted } from 'vue';
   import { useSession } from '../stores/user';
   import { getProfile, setProfile } from '../api/api';
   import sweetalert from '../composables/sweetalert';
   
   const session = useSession();
   const { errorAlert } = sweetalert();
   const { successAlert } = sweetalert();
   const profileData = ref({
     timezone: 'UTC - Coordinated Universal Time',
     notification_email: 'No email notification',
   });
   
   const timeZones = ref([
     { label: 'UTC - Coordinated Universal Time', value: 'UTC', offset: '+00:00' },
     { label: 'Europe/London - Greenwich Mean Time', value: 'Europe/London', offset: '+00:00' },
     { label: 'Europe/Madrid - Central European Time', value: 'Europe/Madrid', offset: '+01:00' },
     { label: 'Europe/Bucharest - Eastern European Time', value: 'Europe/Bucharest', offset: '+02:00' },
     { label: 'Europe/Lisbon - Western European Time', value: 'Europe/Lisbon', offset: '+00:00' },
     { label: 'America/Los_Angeles - Pacific Standard Time', value: 'America/Los_Angeles', offset: '-08:00' },
     { label: 'America/Denver - Mountain Standard Time', value: 'America/Denver', offset: '-07:00' },
     { label: 'America/Chicago - Central Standard Time', value: 'America/Chicago', offset: '-06:00' },
     { label: 'America/New_York - Eastern Standard Time', value: 'America/New_York', offset: '-05:00' },
     { label: 'America/Halifax - Atlantic Standard Time', value: 'America/Halifax', offset: '-04:00' },
     { label: 'America/St_Johns - Newfoundland Standard Time', value: 'America/St_Johns', offset: '-03:30' },
     { label: 'America/Anchorage - Alaska Standard Time', value: 'America/Anchorage', offset: '-09:00' },
     { label: 'Pacific/Honolulu - Hawaii-Aleutian Standard Time', value: 'Pacific/Honolulu', offset: '-10:00' },
     { label: 'Australia/Sydney - Australian Eastern Standard Time', value: 'Australia/Sydney', offset: '+10:00' },
     { label: 'Australia/Adelaide - Australian Central Standard Time', value: 'Australia/Adelaide', offset: '+09:30' },
     { label: 'Australia/Perth - Australian Western Standard Time', value: 'Australia/Perth', offset: '+08:00' },
     { label: 'Pacific/Auckland - New Zealand Standard Time', value: 'Pacific/Auckland', offset: '+12:00' },
     { label: 'Asia/Kolkata - Indian Standard Time', value: 'Asia/Kolkata', offset: '+05:30' },
     { label: 'Asia/Karachi - Pakistan Standard Time', value: 'Asia/Karachi', offset: '+05:00' },
     { label: 'Asia/Jakarta - Western Indonesian Time', value: 'Asia/Jakarta', offset: '+07:00' },
     { label: 'Asia/Tokyo - Japan Standard Time', value: 'Asia/Tokyo', offset: '+09:00' },
     { label: 'Asia/Seoul - Korea Standard Time', value: 'Asia/Seoul', offset: '+09:00' },
     { label: 'Asia/Singapore - Singapore Time', value: 'Asia/Singapore', offset: '+08:00' },
     { label: 'Asia/Hong_Kong - Hong Kong Time', value: 'Asia/Hong_Kong', offset: '+08:00' },
     { label: 'Asia/Shanghai - China Standard Time', value: 'Asia/Shanghai', offset: '+08:00' },
     { label: 'Europe/Moscow - Moscow Standard Time', value: 'Europe/Moscow', offset: '+03:00' },
     { label: 'Europe/Samara - Samara Time', value: 'Europe/Samara', offset: '+04:00' },
     { label: 'Asia/Yekaterinburg - Yekaterinburg Time', value: 'Asia/Yekaterinburg', offset: '+05:00' },
     { label: 'Asia/Omsk - Omsk Time', value: 'Asia/Omsk', offset: '+06:00' },
     { label: 'Asia/Krasnoyarsk - Krasnoyarsk Time', value: 'Asia/Krasnoyarsk', offset: '+07:00' },
     { label: 'Asia/Irkutsk - Irkutsk Time', value: 'Asia/Irkutsk', offset: '+08:00' },
     { label: 'Asia/Yakutsk - Yakutsk Time', value: 'Asia/Yakutsk', offset: '+09:00' },
     { label: 'Asia/Vladivostok - Vladivostok Time', value: 'Asia/Vladivostok', offset: '+10:00' },
     { label: 'Asia/Magadan - Magadan Time', value: 'Asia/Magadan', offset: '+11:00' },
     { label: 'Asia/Kamchatka - Kamchatka Time', value: 'Asia/Kamchatka', offset: '+12:00' },
     { label: 'America/Argentina/Buenos_Aires - Argentina Time', value: 'America/Argentina/Buenos_Aires', offset: '-03:00' },
     { label: 'America/Sao_Paulo - Brasília Time', value: 'America/Sao_Paulo', offset: '-03:00' },
     { label: 'America/Santiago - Chile Standard Time', value: 'America/Santiago', offset: '-04:00' },
     { label: 'America/Asuncion - Paraguay Time', value: 'America/Asuncion', offset: '-04:00' },
     { label: 'America/Manaus - Amazon Time', value: 'America/Manaus', offset: '-04:00' },
     { label: 'America/Godthab - Western Greenland Time', value: 'America/Godthab', offset: '-03:00' },
     { label: 'America/Noronha - Fernando de Noronha Time', value: 'America/Noronha', offset: '-02:00' },
     { label: 'Africa/Algiers - Central European Time (Africa)', value: 'Africa/Algiers', offset: '+01:00' },
     { label: 'Africa/Cairo - Eastern European Time (Africa)', value: 'Africa/Cairo', offset: '+02:00' },
     { label: 'Africa/Nairobi - East Africa Time', value: 'Africa/Nairobi', offset: '+03:00' },
     { label: 'Australia/Adelaide - Australian Central Daylight Time', value: 'Australia/Adelaide', offset: '+10:30' },
     { label: 'Australia/Sydney - Australian Eastern Daylight Time', value: 'Australia/Sydney', offset: '+11:00' },
     { label: 'Pacific/Chatham - Chatham Island Daylight Time', value: 'Pacific/Chatham', offset: '+13:45' },
     { label: 'Pacific/Chatham - Chatham Island Standard Time', value: 'Pacific/Chatham', offset: '+12:45' },
     { label: 'Atlantic/Azores - Azores Summer Time', value: 'Atlantic/Azores', offset: '+00:00' },
     { label: 'Atlantic/Azores - Azores Standard Time', value: 'Atlantic/Azores', offset: '-01:00' }
   ]);
   
   const loadProfile = async () => {
     if (!session.isLogged) {
       return; 
     }
     try {
       const profile = await getProfile(session.getToken);
       profileData.value = {
         timezone: profile.timezone || 'UTC - Coordinated Universal Time',
         notification_email: profile.notification_email || 'No email notification',
       };
     } catch (error) {
       console.error('Error fetching profile:', error);
     }
   };
   
   const saveProfile = async () => {
     try {
       const response = await setProfile(session.getToken, profileData.value);
       successAlert(response.message);
     } catch (error) {
       errorAlert(error.message);
     }
   };
   
   onMounted(loadProfile);
   
</script>
<template>
   <div class="container mt-4">
      <div class="row justify-content-center">
         <div class="col-12 col-md-6 col-lg-4">
            <form @submit.prevent="saveProfile">
               <div class="mb-3">
                  <label for="notification_email" class="form-label">Notification email</label>
                  <input type="email" class="form-control" id="notification_email" v-model="profileData.notification_email" aria-describedby="emailHelp"/>
                  <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
               </div>
               <div class="mb-3">
                  <label for="timezone" class="form-label">Application time zone</label>
                  <select class="form-select" id="timezone" v-model="profileData.timezone">
                     <option v-for="zone in timeZones" :key="zone.value" :value="zone.value">
                        {{ zone.label }} (UTC{{ zone.offset }})
                     </option>
                  </select>
               </div>
               <button type="submit" class="btn btn-primary">Save changes</button>
            </form>
         </div>
      </div>
   </div>
</template>
