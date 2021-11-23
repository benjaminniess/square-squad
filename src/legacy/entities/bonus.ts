const canvasWidth = 700;
const bonusSize = 30;
import { Helpers } from '../../helpers/helpers';
import { EventEmitter } from 'events';

class Bonus {
  private game: any;
  private isTriggeredState: boolean;
  private x = 0;
  private y = 0;
  private eventEmitter: EventEmitter = new EventEmitter();
  private width = 0;
  private height = 0;
  private playerID = '';
  protected imgX = 0;
  protected imgY = 0;
  protected helpers: Helpers;

  constructor(params: any) {
    if (!params) {
      throw new Error('Missing params');
    }

    this.game = params.game;
    this.helpers = new Helpers();
    this.init();
    this.isTriggeredState = false;
  }

  init() {
    this.x = this.helpers.getRandomInt(1, canvasWidth - bonusSize);
    this.y = this.helpers.getRandomInt(1, canvasWidth - bonusSize);
    this.width = bonusSize;
    this.height = bonusSize;
  }

  getGame() {
    return this.game;
  }

  getDuration() {
    return 3000;
  }

  getEventEmmitter() {
    return this.eventEmitter;
  }

  isTriggered() {
    return this.isTriggeredState;
  }

  getPlayerID() {
    return this.playerID;
  }

  trigger(playerID: string) {
    this.playerID = playerID;
    this.isTriggeredState = true;
    const playersManager = this.getGame().getPlayersManager();

    if (this.getDuration() > 1000) {
      setTimeout(function () {
        playersManager.uptadePlayerSingleData(playerID, 'bonusBlinking', true);
      }, this.getDuration() - 1000);
    }
    return this.onTrigger();
  }

  getData() {
    return {
      ...this.getExtraData(),
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      imgX: this.imgX,
      imgY: this.imgY,
    };
  }

  onTrigger() {}
  getExtraData() {
    return {};
  }
}

export { Bonus };
