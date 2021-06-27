<template>
  <div id="app">
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
      this.$store.state.homeUrl + '/assets/js/particles.json'
    )
  },
  name: 'App'
}
</script>

<style>
@import '../static/assets/css/main.css';
</style>
