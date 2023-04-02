import {Service} from "typedi";

@Service()
export class GlobalGameScoreManager {
  private score: number = 0

  public resetScore(): void {
    this.setScore(0)
  }

  public getScore(): number {
    return this.score
  }

  public increaseScore(): void {
    this.setScore(this.score + 1)
  }

  public setScore(score: number): void {
    this.score = score
  }
}
