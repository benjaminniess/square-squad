<template>
  <section id="section-lobby" class="room-section lobby-section">
    <div class="wrapper">
      <Logo/>

      <h2>The game is starting</h2>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo.vue'


export default {
  name: 'ReadyToStart',
  components: {
    Logo,
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
