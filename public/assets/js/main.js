const socket = io()
const playersList = document.getElementById('players')

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

      playersList.appendChild(li)
    })
  }
})

// Once the connection is set, save data in the sessionData variable and ask for joining the room
socket.on('player-connected', (data) => {
  sessionData = data

  let bodyAttribute = document.body.getAttribute('data-roomSlug')
  if (bodyAttribute) {
    socket.emit('room-join', { roomSlug: bodyAttribute })
  }
})
