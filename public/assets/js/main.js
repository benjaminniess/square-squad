const socket = io()

const playersList = document.getElementById('players')

socket.on('refreshPlayers', (data) => {
  if (playersList) {
    playersList.innerHTML = ''
    data.map((player) => {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(player.nickName))
      playersList.appendChild(li)
    })
  }
})
