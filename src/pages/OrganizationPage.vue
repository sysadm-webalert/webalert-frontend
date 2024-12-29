<script setup>
   import { ref, onMounted } from 'vue';
   import { useSession } from '../stores/user';
   import { getMembers, inviteMember, changeMember, removeMember } from '../api/api';
   import sweetalert from '../composables/sweetalert';
   
     const session = useSession();
     const members = ref([]);
     const newMember = ref({ email: '', role: 'ROLE_USER' });
     const roles = ref([
       { label: 'USER', value: 'ROLE_USER' },
       { label: 'MANAGER', value: 'ROLE_MANAGER' },
     ]);
     const currentUserEmail = ref(localStorage.getItem('email'));
     const currentUserRoles = ref([]);
     const { successAlert } = sweetalert();
     const { errorAlert } = sweetalert();
     const { promptAlert } = sweetalert();
   
   const isCurrentUser = (member) => {
     return member.email === currentUserEmail.value;
   };
   
   const loadMembers = async () => {
     if (!session.isLogged) {
       return; 
     }
     try {
       const response = await getMembers(session.getToken);
       members.value = response;
   
       const currentUser = response.find(
         (member) => member.email === currentUserEmail.value
       );
       if (currentUser) {
         currentUserRoles.value = currentUser.roles;
       }
     } catch (error) {
       errorAlert(error.response.data.error);
     }
   };
   
   const hasRoleManager = () => {
     return currentUserRoles.value.includes('ROLE_MANAGER');
   };
   
   const sendInvitation = async () => {
     if (!newMember.value.email) {
       errorAlert("Email is required.");
       return;
     }
     try {
       const response = await inviteMember(newMember.value, session.getToken);
       successAlert(response.message);
       newMember.value = { email: '', role: 'member' };
       loadMembers();
     } catch (error) {
       errorAlert(error.response.data.error);
     }
   };
   
   const updateMember = async (member, actionType) => {
     try {
       let data = { id: member.id };
   
       if (actionType === 'status') {
         data.action = member.isActive ? 'disable' : 'enable';
       } else if (actionType === 'role') {
         const { value: newRole } = await promptAlert(
           'Change Role',
           roles.value.reduce((options, role) => {
             options[role.value] = role.label;
             return options;
           }, {}),
           member.roles[0]
         );
   
         if (!newRole) {
           return;
         }
   
         data.role = newRole;
       }
   
       await changeMember(data, session.getToken);
       successAlert(`Member ${actionType === 'status' ? 'status updated' : 'role updated'} successfully.`);
       loadMembers();
     } catch (error) {
       errorAlert(`Failed to ${actionType === 'status' ? 'update status' : 'update role'}.`);
     }
   };
   
   
   const handleRemoveMember = async (id) => {
     try {
       await removeMember(id, session.getToken);
       successAlert("Member removed successfully.");
       loadMembers();
     } catch (error) {
       errorAlert(error.response.data.error);
     }
   };
   
   onMounted(loadMembers);
</script>
<template>
   <div class="container mt-4">
      <h2 class="mb-4">Organization Members</h2>
      <div class="row">
         <template v-if="members.length === 0">
            <div class="col-12 text-center">
               <p>No members found</p>
            </div>
         </template>
         <template v-else>
            <div
               v-for="member in members"
               :key="member.id"
               class="col-md-6 col-lg-4 mb-4"
               >
               <div class="card panel shadow-sm">
                  <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
                     <h6 class="mb-0">
                        Status:
                        <span class="badge ms-2" :class="member.isActive ? 'bg-success' : 'bg-danger'"> {{ member.isActive ? 'Active' : 'Disabled' }}</span>
                     </h6>
                  </div>
                  <div class="card-body">
                     <h5 class="card-title text-center">{{ member.name }}</h5>
                     <p class="text-center">{{ member.email }}</p>
                     <p class="text-center text-muted">
                        Notification Email: {{ member.notification_email || 'N/A' }}
                     </p>
                     <p class="text-center text-muted">
                        Timezone: {{ member.timezone || 'UTC' }}
                     </p>
                  </div>
                  <!-- Footer -->
                  <div
                     class="card-footer bg-transparent d-flex justify-content-between align-items-center"
                     v-if="hasRoleManager() && !isCurrentUser(member)">
                     <button type="button" class="btn btn-outline-primary btn-sm" @click="updateMember(member, 'status')">{{ member.isActive ? 'Disable' : 'Enable' }}</button>
                     <button type="button" class="btn btn-outline-primary btn-sm" @click="updateMember(member, 'role')">Change Role</button>
                     <button type="button" class="btn btn-danger btn-sm" @click="handleRemoveMember(member.id)">Remove</button>
                  </div>
                  <div class="card-footer bg-transparent text-center" v-else-if="isCurrentUser(member)">
                     <span class="text-muted">You</span>
                  </div>
               </div>
            </div>
         </template>
      </div>
      <div v-if="hasRoleManager()">
         <h4>Invite New Member</h4>
         <form @submit.prevent="sendInvitation">
            <div class="mb-3">
               <label for="email" class="form-label">Email</label>
               <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="newMember.email"
                  placeholder="Enter member's email"
                  />
            </div>
            <div class="mb-3">
               <label for="role" class="form-label">Role</label>
               <select class="form-select" id="role" v-model="newMember.role">
                  <option v-for="role in roles" :key="role.value" :value="role.value">
                     {{ role.label }}
                  </option>
               </select>
            </div>
            <button type="submit" class="btn btn-primary">Send Invitation</button>
         </form>
      </div>
   </div>
</template>
