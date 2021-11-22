import { Speed } from '../entities/bonus/speed';
import { ScoreChanger } from '../entities/bonus/score-changer';
import { Invincible } from '../entities/bonus/invincible';
import { _ } from 'lodash';
import { Helpers } from 'src/helpers/helpers';

class BonusManager {
  private bonusList: any[];
  private game: any;
  private frequency: number;
  private lastBonusTime: any;
  private helpers: Helpers;

  constructor(game: any) {
    this.bonusList = [];
    this.game = game;
    this.frequency = 5;
    this.lastBonusTime = null;
    this.helpers = new Helpers();
  }

  getBonus() {
    return this.bonusList;
  }

  getGame() {
    return this.game;
  }

  getFrequency() {
    return this.frequency;
  }

  resetBonus() {
    this.bonusList = [];
  }

  setFrequency(frequency: number) {
    this.frequency = frequency;
  }

  maybeInitBonus() {
    // Avoid 2 bonus at the same second
    if (this.lastBonusTime && this.lastBonusTime > process.hrtime()[0] - 2) {
      return;
    }

    if (this.getFrequency() === 0) {
      return;
    }

    if (this.helpers.getRandomInt(1, 2500 / this.getFrequency()) === 1) {
      this.initBonus();
      this.lastBonusTime = process.hrtime()[0];
    }
  }

  initBonus(params: any = {}) {
    const bonusID = this.helpers.getRandomInt(1, 4);

    params.game = this.getGame();

    switch (bonusID) {
      case 1:
        this.bonusList.push(new Speed(params));
        break;
      case 2:
        this.bonusList.push(new ScoreChanger(params));
        break;
      case 3:
        this.bonusList.push(new Invincible(params));
        break;
      default:
        break;
    }
  }

  getActiveBonus() {
    const activeBonus: any[] = [];

    _.forEach(this.getBonus(), (bonus: any) => {
      if (!bonus.isTriggered()) {
        activeBonus.push(bonus);
      }
    });

    return activeBonus;
  }
}

export { BonusManager };
