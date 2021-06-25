Vue.component('players', {
  data() {
    return {
      playersList: {
        player1: 'francis',
        player2: 'emmanuel',
      },
    }
  },
  template: `<div>Players
    <li v-for="(player, player_key) in playersList" :key="player_key">
    {{ player }}
    </li>
    </div>`,
})

Vue.component('lobby-section', {
  template: `
  <section class="room-section lobby-section" id="section-lobby">
    <div class="wrapper">
      <logo></logo>
      <h3 class="rooms-list__title">Room: {{ roomName }}</h3>

      <ul v-if="players" class="players-list players no-score">
        <li v-for="(player, player_key) in players" :style="{ color: player.color}">{{ player.nickname }}
          <span v-if="player.isAdmin">[Admin]</span>
          <span v-if="player.id == currentPlayer">[You]</span>
        </li>
      </ul>

      <div v-if="isAdmin == true" id="admin-section" style="visibility: visible;">
        <h4>Rounds number</h4>
        <p>
          <input id="rounds-number" type="number" value="3" min="1" max="100">
        </p>
        <h4>Obstacles speed </h4>
        <p>Slow<input id="obstacles-speed" type="range" min="1" max="30" value="10">fast</p>
        <h4>Bonus frequency</h4>
        <p>No bonus<input id="bonus-frequency" type="range" min="1" max="10" value="5">Too many bonus</p>
        <a class="btn" @click="startGame" href="#">play</a>
      </div>
      <a class="btn" href="/">back</a>
    </div>
  </section>`,
  computed: {
    roomName() {
      return this.$store.state.roomName
    },
    players() {
      return this.$store.state.players
    },
    isAdmin() {
      return this.$store.state.isAdmin
    },
    currentPlayer() {
      return this.$store.state.currentPlayer
    },
  },
  methods: {
    startGame() {
      this.$parent.startGame()
    },
  },
})

Vue.component('game-section', {
  props: {
    roomName: String,
    isAdmin: Boolean,
    players: Array,
    currentPlayer: String,
  },
  template: `
  <section class="room-section play-section" id="section-play">
   <div class="play-section__wrapper">
      <aside class="play-section__aside">
      <logo></logo>
         <div class="play-section__infos">
            <h3 class="rooms-list__title">Room: {{ roomName }}</h3>
            <h4 id="round-number"></h4>
            <ul v-if="players" class="players-list players no-score">
              <li v-for="(player, player_key) in players" :style="{ color: player.color}">{{ player.nickname }}
                <span v-if="player.isAdmin">[Admin]</span>
                <span v-if="player.id == currentPlayer">[You]</span>
              </li>
            </ul>
            <h1 id="points-text"></h1>
         </div>
      </aside>
      <div class="play-section__canvas">
         <h1 class="play-section__countdown" id="countdown-text"></h1>
         <canvas id="gameCanvas" width="700" height="700"></canvas>
      </div>
   </div>
</section>`,
  methods: {},
})

Vue.component('rank-section', {
  props: {
    roomName: String,
    isAdmin: Boolean,
    players: Array,
    currentPlayer: String,
  },
  template: `
  <section class="room-section ranking-section" id="section-ranking">
   <div class="wrapper">
      <logo></logo>
      <div class="text-center">
         <h3 class="rooms-list__title">Room: e</h3>
      </div>
      <table class="winner-annoucement" id="winner-announcement"></table>
      <h3>Round results</h3>
      <ul class="players-list" id="round-rank-list"></ul>
      <h3>Global ranking</h3>
      <ul class="players-list" id="rank-list"></ul>
      <button class="btn" @click="back" id="back-button">Back</button>
   </div>
</section>`,
  methods: {
    back() {
      store.commit('setGameStatus', 'waiting')
    },
  },
})

Vue.component('logo', {
  template: `
  <h1 class="sqsq-logo" title="Square Squad">
      <svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740.2 242.3">
        <polygon points="63.3 122.9 63.3 153.6 63.3 161.3 63.3 192 94 192 140.1 192 140.1 199.7 63.3 199.7 63.3 230.4 140.1 230.4 170.8 230.4 170.8 199.7 170.8 192 170.8 161.3 140.1 161.3 94 161.3 94 153.6 170.8 153.6 170.8 122.9 94 122.9 63.3 122.9" style="fill:#de5649"></polygon>
        <path d="M220.5,123.2H189.8V230.8h38.4v11.5h30.7V230.8h38.4V123.2H220.5Zm46.1,76.9h-7.7V188.5H228.2v11.6h-7.7V154h46.1Z" style="fill:#de5649"></path>
        <polygon points="393.1 200.1 347 200.1 347 123.2 316.3 123.2 316.3 200.1 316.3 230.8 347 230.8 393.1 230.8 423.8 230.8 423.8 200.1 423.8 123.2 393.1 123.2 393.1 200.1" style="fill:#de5649"></polygon>
        <path d="M646.2,122.6H569.4V230.1H676.9V111H646.2Zm0,76.8H600.1V153.3h46.1Z" style="fill:#de5649"></path>
        <polygon points="473.6 123.2 442.8 123.2 442.8 154 442.8 230.8 473.6 230.8 473.6 154 519.6 154 519.6 230.8 550.4 230.8 550.4 154 550.4 123.2 519.6 123.2 473.6 123.2" style="fill:#de5649"></polygon>
        <rect x="481.6" y="163.3" width="30" height="30" style="fill:#64a069"></rect>
        <polygon points="0 0 0 30.7 0 38.4 0 69.1 30.7 69.1 76.8 69.1 76.8 76.8 0 76.8 0 107.5 76.8 107.5 107.5 107.5 107.5 76.8 107.5 69.1 107.5 38.4 76.8 38.4 30.7 38.4 30.7 30.7 107.5 30.7 107.5 0 30.7 0 0 0" style="fill:#1e9294"></polygon>
        <path d="M157.2,0H126.5V107.5h38.4v11.6h30.8V107.5h38.4V0H157.2Zm46.1,76.8h-7.6V65.3H164.9V76.8h-7.7V30.7h46.1Z" style="fill:#1e9294"></path>
        <polygon points="329.9 76.8 283.8 76.8 283.8 0 253 0 253 76.8 253 107.5 283.8 107.5 329.9 107.5 360.6 107.5 360.6 76.8 360.6 0 329.9 0 329.9 76.8" style="fill:#1e9294"></polygon>
        <polygon points="410.3 0 379.6 0 379.6 30.7 379.6 107.5 410.3 107.5 410.3 30.7 456.4 30.7 456.4 107.5 487.1 107.5 487.1 30.7 487.1 0 456.4 0 410.3 0" style="fill:#1e9294"></polygon>
        <path d="M536.8,0H506.1V107.5h30.7V69.1h30.7v38.4h30.8V69.1h15.3V0H536.8Zm46.1,38.4H536.8V30.7h46.1Z" style="fill:#1e9294"></path>
        <rect x="418.3" y="38.8" width="30" height="30" style="fill:#edb035"></rect>
        <polygon points="740.2 0 663.3 0 632.6 0 632.6 30.7 632.6 76.8 632.6 107.5 663.3 107.5 740.2 107.5 740.2 76.8 663.3 76.8 663.3 30.7 740.2 30.7 740.2 0" style="fill:#1e9294"></polygon>
        <rect x="671.2" y="38.8" width="30" height="30" style="fill:#edb035"></rect>
      </svg>
  </h1>`,
})