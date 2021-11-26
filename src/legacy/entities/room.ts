export { RoomBasicData, Room };
import { Player } from './player';
import { MasterGame } from '../games/master-game';
import { _ } from 'lodash';

type RoomBasicData = {
  slug: string;
  name: string;
  url: string;
};

class Room {
  private name: string;
  private slug: string;
  private adminPlayer?: string;
  private game: any;
  private players: Player[] = [];

  constructor(slug: string, name: string, game: MasterGame) {
    this.name = name;
    this.slug = slug;
    this.game = game;
  }

  getGame() {
    return this.game;
  }

  getSlug() {
    return this.slug;
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
    // const players = this.io.sockets.adapter.rooms.get(this.getSlug());
    // return players ? _.toArray(players) : [];
  }

  refreshPlayers(disconnectedPlayerSocketID = null) {
    const game = this.getGame();

    const globalRanking = game.getRanking();
    const currentRoundRanking = game.getLastRoundRanking();
    const socketClients = this.getPlayers();
    let sessionsInRoom: any[] = [];
    const playersData = game.getPlayersManager().getPlayersData();

    _.forEach(socketClients, (socketID: string) => {
      //const playerObj = players.getPlayer(socketID);
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
        //nickname: playerObj.getNickname(),
        //color: playerObj.getColor(),
        score: totalScore,
        alive: playersData[socketID] && playersData[socketID].alive,
        isAdmin: false,
      };

      // If a player is about to disconnect, don't show it in the room
      // if (disconnectedPlayerSocketID !== socketID) {
      //   if (this.getAdminPlayer() === socketID) {
      //     sessionToAdd.isAdmin = true;
      //   } else {
      //     sessionToAdd.isAdmin = false;
      //   }

      //   if (!playerObj.isSpectator()) {
      //     sessionsInRoom.push(sessionToAdd);
      //     if (game.getStatus() !== 'playing') {
      //       game.getPlayersManager().initPlayer(sessionToAdd);
      //     }
      //   }
      // } else {
      //   game.getPlayersManager().removePlayer(socketID);
      // }
    });

    sessionsInRoom = _.orderBy(sessionsInRoom, ['score'], ['desc']);
    //this.io.in(this.getSlug()).emit('refresh-players', sessionsInRoom);

    return sessionsInRoom;
  }
}
