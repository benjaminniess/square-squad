"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockedPlayer = void 0;
const MockedPlayer = {
    socketID: 'abcd1234',
    nickName: 'Player 1',
    color: '#00AA11',
    getSocketID: () => {
        return 'abcd1234';
    },
    getColor: () => {
        return '#00AA11';
    },
    getNickname: () => {
        return 'Player 1';
    },
    isSpectator: () => {
        return false;
    }
};
exports.MockedPlayer = MockedPlayer;
