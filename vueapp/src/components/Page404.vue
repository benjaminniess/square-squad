<template>
  <div class="super-wrapper">
    <section class="wrapper">
      <Logo/>

      <h1 v-if="errorCode">{{ this.getMessageFromKey(errorCode) }}</h1>
      <h1 v-else="errorCode">There's nothing here</h1>

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
  data() {
    return {
      errorCode: null
    }
  },
  mounted() {
    if (this.$gtag) {
      this.$gtag.pageview(this.$route)
    }

    if (this.$route.query.code) {
      this.errorCode = this.$route.query.code
    }
  },
  methods: {
    back() {
      this.$router.push('/')
    },
    getMessageFromKey(messageKey) {
      switch (messageKey) {
        case 'room-does-not-exist':
          return "This room does not exist anymore"
        case 'player-not-logged':
          return "You are not logged anymore, please try again"
        default:
          return "Something wrong happened, please try again later"
      }
    }
  }
}
</script>
