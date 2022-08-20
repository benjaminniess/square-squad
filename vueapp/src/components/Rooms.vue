<template>
  <div class="super-wrapper">
    <div id="particles-js" class="particles-js">
      <canvas
        class="particles-js-canvas-el"
        height="525"
        style="width: 100%; height: 100%;"
        width="1905"
      ></canvas>
    </div>
    <section class="wrapper">
      <Logo/>

      <h3>Rooms list</h3>
      <div class="page-rooms__intro">
        <p class="text-center">
          <a
            id="playerNameLabel"
            :style="{ color: playerData ? playerData.color : null }"
            class="user-name"
            href="#"
            @click="goToHome"
          ><span>{{ playerData ? playerData.name : null }}</span></a
          >
        </p>
        <p>You first need to select a room or create a new one</p>
      </div>
      <a id="rooms-refresh" href="#" @click.prevent="refreshRoomsEventHandler"
      >[Refresh]</a
      >
      <div class="rooms-list">
        <h3 class="rooms-list__title">Join a room…</h3>
        <div id="rooms-holder">
          <ul v-if="rooms.length > 0" class="rooms-list__list">
            <li v-for="room in rooms" :key="room.id" class="rooms-list__item">
              <a
                class="rooms-list__link"
                href="#"
                @click="goToRoom(room.slug)"
              >{{ room.name }}</a
              >
            </li>
          </ul>
          <p v-else class="rooms-list__no-rooms">No rooms yet :(</p>
        </div>
      </div>
      <form
        action="#"
        class="sq-form"
        method="post"
        @submit.prevent="checkForm"
      >
        <div class="input-field">
          <label for="newRoom">Or create a new one?</label
          ><input
          id="newRoom"
          v-model="newRoomName"
          placeholder="Give it a name"
          required
          type="text"
        />
        </div>
        <div class="input-field input-submit text-center">
          <button class="btn" type="submit">Create room</button>
        </div>
      </form>
    </section>
    <Footer/>
  </div>
</template>

<script>
import Logo from './common/Logo.vue'
import Footer from './common/Footer.vue'

export default {
  name: 'Rooms',
  data() {
    return {
      rooms: [],
      newRoomName: null
    }
  },
  mounted() {
    if (this.$gtag) {
      this.$gtag.pageview('/rooms')
    }

    // Not "logged"? Go back to home
    if (this.$store.state.playerData === null) {
      this.$router.push('/')
    }

    // SOCKET CALLBACK: Update the rooms var after socket result
    this.$store.state.socket.on('rooms-refresh-result', (result) => {
      if (!result.success) {
        this.goToHome()
        return
      }

      if (result.data.length === 0) {
        this.rooms = []
      } else {
        this.rooms = result.data
      }
    })

    // SOCKET CALLBACK: The room creation result
    this.$store.state.socket.on('create-room-result', (result) => {
      if (!result.success) {
        this.goToHome()
        return
      }

      if (this.$gtag) {
        this.$gtag.event('roomCreated')
      }

      // Redirect to the new room
      this.goToRoom(result.data.roomSlug)
    })

    // First refresh everytime the rooms view is mounted
    this.refreshRooms()
  },
  destroyed() {
    this.$store.state.socket.off('rooms-refresh-result')
    this.$store.state.socket.off('create-room-result')
  },
  components: {
    Logo,
    Footer
  },
  methods: {
    // The refresh rooms "on click" behaviour
    refreshRoomsEventHandler() {
      if (this.$gtag) {
        this.$gtag.event('roomsRefresh')
      }

      this.refreshRooms()
    },
    refreshRooms() {
      this.$store.state.socket.emit('rooms-refresh')
    },
    checkForm() {
      this.$store.state.socket.emit('create-room', this.newRoomName)
    },
    goToRoom(slug) {
      this.$router.push('/rooms/' + slug)
    },
    goToHome() {
      this.$router.push('/')
    }
  },
  computed: {
    playerData() {
      return this.$store.state.playerData
    }
  }
}
</script>

<style></style>
