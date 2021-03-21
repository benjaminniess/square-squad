const socket = io()
var canvas = document.getElementById('myCanvas')
var ctx = canvas.getContext('2d')
var ballRadius = 10
var playersList = document.getElementById('players')

var sessionID = false;
socket.on('connect', function() {
  sessionID = socket.id;
});

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  socket.emit( "keyPressed", { "key" : e.keyCode, "id": sessionID } )
}
function keyUpHandler(e) {
  socket.emit( "keyUp", { "key" : e.keyCode, "id": sessionID } )
}

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

socket.on('refreshPlayers', (data) => {
  playersList.innerHTML = '';
  for (const [socketID, player] of Object.entries(data)) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(player.name));
    playersList.appendChild(li);     
  }
})