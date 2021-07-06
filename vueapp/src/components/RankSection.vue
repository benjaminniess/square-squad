<template>
  <section class="room-section ranking-section" id="section-ranking">
    <div class="wrapper">
      <Logo />
      <div class="text-center">
        <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>
      </div>
      <table class="winner-annoucement" id="winner-announcement">
        <tbody>
          <tr>
            <td>Winner</td>
            <td>
              <span class="user-name" style="color: #008ea8;"
                ><span>B</span></span
              >
            </td>
          </tr>
          <tr>
            <td>Point(s)</td>
            <td><p>0 pts</p></td>
          </tr>
        </tbody>
      </table>
      <h3>Round results</h3>
      <ul class="players-list" id="round-rank-list">
        <li style="color: #008ea8;">B (0 points)</li>
      </ul>
      <h3>Global ranking</h3>
      <ul class="players-list" id="rank-list">
        <li style="color: #008ea8;">B (0 points)</li>
      </ul>
      <button class="btn" id="back-button" style="display: none;">Back</button>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'
import Footer from './common/Footer'
export default {
  name: 'RankSection',
  computed: {},
  methods: {},
  props: {
    room: {}
  },
  components: {
    Logo,
    Footer
  }
}
</script>
