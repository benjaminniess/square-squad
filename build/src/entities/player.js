"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(socketID) {
        this.socketID = socketID;
        this.nickName = '';
        this.color = '';
        this.isSpectatorVal = false;
    }
    resetData(data) {
        if (data.nickName) {
            this.nickName = data.nickName;
        }
        if (data.color) {
            this.color = data.color;
        }
        if (data.isSpectatorVal) {
            this.isSpectatorVal = data.isSpectatorVal;
        }
    }
    getSocketID() {
        return this.socketID;
    }
    getColor() {
        return this.color;
    }
    getNickname() {
        return this.nickName;
    }
    isSpectator() {
        return this.isSpectatorVal;
    }
}
exports.Player = Player;
