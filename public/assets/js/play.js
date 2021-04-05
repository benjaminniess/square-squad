var canvas = document.getElementById('gameCanvas')
var countdownText = document.getElementById('countdown-text')
var ctx = canvas.getContext('2d')
var ballRadius = 10

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('keyup', keyUpHandler, false)

function keyDownHandler(e) {
  socket.emit('keyPressed', { key: e.keyCode })
}
function keyUpHandler(e) {
  socket.emit('keyUp', { key: e.keyCode })
}

socket.on('countdown-update', (data) => {
  countdownText.innerHTML = data.timeleft
  if (data.timeleft == 0) {
    countdownText.innerHTML = ''
  }
})

socket.on('refreshCanvas', (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const [key, player] of Object.entries(data.players)) {
    ctx.beginPath()
    ctx.arc(player.x, player.y, ballRadius, 0, Math.PI * 2)
    ctx.fillStyle = player.isWolf ? '#DD9500' : '#0095DD'
    ctx.fill()
    ctx.closePath()
  }
})
