const socket = io()
const playersLists = document.getElementsByClassName('players')
const startButton = document.getElementById('startButton')
const adminSection = document.getElementById('admin-section')
const roomSlug = document.body.getAttribute('data-roomSlug')
const countdownText = document.getElementById('countdown-text')
const pointsText = document.getElementById('points-text')
const roundNumber = document.getElementById('round-number')

const lobbySection = document.getElementById('section-lobby')
const playSection = document.getElementById('section-play')
const rankSection = document.getElementById('section-ranking')
const particles = document.getElementById('particles-js')

const winnerAnnouncement = document.getElementById('winner-announcement')
const rankList = document.getElementById('rank-list')
const roundRankList = document.getElementById('round-rank-list')
const backButton = document.getElementById('back-button')

const canvas = document.getElementById('gameCanvas')
const ctx = canvas ? canvas.getContext('2d') : null
let gameData = {}

// Prepare the variable that'll recieve connection data
let sessionData

let playersData = {}

if (typeof Vue !== 'undefined') {
  window.vueApp = new Vue({
    el: '#app',
    data() {
      return {
        name: null,
        isAdmin: null,
        currentPlayer: null,
        players: null,
        status: null,
      }
    },
    template: `
    <div id="vue-app">
      <lobby-section :roomName="name" :isAdmin="isAdmin" :players="players" :currentPlayer="currentPlayer" :status="status"></lobby-section>
    </div>`,
    methods: {
      playGame() {
        this.status = 'playing'
      },

      refreshPlayers(players) {
        this.players = players
        players.map((player) => {
          if (player.isAdmin && player.id === this.currentPlayer) {
            this.isAdmin = true
          }
        })
      },
    },
  })
}

function getVueApp() {
  return window.vueApp
}

// When recieving players in current room
socket.on('refreshPlayers', (data) => {
  getVueApp().refreshPlayers(data)
  /**
  // Check if the current page has a players list container
  if (playersLists) {
    Array.prototype.slice.call(playersLists).map((playersList) => {
      playersList.innerHTML = ''
      data.map((player) => {
        playersData[player.id] = player
        var li = document.createElement('li')
        li.appendChild(document.createTextNode(player.nickname))
        li.style.color = player.color

        // Flag the current user
        if (player.id === sessionData.playerID) {
          li.appendChild(document.createTextNode('(You)'))

          if (player.isAdmin) {
            adminSection.style.visibility = 'visible'
          }
        }

        if (player.isAdmin) {
          li.appendChild(document.createTextNode('[admin]'))
        }

        if (!player.alive && !playersList.classList.contains('no-score')) {
          li.appendChild(document.createTextNode('[DEAD]'))
        }

        if (!playersList.classList.contains('no-score')) {
          li.appendChild(document.createTextNode('[' + player.score + ']'))
        }

        playersList.appendChild(li)
      })
    })
    
  }
  */
})

// Once the connection is set, save data in the sessionData variable and ask for joining the room
socket.on('player-connected', (data) => {
  sessionData = data

  if (roomSlug) {
    socket.emit('room-join', { roomSlug: roomSlug })
  }
})

socket.on('room-joined', (data) => {
  window.vueApp.name = data.roomName
  window.vueApp.isAdmin = data.isAdmin
  window.vueApp.players = data.players
  window.vueApp.status = data.gameStatus
  window.vueApp.currentPlayer = data.currentPlayer
})

socket.on('game-is-starting', (data) => {
  pointsText.innerHTML = null
  roundNumber.innerHTML = 'Round ' + data.currentRound + '/' + data.totalRounds
  show('play')
})

if (startButton) {
  startButton.onclick = function () {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'Start Game')
    }

    socket.emit('start-game', {
      roomSlug: roomSlug,
      roundsNumber: document.getElementById('rounds-number').value,
      obstaclesSpeed: document.getElementById('obstacles-speed').value,
      bonusFrequency: document.getElementById('bonus-frequency').value,
    })
    return false
  }
}

if (backButton) {
  backButton.onclick = function () {
    show('lobby')
    return false
  }
}

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('keyup', keyUpHandler, false)

if (canvas) {
  canvas.addEventListener(
    'touchstart',
    function (e) {
      mousePos = getTouchPos(canvas, e)
      if (mousePos.x < canvas.width / 3) {
        socket.emit('keyPressed', { key: 37 })
      }
      if (mousePos.x > (2 * canvas.width) / 3) {
        socket.emit('keyPressed', { key: 39 })
      }
      if (mousePos.y < canvas.width / 3) {
        socket.emit('keyPressed', { key: 38 })
      }
      if (mousePos.y > (2 * canvas.width) / 3) {
        socket.emit('keyPressed', { key: 40 })
      }
    },
    false,
  )

  canvas.addEventListener(
    'touchend',
    function (e) {
      socket.emit('keyUp')
    },
    false,
  )
  canvas.addEventListener('touchmove', function (e) {}, false)
}

function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect()
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top,
  }
}

function show(sectionID) {
  if (sectionID === 'lobby') {
    lobbySection.classList.remove('is-hidden')
    playSection.classList.add('is-hidden')
    rankSection.classList.add('is-hidden')
    particles.style.display = 'block'
  } else if (sectionID === 'play') {
    lobbySection.classList.add('is-hidden')
    playSection.classList.remove('is-hidden')
    rankSection.classList.add('is-hidden')
    particles.style.display = 'none'
  } else if (sectionID === 'ranking') {
    lobbySection.classList.add('is-hidden')
    playSection.classList.add('is-hidden')
    rankSection.classList.remove('is-hidden')
    particles.style.display = 'block'
  }

  if (typeof gtag !== 'undefined') {
    gtag('event', 'Status update', { event_label: sectionID })
  }
}

function keyDownHandler(e) {
  socket.emit('keyPressed', { key: e.keyCode })
}
function keyUpHandler(e) {
  socket.emit('keyUp', { key: e.keyCode })
}

var refreshLink = document.getElementById('rooms-refresh')
socket.emit('rooms-refresh')
if (refreshLink) {
  refreshLink.onclick = (e) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'Refresh rooms')
    }
    socket.emit('rooms-refresh')
  }
}

const roomsHolder = document.getElementById('rooms-holder')
socket.on('rooms-refresh-result', (rooms) => {
  if (!roomsHolder) {
    return
  }

  if (rooms.length < 1) {
    roomsHolder.innerHTML =
      '<p class="rooms-list__no-rooms">No rooms yet :( </p>'
    return
  }

  let innerHTML = '<ul class="rooms-list__list">'

  rooms.map((room) => {
    innerHTML +=
      '<li class="rooms-list__item"><a class="rooms-list__link" href="' +
      room.url +
      '">' +
      room.name +
      '</a></li>'
  })
  innerHTML += '</ul>'

  roomsHolder.innerHTML = innerHTML
})

socket.on('countdown-update', (data) => {
  gameData = data.gameData
  countdownText.innerHTML = data.timeleft
  countdownText.style.opacity = 1

  if (data.timeleft == 0) {
    countdownText.innerHTML = ''
    countdownText.style.opacity = 0
  }
})

socket.on('in-game-countdown-update', (data) => {
  countdownText.innerHTML = data.timeleft

  if (data.timeleft == 0) {
    countdownText.innerHTML = 'Game over'
    show('ranking')

    winnerAnnouncement.innerHTML =
      '<tbody><tr><td>Winner</td>' +
      '<td><span class="user-name" style="color: ' +
      playersData[data.roundWinner.playerID].color +
      '"><span>' +
      playersData[data.roundWinner.playerID].nickname +
      '</span></span></td></tr>' +
      '<tr><td>Point(s)</td>' +
      '<td><p>' +
      data.roundWinner.score +
      ' pts</p></td></tr></tbody>'
    let ranking = ''
    data.roundRanking.map((rank) => {
      ranking +=
        '<li style="color:' +
        playersData[rank.playerID].color +
        '">' +
        playersData[rank.playerID].nickname +
        ' (' +
        rank.score +
        ' points)'
    })
    roundRankList.innerHTML = ranking

    let globalRanking = ''
    data.ranking.map((rank) => {
      globalRanking +=
        '<li style="color:' +
        playersData[rank.playerID].color +
        '">' +
        playersData[rank.playerID].nickname +
        ' (' +
        rank.score +
        ' points)'
    })
    rankList.innerHTML = globalRanking

    if (data.gameStatus === 'waiting') {
      backButton.style.display = 'block'
    } else {
      backButton.style.display = 'none'
      let timeleft = 3
      let countdownTimer = setInterval(function () {
        if (timeleft <= 0) {
          clearInterval(countdownTimer)
          if (typeof gtag !== 'undefined') {
            gtag('event', 'Start new round')
          }
          socket.emit('start-game', { roomSlug: roomSlug })
          countdownText.innerHTML = 'Starting...'
        }

        timeleft -= 1
      }, 1000)
    }
  }
})

// Save user data to local storage for next time
if (typeof userNickname !== 'undefined') {
  window.localStorage.setItem('nickame', userNickname)
}
if (typeof userColor !== 'undefined') {
  window.localStorage.setItem('color', userColor)
}

var playerNameField = document.getElementById('playerName')
if (playerNameField) {
  let localNickname = window.localStorage.getItem('nickame')
  if (localNickname) {
    document.getElementById('playerName').value = localNickname
  }
}
var playerColorField = document.getElementById('playerColor')
if (playerColorField) {
  let localColor = window.localStorage.getItem('color')
  if (localColor) {
    document.getElementById('playerColor').value = localColor
  }
}
