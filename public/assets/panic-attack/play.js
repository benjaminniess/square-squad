var bonusImage = new Image()
bonusImage.src = '/assets/images/bonus.png'
socket.on('refreshCanvas', (data) => {
  if (Number.isInteger(data.score)) {
    pointsText.innerHTML = data.score
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  data.bonusList.map((bonus) => {
    ctx.beginPath()
    ctx.drawImage(
      bonusImage,
      bonus.imgX,
      bonus.imgY,
      100,
      100,
      bonus.x,
      bonus.y,
      bonus.width,
      bonus.height,
    )
    ctx.fillStyle = '#00DD00'
    ctx.fill()
    ctx.closePath()
  })

  data.obstacles.map((obstacle) => {
    ctx.beginPath()
    ctx.fillStyle = '#DD0000'
    obstacle.map((vertice, i) => {
      if (i === 0) {
        ctx.moveTo(vertice.x, vertice.y)
      } else {
        ctx.lineTo(vertice.x, vertice.y)
      }
    })

    ctx.fill()
    ctx.closePath()
  })

  for (const [key, player] of Object.entries(data.players)) {
    if (player.alive) {
      ctx.beginPath()
      ctx.rect(player.x, player.y, gameData.squareSize, gameData.squareSize)
      ctx.fillStyle = player.color
      ctx.fill()
      ctx.closePath()
    } else {
      if (key === sessionData.playerID) {
        ctx.font = "30px 'Zen Dots', cursive"
        ctx.textAlign = 'center'
        ctx.fillStyle = '#de564a'
        ctx.fillText('You are DEAD!', canvas.width / 2, canvas.width / 2)
      }
    }
  }
})
