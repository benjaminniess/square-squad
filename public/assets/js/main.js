const socket = io()
const playersLists = document.getElementsByClassName('players')
const startButton = document.getElementById('startButton')
const roomSlug = document.body.getAttribute('data-roomSlug')
const countdownText = document.getElementById('countdown-text')
const pointsText = document.getElementById('points-text')

const lobbySection = document.getElementById('section-lobby')
const playSection = document.getElementById('section-play')
const rankSection = document.getElementById('section-ranking')

const winnerNickname = document.getElementById('winner-nickname')
const winnerScore = document.getElementById('winner-score')
const rankList = document.getElementById('rank-list')
const roundRankList = document.getElementById('round-rank-list')

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
        if (player.playerID === sessionData.playerID) {
          li.appendChild(document.createTextNode('(You)'))
        }

        if (player.isAdmin) {
          li.appendChild(document.createTextNode('[admin]'))
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
  lobbySection.style.display = 'none'
  playSection.style.display = 'block'
  rankSection.style.display = 'none'
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
    lobbySection.style.display = 'none'
    playSection.style.display = 'none'
    rankSection.style.display = 'block'
    winnerNickname.innerHTML = data.roundWinner.nickname
    winnerScore.innerHTML = data.roundWinner.score
    let ranking = ''
    data.roundRanking.map((rank) => {
      ranking += '<li>' + rank.nickname + ' (' + rank.score + ' points)'
    })
    roundRankList.innerHTML = ranking

    let globalRanking = ''
    data.ranking.map((rank) => {
      globalRanking += '<li>' + rank.nickname + ' (' + rank.score + ' points)'
    })
    rankList.innerHTML = globalRanking

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
})
