<template>
  <div class="super-wrapper">
    <section class="wrapper">
      <Logo />

      <form
        class="sq-form"
        id="pre-home-form"
        method="post"
        action="/"
        @submit="checkForm"
      >
        <div class="input-field">
          <label for="playerName">What's your name?</label
          ><input
            id="playerName"
            type="text"
            name="playerName"
            required
            v-model="playerName"
          />
        </div>
        <div class="input-field">
          <label for="playerColor">What's your favourite color?</label
          ><input
            id="playerColor"
            type="color"
            name="playerColor"
            required
            value="#742a55"
            v-model="playerColor"
          />
        </div>
        <div class="input-field input-submit text-center">
          <button class="btn" type="submit">Let's play!</button>
        </div>
      </form>
    </section>
    <Footer />
  </div>
</template>

<script>
import Logo from './common/Logo'
import Footer from './common/Footer'

export default {
  mounted() {
    if (this.$gtag) {
      this.$gtag.pageview('/')
    }

    this.$store.state.socket.on('player-data-updated', () => {
      this.$router.push('/rooms')
    })
  },
  destroyed() {
    // Not to have double listener next time the component is mounted
    this.$store.state.socket.off('player-data-updated')
  },
  data() {
    return {
      playerName: localStorage.playerName ? localStorage.playerName : null,
      playerColor: localStorage.playerColor
        ? localStorage.playerColor
        : '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
    }
  },
  name: 'Home',
  components: {
    Logo,
    Footer
  },
  methods: {
    checkForm(e) {
      e.preventDefault()
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
    }
  }
}
</script>
