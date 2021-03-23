const socket = io()

// Pre-Home
const preHomeForm = document.getElementById('pre-home-form')
const playerNameField = document.getElementById('playerName')
const playerNameLabel = document.getElementById('playerNameLabel')

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

