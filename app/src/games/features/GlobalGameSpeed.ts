import {Service} from "typedi";

@Service()
export class GlobalGameSpeed {
  private speed: number = 0

  getSpeed(): number {
    return this.speed
  }

  setSpeed(speed: number): void {
    this.speed = speed
  }

  increaseSpeed(by: number = 1): void {
    this.speed = this.speed + by
  }
}
