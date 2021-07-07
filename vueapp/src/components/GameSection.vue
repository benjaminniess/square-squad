<template>
  <section class="room-section play-section" id="section-play">
    <div class="play-section__wrapper">
      <aside class="play-section__aside">
        <Logo />
        <div class="play-section__infos">
          <h3 class="rooms-list__title">Room: {{ room.roomName }}</h3>
          <h4 id="round-number">
            Round {{ gameData.currentRound }}/{{ gameData.totalRounds }}
          </h4>
          <ul v-if="players" class="players-list players">
            <li
              v-for="(player, player_key) in players"
              :key="player_key"
              :style="{ color: player.color }"
            >
              {{ player.nickname }}
              <!--<span v-if="player.isAdmin">[Admin]</span>-->
              <span v-if="player.id == currentPlayer">[You]</span>
              <span v-if="player.alive !== true">[Dead]</span>
              <span>[{{ player.score }}]</span>
            </li>
          </ul>
          <h1>
            {{ pointsText }}
          </h1>
        </div>
      </aside>
      <div class="play-section__canvas">
        <h1
          v-if="gameData.timeLeft > 0"
          class="play-section__countdown"
          style="opacity: 1;"
          id="countdown-text"
        >
          {{ gameData.timeLeft }}
        </h1>
        <canvas id="gameCanvas" width="700" height="700"></canvas>
        
      </div>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'

export default {
  name: 'GameSection',
  mounted() {
    window.addEventListener('keydown', this.keyDownHandler)
    window.addEventListener('keyup', this.keyUpHandler)

    let canvas = document.getElementById('gameCanvas')
    let ctx = canvas ? canvas.getContext('2d') : null

    let bonusImage = new Image()
    bonusImage.src = this.$store.state.homeUrl + '/assets/images/bonus.png'

    let currentTime = Date.now()
    let blinkOn = true
    let squareSize = 30
    this.$store.state.socket.on('refresh-canvas', (data) => {
      // Blink ON/OFF system for bonus about to end
      var loopTime = Date.now()
      if (loopTime - currentTime > 200) {
        blinkOn = !blinkOn
        currentTime = loopTime
      }

      if (Number.isInteger(data.score)) {
        this.pointsText = data.score
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      data.bonusList.map((bonus) => {
        ctx.beginPath()
        ctx.drawImage(
          bonusImage,
          bonus.imgX,
          bonus.imgY,
          100,
          100,
          bonus.x,
          bonus.y,
          bonus.width,
          bonus.height
        )
        ctx.fillStyle = '#00DD00'
        ctx.fill()
        ctx.closePath()
      })

      if (data.debugBodies.length > 0) {
        data.debugBodies.map((vertice, i) => {
          ctx.beginPath()
          ctx.rect(vertice.x, vertice.y, 10, 10)
          ctx.fillStyle = '#DDDD00'
          ctx.fill()
          ctx.closePath()
        })
      }

      data.obstacles.map((obstacle) => {
        ctx.beginPath()
        ctx.fillStyle = '#DD0000'
        obstacle.map((vertice, i) => {
          if (i === 0) {
            ctx.moveTo(vertice.x, vertice.y)
          } else {
            ctx.lineTo(vertice.x, vertice.y)
          }
        })

        ctx.fill()
        ctx.closePath()
      })

      for (const [key, player] of Object.entries(data.players)) {
        if (player.alive) {
          ctx.beginPath()
          ctx.rect(
            player.x - squareSize / 2,
            player.y - squareSize / 2,
            squareSize,
            squareSize
          )
          ctx.fillStyle = player.color
          ctx.fill()
          ctx.closePath()

          if (player.bonus && (!player.bonusBlinking || blinkOn)) {
            ctx.beginPath()
            ctx.drawImage(
              bonusImage,
              player.bonus.imgX,
              player.bonus.imgY,
              100,
              100,
              player.x + squareSize / 2,
              player.y + squareSize / 2,
              (player.bonus.width * 2) / 3,
              (player.bonus.height * 2) / 3
            )
            ctx.fillStyle = '#00DD00'
            ctx.fill()
            ctx.closePath()
          }
        } else {
          if (key === this.currentPlayer) {
            ctx.font = "30px 'Zen Dots', cursive"
            ctx.textAlign = 'center'
            ctx.fillStyle = '#de564a'
            ctx.fillText('You are DEAD!', canvas.width / 2, canvas.width / 2)
          }
        }
      }
    })
  },
  destroyed() {
    // Not to have double listener next time the component is mounted
    this.$store.state.socket.off('refresh-canvas')

    window.removeEventListener('keyup', this.keyUpHandler)
    window.removeEventListener('keydown', this.keyDownHandler)
  },
  computed: {
    currentPlayer() {
      return this.$store.state.socket.id
    }
  },
  data() {
    return {
      pointsText: 0
    }
  },
  props: {
    players: [],
    room: {},
    gameData: {}
  },
  components: {
    Logo
  },
  methods: {
    keyDownHandler(e) {
      this.$store.state.socket.emit('keyPressed', { key: e.keyCode })
    },
    keyUpHandler(e) {
      this.$store.state.socket.emit('keyUp', { key: e.keyCode })
    }
  }
}
</script>
