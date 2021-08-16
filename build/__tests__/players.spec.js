"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const players_1 = require("../src/helpers/players");
const player_1 = require("../src/entities/player");
describe('Players management', () => {
    const players = new players_1.Players().getInstance();
    it('returns an empty players object', () => {
        expect(players.getPlayers()).toEqual({});
    });
    it('creates a new player and returns true', () => {
        expect(players.initPlayer('abc1234', 'Players 1', '#FF00FF')).toBeTruthy();
    });
    it('returns an empty players object', () => {
        expect(players.getPlayers()['abc1234']).toBeInstanceOf(player_1.Player);
    });
    it('returns the previously created player', () => {
        expect(players.getPlayer('abc1234')).toBeInstanceOf(player_1.Player);
    });
    it('returns false when calling a wrong ID', () => {
        expect(players.getPlayer('abc12345')).toBeFalsy();
    });
    it('returns false when trying to update a non existing user', () => {
        expect(players.updatePlayer('abc12345', { color: '#0000FF' })).toBeFalsy();
    });
    it('updates the previously created user', () => {
        expect(players.updatePlayer('abc1234', { color: '#0000FF' })).toBeFalsy();
    });
});
