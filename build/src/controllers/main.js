"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rooms_1 = require("../helpers/rooms");
const appRoot = require('app-root-path');
const router = express_1.default.Router();
const _ = require('lodash');
module.exports = function (app, io) {
    const rooms = new rooms_1.Rooms().getInstance();
    rooms.injectIo(io);
    app.use('/', router);
    /**
     * The dynamic public end data
     */
    router.get('/env', function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            ga_id: process.env.GA_ID
        }));
    });
    const publicPages = ['/about-us', '/rooms/*'];
    _.forEach(publicPages, (pageEndpoint) => {
        router.get(pageEndpoint, function (req, res, next) {
            res.sendFile(appRoot + '/vueapp/dist/index.html');
        });
    });
    /**
     * Redirect everything to vueapp
     */
    router.get('*', function (req, res, next) {
        res.status(404).sendFile(appRoot + '/vueapp/dist/index.html');
    });
    setInterval(refreshData, 10);
    let lockedRefresh = false;
    function refreshData() {
        if (lockedRefresh) {
            return;
        }
        lockedRefresh = true;
        _.forEach(rooms.getRooms(), (room) => {
            let roomGame = room.getGame();
            let status = room.getGame().getStatus();
            if (roomGame && (status === 'playing' || status === 'starting')) {
                io.to(room.getSlug()).emit('refresh-canvas', roomGame.refreshData());
            }
        });
        lockedRefresh = false;
    }
};
