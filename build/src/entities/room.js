"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const players_1 = require("../helpers/players");
const _ = require('lodash');
const games = {
    panicAttack: require('../games/panic-attack'),
    wolfAndSheeps: require('../games/wolf-and-sheeps')
};
class Room {
    constructor(slug, name, io) {
        this.players = [];
        this.name = name;
        this.slug = slug;
        this.io = io;
        this.setGame('panic-attack');
    }
    getName() {
        return this.name;
    }
    getSlug() {
        return this.slug;
    }
    getGame() {
        return this.game;
    }
    getBasicData() {
        return {
            slug: this.getSlug(),
            name: this.getName(),
            url: this.getLobbyURL()
        };
    }
    setGame(gameID) {
        switch (gameID) {
            case 'panic-attack':
                this.game = new games.panicAttack(this);
                break;
            case 'wolfs-and-sheeps':
                this.game = new games.wolfAndSheeps(this);
                break;
        }
    }
    addPlayer(player) {
        this.players.push(player);
    }
    removePlayer(player) {
        this.players = this.players.filter((playerElement) => {
            return player.getSocketID() === playerElement.getSocketID();
        });
    }
    getPlayersEntities() {
        return this.players;
    }
    getPlayers() {
        let players = this.io.sockets.adapter.rooms.get(this.getSlug());
        return players ? _.toArray(players) : [];
    }
    getAdminPlayer() {
        return this.adminPlayer;
    }
    getLobbyURL() {
        return '/rooms/' + this.getSlug();
    }
    setAdminPlayer(playerID) {
        this.adminPlayer = playerID;
    }
    /**
     * Auto elect a new admin when the previous one is leaving
     */
    resetAdminPlayer() {
        let socketClients = this.getPlayers();
        socketClients.map((socketID) => {
            if (this.getAdminPlayer() !== socketID) {
                this.setAdminPlayer(socketID);
            }
        });
    }
    refreshPlayers(disconnectedPlayerSocketID = null) {
        const players = new players_1.Players().getInstance();
        let game = this.getGame();
        let globalRanking = game.getRanking();
        let currentRoundRanking = game.getLastRoundRanking();
        let socketClients = this.getPlayers();
        let sessionsInRoom = [];
        let playersData = game.getPlayersManager().getPlayersData();
        _.forEach(socketClients, (socketID) => {
            let playerObj = players.getPlayer(socketID);
            let globalRankingIndex = _.findIndex(globalRanking, {
                playerID: socketID
            });
            let currentRoundRankingIndex = _.findIndex(currentRoundRanking, {
                playerID: socketID
            });
            let totalScore = globalRankingIndex === -1 ? 0 : globalRanking[globalRankingIndex].score;
            if (currentRoundRanking[currentRoundRankingIndex]) {
                totalScore += currentRoundRanking[currentRoundRankingIndex].score;
            }
            let sessionToAdd = {
                id: socketID,
                nickname: playerObj.getNickname(),
                color: playerObj.getColor(),
                score: totalScore,
                alive: playersData[socketID] && playersData[socketID].alive,
                isAdmin: false
            };
            // If a player is about to disconnect, don't show it in the room
            if (disconnectedPlayerSocketID !== socketID) {
                if (this.getAdminPlayer() === socketID) {
                    sessionToAdd.isAdmin = true;
                }
                else {
                    sessionToAdd.isAdmin = false;
                }
                if (!playerObj.isSpectator()) {
                    sessionsInRoom.push(sessionToAdd);
                    if (game.getStatus() !== 'playing') {
                        game.getPlayersManager().initPlayer(sessionToAdd);
                    }
                }
            }
            else {
                game.getPlayersManager().removePlayer(socketID);
            }
        });
        sessionsInRoom = _.orderBy(sessionsInRoom, ['score'], ['desc']);
        this.io.in(this.getSlug()).emit('refresh-players', sessionsInRoom);
        return sessionsInRoom;
    }
}
exports.Room = Room;
