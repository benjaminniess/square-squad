<template>
  <div class="super-wrapper">
    <div class="particles-js" id="particles-js">
      <canvas
        class="particles-js-canvas-el"
        width="1905"
        height="525"
        style="width: 100%; height: 100%;"
      ></canvas>
    </div>
    <section class="wrapper">
      <Logo />

      <h3>Rooms list</h3>
      <div class="page-rooms__intro">
        <p class="text-center">
          <a
            class="user-name"
            href="/"
            id="playerNameLabel"
            :style="{ color: playerData ? playerData.color : null }"
            ><span>{{ playerData ? playerData.name : null }}</span></a
          >
        </p>
        <p>You first need to select a room or create a new one</p>
      </div>
      <a id="rooms-refresh" href="#">[Refresh]</a>
      <div class="rooms-list">
        <h3 class="rooms-list__title">Join a room…</h3>
        <div id="rooms-holder">
          <p class="rooms-list__no-rooms">No rooms yet :(</p>
        </div>
      </div>
      <form class="sq-form" method="post" action="/rooms">
        <div class="input-field">
          <label for="newRoom">Or create a new one?</label
          ><input
            id="newRoom"
            placeholder="Give it a name"
            type="text"
            name="new-room"
          />
        </div>
        <div class="input-field input-submit text-center">
          <button class="btn" type="submit">Create room</button>
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
  name: 'Rooms',
  created() {
    if (this.$store.state.playerData === null) {
      this.$router.push('/')
    }
  },
  components: {
    Logo,
    Footer
  },
  methods: {},
  computed: {
    playerData() {
      return this.$store.state.playerData
    }
  }
}
</script>

<style></style>
