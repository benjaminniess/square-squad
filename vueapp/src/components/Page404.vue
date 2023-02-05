<template>
  <div class="super-wrapper">
    <section class="wrapper">
      <Logo/>

      <h1>There's nothing here</h1>

      <img
        height="360"
        src="https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif"
        width="480"
      />
      <a class="btn" @click="back">back</a>
    </section>
    <Footer/>
  </div>
</template>

<script>
import Logo from './common/Logo.vue'
import Footer from './common/Footer.vue'

export default {
  name: 'Page404',
  components: {
    Logo,
    Footer
  },
  mounted() {
    if (this.$gtag) {
      this.$gtag.pageview(this.$route)
    }
  },
  methods: {
    back() {
      this.$router.push('/')
    }
  }
}
</script>
