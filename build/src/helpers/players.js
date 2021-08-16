"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Players = void 0;
const player_1 = require("../entities/player");
class Players {
    constructor() {
        if (!Players.instance) {
            Players.instance = this;
            this.players = {};
        }
    }
    getInstance() {
        return Players.instance;
    }
    getPlayers() {
        return this.players;
    }
    getPlayer(socketID) {
        if (!socketID) {
            return false;
        }
        if (!this.players[socketID]) {
            return false;
        }
        return this.players[socketID];
    }
    initPlayer(socketID, playerName, playerColor) {
        let newPlayer = new player_1.Player(socketID);
        newPlayer.resetData({
            nickName: playerName,
            color: playerColor
        });
        this.players[socketID] = newPlayer;
        return newPlayer;
    }
    updatePlayer(socketID, playerData) {
        if (!this.getPlayer(socketID)) {
            return false;
        }
        this.players[socketID].resetData(playerData);
    }
}
exports.Players = Players;
