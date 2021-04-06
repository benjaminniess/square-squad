const socket = io(window.location.host, {
  transports: ['websocket'],
})
const playersList = document.getElementById('players')
const startButton = document.getElementById('startButton')
const roomSlug = document.body.getAttribute('data-roomSlug')

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
