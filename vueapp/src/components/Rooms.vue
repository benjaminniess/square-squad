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
              <button
                class="rooms-list__link"
                @click="goToRoom(room.slug)"
              >{{ room.name }}
              </button
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
import {usePlayerStore} from "../stores/PlayerStore.js";
import {useSocketStore} from "../stores/SocketStore.js";

export default {
  name: 'Rooms',
  data() {
    return {
      rooms: [],
      newRoomName: null
    }
  },
  mounted() {
    const playerStore = usePlayerStore();
    const socketStore = useSocketStore();


    if (this.$gtag) {
      this.$gtag.pageview('/rooms')
    }

    // Not "logged"? Go back to home
    if (playerStore.isEmpty()) {

      this.$router.push('/')
    }

    // SOCKET CALLBACK: Update the rooms var after socket result
    socketStore.socket.on('rooms-refresh-result', (result) => {
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
    socketStore.socket.on('rooms-create-result', (result) => {
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
    const socketStore = useSocketStore();

    socketStore.socket.off('rooms-refresh-result')
    socketStore.socket.off('rooms-create-result')
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
      const socketStore = useSocketStore();

      socketStore.socket.emit('rooms-refresh')
    },
    checkForm() {
      const socketStore = useSocketStore();

      socketStore.socket.emit('rooms-create', this.newRoomName)
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
      const playerStore = usePlayerStore();

      return playerStore.playerData
    }
  }
}
</script>

<style></style>
