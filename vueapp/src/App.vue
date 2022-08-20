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
  created() {
    particlesJS.load(
      'particles-js',
      '../../assets/js/particles.json',
    );
  },
  name: 'App',
};
</script>
