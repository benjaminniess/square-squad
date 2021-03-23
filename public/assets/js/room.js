const socket = io()

var playersList = document.getElementById('players')

socket.on('session', ({ sessionID, userID }) => {
  socket.auth = { sessionID }
  socket.userID = userID
  //localStorage.setItem('sessionID', sessionID)
})

socket.on('refreshPlayers', (data) => {
  playersList.innerHTML = ''
  for (const [socketID, player] of Object.entries(data)) {
    var li = document.createElement('li')
    li.appendChild(document.createTextNode(player.name))
    playersList.appendChild(li)
  }
})
