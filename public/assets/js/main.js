const socket = io()
const playersLists = document.getElementsByClassName('players')
const startButton = document.getElementById('startButton')
const roomSlug = document.body.getAttribute('data-roomSlug')
const countdownText = document.getElementById('countdown-text')
const pointsText = document.getElementById('points-text')
const roundNumber = document.getElementById('round-number')

const lobbySection = document.getElementById('section-lobby')
const playSection = document.getElementById('section-play')
const rankSection = document.getElementById('section-ranking')

const winnerAnnouncement = document.getElementById('winner-announcement')
const rankList = document.getElementById('rank-list')
const roundRankList = document.getElementById('round-rank-list')
const backButton = document.getElementById('back-button')

const roomsList = document.querySelector('roomsList ul')

const canvas = document.getElementById('gameCanvas')
const ctx = canvas ? canvas.getContext('2d') : null
let gameData = {}

// Prepare the variable that'll recieve connection data
let sessionData

// When recieving players in current room
socket.on('refreshPlayers', (data) => {
  // Check if the current page has a players list container
  if (playersLists) {
    Array.prototype.slice.call(playersLists).map((playersList) => {
      playersList.innerHTML = ''
      data.map((player) => {
        var li = document.createElement('li')
        li.appendChild(document.createTextNode(player.nickname))
        li.style.color = player.color

        // Flag the current user
        if (player.id === sessionData.playerID) {
          li.appendChild(document.createTextNode('(You)'))

          if (player.isAdmin) {
            startButton.style.visibility = 'visible'
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
})

// Once the connection is set, save data in the sessionData variable and ask for joining the room
socket.on('player-connected', (data) => {
  sessionData = data

  if (roomSlug) {
    socket.emit('room-join', { roomSlug: roomSlug })
  }
})

socket.on('game-is-starting', (data) => {
  pointsText.innerHTML = null
  roundNumber.innerHTML = 'Round ' + data.currentRound + '/' + data.totalRounds
  show('play')
})

if (startButton) {
  startButton.onclick = function () {
    socket.emit('start-game', { roomSlug: roomSlug })
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

function show(sectionID) {
  if (sectionID === 'lobby') {
    lobbySection.style.display = 'block'
    playSection.style.display = 'none'
    rankSection.style.display = 'none'
  } else if (sectionID === 'play') {
    lobbySection.style.display = 'none'
    playSection.style.display = 'block'
    rankSection.style.display = 'none'
  } else if (sectionID === 'ranking') {
    lobbySection.style.display = 'none'
    playSection.style.display = 'none'
    rankSection.style.display = 'block'
  }
}

function keyDownHandler(e) {
  socket.emit('keyPressed', { key: e.keyCode })
}
function keyUpHandler(e) {
  socket.emit('keyUp', { key: e.keyCode })
}

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

    const playerColor = data.roundWinner.color

    winnerAnnouncement.innerHTML =
      '<tbody><tr><td>Winner</td>' +
      '<td><span class="user-name" style="color: ' +
      playerColor +
      '"><span>' +
      data.roundWinner.nickname +
      '</span></span></td></tr>' +
      '<tr><td>Point(s)</td>' +
      '<td><p>' +
      data.roundWinner.score +
      ' pts</p></td></tr></tbody>'
    let ranking = ''
    data.roundRanking.map((rank) => {
      ranking +=
        '<li style="color:' +
        rank.color +
        '">' +
        rank.nickname +
        ' (' +
        rank.score +
        ' points)'
    })
    roundRankList.innerHTML = ranking

    let globalRanking = ''
    data.ranking.map((rank) => {
      globalRanking +=
        '<li style="color:' +
        rank.color +
        '">' +
        rank.nickname +
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
