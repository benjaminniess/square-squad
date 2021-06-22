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

  if (data.debugBodies.length > 0) {
    data.debugBodies.map((vertice, i) => {
      ctx.beginPath()
      ctx.rect(vertice.x, vertice.y, 10, 10)
      ctx.fillStyle = '#DDDD00'
      ctx.fill()
      ctx.closePath()
    })
  }

  for (const [key, player] of Object.entries(data.players)) {
    if (player.alive) {
      ctx.beginPath()
      ctx.rect(
        player.x - gameData.squareSize / 2,
        player.y - gameData.squareSize / 2,
        gameData.squareSize,
        gameData.squareSize,
      )
      ctx.fillStyle = player.isWolf === true ? '#000' : player.color
      ctx.fill()
      ctx.closePath()

      if (player.bonus) {
        ctx.beginPath()
        ctx.drawImage(
          bonusImage,
          player.bonus.imgX,
          player.bonus.imgY,
          100,
          100,
          player.x + gameData.squareSize / 2,
          player.y + gameData.squareSize / 2,
          (player.bonus.width * 2) / 3,
          (player.bonus.height * 2) / 3,
        )
        ctx.fillStyle = '#00DD00'
        ctx.fill()
        ctx.closePath()
      }
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