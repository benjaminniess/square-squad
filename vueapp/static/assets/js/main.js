
const socket = io()

var refreshLink = document.getElementById('rooms-refresh')
socket.emit('rooms-refresh')
if (refreshLink) {
  refreshLink.onclick = (e) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'Refresh rooms')
    }
    socket.emit('rooms-refresh')
  }
}

const roomsHolder = document.getElementById('rooms-holder')
socket.on('rooms-refresh-result', (rooms) => {
  if (!roomsHolder) {
    return
  }

  if (rooms.length < 1) {
    roomsHolder.innerHTML =
      '<p class="rooms-list__no-rooms">No rooms yet :( </p>'
    return
  }

  let innerHTML = '<ul class="rooms-list__list">'

  rooms.map((room) => {
    innerHTML +=
      '<li class="rooms-list__item"><a class="rooms-list__link" href="' +
      room.url +
      '">' +
      room.name +
      '</a></li>'
  })
  innerHTML += '</ul>'

  roomsHolder.innerHTML = innerHTML
})


// Save user data to local storage for next time
if (typeof userNickname !== 'undefined') {
  window.localStorage.setItem('nickame', userNickname)
}
if (typeof userColor !== 'undefined') {
  window.localStorage.setItem('color', userColor)
}

var playerNameField = document.getElementById('playerName')
if (playerNameField) {
  let localNickname = window.localStorage.getItem('nickame')
  if (localNickname) {
    document.getElementById('playerName').value = localNickname
  }
}
var playerColorField = document.getElementById('playerColor')
if (playerColorField) {
  let localColor = window.localStorage.getItem('color')
  if (localColor) {
    document.getElementById('playerColor').value = localColor
  }
}
