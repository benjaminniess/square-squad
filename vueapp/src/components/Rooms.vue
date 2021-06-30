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
<<<<<<< HEAD
            :style="{ color: playerData ? playerData.color : null }"
            ><span>{{ playerData ? playerData.name : null }}</span></a
=======
            :style="{ color: playerData.color }"
            ><span>{{ playerData.name }}</span></a
>>>>>>> origin/vue
          >
        </p>
        <p>You first need to select a room or create a new one</p>
      </div>
<<<<<<< HEAD
      <a id="rooms-refresh" href="#" @click="refreshRooms">[Refresh]</a>
      <div class="rooms-list">
        <h3 class="rooms-list__title">Join a room…</h3>
        <div id="rooms-holder">
          <ul v-if="rooms" class="rooms-list__list">
            <li v-for="room in rooms" :key="room.id" class="rooms-list__item">
              <a class="rooms-list__link" :href="'rooms/' + room.slug">{{
                room.name
              }}</a>
            </li>
          </ul>
          <p v-else class="rooms-list__no-rooms">No rooms yet :(</p>
        </div>
      </div>
      <form class="sq-form" method="post" action="#" @submit="checkForm">
=======
      <a id="rooms-refresh" href="#">[Refresh]</a>
      <div class="rooms-list">
        <h3 class="rooms-list__title">Join a room…</h3>
        <div id="rooms-holder">
          <p class="rooms-list__no-rooms">No rooms yet :(</p>
        </div>
      </div>
      <form class="sq-form" method="post" action="/rooms">
>>>>>>> origin/vue
        <div class="input-field">
          <label for="newRoom">Or create a new one?</label
          ><input
            id="newRoom"
            placeholder="Give it a name"
            type="text"
<<<<<<< HEAD
            v-model="newRoomName"
=======
            name="new-room"
>>>>>>> origin/vue
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
<<<<<<< HEAD
  data() {
    return {
      rooms: [],
      newRoomName: null
    }
  },
  created() {
    if (this.$store.state.playerData === null) {
      this.$router.push('/')
    }

    this.$store.state.socket.on('rooms-refresh-result', (result) => {
      if (!result.success) {
        alert(result.error)
        return
      }

      this.rooms = result.data
    })

    this.$store.state.socket.on('rooms-create-result', (result) => {
      if (!result.success) {
        alert(result.error)
        return
      }

      this.$router.push('/rooms/' + result.data.roomSlug)
    })
=======
  mounted() {
    if (this.$store.state.playerData === null) {
      this.$router.push('/')
    }
>>>>>>> origin/vue
  },
  components: {
    Logo,
    Footer
  },
<<<<<<< HEAD
  methods: {
    refreshRooms() {
      this.$store.state.socket.emit('rooms-refresh')
    },
    checkForm(e) {
      e.preventDefault()
      this.$store.state.socket.emit('rooms-create', this.newRoomName)
    }
  },
=======
  methods: {},
>>>>>>> origin/vue
  computed: {
    playerData() {
      return this.$store.state.playerData
    }
  }
}
</script>

<style></style>
