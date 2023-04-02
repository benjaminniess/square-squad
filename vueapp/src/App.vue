<template>
  <div id="app">
    <div id="particles-js" class="particles-js"></div>
    <router-view></router-view>
  </div>
</template>

<script>

/**

 */
export default {
  data() {
    return {
      version: this.version,
      homeUrl: this.homeUrl
    }
  },
  created() {
    particlesJS.load(
      'particles-js',
      this.$data.homeUrl + '/assets/js/particles.json'
    )
  },
  name: 'App'
}
</script>

<style lang="scss">
@import '../assets/sass/main.scss';
</style>
