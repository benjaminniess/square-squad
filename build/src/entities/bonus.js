"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require('../helpers/helpers');
const { canvasWidth, bonusSize } = require('../config/main');
const events_1 = __importDefault(require("events"));
class Bonus {
    constructor(params) {
        this.x = 0;
        this.y = 0;
        this.eventEmitter = new events_1.default();
        this.width = 0;
        this.height = 0;
        this.playerID = '';
        this.imgX = 0;
        this.imgY = 0;
        if (!params) {
            throw new Error('Missing params');
        }
        this.game = params.game;
        this.init();
        this.isTriggeredState = false;
    }
    init() {
        this.x = helpers.getRandomInt(1, canvasWidth - bonusSize);
        this.y = helpers.getRandomInt(1, canvasWidth - bonusSize);
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
    trigger(playerID) {
        this.playerID = playerID;
        this.isTriggeredState = true;
        let playersManager = this.getGame().getPlayersManager();
        if (this.getDuration() > 1000) {
            setTimeout(function () {
                playersManager.uptadePlayerSingleData(playerID, 'bonusBlinking', true);
            }, this.getDuration() - 1000);
        }
        return this.onTrigger();
    }
    getData() {
        return Object.assign(Object.assign({}, this.getExtraData()), { x: this.x, y: this.y, width: this.width, height: this.height, imgX: this.imgX, imgY: this.imgY });
    }
    onTrigger() { }
    getExtraData() {
        return {};
    }
}
module.exports = Bonus;
