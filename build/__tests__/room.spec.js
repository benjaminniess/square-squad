"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = require("../src/entities/room");
// Quick mock of socket io object
const mockedSocket = {
    sockets: {
        adapter: {
            rooms: {
                get: (a) => {
                    return true;
                }
            }
        }
    }
};
describe('Room entity management', () => {
    const room = new room_1.Room('room-name', 'Room name', mockedSocket);
    it('returns the room name', () => {
        expect(room.getName()).toBe('Room name');
    });
    it('returns the room slug', () => {
        expect(room.getSlug()).toBe('room-name');
    });
});
