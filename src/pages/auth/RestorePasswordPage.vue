<script setup>
   import { ref } from 'vue';
   import { requestPassword, restartPassword } from '../../api/api';
   import { useRouter, useRoute } from 'vue-router';
   import DarkSection from '../../components/common/DarkSection.vue';
   import sweetalert from '../../composables/sweetalert';
   import '../../assets/auth.css';
   
   const route = useRoute();
   const router = useRouter();
   const email = ref('');
   const token = route.query.token;
   const password = ref('');
   const hasToken = ref(!!token);
   const { successAlert } = sweetalert();
   const { errorAlert } = sweetalert();
   
   const handlerequestPasword = async () => {
     try {
       const response = await requestPassword(email.value);
       successAlert(response.message);
     } catch (error) {
       errorAlert(error.response.data.error);
     }
   };
   const handleresetPasword = async () => {
       const resetData = {
       password: password.value,
       token: token,
     };
     try {
       const response = await restartPassword(resetData); 
       successAlert(response.message);
       router.push({ name: 'login' });
     } catch (error) {
       errorAlert(error.response.data.message);
     }
   };
</script>
<template>
   <div v-if="hasToken">
      <DarkSection />
      <!-- Light Section -->
      <div class="split right">
         <div class="login-container">
            <div class="login-form">
               <h3 class="mb-4 text-center">Restore password</h3>
               <form class="centered-content" @submit.prevent="handleresetPasword">
                  <div class="mb-3">
                     <label for="password" class="form-label">New password</label>
                     <input class="form-control" v-model="password" type="password" id="password" name="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Restore</button>
               </form>
               <div class="mt-3 text-center">
                  <p>
                     <small>
                        Don't have an account?
                        <router-link :to="{ name: 'register' }" class="text-primary"> Register here</router-link>
                     </small>
                  </p>
                  <p>
                     <small>
                        Already have an account?
                        <router-link :to="{ name: 'login' }" class="text-primary"> Login here</router-link>
                     </small>
                  </p>
               </div>
            </div>
         </div>
      </div>
   </div>
   <div v-else>
      <DarkSection />
      <!-- Light Section -->
      <div class="split right">
         <div class="login-container">
            <div class="login-form">
               <h3 class="mb-4 text-center">Restore password</h3>
               <form class="centered-content" @submit.prevent="handlerequestPasword">
                  <div class="mb-3">
                     <label for="email" class="form-label">Email address</label>
                     <input class="form-control" v-model="email" type="email" id="email" name="email" placeholder="name@example.com" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Restore</button>
               </form>
               <div class="mt-3 text-center">
                  <p>
                     <small>
                        Don't have an account?
                        <router-link :to="{ name: 'register' }" class="text-primary"> Register here</router-link>
                     </small>
                  </p>
                  <p>
                     <small>
                        Already have an account?
                        <router-link :to="{ name: 'login' }" class="text-primary"> Login here</router-link>
                     </small>
                  </p>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>
<style scoped></style>
