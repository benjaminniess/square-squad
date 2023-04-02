import {PlayerScoreDto} from "./dto/PlayerScoreDto";
import {Service} from "typedi";

@Service()
export class PlayersScoreManager {
  private playerScores: Array<PlayerScoreDto> = []
  private ranking: any[] = []
  private lastRoundRanking: any[] = []

  initPlayer(socketID: string) {
    this.playerScores.push({
      socketID: socketID,
      score: 0
    })
  }

  getRankingOrderedByScoreDesc(): Array<PlayerScoreDto> {
    return this.playerScores
  }

  getRankingOrderedByScoreAsc(): Array<PlayerScoreDto> {
    return this.playerScores
  }

  increaseScoreForPlayer(socketID: string, by: number = 1): void {
    //:this.playerScores. TODO
  }

  getScoreForPlayer(socketID: string): number {
    return 1 // TODO
  }

  getHighestScore() {
    return this.getRankingOrderedByScoreDesc()[0].score
  }

  //
  // getLastRoundRanking() {
  //   return this.lastRoundRanking
  // }
  //
  // getLastRoundWinner() {
  //   return this.getLastRoundRanking()[0]
  // }
  //
  //
  //
  resetRanking(): void {
    this.ranking = []
  }


  resetLastRoundRanking(): void {
    this.lastRoundRanking = []
  }

  //
  // syncScores() {
  //   let playersData = this.getPlayersManager().getPlayersData()
  //   this.lastRoundRanking = []
  //   _.forEach(playersData, (playerData: any, playerID: string) => {
  //     this.lastRoundRanking.push({
  //       playerID: playerID,
  //       score: playerData.score
  //     })
  //   })
  //
  //   this.lastRoundRanking = _.orderBy(
  //     this.lastRoundRanking,
  //     ['score'],
  //     ['desc']
  //   )
  // }
  //
  // saveRoundScores() {
  //   let lastRoundRanking = this.getLastRoundRanking()
  //   _.forEach(lastRoundRanking, (lastRoundResult: any) => {
  //     let index = _.findIndex(this.ranking, {
  //       playerID: lastRoundResult.playerID
  //     })
  //
  //     if (index === -1) {
  //       this.ranking.push({
  //         playerID: lastRoundResult.playerID,
  //         score: lastRoundResult.score
  //       })
  //     } else {
  //       this.ranking[index].score += lastRoundResult.score
  //     }
  //   })
  //
  //   this.ranking = _.orderBy(this.ranking, ['score'], ['desc'])
  // }
}
