const socket = io()

var playersList = document.getElementById('players')

var sessionID = false;
socket.on('connect', function() {
  sessionID = socket.id;
});


socket.on('refreshPlayers', (data) => {
  playersList.innerHTML = '';
  for (const [socketID, player] of Object.entries(data)) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(player.name));
    playersList.appendChild(li);     
  }
})
