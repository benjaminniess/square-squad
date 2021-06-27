<template>
  <div class="super-wrapper">
    <div class="particles-js" id="particles-js"></div>
    <section class="wrapper">
      <Logo />

      <h3>Rooms list</h3>
    </section>
    <Footer />
  </div>
</template>

<script>
import Logo from './common/Logo'
import Footer from './common/Footer'
export default {
  name: 'Rooms',
  components: {
    Logo,
    Footer
  },
  methods: {}
}
</script>

<style></style>
