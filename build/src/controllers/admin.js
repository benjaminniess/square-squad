"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rooms_1 = require("../helpers/rooms");
const players_1 = require("../helpers/players");
const router = express_1.default.Router();
const _ = require('lodash');
module.exports = function (app, io) {
    app.use('/admin', router);
    const rooms = new rooms_1.Rooms().getInstance();
    const players = new players_1.Players().getInstance();
    rooms.injectIo(io);
    router.get('*', function (req, res, next) {
        const reject = () => {
            res.setHeader('www-authenticate', 'Basic');
            res.sendStatus(401);
        };
        const authorization = req.headers.authorization;
        if (!authorization) {
            return reject();
        }
        const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64')
            .toString()
            .split(':');
        // If nothing is configured, don't show the admin to anyone
        if (!process.env.ADMIN_PASSWORD) {
            return reject();
        }
        if (password !== process.env.ADMIN_PASSWORD) {
            return reject();
        }
        next();
    });
    /**
     * The home URL
     */
    router.get('/', function (req, res, next) {
        let memoryUsage = process.memoryUsage();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            snapUrl: '/admin/snapshot?pwd=' + process.env.ADMIN_PASSWORD,
            playersCount: _.size(players.getPlayers()),
            roomsCount: _.size(rooms.getRooms()),
            memoryRSS: Math.round(memoryUsage.rss / 1024 / 1024) + 'Mb',
            memoryheapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'Mb',
            memoryheapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'Mb',
            memoryexternal: Math.round(memoryUsage.external / 1024 / 1024) + 'Mb',
            memoryarrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) + 'Mb'
        }));
    });
    router.get('/snapshot', function (req, res, next) {
        const fs = require('fs');
        const v8 = require('v8');
        const snapshotStream = v8.getHeapSnapshot();
        const localPath = `${process.cwd()}/public/`;
        const fileName = `${Date.now()}.heapsnapshot`;
        const fileStream = fs.createWriteStream(localPath + fileName);
        snapshotStream.pipe(fileStream);
        res.redirect('/' + fileName);
    });
};
