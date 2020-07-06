<template>
    <home v-if="isLogin" v-bind:store="store"/>
    <login v-else v-on:login="login" 
        v-on:signup="signup" 
        v-bind:isUsernameAvailable="isUsernameAvailable"
        v-on:validateUsername="validateUsername"/>
</template>

<script>
import Home from './components/Home.vue'
import Login from './components/Login.vue';
import { Store } from './store';
const host = window.location.hostname;
var store = new Store(host);
store.connect(true);
export default {
  name: 'App',
  data: () => ({
      isLogin: store.isLogin(),
      store,
      isUsernameAvailable: false
  }),
  components: {
    Home,
    Login
  },
  methods: {
      login: async function (login) {
          await this.store.login(login);
          this.isLogin = this.store.isLogin();
      },
      signup: async function(signup) {
          console.log('isUsernameAvailable', this.isUsernameAvailable);
          if(!this.isUsernameAvailable) return;
          await this.store.signup(signup);
          this.isLogin = this.store.isLogin();
      },
      validateUsername: async function(username) {
          if(username.length< 4) {
              this.isUsernameAvailable = false;
              return;
          }
          this.isUsernameAvailable = await this.store.validateUsername(username)
          console.log(this.isUsernameAvailable);
      }
  }
}
</script>

<style>
    #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    }
</style>
