<template>
    <home v-if="isLogin" v-bind:store="store"/>
    <login v-else v-on:login="login" v-on:signup="signup"/>
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
      store
  }),
  components: {
    Home,
    Login
  },
  methods: {
      login: async function (login) {
          await this.store.login(login);
          this.isLogin = store.isLogin();
      },
      signup: async(signup) => {
          console.log(signup);
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
