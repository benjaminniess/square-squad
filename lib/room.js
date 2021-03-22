'use strict';
const Player = require('./player')

class Room {

    constructor(name){
        this.name = name
        this.players = {}
    }
 
    getName() {
        return this.name
    }

    getPlayers() {
        return this.players
    }

    addPlayer(playerID, nickname) {
        this.players[playerID] = new Player(playerID, nickname)
    }

    removePlayer(playerID) {
        delete this.players[playerID]
    }
}

module.exports = Room