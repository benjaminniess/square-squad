"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require('glob');
const path = require('path');
const controllers = glob.sync(path.join(__dirname, '../src/controllers/*.js'));
// Prevent multiple controllers loadings
let isLoaded = false;
module.exports = function (app, io) {
    if (isLoaded) {
        return;
    }
    isLoaded = true;
    controllers.map(function (controller) {
        require(controller)(app, io);
    });
    app.use(function (req, res, next) {
        res.status(404).send('bad request');
    });
};
