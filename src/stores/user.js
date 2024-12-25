import { defineStore } from "pinia";

export const useSession = defineStore('session', {
  state: () => ({
    name: localStorage.getItem("name") || '',
    token: localStorage.getItem("token") || '',
    email: localStorage.getItem("email") || '',
    logged: false,
    showWelcomeAlert: false,
    snapshotCooldown: JSON.parse(localStorage.getItem('snapshotCooldown')) || {}
  }),
  actions: {
    setUserData(response) {
      const userData = response;
      this.logged = true;
      this.name = userData.name;
      this.token = userData.token;
      this.screenshotCooldown = {};
      localStorage.setItem('name', userData.name);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('email', userData.email);
      localStorage.removeItem('screenshotCooldown');
    },
    logout() {
      this.logged = false;
      this.name = '';
      this.token = '';
      this.email = '';
      localStorage.removeItem('name');
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    },
    showAlert() {
      this.showWelcomeAlert = true;
    },
    hideAlert() {
      this.showWelcomeAlert = false;
    },
    setCooldown(siteId) {
      const now = Date.now();
      this.snapshotCooldown[siteId] = now + 60000;
      this.saveCooldownState();
    },
    clearCooldown(siteId) {
      delete this.snapshotCooldown[siteId];
      this.saveCooldownState();
    },
    saveCooldownState() {
      localStorage.setItem('snapshotCooldown', JSON.stringify(this.snapshotCooldown));
    },
    loadCooldownState() {
      const now = Date.now();
      for (const siteId in this.snapshotCooldown) {
        if (this.snapshotCooldown[siteId] < now) {
          delete this.snapshotCooldown[siteId];
        }
      }
      this.saveCooldownState();
    }
  },
  getters: {
    isLogged() {
      return this.logged;
    },

    getName() {
      return this.name;
    },

    getToken() {
      return this.token;
    },
    isCooldownActive: (state) => (siteId) => {
      const now = Date.now();
      return state.snapshotCooldown[siteId] && state.snapshotCooldown[siteId] > now;
    },
    getCooldownRemaining: (state) => (siteId) => {
      const now = Date.now();
      return Math.max(0, Math.ceil((state.snapshotCooldown[siteId] - now) / 1000));
    }
  }
});
