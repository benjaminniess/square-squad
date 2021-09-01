<template>
  <div id="app">
    <div class="particles-js" id="particles-js"></div>
    <router-view></router-view>
  </div>
</template>

<script>
/**

*/
export default {
  created() {
    particlesJS.load(
      'particles-js',
      this.$globalEnv.homeUrl + '/static/assets/js/particles.json',
    );
  },
  name: 'App',
};
</script>

<style>
@import '../static/assets/css/main.css';
</style>
