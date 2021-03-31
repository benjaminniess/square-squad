const socket = io()
const playersList = document.getElementById('players')

let sessionData;

socket.on('refreshPlayers', (data) => {
  if (playersList) {
    playersList.innerHTML = ''
    data.map((player) => {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(player.nickName))
      console.log(socket.playerID, socket.id, socket.sid )
      if ( player.playerID === socket.playerID ) {
        li.appendChild(document.createTextNode("(You)"))
      }
      playersList.appendChild(li)
    })
  }
})

socket.on('player-connected', (data) => {
  sessionData = data
})
