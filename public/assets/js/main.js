const socket = io()
const playersList = document.getElementById('players')

let sessionData;

socket.on('refreshPlayers', (data) => {
  if (playersList) {
    playersList.innerHTML = ''
    data.map((player) => {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(player.nickName))
      if ( player.playerID === sessionData.playerID ) {
        li.appendChild(document.createTextNode("(You)"))
      }
      playersList.appendChild(li)
    })
  }
})

socket.on('player-connected', (data) => {
  sessionData = data
})
