socket.on('refreshCanvas', (data) => {
  if (Number.isInteger(data.score)) {
    pointsText.innerHTML = data.score
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const [key, player] of Object.entries(data.players)) {
    if (player.alive) {
      ctx.beginPath()
      ctx.rect(player.x, player.y, gameData.squareSize, gameData.squareSize)
      ctx.fillStyle = player.isWolf ? '#DD9500' : player.color
      ctx.fill()
      ctx.closePath()
    }
  }
})
