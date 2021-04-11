const socket = io()
const playersList = document.getElementById('players')
const startButton = document.getElementById('startButton')
const roomSlug = document.body.getAttribute('data-roomSlug')
const countdownText = document.getElementById('countdown-text')
const pointsText = document.getElementById('points-text')

const canvas = document.getElementById('gameCanvas')
const ctx = canvas ? canvas.getContext('2d') : null
let gameData = {}

// Prepare the variable that'll recieve connection data
let sessionData

// When recieving players in current room
socket.on('refreshPlayers', (data) => {
  // Check if the current page has a players list container
  if (playersList) {
    playersList.innerHTML = ''
    data.map((player) => {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(player.nickName))

      // Flag the current user
      if (player.playerID === sessionData.playerID) {
        li.appendChild(document.createTextNode('(You)'))
      }

      if (player.isAdmin) {
        li.appendChild(document.createTextNode('[admin]'))
      }

      playersList.appendChild(li)
    })
  }
})

// Once the connection is set, save data in the sessionData variable and ask for joining the room
socket.on('player-connected', (data) => {
  sessionData = data

  if (roomSlug) {
    socket.emit('room-join', { roomSlug: roomSlug })
  }
})

socket.on('game-is-starting', (data) => {
  window.location.href = data.href
})

if (startButton) {
  startButton.onclick = function () {
    socket.emit('start-game', { roomSlug: roomSlug })
    return false
  }
}

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('keyup', keyUpHandler, false)

function keyDownHandler(e) {
  socket.emit('keyPressed', { key: e.keyCode })
}
function keyUpHandler(e) {
  socket.emit('keyUp', { key: e.keyCode })
}

socket.on('countdown-update', (data) => {
  gameData = data.gameData
  countdownText.innerHTML = data.timeleft
  if (data.timeleft == 0) {
    countdownText.innerHTML = ''
  }
})

socket.on('in-game-countdown-update', (data) => {
  countdownText.innerHTML = data.timeleft
  if (data.timeleft == 0) {
    countdownText.innerHTML = 'Game over'
    window.location.href = data.href
  }
})
