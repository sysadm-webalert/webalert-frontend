<script setup>
   import { useRoute, useRouter } from 'vue-router';
   import { ref } from 'vue';
   import { invitation } from '../../api/api';
   import DarkSection from '../../components/common/DarkSection.vue';
   import sweetalert from '../../composables/sweetalert';
   import '../../assets/auth.css';
   
   const route = useRoute();
   const router = useRouter();
   const password = ref('');
   const { successAlert } = sweetalert();
   const { errorAlert } = sweetalert();
   
   const submitRegistration = async () => {
     const registrationData = {
       name: name.value,
       password: password.value,
       token: route.query.token,
     };
   
     try {
       await invitation(registrationData);
       successAlert("Registration complete!, now you can access.");
       router.push({ name: 'login' });
     } catch (error) {
      errorAlert(error.response.data.error);
     }
   };
</script>
<template>
   <DarkSection />
   <!-- Light Section -->
   <div class="split right">
      <div class="login-container">
         <div class="login-form">
            <h3 class="mb-4 text-center">Register to Webalert</h3>
            <div class="steps-container">
               <div>
                  <form class="centered-content" @submit.prevent="submitRegistration">
                     <div class="mb-3">
                        <label for="name" class="form-label">Name</label>
                        <input
                           class="form-control"
                           v-model="name"
                           type="name"
                           id="name"
                           name="name"
                           placeholder="Your name"
                           required
                           />
                     </div>
                     <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input
                           class="form-control"
                           v-model="password"
                           type="password"
                           id="password"
                           name="password"
                           placeholder="password"
                           required
                           />
                     </div>
                     <button type="submit" class="btn btn-primary w-100">Submit</button>
                  </form>
               </div>
            </div>
            <br>
            <div class="mt-3 text-center">
               <p>
                  Already have an account?
                  <router-link :to="{ name: 'login' }" class="text-primary">Login here</router-link>
               </p>
            </div>
         </div>
      </div>
   </div>
</template>
<style scoped>
   .text-primary {
   display: inline-block;
   color: #007bff;
   text-decoration: none;
   margin-top: 1rem;
   }
</style>
