<script setup>
   import { ref } from 'vue';
   import { login } from '../../api/api';
   import { useSession } from '../../stores/user';
   import { useRouter } from 'vue-router';
   import DarkSection from '../../components/common/DarkSection.vue';
   import sweetalert from '../../composables/sweetalert';
   import '../../assets/auth.css';
   
   const router = useRouter();
   const session = useSession();
   const email = ref('');
   const password = ref('');
   const { errorAlert } = sweetalert();
   
   const userLogin = async () => {
     try {
       const response = await login(email.value, password.value);
       session.setUserData(response);
       session.showAlert();
       router.push({ name: 'Overview' });
     } catch (error) {
         errorAlert(error.response.data.message);
     }
   };
</script>
<template>
   <!-- Dark Section -->
   <DarkSection />
   <!-- Light Section -->
   <div class="split right">
      <div class="login-container">
         <div class="login-form">
            <h3 class="mb-4 text-center">Login to Webalert</h3>
            <form class="centered-content" @submit.prevent="userLogin">
               <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input class="form-control" v-model="email" type="email" id="email" name="email" placeholder="name@example.com" required>
               </div>
               <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input class="form-control" v-model="password" type="password" id="password" name="password" placeholder="password" required>
               </div>
               <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div class="mt-3 text-center">
               <p>
                  <small>
                     Don't have an account?
                     <router-link :to="{ name: 'register' }" class="text-primary"> Register here</router-link>
                  </small>
               </p>
               <p>
                  <small class="text-muted">Forget your password?</small>
                  <small>
                     <router-link :to="{ name: 'restore' }" class="text-primary"> Restore here</router-link>
                  </small>
               </p>
            </div>
         </div>
      </div>
   </div>
</template>
