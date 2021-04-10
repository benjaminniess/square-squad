socket.on('refreshCanvas', (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const [key, player] of Object.entries(data.players)) {
    ctx.beginPath()
    ctx.rect(player.x, player.y, gameData.squareSize, gameData.squareSize)
    ctx.fillStyle = player.isWolf ? '#DD9500' : '#0095DD'
    ctx.fill()
    ctx.closePath()
  }

  data.obstacles.map((obstacle) => {
    ctx.beginPath()
    ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    ctx.fillStyle = '#DD0000'
    ctx.fill()
    ctx.closePath()
  })
})
