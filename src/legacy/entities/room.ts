export { RoomBasicData, Room };
import { Player } from './player';
import { MasterGame } from '../games/master-game';
import { _ } from 'lodash';

const games = {
  panicAttack: require('../games/panic-attack'),
  wolfAndSheeps: require('../games/wolf-and-sheeps'),
};

type RoomBasicData = {
  slug: string;
  name: string;
  url: string;
};

class Room {
  private name: string;
  private slug: string;
  private io: any;
  private adminPlayer?: string;
  private game: any;
  private players: Player[] = [];

  constructor(slug: string, name: string, io: any) {
    this.name = name;
    this.slug = slug;
    this.io = io;
    this.setGame('panic-attack');
  }

  getName(): string {
    return this.name;
  }

  getSlug(): string {
    return this.slug;
  }

  getGame(): MasterGame {
    return this.game;
  }

  getBasicData(): RoomBasicData {
    return {
      slug: this.getSlug(),
      name: this.getName(),
      url: this.getLobbyURL(),
    };
  }

  setGame(gameID: string) {
    switch (gameID) {
      case 'panic-attack':
        this.game = new games.panicAttack(this);
        break;
      case 'wolfs-and-sheeps':
        this.game = new games.wolfAndSheeps(this);
        break;
    }
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((playerElement: Player) => {
      return player.getSocketID() === playerElement.getSocketID();
    });
  }

  getPlayersEntities(): Player[] {
    return this.players;
  }

  getPlayers() {
    const players = this.io.sockets.adapter.rooms.get(this.getSlug());
    return players ? _.toArray(players) : [];
  }

  getAdminPlayer() {
    return this.adminPlayer;
  }

  getLobbyURL(): string {
    return '/rooms/' + this.getSlug();
  }

  setAdminPlayer(playerID: string): void {
    this.adminPlayer = playerID;
  }

  /**
   * Auto elect a new admin when the previous one is leaving
   */
  resetAdminPlayer() {
    const socketClients = this.getPlayers();

    socketClients.map((socketID: string) => {
      if (this.getAdminPlayer() !== socketID) {
        this.setAdminPlayer(socketID);
      }
    });
  }

  refreshPlayers(disconnectedPlayerSocketID = null) {
    const players = new Players().getInstance();
    const game = this.getGame();

    const globalRanking = game.getRanking();
    const currentRoundRanking = game.getLastRoundRanking();
    const socketClients = this.getPlayers();
    let sessionsInRoom: any[] = [];
    const playersData = game.getPlayersManager().getPlayersData();

    _.forEach(socketClients, (socketID: string) => {
      const playerObj = players.getPlayer(socketID);
      const globalRankingIndex = _.findIndex(globalRanking, {
        playerID: socketID,
      });
      const currentRoundRankingIndex = _.findIndex(currentRoundRanking, {
        playerID: socketID,
      });

      let totalScore =
        globalRankingIndex === -1 ? 0 : globalRanking[globalRankingIndex].score;

      if (currentRoundRanking[currentRoundRankingIndex]) {
        totalScore += currentRoundRanking[currentRoundRankingIndex].score;
      }

      const sessionToAdd = {
        id: socketID,
        nickname: playerObj.getNickname(),
        color: playerObj.getColor(),
        score: totalScore,
        alive: playersData[socketID] && playersData[socketID].alive,
        isAdmin: false,
      };

      // If a player is about to disconnect, don't show it in the room
      if (disconnectedPlayerSocketID !== socketID) {
        if (this.getAdminPlayer() === socketID) {
          sessionToAdd.isAdmin = true;
        } else {
          sessionToAdd.isAdmin = false;
        }

        if (!playerObj.isSpectator()) {
          sessionsInRoom.push(sessionToAdd);
          if (game.getStatus() !== 'playing') {
            game.getPlayersManager().initPlayer(sessionToAdd);
          }
        }
      } else {
        game.getPlayersManager().removePlayer(socketID);
      }
    });

    sessionsInRoom = _.orderBy(sessionsInRoom, ['score'], ['desc']);
    this.io.in(this.getSlug()).emit('refresh-players', sessionsInRoom);

    return sessionsInRoom;
  }
}
