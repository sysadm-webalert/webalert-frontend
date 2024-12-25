<script setup>
   import { ref } from 'vue';
   import { register } from '../../api/api';
   import { useRouter } from 'vue-router';
   import DarkSection from '../../components/common/DarkSection.vue';
   import sweetalert from '../../composables/sweetalert';
   import '../../assets/auth.css';
   
   const router = useRouter();
   
   const step = ref(1);
   const email = ref('');
   const password = ref('');
   const name = ref('');
   const organization = ref('');
   const { successAlert } = sweetalert();
   const { errorAlert } = sweetalert();
   
   const nextStep = () => {
     if (!email.value || !password.value) {
       errorAlert('Please fill in all fields in Step 1!');
       return;
     }
     step.value = 2;
   };
   
   const submitRegistration = async () => {
     if (!organization.value) {
       errorAlert('Please provide your organization!');
       return;
     }
   
     const registrationData = {
       email: email.value,
       password: password.value,
       name: name.value,
       organization: organization.value
     };
   
     try {
       await register(registrationData);
       successAlert('Registration complete! Please activate your account.');
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
               <!-- Phase 1 -->
               <transition name="fade" mode="out-in">
                  <div v-if="step === 1" key="step1" class="step">
                     <form class="centered-content" @submit.prevent="nextStep">
                        <div class="mb-3">
                           <label for="email" class="form-label">Email address</label>
                           <input
                              class="form-control"
                              v-model="email"
                              type="email"
                              id="email"
                              name="email"
                              placeholder="name@example.com"
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
                        <button type="submit" class="btn btn-primary w-100">Next</button>
                     </form>
                  </div>
               </transition>
               <!-- Phase 2 -->
               <transition name="fade" mode="out-in">
                  <div v-if="step === 2" key="step2" class="step">
                     <form class="centered-content" @submit.prevent="submitRegistration">
                        <div class="mb-3">
                           <label for="organization" class="form-label">Name</label>
                           <input
                              class="form-control"
                              v-model="name"
                              type="text"
                              id="name"
                              name="name"
                              placeholder="Your name"
                              required
                              />
                        </div>
                        <div class="mb-3">
                           <label for="organization" class="form-label">Organization</label>
                           <input
                              class="form-control"
                              v-model="organization"
                              type="text"
                              id="organization"
                              name="organization"
                              placeholder="Your organization name"
                              required
                              />
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Submit</button>
                        <button
                           type="button"
                           class="btn btn-secondary w-100 mt-2"
                           @click="step = 1"
                           >
                        Back
                        </button>
                     </form>
                  </div>
               </transition>
            </div>
            <br>
            <div class="mt-3 text-center">
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
</template>
<style scoped>
   .text-primary {
   display: inline-block;
   color: #007bff;
   text-decoration: none;
   margin-top: 1rem;
   }
   .text-primary:hover {
   text-decoration: underline;
   }
</style>
