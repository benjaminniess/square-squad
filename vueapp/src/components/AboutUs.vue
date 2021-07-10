<template>
  <div class="super-wrapper">
    <section class="wrapper">
      <Logo />

      <h3>About us</h3>
      <h4>Benjamin Niess</h4>
      <p>Backend developer</p>
      <a href="https://twitter.com/benjaminniess" target="_blank"
        >@benjaminniess</a
      >
      <h4>Axel Roche</h4>
      <p>Front end developer</p>
      <a href="https://twitter.com/MoonPopper" target="_blank">@MoonPopper</a>
      <h3>Stack</h3>
      <ul>
        <li>Node JS</li>
        <li>Matter JS engine</li>
        <li>Socket.io</li>
        <li>Vue.js</li>
      </ul>
      <h3>
        Inspired by the amazing
        <a href="http://curvytron.com" target="_blank">Curvytron</a>
      </h3>

      <div class="input-field input-submit text-center">
        <a class="btn" @click="back">back</a>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import Logo from './common/Logo'
import Footer from './common/Footer'

export default {
  name: 'AboutUs',
  components: {
    Logo,
    Footer
  },
  methods: {
    back() {
      this.$router.push('/')
    }
  }
}
</script>
