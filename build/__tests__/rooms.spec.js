"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('../');
const room_1 = require("../src/entities/room");
const rooms_1 = require("../src/helpers/rooms");
const rooms = new rooms_1.Rooms().getInstance();
// Quick mock of socket io object
rooms.injectIo({
    sockets: {
        adapter: {
            rooms: {
                get: (a) => {
                    return true;
                }
            }
        }
    }
});
describe('Rooms management - scenario 1', () => {
    it('returns an empty rooms object', () => {
        expect(rooms.getRooms()).toEqual({});
    });
    it('returns true after creating a new room', () => {
        expect(rooms.createRoom('The Room Name')).toBeTruthy();
    });
    it('refuses to create a room with the same name and return false', () => {
        expect(rooms.createRoom('The Room Name')).toBeFalsy();
    });
    it('returns an object of all rooms and one of them is the one created previously', () => {
        expect(rooms.getRooms()).toHaveProperty('the-room-name');
    });
    it('returns an array of all rooms basic data', () => {
        expect(rooms.getRoomsData().length).toBe(1);
    });
    it('shows the last created room name in the first item of the array', () => {
        expect(rooms.getRoomsData()[0]['name']).toBe('The Room Name');
    });
    it('returns true after deleting the new room from its slug', () => {
        expect(rooms.deleteRoom('the-room-name')).toBeTruthy();
    });
    it('returns an empty rooms object', () => {
        expect(rooms.getRooms()).toEqual({});
    });
});
describe('Rooms management - scenario 2', () => {
    it('returns an empty rooms object', () => {
        expect(rooms.getRooms()).toEqual({});
    });
    it('returns true after creating a new room', () => {
        expect(rooms.createRoom('The Room Name')).toBeTruthy();
    });
    it('returns an object of all rooms and one of them is the one created previously', () => {
        expect(rooms.getRooms()).toHaveProperty('the-room-name');
    });
    it('returns a single room object', () => {
        expect(rooms.getRoom('the-room-name')).toBeInstanceOf(room_1.Room);
    });
    it('returns true after deleting the new room from its slug', () => {
        expect(rooms.deleteEmptyRooms()).toBeTruthy();
    });
    it('returns an empty rooms object', () => {
        expect(rooms.getRooms()).toEqual({});
    });
});
