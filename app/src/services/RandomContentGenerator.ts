import {Service} from "typedi";
import crypto from "crypto";

@Service()
export class RandomContentGenerator {

  getRandomID() {
    return crypto.randomBytes(8).toString('hex')
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }

}
