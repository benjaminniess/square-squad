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
              {{ player.nickName }}
              <!--<span v-if="player.isAdmin">[Admin]</span>-->
              <span v-if="player.id == currentPlayer">[You]</span>
              <span v-if="player.alive !== true">[Dead]</span>
              <span>[{{ player.score }}]</span>
            </li>
          </ul>
          <h1 v-if="pointsText">
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
        <canvas
          id="gameCanvas"
          :width="canvasWidth"
          :height="canvasWidth"
        ></canvas>

        <div class="play-section__joystick">
          <Joystick @change="handleChange($event)" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Logo from './common/Logo'
import Joystick from './common/Joystick'

export default {
  name: 'GameSection',
  mounted() {
    let socket = this.$store.state.socket
    window.addEventListener('keydown', this.keyDownHandler)
    window.addEventListener('keyup', this.keyUpHandler)

    const particlesElement = document.getElementById('particles-js')
    if (particlesElement) {
      particlesElement.style.opacity = 0
    }

    this.$store.state.socket.on('start-game-result', (data) => {
      if (data.success) {
        this.pointsText = null
      }
    })

    let canvas = document.getElementById('gameCanvas')
    let ctx = canvas ? canvas.getContext('2d') : null

    let bonusImage = new Image()
    bonusImage.src = this.$globalEnv.homeUrl + '/static/assets/images/bonus.png'

    let currentTime = Date.now()
    let blinkOn = true
    let squareSize = 30
    this.$store.state.socket.on('refresh-canvas', (data) => {
      let canvasWidth = window.innerWidth > 700 ? 700 : window.innerWidth
      this.canvasWidth = canvasWidth

      function rationalize(num) {
        return (num * canvasWidth) / 700
      }
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

      if (data.bonusList) {
        data.bonusList.map((bonus) => {
          ctx.beginPath()
          ctx.drawImage(
            bonusImage,
            bonus.imgX,
            bonus.imgY,
            100,
            100,
            rationalize(bonus.x),
            rationalize(bonus.y),
            rationalize(bonus.width),
            rationalize(bonus.height)
          )
          ctx.fillStyle = '#00DD00'
          ctx.fill()
          ctx.closePath()
        })
      }

      if (data.debugBodies.length > 0) {
        data.debugBodies.map((vertice, i) => {
          ctx.beginPath()
          ctx.rect(
            rationalize(vertice.x - 5),
            rationalize(vertice.y - 5),
            rationalize(10),
            rationalize(10)
          )
          ctx.fillStyle = '#DDDD00'
          ctx.fill()
          ctx.closePath()
        })
      }

      if (data.obstacles) {
        data.obstacles.map((obstacle) => {
          ctx.beginPath()
          ctx.fillStyle = '#DD0000'
          obstacle.map((vertice, i) => {
            if (i === 0) {
              ctx.moveTo(rationalize(vertice.x), rationalize(vertice.y))
            } else {
              ctx.lineTo(rationalize(vertice.x), rationalize(vertice.y))
            }
          })

          ctx.fill()
          ctx.closePath()
        })
      }

      for (const [key, player] of Object.entries(data.players)) {
        if (player.alive) {
          ctx.beginPath()
          ctx.rect(
            rationalize(player.x - squareSize / 2),
            rationalize(player.y - squareSize / 2),
            rationalize(squareSize),
            rationalize(squareSize)
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
              rationalize(player.x + squareSize / 2),
              rationalize(player.y + squareSize / 2),
              rationalize((player.bonus.width * 2) / 3),
              rationalize((player.bonus.height * 2) / 3)
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
            ctx.fillText(
              'You are DEAD!',
              rationalize(canvas.width / 2),
              rationalize(canvas.width / 2)
            )
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

    document.getElementById('particles-js').style.opacity = 1

    this.$store.state.socket.off('start-game-result')
  },
  computed: {
    currentPlayer() {
      return this.$store.state.socket.id
    }
  },
  data() {
    return {
      canvasWidth: window.innerWidth > 700 ? 700 : window.innerWidth,
      pointsText: null
    }
  },
  props: {
    players: [],
    room: {},
    gameData: {}
  },
  components: {
    Logo,
    Joystick
  },
  methods: {
    keyDownHandler(e) {
      this.pressKey(e.keyCode)
    },
    keyUpHandler(e) {
      this.releaseKey(e.keyCode)
    },
    handleChange(event) {
      let limit = 20
      if (event.x < -limit) {
        this.pressKey(37)
      } else if (event.x > limit) {
        this.pressKey(39)
      } else {
        this.releaseKey(39)
        this.releaseKey(37)
      }

      if (event.y < -limit) {
        this.pressKey(38)
      } else if (event.y > limit) {
        this.pressKey(40)
      } else {
        this.releaseKey(38)
        this.releaseKey(40)
      }
    },
    pressKey(keyNumber) {
      this.$store.state.socket.emit('keyPressed', { key: keyNumber })
    },
    releaseKey(keyNumber) {
      this.$store.state.socket.emit('keyUp', { key: keyNumber })
    }
  }
}
</script>
