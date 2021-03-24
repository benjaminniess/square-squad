const socket = io()

const playersList = document.getElementById('players')

socket.on('refreshPlayers', (data) => {
  if (playersList) {
    playersList.innerHTML = ''
    for (const [socketID, player] of Object.entries(data)) {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(player.name))
      playersList.appendChild(li)
    }
  }
})
