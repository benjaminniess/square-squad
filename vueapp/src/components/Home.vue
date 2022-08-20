<template>
  <div class="super-wrapper">
    <section class="wrapper">
      <Logo/>

      <form
        v-if="!submitted"
        id="pre-home-form"
        action="/"
        class="sq-form"
        method="post"
        @submit.prevent="checkForm"
      >
        <div class="input-field">
          <label for="playerName">What's your name?</label
          ><input
          id="playerName"
          v-model="playerName"
          name="playerName"
          required
          type="text"
        />
        </div>
        <div class="input-field">
          <label for="playerColor">What's your favourite color?</label
          ><input
          id="playerColor"
          v-model="playerColor"
          name="playerColor"
          placeholder="#742a55"
          required
          type="color"
        />
        </div>
        <div class="input-field input-submit text-center">
          <button class="btn" type="submit">Let's play!</button>
        </div>
      </form>

      <p v-if="submitted">
        Connecting to server...
      </p>
    </section>
    <Footer/>
  </div>
</template>

<script>
import Logo from './common/Logo.vue'
import Footer from './common/Footer.vue'

export default {
  mounted() {
    if (this.$gtag) {
      this.$gtag.pageview('/')
    }

    this.$store.state.socket.on('update-player-data-result', () => {
      // Check if user comes from the room link
      if (this.$route.query.redirect_to) {
        this.$router.push('/rooms/' + this.$route.query.redirect_to)
      } else {
        this.$router.push('/rooms')
      }
    })
  },
  destroyed() {
    // Not to have double listener next time the component is mounted
    this.$store.state.socket.off('update-player-data-result')
  },
  data() {
    return {
      playerName: localStorage.playerName ? localStorage.playerName : null,
      playerColor: localStorage.playerColor
        ? localStorage.playerColor
        : '#' +
        (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
      submitted: false
    }
  },
  name: 'Home',
  components: {
    Logo,
    Footer
  },
  methods: {
    checkForm(e) {
      localStorage.playerName = this.playerName
      localStorage.playerColor = this.playerColor

      let playerData = {
        name: this.playerName,
        color: this.playerColor
      }

      this.$store.state.socket.emit('update-player-data', playerData)
      this.$store.commit('updatePlayerData', playerData)

      if (this.$gtag) {
        this.$gtag.event('loginUpdate')
      }

      this.submitted = true
    }
  }
}
</script>
