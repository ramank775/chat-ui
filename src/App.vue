<template>
    <home v-if="isLogin" />
    <login v-else/>
</template>

<script>
import Home from './components/Home.vue'
import Login from './components/Login.vue';
export default {
  name: 'App',
  data: () => ({
      isLogin: false
  }),
  components: {
    Home,
    Login
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
