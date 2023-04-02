import {Service} from "typedi";

@Service()
export class GlobalGameRoundsManager {
  private roundNumber: number = 1
  private readonly totalRounds: number

  constructor(totalRounds: number = 3) {
    this.totalRounds = totalRounds
  }

  getCurrentRound(): number {
    return this.roundNumber
  }

  getTotalRounds(): number {
    return this.totalRounds
  }

  increaseRoundNumber(): void {
    if (this.roundNumber >= this.totalRounds) {
      throw new Error('max-rounds-limit')
    }

    this.roundNumber++
  }
}
