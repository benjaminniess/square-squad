"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rooms = void 0;
const room_1 = require("../entities/room");
const helpers = require('../helpers/helpers');
const _ = require('lodash');
class Rooms {
    constructor() {
        this.io = null;
        if (!Rooms.instance) {
            Rooms.instance = this;
            this.rooms = {};
        }
    }
    getInstance() {
        return Rooms.instance;
    }
    /**
     * Allows to inject IO dependency after construct call
     * Used in controllers after express app exists
     *
     * @param {} io: the socket io server object
     */
    injectIo(io) {
        this.io = io;
    }
    getRooms() {
        return this.rooms;
    }
    deleteRoom(roomSlug) {
        if (typeof this.rooms[roomSlug] !== 'undefined') {
            delete this.rooms[roomSlug];
            return true;
        }
        return false;
    }
    deleteEmptyRooms() {
        let rooms = this.getRooms();
        if (!rooms) {
            return false;
        }
        let hasDeletedRooms = false;
        _.forEach(rooms, (room) => {
            if (room.getPlayers().length <= 0) {
                this.deleteRoom(room.getSlug());
                hasDeletedRooms = true;
            }
        });
        return hasDeletedRooms;
    }
    getRoomsData() {
        let roomsData = [];
        let rooms = this.getRooms();
        if (!rooms) {
            return [];
        }
        _.forEach(rooms, (room) => {
            roomsData.push(room.getBasicData());
        });
        return roomsData;
    }
    createRoom(roomName) {
        let roomSlug = helpers.stringToSlug(roomName);
        if (typeof this.rooms[roomSlug] !== 'undefined' || roomName === '') {
            return null;
        }
        this.rooms[roomSlug] = new room_1.Room(roomSlug, roomName, this.io);
        return roomSlug;
    }
    getRoom(roomSlug) {
        if (typeof this.rooms[roomSlug] !== 'undefined') {
            return this.rooms[roomSlug];
        }
        else {
            return null;
        }
    }
}
exports.Rooms = Rooms;
