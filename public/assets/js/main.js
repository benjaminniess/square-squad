const socket = io()

// Pre-Home
const preHomeForm = document.getElementById('pre-home-form')
const playerNameField = document.getElementById('playerName')
const playerNameLabel = document.getElementById('playerNameLabel')
const  playersList = document.getElementById('players')

if ( preHomeForm ) {
  preHomeForm.addEventListener('submit', (event) => {
    event.preventDefault()
    socket.emit('nicknameSubmitted', { nickName: playerNameField.value })
  })
}
socket.on('nicknameSet', (data) => {
  window.localStorage.setItem('sessionID', data.sessionID)
  window.location.href = '/rooms'
})

socket.on('connect', () => {
  let sessionID = window.localStorage.getItem('sessionID')
  if (sessionID) {
    socket.emit('setSessionID', { sessionID: sessionID })
  }
})

socket.on('sessionEstablished', (sessionData) => {
  if ( ! sessionData ) {
    return
  }

  if ( playerNameLabel ) {
    playerNameLabel.innerHTML = sessionData.nickName
  }

  if ( playerNameField ) {
    playerNameField.value = sessionData.nickName
  }
})

socket.on('refreshPlayers', (data) => {
  if ( playersList ) {
    playersList.innerHTML = ''
    for (const [socketID, player] of Object.entries(data)) {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(player.name))
      playersList.appendChild(li)
    }
  }
})

